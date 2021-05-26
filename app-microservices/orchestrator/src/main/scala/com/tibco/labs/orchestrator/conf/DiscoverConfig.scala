/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.orchestrator.conf


import better.files.{File => ScalaFile}
import com.tibco.labs.orchestrator.api.SparkOnK8s
import com.typesafe.config.{Config, ConfigFactory}
import io.circe.generic.auto._
import io.circe.syntax._
import io.circe.{Json, _}
import org.slf4j.{Logger, LoggerFactory}
import redis.clients.jedis.Jedis


import java.nio.file.Path
import scala.util.matching.Regex
import scala.util.{Failure, Success, Try}


object DiscoverConfig {

  val logger: Logger = LoggerFactory.getLogger("spark-orchestrator:discoverConfig")
  logger.info("Entering classs discoverConfig")


  logger.info("Loading env from Kubernetes for the orchestrator...")


  val redis_host: String = sys.env.getOrElse("REDIS_HOST", "redis-service")
  val redis_port: String = sys.env.getOrElse("REDIS_PORT", "6379")


  if (redis_host.isEmpty || redis_host.isEmpty) {
    logger.error("Mandatory REDIS_HOST, and REDIS_PORT")
    logger.error("exiting....")
    sys.exit(100)
  }
  //load Key and URL for auth from env (k8s envFrom) or local application.conf
  logger.info("loading internal application.conf file, shipped with this jar...")
  val localConfig: Config = ConfigFactory.load("application.conf")
  // Mandatory K8S Secrets

  // Local files
  val sparkJobTmplFile: ScalaFile =  ScalaFile("/tmp/k8s/processMinerSimple.template.json")
  val sparkJobScheduledTmplFile: ScalaFile =  ScalaFile("/tmp/k8s/processMinerScheduled.template.json")
  val sparkPreviewTmplFile: ScalaFile =  ScalaFile("/tmp/k8s/previewFile.template.json")

  logger.info(s"Retrieving app settings from redis ... ${redis_host}:${redis_port}")

  var configStorageRaw = ""
  var sparkPreviewRaw = ""
  var sparkSingleJobRaw = ""
  var sparkScheduledJobRaw = ""
  var configParsed: Option[DiscoverConfiguration] = None
  withRedis{ jedis =>
    // select base 0
    jedis.select(0)
    if (jedis.exists("discover-backend-config")) {
      configStorageRaw = jedis.get("discover-backend-config")
    } else {
      logger.error("Mandatory base configuration in redis database 0 : key discover-backend-config ")
      logger.error("exiting....")
      sys.exit(101)
    }
    if (jedis.exists("discover-backend-spark-preview-template")) {
      sparkPreviewRaw = jedis.get("discover-backend-spark-preview-template")
    } else {
      logger.error("Mandatory base configuration in redis database 0 : key discover-backend-spark-preview-template ")
      logger.error("exiting....")
      sys.exit(101)
    }
    if (jedis.exists("discover-backend-spark-single-template")) {
      sparkSingleJobRaw = jedis.get("discover-backend-spark-single-template")
    } else {
      logger.error("Mandatory base configuration in redis database 0 : key discover-backend-spark-single-template ")
      logger.error("exiting....")
      sys.exit(101)
    }
    if (jedis.exists("discover-backend-spark-scheduled-template")) {
      sparkScheduledJobRaw = jedis.get("discover-backend-spark-scheduled-template")
    } else {
      logger.error("Mandatory base configuration in redis database 0 : key discover-backend-spark-scheduled-template ")
      logger.error("exiting....")
      sys.exit(101)
    }

    jedis.close()
  }

  parser.decode[DiscoverConfiguration](configStorageRaw) match {
    case Left(value) => {
      logger.error(s"Raw : ${configStorageRaw}")
      logger.error(s"Fail parsing default config with ${value.getMessage}")
      logger.error("exiting....")
      sys.exit(101)
    }
    case Right(value) => {
      logger.info("Parsing default config ok")
      configParsed = Some(value)
    }
  }
  if (!configParsed.isDefined) {
    logger.error("Config improperly instanciated")
    sys.exit(102)
  }

  val config: DiscoverConfiguration =  configParsed.get

  var la_claims_uri: String = _
  var la_groups_base_uri: String = _
  val cic_region: String = config.clouds.TIBCO.cic_region
  if (cic_region.equalsIgnoreCase("eu")) {
    la_claims_uri = localConfig.getString("discover.eu.eu_claims_url")
    la_groups_base_uri = localConfig.getString("discover.eu.eu_groups_details_url")
  }

  logger.info("Encoding templates on FS")
  sparkJobTmplFile.overwrite(sparkSingleJobRaw)
  sparkJobScheduledTmplFile.overwrite(sparkScheduledJobRaw)
  sparkPreviewTmplFile.overwrite(sparkPreviewRaw)


    val sparkFile: Path = sparkJobTmplFile.path.toAbsolutePath
    val sparkScheduledFile: Path = sparkJobScheduledTmplFile.path.toAbsolutePath
    val sparkPreviewFile: Path = sparkPreviewTmplFile.path.toAbsolutePath

    logger.info(s"aws region ${config.clouds.aws.region}")
    logger.info(s"surprise me ${config.backend.tdv.jdbcPort}")


  val regex: Regex = "[+._, ]".r

  val _secretName: String = (regex.replaceAllIn(config.orgId.toLowerCase, "-")).toLowerCase() + "-secret"


  Try {
    val data: Map[String, String] = Map(
      "TdvUsername" -> config.backend.tdv.username,
      "TdvPassword" -> config.backend.tdv.password,
      "TdvHost" -> config.backend.tdv.hostname,
      "TdvJdbcPort" -> config.backend.tdv.jdbcPort,
      "TdvSSL" -> config.backend.tdv.ssl,
      "TdvDomain" -> config.backend.tdv.domain,
      "BackendJdbcUsername" -> config.backend.storage.database.username,
      "BackendJdbcPassword" -> config.backend.storage.database.password,
      "BackendType" -> config.backend.storage.database.flavor,
      "BackendSize" -> config.backend.storage.database.batchSize,
      "BackendNumParts" ->config.backend.storage.database.partitions,
      "BackendJdbcDriver" -> config.backend.storage.database.driver,
      "BackendJdbcUrl" -> config.backend.storage.database.url,
      "CIC_REGION" -> cic_region
    )
    new SparkOnK8s().sparkEnvironmentSecret(data, _secretName)
  } match {
    case Success(v) => logger.info(s"Secret for common env created")
    case Failure(exception) => logger.error(s"Error creating secrets : ${exception.getMessage}")
  }


  logger.info("Exiting class discoverConfig")


  /**
   * @param map
   * @return json
   */
  def mapToJson(map: Map[String, Any]): Json =
    map.mapValues(anyToJson).asJson

  /**
   * @param any
   * @return
   */
  def anyToJson(any: Any): Json = any match {
    case n: Int => n.asJson
    case n: Long => n.asJson
    case n: Double => n.asJson
    case s: String => s.asJson
    case true => true.asJson
    case false => false.asJson
    case null | None => None.asJson
    case list: List[_] => list.map(anyToJson).asJson
    case list: Vector[_] => list.map(anyToJson).asJson
    case Some(any) => anyToJson(any)
    // avoid type erasure warning..
    // case map: Map[String, Any] => mapToJson(map)
    case map: Map[_, _] if map.keySet.forall(_.isInstanceOf[String]) => mapToJson(map.asInstanceOf[Map[String, Any]])
  }


  /**
   * @param f
   * @tparam T
   * @return
   */
  def withRedis[T](f: Jedis => T): T = {
    val jedis = new Jedis(s"${redis_host}", s"${redis_port}".toInt)
    try {
      f(jedis)
    } finally {
      jedis.close()
    }
  }
}
