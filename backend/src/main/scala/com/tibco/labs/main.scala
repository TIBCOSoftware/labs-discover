/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

// scalastyle:off println
package com.tibco.labs

import java.io.File
import com.tibco.labs.utils.Status._
import io.circe.optics.JsonPath.root
import org.apache.commons.io.FileUtils
import org.apache.spark.SparkConf
import org.apache.spark.sql._
import org.apache.spark.sql.types.{StringType, StructField, StructType}

import scala.tools.nsc.io.Path
import scala.util.{Failure, Success, Try}
import java.time.LocalDateTime
import scala.util.matching.Regex

object main extends App {



  import com.tibco.labs.utils.commons._



  private val NPARAMS = 2


  println("##### JOB START ####")

  println(s"driver   =      $jdbcDriver")
  println(s"url      =      $jdbcUrl")
  println(s"username =      $jdbcUsername")
  println(s"password =      *************")

 // println(s"REST[GET] Config from TCI : ${_tciEndPoint}")

  parseArgs(args)


  println(spark.version)
  println("##### input params ####")
  println(s"$analysisId")
  println(s"$configFileForPM")

  println(s"###########  Retrieve and Parse Analysis Config ##########")

  //val getCaseEndpoint = s"${_tciEndPoint}$analysisId"

  import com.tibco.labs.utils.jsonConfig
  // Get Config and files
  //jsonConfig RetrieveCaseConfig(getCaseEndpoint, getSharedFileSystem, uuid, authResponse)
  val confJ = jsonConfig.RetrieveCaseConfig(configFileForPM)
  println(s"###########  Init vars ##########")
  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Load Analysis Config",12, databaseName, LocalDateTime.now().toString)
  jsonConfig.InitialiseVars(confJ)

  sendBottleToTheSea(s"$analysisId","info","Load Analysis Config",10, organisation)


  /*  if(confJ.InputType.equals("csv")||confJ.InputType.equals("json")) {
      jsonConfig.DownloadLARessources(getSharedFileSystem, uuid)
      sendTCMMessage(s"$analysisId",s"$caseRef","progress","Load Datasource ",18, databaseName, LocalDateTime.now().toString)
    }*/

  if (_colsExtraToKeep.equals("false")) {
    println(s"Extra Attributes is null..")
    columnNamesToKeep = Seq[String]()
  } else {
    println(s"Extra Attributes filled")
    //columnNamesToKeep = _colsExtraToKeep.split(",").toSeq
    println(s"columnsNamesToKeep : " + columnNamesToKeep)
  }

  // Mapping outPut
  println(s"Mapping CASE_ID to " + columnCaseId)
  println(s"Mapping ACTIVITY_START_TIMESTAMP to " + columnCaseStart)
  println(s"Mapping ACTIVITY_END_TIMESTAMP to " + columnCaseEnd)
  println(s"Mapping ACTIVITY_ID to " + columnActivityId)
  println(s"Mapping RESOURCE_ID to " + columnResourceId)
  println(s"Mapping analysis_id to " + analysisId)
  println(s"Mapping FILTERED LIST to " + columnNamesToKeep)
  println(s"Mapping Requester to " + columnRequester)
  println(s"Mapping Resource Group LIST to " + columnResourceGroup)
  println(s"Mapping Schedule start to " + columnScheduleStart)
  println(s"Mapping Schedule end to " + columnScheduleStart)



  println(s"###########  Load Data source as DataFrame ##########")


  var tmpDataFrame = spark.emptyDataFrame
  //var df_events = snSession.emptyDataFrame
  var schema: StructType = _

  import com.tibco.labs.utils.DataFrameUtils

  Try {
      println(s"Loading TDV table input into a dataframe")
      dateFormatString = tdvDateTimeFormat
      val url = "jdbc:compositesw:dbapi@" + tdvSiteEndpoint + "?domain=" + tdvDomain + "&dataSource=" + tdvDatabase
      println(s"tdv uri $url")
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
    case Success(value) => println("So far...so Good " + value)
    case Failure(exception) => println(s"Error ${exception.getMessage}")
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

  // generate activities
  import com.tibco.labs.pm.activities._

  val df_act = transformActivities(df_events)
  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Activities table",36, databaseName, LocalDateTime.now().toString)
  sendBottleToTheSea(s"$analysisId","info","Generate Activities table",30, organisation)


  //finalize events with activities

  val df_eventsFinal = FinalizeEvents(df_events, df_act)
  sendBottleToTheSea(s"$analysisId","info","Polish Events table",36, organisation)

  //val df_eventsFinal = FinalizeEvents(df_events.drop("cases_extra_attributes"), df_act)



  // generate variants table

  import com.tibco.labs.pm.variants._

  val df_variants: DataFrame = transformVariants(df_eventsFinal)

  sendBottleToTheSea(s"$analysisId","info","Generate Variants table",42, organisation)

  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Variants table",42, databaseName, LocalDateTime.now().toString)

  import com.tibco.labs.pm.variants_status._

  val df_var_status: DataFrame = transformVariantsStatus(df_variants)
  sendBottleToTheSea(s"$analysisId","info","Generate Compliance table",48, organisation)

  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Compliance table",48, databaseName, LocalDateTime.now().toString)

  // generate cases table

  import com.tibco.labs.pm.cases._

  val df_cases = transformCases(df_eventsFinal, df_variants)
  sendBottleToTheSea(s"$analysisId","info","Generate Cases table",54, organisation)

  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Cases table",54, databaseName, LocalDateTime.now().toString)

  // generate metrics table

  // import com.tibco.labs.pm.metrics._

  // getAnalysisMetrics(df_cases, df_events, spark)
  // cast Duration_SEC to LongType
  val df_eventsFinalDB = FinalizeEventsForDB(df_eventsFinal)
  sendBottleToTheSea(s"$analysisId","info","Polish Events table Second pass",58, organisation)


  /*  Seq(df_eventsFinalDB,df_attrib_bin, df_act , df_attrib , df_variants , df_cases , df_var_status).foldLeft(()) {
      case (u, df) => printDFSchema(df)
    }*/
  Seq(df_eventsFinalDB,df_attrib_bin, df_act , df_variants , df_cases , df_var_status).foldLeft(()) {
    case (u, df) => printDFSchema(df)
  }
  // writing

  DataFrameUtils.updateAnalysisJDBC("events", df_eventsFinalDB)
  // Attributes in binary
  DataFrameUtils.updateAnalysisBinaryJDBC("attributes_binary", df_attrib_bin)
  sendBottleToTheSea(s"$analysisId","info","Event Table Saved",60, organisation)
  DataFrameUtils.updateAnalysisJDBC("activities", df_act)
  sendBottleToTheSea(s"$analysisId","info","Activities Table Saved",70, organisation)
  //DataFrameUtils.updateAnalysisJDBC("attributes",df_attrib)
  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Attributes table",78, databaseName, LocalDateTime.now().toString)
  DataFrameUtils.updateAnalysisJDBC("variants", df_variants)
  sendBottleToTheSea(s"$analysisId","info","Variant Table Saved",80, organisation)
  DataFrameUtils.updateAnalysisJDBC("cases", df_cases)
  sendBottleToTheSea(s"$analysisId","info","Cases Table Saved",85, organisation)
  DataFrameUtils.updateAnalysisJDBC("variants_status", df_var_status)
  sendBottleToTheSea(s"$analysisId","info","Variant Status Table Saved",90, organisation)
  //sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Compliance table",95, databaseName, LocalDateTime.now().toString)

  // cleaning

    println(s"###########  cleaning file ##########")

    val cleanedFile = FileUtils.deleteQuietly(new File(configFileForPM))
    val jobFilePath = new File(configFileForPM).getParent
    val regex: Regex = "[+._, ]".r

    val meta_name: String = (regex.replaceAllIn(analysisId, "-")).toLowerCase()
    val jobFile = FileUtils.deleteQuietly(new File(s"$jobFilePath/${meta_name}.yaml"))

    if (!cleanedFile) {
      println(s"###########  Error while removing file ##########")
      //sendTCMMessage(s"$analysisId",s"$caseRef","error","Error deleting file : " + configFileForPM, 0, databaseName, LocalDateTime.now().toString)
      sendBottleToTheSea(s"$analysisId","error","Error deleting file : " + configFileForPM,0, organisation)
      //throw new Exception("Error deleting file : " + configFileForPM)
    }

  if (!jobFile) {
    println(s"###########  Error while removing file ##########")
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
  println("...Bye Bye...")
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
    println(usage)
  }

  private def printDFSchema(df: DataFrame) = {
    df.printSchema()
  }

}

// scalastyle:on println