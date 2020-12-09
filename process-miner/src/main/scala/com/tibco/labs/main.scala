/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

// scalastyle:off println
package com.tibco.labs

import java.io.File

import com.tibco.labs.utils.tibcoCloudMessaging._
import io.circe.optics.JsonPath.root
import org.apache.commons.io.FileUtils
import org.apache.spark.SparkConf
import org.apache.spark.sql._
import org.apache.spark.sql.types.{StringType, StructField, StructType}

import scala.tools.nsc.io.Path
import scala.util.{Failure, Success, Try}
import java.time.LocalDateTime

object main extends App {



  import com.tibco.labs.utils.commons._

  private val NPARAMS = 2


  println("##### JOB START ####")

  println(s"driver   =      $jdbcDriver")
  println(s"url      =      $jdbcUrl")
  println(s"username =      $jdbcUsername")
  println(s"password =      *************")

  println(s"REST[GET] Config from TCI : ${_tciEndPoint}")

/*  def uuid = java.util.UUID.randomUUID.toString

  val getSharedFileSystem = Path("/data/").path

  val appName = "SparkProcessMining" + "_" + uuid
  // launch the spark Session
  val spark: SparkSession = SparkSession
    .builder()
    .config(
      new SparkConf().setIfMissing("spark.master", "local[*]")
    )
    .appName(s"$appName")
    .getOrCreate()
  // get a spark Context
  val sc = spark.sparkContext*/


  // we have only 2 arguments : Analysis ID, bound to the org where the flogo app is published and the liveapps anyway
  // and the database we wanna write the output into

  // as we extend the App traits..args: Array[String] ...
  parseArgs(args)


  println(spark.version)
  println("##### input params ####")
  println(s"$analysisId")
  println(s"$databaseName")

  println(s"###########  Retrieve and Parse Analysis Config ##########")
  //import sttp.client._
  //import sttp.client.okhttp.OkHttpSyncBackend
  //implicit val backend: SttpBackend[Identity, Nothing, WebSocketHandler] = OkHttpSyncBackend()
  val getCaseEndpoint = s"${_tciEndPoint}$analysisId"

  import com.tibco.labs.utils.jsonConfig
  // Get Config and files
  //jsonConfig RetrieveCaseConfig(getCaseEndpoint, getSharedFileSystem, uuid, authResponse)
  val confJ = jsonConfig.RetrieveCaseConfig(getCaseEndpoint)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Load Analysis Config",12, databaseName, LocalDateTime.now().toString)
  jsonConfig.InitialiseVars(confJ)

  if(confJ.InputType.equals("csv")||confJ.InputType.equals("json")) {
    jsonConfig.DownloadLARessources(getSharedFileSystem, uuid)
    sendTCMMessage(s"$analysisId",s"$caseRef","progress","Load Datasource ",18, databaseName, LocalDateTime.now().toString)
  }

  if (_colsExtraToKeep.equals("None")) {
    println(s"Extra Attributes is null..")
  } else {
    println(s"Extra Attributes filled")
    columnNamesToKeep = _colsExtraToKeep.split(",").toSeq
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
  if (inputFileType.equalsIgnoreCase("csv")) {
    println(s"Mapping DateTime Format to " + dateFormatString)
  } else if (inputFileType.equalsIgnoreCase("tdv")) {
    println(s"Mapping DateTime Format (TDV) to " + tdvDateTimeFormat)
  }


  println(s"###########  Load Data source as DataFrame ##########")


  var tmpDataFrame = spark.emptyDataFrame
  //var df_events = snSession.emptyDataFrame
  var schema: StructType = _

  import com.tibco.labs.utils.DataFrameUtils

  Try {
    if (inputFileType.equalsIgnoreCase("csv")) {
      var csvOption = Map[String, String]()
      dateFormatString = datetimeFormat
      csvOption = Map("delimiter" -> separator, "quote" -> quoteChar, "escape" -> escapeChar, "nullValue" -> null, "inferSchema" -> "false", "timestampFormat" -> dateFormatString, "encoding" -> encodingFormat)
      if (hasHeaders.equalsIgnoreCase("true")) {
        println(s"inferring schema from CSV file while reading")
        //headers or inferschema has to be string instead of boolean...
        tmpDataFrame = DataFrameUtils.parseCsv(sourceDataFilePath, csvOption, true, null)
      } else {
        println(s"Building CSV schema from Json Specs")
        // schema has to be StructType(List(StructField(<Name>, StringType)....
        val _mapCsvSchema = root.Columns.each._value.string
        val mapCsvSchema: List[String] = _mapCsvSchema.getAll(jsonParam)
        schema = StructType(mapCsvSchema.map(fieldName => StructField(fieldName, StringType, nullable = true)))
        println(s"reading the file...")
        tmpDataFrame = DataFrameUtils.parseCsv(sourceDataFilePath, csvOption,  false,schema)
      }
    } else if (inputFileType.equalsIgnoreCase("json")) {
      println(s"Loading JSON file input into a dataframe")
      tmpDataFrame = DataFrameUtils.parseJson(sourceDataFilePath, spark.sqlContext)
    } else if (inputFileType.equalsIgnoreCase("tdv")) {
      println(s"Loading TDV table input into a dataframe")
      dateFormatString = tdvDateTimeFormat
      val url = "jdbc:compositesw:dbapi@" + tdvSiteEndpoint + "?domain=" + tdvDomain + "&dataSource=" + tdvDatabase
      println(s"tdv uri $url")
      //var tdvOption = Map[String, String]()
      var tdvOption: Map[String, String] =
        Map(
          "url" -> url,
          "dbtable" -> tdvTable,
          "driver" -> "cs.jdbc.driver.CompositeDriver",
          "fetchsize" -> "10000",
          "numPartitions" -> tdvNumPart,
          "user" -> tdvUsername,
          "password" -> tdvPassword,
          "encoding" -> "UTF-8",
          "characterEncoding" -> "UTF-8"
        )
      tmpDataFrame = DataFrameUtils.parseTdv(tdvOption, spark.sqlContext)
      sendTCMMessage(s"$analysisId",s"$caseRef","progress","Load Analysis Config",12, databaseName, LocalDateTime.now().toString)
    } else {
      println(s"Error :Beurk...what kind of input is that " + inputFileType)
    }
  } match {
    case Success(value) => println("So far...so Good " + value)
    case Failure(exception) => println(s"Error ${exception.getMessage}")
      sendTCMMessage(s"$analysisId",s"$caseRef","error","Error loading input : " + exception.getMessage, 0, databaseName, LocalDateTime.now().toString)
      throw new Exception(exception.getMessage)
      spark.stop()
  }

  // generate events table
  import com.tibco.labs.pm.events._


  val df_events = transformEvents(tmpDataFrame)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Events table",24, databaseName, LocalDateTime.now().toString)

  if (df_events.head(1).isEmpty) {
    sendTCMMessage(s"$analysisId",s"$caseRef","error","Error DF Events is empty : ", 0, databaseName, LocalDateTime.now().toString)
    throw new Exception(s"Events table is empty for $analysisId exiting....")
  }

  import com.tibco.labs.pm.attributes._

  val redux_events = df_events.select("analysis_id", "row_id", "cases_extra_attributes")

  val df_attrib: DataFrame = transformAttributes(redux_events)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Attributes table",30, databaseName, LocalDateTime.now().toString)


  // generate activities
  import com.tibco.labs.pm.activities._

  val df_act = transformActivities(df_events)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Activities table",36, databaseName, LocalDateTime.now().toString)


  //finalize events with activities


  val df_eventsFinal = FinalizeEvents(df_events.drop("cases_extra_attributes"), df_act)



  // generate variants table

  import com.tibco.labs.pm.variants._

  val df_variants: DataFrame = transformVariants(df_eventsFinal)

  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Variants table",42, databaseName, LocalDateTime.now().toString)

  import com.tibco.labs.pm.variants_status._

  val df_var_status: DataFrame = transformVariantsStatus(df_variants)

  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Compliance table",48, databaseName, LocalDateTime.now().toString)

  // generate cases table

  import com.tibco.labs.pm.cases._

  val df_cases = transformCases(df_eventsFinal, df_variants)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Generate Cases table",54, databaseName, LocalDateTime.now().toString)

  // generate metrics table

  // import com.tibco.labs.pm.metrics._

  // getAnalysisMetrics(df_cases, df_events, spark)

  Seq(df_eventsFinal, df_act , df_attrib , df_variants , df_cases , df_var_status).foldLeft(()) {
    case (u, df) => printDFSchema(df)
  }
  // writing

  DataFrameUtils.updateAnalysisJDBC("events", df_eventsFinal)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Events table",60, databaseName, LocalDateTime.now().toString)
  DataFrameUtils.updateAnalysisJDBC("activities", df_act)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Activities table",70, databaseName, LocalDateTime.now().toString)
  DataFrameUtils.updateAnalysisJDBC("attributes",df_attrib)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Attributes table",78, databaseName, LocalDateTime.now().toString)
  DataFrameUtils.updateAnalysisJDBC("variants", df_variants)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Variants table",85, databaseName, LocalDateTime.now().toString)
  DataFrameUtils.updateAnalysisJDBC("cases", df_cases)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Cases table",90, databaseName, LocalDateTime.now().toString)
  DataFrameUtils.updateAnalysisJDBC("variants_status", df_var_status)
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","Write Compliance table",95, databaseName, LocalDateTime.now().toString)

  // cleaning
  Thread.sleep(2000)
  if (inputFileType.equalsIgnoreCase("csv") || inputFileType.equalsIgnoreCase("json")) {

    println(s"###########  cleaning file ##########")

    val cleanedFile = FileUtils.deleteQuietly(new File(sourceDataFilePath))

    if (!cleanedFile) {
      println(s"###########  Error while removing file ##########")
      sendTCMMessage(s"$analysisId",s"$caseRef","error","Error deleting file : " + sourceDataFilePath, 0, databaseName, LocalDateTime.now().toString)
      throw new Exception("Error deleting file : " + sourceDataFilePath)
    }
  }
  sendTCMMessage(s"$analysisId",s"$caseRef","progress","done in few secs...",100, databaseName, LocalDateTime.now().toString)
  Thread.sleep(2000)
  sendTCMMessage(s"$analysisId",s"$caseRef","done","bye bye", 100, databaseName, LocalDateTime.now().toString)
  Thread.sleep(2000)
  //backend.close()
  spark.stop()
  println("...Bye Bye...")
  sys.exit(0)



  private def parseArgs(args: Array[String]): Unit = {
    if (args.length != NPARAMS) {
      printUsage()
      System.exit(1) // maybe throwing an error here ?
    }
    analysisId = args(0)
    databaseName = args(1)
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