package com.tibco.labs

import org.apache.spark.sql.{DataFrame, SaveMode}

import java.sql.{Connection, DriverManager, PreparedStatement}
import java.time.LocalDateTime
import java.util.Properties
import scala.util.{Failure, Success, Try}
import com.github.mrpowers.spark.daria.sql.DariaWriters
import com.tibco.labs.utils.MetricsSend.sendMetricsToRedis
import com.tibco.labs.utils.Status.sendBottleToTheSea
import com.tibco.labs.utils.{DataFrameProfile, previewConfigFile, profiles, schemaPreview}
import org.apache.commons.io.FileUtils
import org.apache.spark.SparkException
import org.apache.spark.sql.functions.{col, date_format, to_timestamp}
import org.apache.spark.sql.types.TimestampType
import org.apache.spark.sql.types._

import java.io.File
import java.time.format.DateTimeParseException
import scala.collection.mutable.ListBuffer
import utils.common._

import scala.collection.mutable

object main extends App {


  private val NPARAMS = 2
  val _startJobTimer = System.nanoTime()
  val _startSparkTimer = System.nanoTime()
  // initialize variables and spark context


  logger.info("##### JOB START ####")

  val _endSparkTimer = System.nanoTime()
  time_spark_context = (_endSparkTimer - _startSparkTimer) / 1000000000

  logger.info(s"##### Spark Context init time  $time_spark_context seconds ####")

  // parse arguments
  parseArgs(args)
  logger.info(s"##### Asset ID : $assetId ####")
  logger.info(s"##### Config File Path : ${configFilePath} ####")

  logger.info(s"##### parsing config ####")

  val cfg: previewConfigFile = utils.jsonConfig.RetrieveCaseConfig(configFilePath)

  organization = cfg.Organization.toLowerCase
  assetId = cfg.DatasetId
  token = cfg.Token
  sendBottleToTheSea(assetId, "info", "Config Loaded", 51, organization)

  logger.info(s"##### Asset ID : $assetId ####")
  logger.info(s"##### organization : ${organization} ####")
  //println(s"##### tdvView : $tdvTable ####")
  logger.info(s"##### driver   =      $jdbcDriver #####")
  logger.info(s"##### url      =      $jdbcUrl #####")
  logger.info(s"##### username =      $jdbcUsername #####")
  logger.info(s"##### password =      *************")

  // Should look up asset ID definition at pod level under /app/$assetId.json
  var tmpDataFrame = spark.emptyDataFrame

  import utils.DataFrameUtils

  tdvDatabase = s"ORG_${organization}"
  Try {
    logger.info(s"Loading TDV table input into a dataframe")
    val url = "jdbc:compositesw:dbapi@" + tdvSiteEndpoint + "?domain=" + tdvDomain + "&dataSource=" + tdvDatabase
    logger.info(s"tdv uri $url")
    //var tdvOption = Map[String, String]()
    var tdvOption: Map[String, String] =
      Map(
        "url" -> url,
        "dbtable" -> s"""datasets."${assetId}"""",
        "driver" -> "cs.jdbc.driver.CompositeDriver",
        "fetchsize" -> "10000",
        "numPartitions" -> tdvNumPart,
        "user" -> tdvUsername,
        "password" -> tdvPassword //,
        //"encoding" -> "UTF-8",
        //"characterEncoding" -> "UTF-8"
      )
    tmpDataFrame = DataFrameUtils.parseTdv(tdvOption, spark.sqlContext)
  } match {
    case Success(value) => {
      logger.info("So far...so Good " + value)
      sendBottleToTheSea(assetId, "info", "Data Loaded", 60, organization)
    }
    case Failure(exception) => logger.error(s"Error ${exception.getMessage}")
      sendBottleToTheSea(assetId, "error", exception.getMessage, 0, organization)

  }

  logger.info(s"NB lines : ${tmpDataFrame.count()}")
  // normalize col names is required
  // Attribute name "Service ID" contains invalid character(s) among " ,;{}()\n\t=". Please use alias to rename it.;

  logger.info(s"Normalizing Columns Name")

  //val _columns: Array[String] = tmpDataFrame.columns
  //val NormalizationRegexColName = """[+._, ()]+"""
  //val replacingColumns = _columns.map(NormalizationRegexColName.r.replaceAllIn(_, "_"))
  //val df2: DataFrame = replacingColumns.zip(_columns).foldLeft(tmpDataFrame) { (tempdf, name) => tempdf.withColumnRenamed(name._2, name._1) }
  //tmpDataFrame = tmpDataFrame.toDF(DataFrameUtils.normalizeColNames(tmpDataFrame.columns):_*)
  val df2 = tmpDataFrame.toDF(normalize(tmpDataFrame.columns): _*)
  sendBottleToTheSea(assetId, "info", "Data Normalize", 65, organization)
  // save the DF as parquet file, coalesce(1) with gzip compression
  // using daria for simplicity
  logger.info("before :")
  logger.info(df2.schema.treeString)
  logger.info(df2.count())
  // casting all timestamps as TimeStampType
  val listCols: Seq[schemaPreview] = cfg.schema.getOrElse(Seq(schemaPreview(None, None, None)))
  //All elements with a timestamp datatype, we keep a map (colName -> format)
  val filteredTimestampList = listCols.filter(l => l.dataType.getOrElse("") == "timestamp")
  filteredTimestampList.foreach(u => {
    timeStampMap += (normalizerString(u.columnName.getOrElse("")) -> u.format.getOrElse(""))
  })

  //var df3 = spark.emptyDataFrame
  logger.info(timeStampMap)

  logger.info("Casting DateTime cols..")

 val df_preview = dateTimeTransform(timeStampMap, df2)

  /*
  timeStampMap.foreach { kv =>

    Try {
      val colName = kv._1
      val colFormat = kv._2
      logger.info(s"Casting Column : $colName")
      df3 = df2.withColumn(s"tmp_$colName", date_format(to_timestamp(col(s"$colName"), colFormat), isoDatePattern).cast(TimestampType))
        .drop(col(s"$colName"))
        .withColumnRenamed(s"tmp_$colName", s"$colName")
    } match {
      case Failure(exception) => {
        logger.error(s"ERRRRRRROOOOORRR  ${exception.getClass.toString}")
        logger.error(s"ERRRRRRROOOOORRR  ${exception.getCause.getMessage}")
        exception match {
          //java.time.format.DateTimeParseException
          case errorDate if exception.isInstanceOf[DateTimeParseException] => {
            logger.error("Error in events for DateTimeParseException : " + errorDate.getCause.getMessage)
            sendBottleToTheSea(s"$assetId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organization)
          }
          case sparkError if exception.isInstanceOf[SparkException] => sparkError.getCause.getMessage match {
            case date if date contains ("You may get a different result due to the upgrading of Spark 3.0") => {
              logger.error("Error in events for SparkException/DateTimeParseException : " + date)
              sendBottleToTheSea(s"$assetId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organization)
            }
            case x => {
              logger.error("Error in events for SparkException/Unknown : " + x)
              sendBottleToTheSea(s"$assetId", "error", s"Undefined SparkException , ${x}", 0, organization)
            }
          }
          case x => {
            logger.error("Error in events : " + x)
            sendBottleToTheSea(s"$assetId", "error", s"Undefined error yet, ${x}", 0, organization)
          }

        }
      }
      case Success(value) => logger.info("TimeStamp casting ok")
    }
  }
*/
  //df3 = df3.repartition(1)
  //df3.persist()
  logger.info("after (df_preview):")
  logger.info(df_preview.schema.treeString)
  logger.info(s"NB lines : ${df_preview.count()}")
  var targetFile = ""

  if (fileDataType.toLowerCase == "parquet") {
    logger.info("writing parquet file....")
    targetFile = s"/data/${organization.toLowerCase}/tmp-${assetId}.parquet"

    DariaWriters.writeThenMerge(
      df_preview,
      "parquet",
      sc,
      s"/data/${organization}/tmp-daria/",
      s"${targetFile}",
      "overwrite"
    )
    logger.info("writing parquet file....OK")

  } else if (fileDataType.toLowerCase == "rds") {
    // Writing RDS :
    logger.info("writing RDS file....")
    targetFile = s"/data/${organization.toLowerCase}/tmp-${assetId}.rds"
    Try {
      df_preview.coalesce(1).write.format("com.tibco.labs.rds.RdsDataSource").option("rds.path", targetFile).mode("append").save()
    } match {
      case Failure(exception) => {
        logger.error(s"Error in RDS SERDE  ${exception.getClass.toString}")
        logger.error(s"Error in RDS SERDE  ${exception.getCause.getMessage}")
        exception match {
          //java.time.format.DateTimeParseException
          case errorDate if exception.isInstanceOf[DateTimeParseException] => {
            logger.error("Error in events for DateTimeParseException : " + errorDate.getCause.getMessage)
            sendBottleToTheSea(s"$assetId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organization)
          }
          case sparkError if exception.isInstanceOf[SparkException] => sparkError.getCause.getMessage match {
            case date if date contains ("You may get a different result due to the upgrading of Spark 3.0") => {
              logger.error("Error in events for SparkException/DateTimeParseException : " + date)
              sendBottleToTheSea(s"$assetId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organization)
            }
            case x => {
              logger.error("Error in events for SparkException/Unknown : " + x)
              sendBottleToTheSea(s"$assetId", "error", s"Undefined SparkException , ${x}", 0, organization)
            }
          }
          case x => {
            logger.error("Error in events : " + x)
            sendBottleToTheSea(s"$assetId", "error", s"Undefined error yet, ${x}", 0, organization)
          }

        }
      }
      case Success(value) => {
        sendBottleToTheSea(assetId, "info", "RDS file serialized", 70, organization)
      }
    }
    logger.info("writing RDS file....OK")
  }

  logger.info("after rds (df_preview):")
  logger.info(df_preview.schema.treeString)
  logger.info(s"NB lines : ${df_preview.count()}")

  // deleting a previous asset in the target database
  val dbName = s"org_${organization.toLowerCase}"
  val tableName = "datasets"
  logger.info(s"###########  Dropping previous $dbName.$tableName ##########")
  var time_del_db: Long = 0

  Class.forName(jdbcDriver)
  var prepSt: PreparedStatement = null
  val SQL = s"""DELETE FROM ${dbName}.${tableName} WHERE dataset_id = ?"""

  var affectedrows = 0
  var dbc: Connection = null
  Try {
    val props = new Properties()
    props.setProperty("user", jdbcUsername)
    props.setProperty("password", jdbcPassword)
    props.setProperty("loginTimeout", "60")
    props.setProperty("connectTimeout", "60")
    //props.setProperty("currentSchema", organisation)
    dbc = DriverManager.getConnection(jdbcUrl, props)
    prepSt = dbc.prepareStatement(SQL)
    prepSt.setString(1, assetId)
    logger.info(s"Dropping Previous Data for table " + dbName + "." + tableName)
    val _dropStart = System.nanoTime()
    affectedrows = prepSt.executeUpdate()
    val _dropend = System.nanoTime()
    time_del_db = (_dropend - _dropStart) / 1000000000
  } match {
    case Success(_) => logger.info(s"Affected Rows : $affectedrows")
      logger.info(s"###########  Dropping previous dataset $assetId in $time_del_db seconds done ##########")
      sendBottleToTheSea(assetId, "info", "Clean previous entry", 80, organization)

      dbc.close()
    case Failure(e) => logger.error("ERROR : " + e.getMessage)
      throw new Exception(e.getMessage)
  }

  // inserting new content

  val df = spark.readStream.format("kafka").option("kafka.bootstrap.servers", "<your TIBCO Kafka URL ID>-akd.eu.messaging.cloud.tibco.com:10159").option("kafka.client.id", "discover").option("kafka.group.id", "discover").option("kafka.sasl.mechanism", "PLAIN").option("kafka.security.protocol", "SASL_SSL").option("kafka.sasl.jaas.config", "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"<your TIBCO Kafka Channel User ID>/channel\" password=\"token:<your TIBCO Kafka Password Token>";").option("subscribe", "discover").load()

  logger.info(s"###########  Inserting File into $dbName.$tableName  ##########")
  var time_ins_db: Long = 0

  Class.forName(jdbcDriver)
  prepSt = null
  val SqlInsert = s"""INSERT INTO  ${dbName}.${tableName} VALUES (?, ?, ?)"""

  affectedrows = 0
  dbc = null
  Try {
    import java.io.FileInputStream
    val file: File = new File(targetFile)
    val fis: FileInputStream = new FileInputStream(file)
    val props = new Properties()
    props.setProperty("user", jdbcUsername)
    props.setProperty("password", jdbcPassword)
    props.setProperty("loginTimeout", "60")
    props.setProperty("connectTimeout", "60")
    //props.setProperty("currentSchema", organisation)
    dbc = DriverManager.getConnection(jdbcUrl, props)
    prepSt = dbc.prepareStatement(SqlInsert)
    prepSt.setString(1, assetId)
    prepSt.setBinaryStream(2, fis, file.length())
    prepSt.setString(3, fileDataType.toLowerCase)
    logger.info(s"inserting....")
    val _dropStart = System.nanoTime()
    affectedrows = prepSt.executeUpdate()
    val _dropend = System.nanoTime()
    time_ins_db = (_dropend - _dropStart) / 1000000000
  } match {
    case Success(_) => logger.info(s"Affected Rows : $affectedrows")
      logger.info(s"###########  inserting $assetId in $time_ins_db seconds done ##########")
      sendBottleToTheSea(assetId, "info", "Insert RDS file done", 90, organization)

      dbc.close()
    case Failure(e) => logger.error("ERROR : " + e.getMessage)
      throw new Exception(e.getMessage)
  }

  // cleaning stuff

  if (fileDataType.toLowerCase == "parquet") {
    // cleaning the temp dir for daria
    Try {
      FileUtils.deleteDirectory(new File(s"/data/${organization.toLowerCase}/tmp-daria/"))
    } match {
      case Success(v) => logger.info("Daria directory cleaned")
      case Failure(exception) => logger.error("Error cleaning directory for Daria " + exception.getMessage)
    }

  }

  // cleaning target file in all case


  val cleanTargetFile = FileUtils.deleteQuietly(new File(targetFile))
  if (cleanTargetFile) {
    logger.info("Target file has been deleted")
  } else {
    logger.error("Houston we have a problem")
  }


  val jobName = normalizerStringDNS(s"${assetId}")

  //val tfile1 = s"/data/${organization.toLowerCase}/${jobName}-preview-config.json"
  val tfile2 = s"/data/${organization.toLowerCase}/${jobName}.yaml"

/*
  sendBottleToTheSea(assetId, "info", "Profiling Datasets", 95, organization)
  logger.info("before profiling:")
  logger.info(df3.schema.treeString)
  logger.info(s"NB lines : ${df3.count()}")
  val profilesDf1 = new DataFrameProfile(df3).toDataFrame
  logger.info("after profiling:")
  logger.info(df3.schema.treeString)
  logger.info(s"NB lines : ${df3.count()}")
  import com.amazon.deequ.profiles.{ColumnProfilerRunner, NumericColumnProfile}

  /* Make deequ profile this data. It will execute the three passes over the data and avoid
         any shuffles. */
  val result = ColumnProfilerRunner().onData(df3).run()
  var profileArray: Seq[(String, String, Int, String, String, String, String, String)] = Seq[(String, String, Int, String, String, String, String, String)]()

  result.profiles.foreach { case (columnName, profile) =>

    val completeness = profile.completeness.toString;
    val approximateNumDistinctValues = profile.approximateNumDistinctValues.toString
    val dataType = profile.dataType.toString
    var stats = ""
    var minVal = ""
    var maxVal = ""
    var meanVal = ""
    var stdVal = ""

    if (profile.dataType.toString.equalsIgnoreCase("Integral") || profile.dataType.toString.equalsIgnoreCase("Fractional")) {
      val numericProfile = result.profiles(columnName).asInstanceOf[NumericColumnProfile]
      minVal = numericProfile.minimum.get.toString
      maxVal = numericProfile.maximum.get.toString
      meanVal = numericProfile.mean.get.toString
      stdVal = numericProfile.stdDev.get.toString
      stats = minVal + " / " + maxVal + " / " + meanVal + " / " + stdVal
    }
    profileArray :+= (s"$columnName", completeness, approximateNumDistinctValues.toInt, dataType, minVal, maxVal, meanVal, stdVal)
  }

  import spark.implicits._

  val profileDf2: DataFrame = profileArray.toDF("ColumnName", "Completeness", "ApproxDistinctValues", "DataType", "StatsMin", "StatsMax", "StatsMean", "StatsStdDev")

  var profilDf3 = profileDf2.join(profilesDf1, "ColumnName")


  profilDf3.show()


  val data = new ListBuffer[profiles]()


  import io.circe.generic.auto._, io.circe.syntax._

  val out: Unit = profilDf3.as[profiles].collect().foreach((row => data += row))
  logger.info(data.toList.asJson.spaces2)
  profilDf3.printSchema()
  val _stopJobTimer = System.nanoTime()
  time_spark_job = (_stopJobTimer - _startJobTimer) / 1000000000
  val totalRows = df3.count()
  import org.apache.spark.sql.functions._
  val dupRows = df3.groupBy(df3.columns.map(col): _*).count().where(col("count")>1).select(sum("count")).first().getLong(0).toInt
  logger.info("TotalRows: " + totalRows)
  logger.info("DistinctRows: " + dupRows)

  sendMetricsToRedis(assetId, data.toList, time_ins_db, time_spark_job, organization, totalRows, dupRows)
  //Thread.sleep(10000)
*/
  FileUtils.deleteQuietly(new File(configFilePath))
  FileUtils.deleteQuietly(new File(tfile2))
  sendBottleToTheSea(assetId, "info", "Cleaning ... No Trace©", 95, organization)


  // quitting job
  val _endJobTimer = System.nanoTime()
  time_spark_job = (_endJobTimer - _startJobTimer) / 1000000000
  logger.info(s"##### Spark JOB  time  $time_spark_job seconds ####")
  logger.info("##### END JOB ####")
  sendBottleToTheSea(assetId, "info", "Thanks for your patience...", 100, organization)
  spark.stop()
  logger.info("...Bye Bye...")
  sys.exit(0)


  /**
   * @param args
   */
  // Private Methods...
  private def parseArgs(args: Array[String]): Unit = {
    if (args.length != NPARAMS) {
      printUsage()
      System.exit(1) // maybe throwing an error here ?
    }
    assetId = args(1)
    configFilePath = args(0)
    //tdvTable = args(2).split("/").last
  }

  /**
   *
   */
  private def printUsage(): Unit = {
    val usage: String =
      "Usage: SparkPreProcessing <config path> <assetId> \n" +
        "\n" +
        "organization - (string) the schema - tenant to use... \n" +
        "\n" +
        "assetId - (string) the asset id to be processed... \n"
    logger.info(usage)
  }

  private def toInt(s: String): Int = {
    Try {
      s.toInt
    } match {
      case Success(value) => value
      case Failure(exception) => 0
    }
  }

  def normalizerStringDNS(aString: String): String = {
    val tmpString = org.apache.commons.lang3.StringUtils.stripAccents(aString.replaceAll("[ ,;{}()\n\t=._+]+", "-")).toLowerCase.take(63)
    val sClean: String = tmpString.takeRight(1) match {
      case "-" => tmpString.dropRight(1)
      case _ => tmpString
    }
    sClean
  }

  def dateTimeTransform(timeMap: mutable.Map[String, String], df: DataFrame): DataFrame = {
    Try{
      timeMap.foldLeft(df) {
        case (acc, mp) => acc.withColumn(s"tmp_${mp._1}", date_format(to_timestamp(col(s"${mp._1}"), mp._2), isoDatePattern).cast(TimestampType)).drop(col(s"${mp._1}")).withColumnRenamed(s"tmp_${mp._1}", s"${mp._1}")
      }
    }match {
      case Failure(exception) => {
        logger.error(s"ERROR in dateTimeTransform  ${exception.getClass.toString}")
        logger.error(s"ERROR in dateTimeTransform  ${exception.getCause.getMessage}")
        exception match {
          //java.time.format.DateTimeParseException
          case errorDate if exception.isInstanceOf[DateTimeParseException] => {
            logger.error("Error in events for DateTimeParseException : " + errorDate.getCause.getMessage)
            sendBottleToTheSea(s"$assetId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organization)
            spark.emptyDataFrame
          }
          case sparkError if exception.isInstanceOf[SparkException] => sparkError.getCause.getMessage match {
            case date if date contains ("You may get a different result due to the upgrading of Spark 3.0") => {
              logger.error("Error in events for SparkException/DateTimeParseException : " + date)
              sendBottleToTheSea(s"$assetId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organization)
              spark.emptyDataFrame
            }
            case x => {
              logger.error("Error in events for SparkException/Unknown : " + x)
              sendBottleToTheSea(s"$assetId", "error", s"Undefined SparkException , ${x}", 0, organization)
              spark.emptyDataFrame
            }
          }
          case x => {
            logger.error("Error in events : " + x)
            sendBottleToTheSea(s"$assetId", "error", s"Undefined error yet, ${x}", 0, organization)
            spark.emptyDataFrame
          }

        }
      }
      case Success(value) => {
        logger.info("TimeStamp casting ok")
        value
      }
    }
  }
}
