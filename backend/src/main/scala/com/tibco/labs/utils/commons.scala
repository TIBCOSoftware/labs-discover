/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import com.typesafe.config.{Config, ConfigFactory}
import io.circe.Json
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import org.apache.spark.SparkConf
import org.apache.spark.sql.{DataFrame, SparkSession}

import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.tools.nsc.io.Path

object commons {

  val logger: Logger = LoggerFactory.getLogger("Processmining")

  def uuid = java.util.UUID.randomUUID.toString

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
  val sc = spark.sparkContext
  val config: Config = ConfigFactory.load("processmining.conf")

  // backend for writing back results into Databases
  // stored in the application config file or by configMap or Secrets

  val jdbcDriver: String = sys.env.getOrElse("BackendJdbcDriver", config.getString("aurora.jdbcDriver"))
  var jdbcUrl: String = sys.env.getOrElse("BackendJdbcUrl", config.getString("aurora.jdbcUrl"))
  val jdbcUsername: String = sys.env.getOrElse("BackendJdbcUsername", config.getString("aurora.jdbcUsername"))
  val jdbcPassword: String = sys.env.getOrElse("BackendJdbcPassword", config.getString("aurora.jdbcPassword"))

  var time_spark_job: Long = 0
  var time_jdbc_destination: Long = 0
  // auth needed to get access to liveapps

  //val liveAppTenantId: String = sys.env.getOrElse("liveAppTenantId", config.getString("liveapps.TenantId"))
  // theses variables are being passed thru kubernetes secrets as env variables
  //val liveAppClientId: String = sys.env.getOrElse("liveAppClientId", "").stripMargin
  //val liveAppEmail: String = sys.env.getOrElse("liveAppEmail", "").stripMargin
  //val liveAppPassword: String = sys.env.getOrElse("liveAppPassword", "").stripMargin

  //val tibcoBaseDomain = "cloud.tibco.com" // <-- This is Static
  //val _tciDomain: String = config.getString("liveapps.domain")
  //val authEndPoint: String = config.getString("liveapps.authEndPoint")
  //val _tciEndPoint = config.getString("tci.endPoint")
  //val tibcoCloudRegion = s"${_tciDomain}.$tibcoBaseDomain"

  //val _tciEndPoint: String = sys.env.getOrElse("TCIGetAnalysisPublicEndpoint", config.getString("tci.endPoint"))


  var dbSize: String = sys.env.getOrElse("BackendSize", config.getString("backend.dbSize"))
  val backEndType: String = sys.env.getOrElse("BackendType", config.getString("backend.type"))
  var numParts: String = sys.env.getOrElse("BackendNumParts", config.getString("backend.numParts"))

  //val cic_oauth:String = sys.env.getOrElse("CIC_OAUTH_KEY", "")
  //val cic_region:String = sys.env.getOrElse("CIC_REGION", "")
  //val cic_app_id:String = sys.env.getOrElse("CIC_APPID", "")

  var analysisId: String = ""
  var configFileForPM: String = ""
  var databaseName = ""
  var organisation: String = ""

  //var caseRef: String = ""

  var jsonParam: Json = Json.Null

  //var columnsFinal: Seq[String] = Seq("")
  var columnNamesToKeep: Seq[String] = Seq[String]()

  var startIds: Seq[String] = Seq("")
  var endIds: Seq[String] = Seq("")

  var filename = ""
  var fileUri = ""
  var _jsonConfigRaw = ""
  var analysisDesc = ""
  var tokenCic = ""
  var inputFileType: String = _
  var hasHeaders: String = _
  var separator: String = _
  var quoteChar: String = _
  var escapeChar: String = _
  var datetimeFormat: String = _
  var encodingFormat: String = _
  var sourceDataFilePath: String = ""

  var dateFormatString: String = ""

  val fileDataType: String = config.getString("fs.type")

  // TDV
  var tdvDatabase: String = _
  var tdvTable: String = _
  var tdvDomain: String = sys.env.getOrElse("TdvDomain", "")
  var tdvUsername: String = sys.env.getOrElse("TdvUsername", config.getString("tdv.tdvUsername"))
  var tdvPassword: String = sys.env.getOrElse("TdvPassword", config.getString("tdv.tdvPassword"))
  var tdvSiteEndpoint: String = sys.env.getOrElse("TdvHost", "")+":"+sys.env.getOrElse("TdvJdbcPort", "9401")
  var tdvSiteName: String = _
  var tdvNumPart: String = "20"
  var tdvDateTimeFormat: String = _

  var analysisVersion: String = ""

  // Common Vars
  var columnCaseId: String = ""
  var columnCaseStart: String = ""
  var columnCaseEnd: String = ""
  var columnActivityId: String = ""
  var columnResourceId: String = ""
  var _colsExtraToKeep: String = ""
  var columnScheduleStart: String = ""
  var columnScheduleEnd: String = ""
  var columnRequester: String = ""
  var columnResourceGroup: String = ""
  var _colsAllList: String = ""
  var timeStampMap: mutable.Map[String, String] = scala.collection.mutable.Map[String, String]()

  // TCM

  //val tcmUrl: String = sys.env.getOrElse("TCMUrl", config.getString("TCM.url"))
  //val tcmKey: String = sys.env.getOrElse("TCMKey", config.getString("TCM.key"))

  //val tcmDurable: String = "discover_tcm"


  val NormalizationRegexColName = """[+._ ()]+"""
  val isoDatePattern ="yyyy-MM-dd'T'HH:mm:ss.SSSSSSX"
  val isoSpotPattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"

  def normalizer(columns: Seq[String]): Seq[String] = {
    columns.map { c =>
      org.apache.commons.lang3.StringUtils.stripAccents(c.replaceAll("[ ,;{}()\n\t=._+]+", "_"))
    }
  }

  def normalizerString(aString : String): String = {
    org.apache.commons.lang3.StringUtils.stripAccents(aString.replaceAll("[ ,;{}()\n\t=._+]+", "_"))
  }

  case class tFEvents(eventsDF: DataFrame, attributesDF: DataFrame, eventsCasesFiltered: DataFrame)
  val prefixColsInternal = "input_"

  var startFilters: List[String] = List()
  var stopFilters: List[String] = List()

  var eventsRange: ListBuffer[(String, String,String, String, String)] = new ListBuffer[(String, String,  String, String, String)]() // (ColName, ColType, colFormat,  Min, Max)
  var casesRange: ListBuffer[(String, String,String, String, String)] = new ListBuffer[(String, String,  String, String, String)]() // (ColName, ColType, colFormat,  Min, Max)
  var casesValues: ListBuffer[(String, String,String, List[String])] = new ListBuffer[(String, String,  String, List[String])]() // (ColName, ColType, colFormat,  list)
  var eventsValues: ListBuffer[(String, String,String, List[String])] = new ListBuffer[(String, String,  String, List[String])]() // (ColName, ColType, colFormat,  list)


}
