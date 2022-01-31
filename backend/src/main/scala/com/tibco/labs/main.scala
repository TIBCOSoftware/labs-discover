/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

// scalastyle:off println
package com.tibco.labs

import com.tibco.labs.config.analysisMetrics
import com.tibco.labs.utils.DataFrameUtils.{joinByColumn, joinByColumnGen}
import com.tibco.labs.utils.MetricsSend.sendMetricsToRedis

import java.io.File
import com.tibco.labs.utils.Status._
import io.circe.optics.JsonPath.root
import org.apache.commons.io.FileUtils

import org.apache.spark.sql._
import org.apache.spark.sql.types.{StringType, StructField, StructType}

import scala.tools.nsc.io.Path
import scala.util.{Failure, Success, Try}
import java.time.LocalDateTime
import scala.util.matching.Regex

object main extends App {


  val _startJobTimer = System.nanoTime()


  import com.tibco.labs.utils.commons._

  import spark.implicits._

  private val NPARAMS = 2


  logger.info("##### JOB START ####")

  logger.info(s"driver   =      $jdbcDriver")
  logger.info(s"url      =      $jdbcUrl")
  logger.info(s"username =      $jdbcUsername")
  logger.info(s"password =      *************")

 // logger.info(s"REST[GET] Config from TCI : ${_tciEndPoint}")

  parseArgs(args)


  logger.info(spark.version)
  logger.info("##### input params ####")
  logger.info(s"$analysisId")
  logger.info(s"$configFileForPM")

  logger.info(s"###########  Retrieve and Parse Analysis Config ##########")

  //val getCaseEndpoint = s"${_tciEndPoint}$analysisId"

  import com.tibco.labs.utils.jsonConfig
  // Get Config and files
  //jsonConfig RetrieveCaseConfig(getCaseEndpoint, getSharedFileSystem, uuid, authResponse)
  val confJ = jsonConfig.RetrieveCaseConfig(configFileForPM)
  logger.info(s"###########  Init vars ##########")
  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Load Analysis Config",12, databaseName, LocalDateTime.now().toString)
  jsonConfig.InitialiseVars(confJ)

  sendBottleToTheSea(s"$analysisId","info","Load Analysis Config",10, organisation)


  /*  if(confJ.InputType.equals("csv")||confJ.InputType.equals("json")) {
      jsonConfig.DownloadLARessources(getSharedFileSystem, uuid)
      sendTCMMessage(s"$analysisId",s"$caseRef","progress","Load Datasource ",18, databaseName, LocalDateTime.now().toString)
    }*/

  if (_colsExtraToKeep.equals("false")) {
    logger.info(s"Extra Attributes is null..")
    columnNamesToKeep = Seq[String]()
  } else {
    logger.info(s"Extra Attributes filled")
    //columnNamesToKeep = _colsExtraToKeep.split(",").toSeq
    logger.info(s"columnsNamesToKeep : " + columnNamesToKeep)
  }

  // Mapping outPut
  logger.info(s"Mapping CASE_ID to " + columnCaseId)
  logger.info(s"Mapping ACTIVITY_START_TIMESTAMP to " + columnCaseStart)
  logger.info(s"Mapping ACTIVITY_END_TIMESTAMP to " + columnCaseEnd)
  logger.info(s"Mapping ACTIVITY_ID to " + columnActivityId)
  logger.info(s"Mapping RESOURCE_ID to " + columnResourceId)
  logger.info(s"Mapping analysis_id to " + analysisId)
  logger.info(s"Mapping FILTERED LIST to " + columnNamesToKeep)
  logger.info(s"Mapping Requester to " + columnRequester)
  logger.info(s"Mapping Resource Group LIST to " + columnResourceGroup)
  logger.info(s"Mapping Schedule start to " + columnScheduleStart)
  logger.info(s"Mapping Schedule end to " + columnScheduleStart)



  logger.info(s"###########  Load Data source as DataFrame ##########")


  var tmpDataFrame = spark.emptyDataFrame
  //var df_events = snSession.emptyDataFrame
  var schema: StructType = _

  import com.tibco.labs.utils.DataFrameUtils

  Try {
      logger.info(s"Loading TDV table input into a dataframe")
      dateFormatString = tdvDateTimeFormat
      val url = "jdbc:compositesw:dbapi@" + tdvSiteEndpoint + "?domain=" + tdvDomain + "&dataSource=" + tdvDatabase
      logger.info(s"tdv uri $url")
      //var tdvOption = Map[String, String]()
      var tdvOption: Map[String, String] =
        Map(
          "url" -> url,
          "dbtable" -> s"""datasets."${tdvTable}"""",
          "driver" -> "cs.jdbc.driver.CompositeDriver",
          "fetchsize" -> "10000",
          "numPartitions" -> tdvNumPart,
          "user" -> tdvUsername,
          "password" -> tdvPassword,
          "encoding" -> "UTF-8",
          "characterEncoding" -> "UTF-8"
        )
      tmpDataFrame = DataFrameUtils.parseTdv(tdvOption, spark.sqlContext)
    val Msg = s"Load Datasource"
    sendBottleToTheSea(s"$analysisId","info",Msg,15, organisation)
  } match {
    case Success(value) => logger.info("So far...so Good " + value)
    case Failure(exception) => logger.error(s"Error ${exception.getMessage}")
      val errMsg = s"Error: Loading from TDV : ${exception.getMessage}"
      sendBottleToTheSea(s"$analysisId","error",errMsg,0, organisation)
  }

  // generate events table
  import com.tibco.labs.pm.events._


   val events: tFEvents = transformEvents(tmpDataFrame)

  val df_events = events.eventsDF
  sendBottleToTheSea(s"$analysisId","info","Generate Events table first pass",20, organisation)

  if (df_events.take(1).isEmpty) {
    //sendTCMMessage(s"$analysisId",s"$caseRef","error","Error DF Events is empty : ", 0, databaseName, LocalDateTime.now().toString)
    val errMsg = s"Error DF Events is empty"
    sendBottleToTheSea(s"$analysisId","error",errMsg,0, organisation)
  }
  val df_attrib_bin = events.attributesDF
  sendBottleToTheSea(s"$analysisId","info","Generate Attributes Table",24, organisation)

  val df_events_casefilter = events.eventsCasesFiltered
  // generate activities
  import com.tibco.labs.pm.activities._

  val df_act = transformActivities(df_events)
  sendBottleToTheSea(s"$analysisId","info","Generate Activities table",30, organisation)


  //finalize events with activities

  val df_eventsFinal = FinalizeEvents(df_events, df_act)
  sendBottleToTheSea(s"$analysisId","info","Polish Events table",36, organisation)

  //val df_eventsFinal = FinalizeEvents(df_events.drop("cases_extra_attributes"), df_act)

  // generate cases table

  import com.tibco.labs.pm.cases._

  val df_cases = transformCases(df_eventsFinal, df_events_casefilter)
  sendBottleToTheSea(s"$analysisId","info","Generate Cases table",40, organisation)

  // generate variants table

  import com.tibco.labs.pm.variants._

  var df_variants: DataFrame = transformVariants(df_eventsFinal)

  sendBottleToTheSea(s"$analysisId","info","Generate Variants table",42, organisation)

  import com.tibco.labs.pm.variants_status._

  var df_var_status: DataFrame = transformVariantsStatus(df_variants)
  sendBottleToTheSea(s"$analysisId","info","Generate Compliance table",48, organisation)


  // Filter second pass on df_events
  logger.info("############ filter events second pass")
  val df_eventsFinal2 = joinByColumnGen("case_id", df_cases, df_eventsFinal, "inner")
  sendBottleToTheSea(s"$analysisId","info","filter events second pass",50, organisation)

  logger.info("############ filter variants second pass")

  df_variants = transformVariants(df_eventsFinal2)
  df_var_status = transformVariantsStatus(df_variants)

  // generate cases table

  val df_casesFinal = enrichCaseTable(df_cases, df_variants, df_act)
  sendBottleToTheSea(s"$analysisId","info","Enrich Cases table",54, organisation)


  // cast Duration_SEC to LongType
  val df_eventsFinalDB = FinalizeEventsForDB(df_eventsFinal2)
  sendBottleToTheSea(s"$analysisId","info","Polish Events table Second pass",58, organisation)

  // generate metrics table

  import com.tibco.labs.pm.metrics._

  val df_metricsFinal = AnalysisMetrics(df_casesFinal, df_eventsFinalDB, spark)

  /*  Seq(df_eventsFinalDB,df_attrib_bin, df_act , df_attrib , df_variants , df_cases , df_var_status).foldLeft(()) {
      case (u, df) => printDFSchema(df)
    }*/
  logger.info("######### table structures #######@")
  Seq(df_eventsFinalDB,df_attrib_bin, df_act , df_variants ,df_cases, df_casesFinal , df_var_status, df_metricsFinal).foldLeft(()) {
    case (u, df) =>  logger.info(printDFSchema(df))
  }
  // writing
  val _startDBInsert = System.nanoTime()
  logger.info("######### writing tables #######@")
  //DataFrameUtils.updateAnalysisJDBC("events", df_eventsFinalDB)
  // events in binary
  DataFrameUtils.updateAnalysisBinaryJDBC("events_binary", df_eventsFinalDB)
  sendBottleToTheSea(s"$analysisId","info","Event Table Saved",60, organisation)
  // Attributes in binary
  DataFrameUtils.updateAnalysisBinaryJDBC("attributes_binary", df_attrib_bin)
  sendBottleToTheSea(s"$analysisId","info","Attributes Table Saved",65, organisation)
  DataFrameUtils.updateAnalysisJDBC("activities", df_act)
  sendBottleToTheSea(s"$analysisId","info","Activities Table Saved",70, organisation)
  //DataFrameUtils.updateAnalysisJDBC("attributes",df_attrib)
  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Attributes table",78, databaseName, LocalDateTime.now().toString)
  DataFrameUtils.updateAnalysisJDBC("variants", df_variants)
  sendBottleToTheSea(s"$analysisId","info","Variant Table Saved",80, organisation)
  DataFrameUtils.updateAnalysisJDBC("cases", df_casesFinal)
  sendBottleToTheSea(s"$analysisId","info","Cases Table Saved",85, organisation)
  DataFrameUtils.updateAnalysisJDBC("variants_status", df_var_status)
  sendBottleToTheSea(s"$analysisId","info","Variant Status Table Saved",90, organisation)
  val _stopDBInsert = System.nanoTime()
  time_jdbc_destination = (_stopDBInsert - _startDBInsert) / 1000000000
  val _stopJobTimer = System.nanoTime()
  time_spark_job = (_stopJobTimer - _startJobTimer) / 1000000000
  import io.circe.generic.auto._, io.circe.syntax._
  sendMetricsToRedis(analysisId, df_metricsFinal.drop("analysis_id").as[analysisMetrics].first(), time_jdbc_destination, time_spark_job, organisation)
  //DataFrameUtils.updateAnalysisJDBC("metrics", df_metricsFinal)
  //sendBottleToTheSea(s"$analysisId","info","Metrics Table Saved",95, organisation)
  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Compliance table",95, databaseName, LocalDateTime.now().toString)

  // cleaning

    logger.info(s"###########  cleaning file ##########")

    val cleanedFile = FileUtils.deleteQuietly(new File(configFileForPM))
    val jobFilePath = new File(configFileForPM).getParent
    val regex: Regex = "[+._, ]".r

    val meta_name: String = (regex.replaceAllIn(analysisId, "-")).toLowerCase()
    val jobFile = FileUtils.deleteQuietly(new File(s"$jobFilePath/${meta_name}.yaml"))

    if (!cleanedFile) {
      logger.info(s"###########  Error while removing file ##########")
      //sendTCMMessage(s"$analysisId",s"$caseRef","error","Error deleting file : " + configFileForPM, 0, databaseName, LocalDateTime.now().toString)
      sendBottleToTheSea(s"$analysisId","error","Error deleting file : " + configFileForPM,0, organisation)
      //throw new Exception("Error deleting file : " + configFileForPM)
    }

  if (!jobFile) {
    logger.info(s"###########  Error while removing file ##########")
    sendBottleToTheSea(s"$analysisId","error","Error deleting file : " + jobFile,0, organisation)

    //sendTCMMessage(s"$analysisId",s"$caseRef","error","Error deleting file : " + jobFile, 0, databaseName, LocalDateTime.now().toString)
    //throw new Exception("Error deleting file : " + jobFile)
  }

  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","done in few secs...",100, databaseName, LocalDateTime.now().toString)

  //sendTCMMessage(s"$analysisId",s"$caseRef","done","bye bye", 100, databaseName, LocalDateTime.now().toString)
  //backend.close()
  sendBottleToTheSea(s"$analysisId","info","Thanks for your patience",100, organisation)
  Thread.sleep(2000)
  spark.stop()
  logger.info("...Bye Bye...")
  sys.exit(0)



  private def parseArgs(args: Array[String]): Unit = {
    if (args.length != NPARAMS) {
      printUsage()
      System.exit(1) // maybe throwing an error here ?
    }
    analysisId = args(0)
    configFileForPM = args(1)
  }

  private def printUsage(): Unit = {
    val usage: String =
      "Usage: ComputeDBProcessMiner <AnalysisID> <databaseName> \n" +
        "\n" +
        "Database Target Name - (string) where the output of this job is being stored...\n" +
        "AnalysisID - (string) the AnalysisID to be processed\n"
    logger.info(usage)
  }

  private def printDFSchema(df: DataFrame): String = {
   df.schema.treeString
  }

}

// scalastyle:on println