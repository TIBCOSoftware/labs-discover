package com.tibco.labs
package utils


import com.typesafe.config.{Config, ConfigFactory}
import org.apache.spark.SparkConf
import org.apache.spark.sql.SparkSession

import scala.tools.nsc.io.Path

object common {

  /**
   * @return Unique identifier as a string
   */
  def uuid: String = java.util.UUID.randomUUID.toString

  val getSharedFileSystem = Path("/data/").path

  val appName = "SparkPreProcessing" + "_" + uuid
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


  // Information set by env variables from Kubernetes

  val jdbcDriver: String = sys.env.getOrElse("BackendJdbcDriver", config.getString("aurora.jdbcDriver"))
  var jdbcUrl: String = sys.env.getOrElse("BackendJdbcUrl", config.getString("aurora.jdbcUrl"))
  val jdbcUsername: String = sys.env.getOrElse("BackendJdbcUsername", config.getString("aurora.jdbcUsername"))
  val jdbcPassword: String = sys.env.getOrElse("BackendJdbcPassword", config.getString("aurora.jdbcPassword"))
  var dbSize: String = sys.env.getOrElse("BackendSize", config.getString("backend.dbSize"))
  val backEndType: String = sys.env.getOrElse("BackendType", config.getString("backend.type"))
  var numParts: String = sys.env.getOrElse("BackendNumParts", config.getString("backend.numParts"))

  val fileDataType: String = config.getString("fs.type")
  // job parameters
  var assetId: String = ""
  var organization: String = ""
  var configFilePath: String = ""
  var token: String = ""
  //var tdvTable: String = ""

  // TDV
  var tdvDatabase: String = _
  var tdvDomain: String = sys.env.getOrElse("TdvDomain", "composite")
  var tdvUsername: String = sys.env.getOrElse("TdvUsername", config.getString("tdv.tdvUsername"))
  var tdvPassword: String = sys.env.getOrElse("TdvPassword", config.getString("tdv.tdvPassword"))
  var tdvSiteEndpoint: String = sys.env.getOrElse("TdvHost", "")+":"+sys.env.getOrElse("TdvJdbcPort", "9401")
  var tdvNumPart: String = "20"

  val NormalizationRegexColName = """[+._ ,;{}()\n\t=]+"""
  val isoDatePattern ="yyyy-MM-dd'T'HH:mm:ss.SSSSSSX"

  var time_spark_context: Long = 0
  var time_spark_job: Long = 0
  var time_spark_source: Long = 0
  var time_jdbc_destination: Long = 0
  var time_spark_serialisation: Long = 0

  def normalize(columns: Seq[String]): Seq[String] = {
    columns.map { c =>
      org.apache.commons.lang3.StringUtils.stripAccents(c.replaceAll("[ ,;{}()\n\t=._+]+", "_"))
    }
  }

}
