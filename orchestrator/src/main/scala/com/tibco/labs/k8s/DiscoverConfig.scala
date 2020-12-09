package com.tibco.labs.k8s


import java.io.{BufferedReader, File, FileReader, Reader}

import com.tibco.labs.models.environment
import com.tibco.labs.models.ConfigSS

import util.{Failure, Success, Try}
import com.typesafe.scalalogging.Logger
import io.circe
import java.sql.Connection
import java.sql.DriverManager
import java.util.Base64

import scala.concurrent.Future
import sttp.client._
import sttp.client.circe._
import io.circe.generic.auto._
import com.typesafe.config.ConfigFactory
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import io.circe.jawn.decode
import io.circe.{Decoder, Encoder, Json}
import io.circe.parser._
import io.circe._
import io.circe.syntax._

import scala.io.Source
import scala.util.matching.Regex



object DiscoverConfig {

  val logger = Logger("spark-orchestrator:discoverConfig")
  logger.info("Entering classs discoverConfig")

  val tcmDurableKey: String = "discover_backend"

  import sttp.client.okhttp.OkHttpSyncBackend
  implicit val sttpBackend = OkHttpSyncBackend()

  logger.info("Loading env from Kubernetes for the orchestrator...")

  val cic_oauth:String = sys.env.getOrElse("CIC_OAUTH_KEY", "")
  val cic_region:String = sys.env.getOrElse("CIC_REGION", "")
  val cic_app_id:String = sys.env.getOrElse("CIC_APPID", "")


  if (cic_oauth.isEmpty || cic_region.isEmpty|| cic_app_id.isEmpty ) {
    logger.error("Mandatory CIC_OAUTH_KEY, or CIC_REGION, or CIC_APPID")
    logger.error("exiting....")
    sys.exit(100)
  }
  //load Key and URL for auth from env (k8s envFrom) or local application.conf
  logger.info("loading internal application.conf file, shipped with this jar...")
  val config = ConfigFactory.load("application.conf")
  // Mandatory K8S Secrets

/*  val envDataFile = {
    new File("/tmp/k8s/orchestrator_env.json")
  }*/
  val sparkJobDataFile = {
    new File("/tmp/k8s/spark.job.template.json")
  }
  val sparkJobScheduledDataFile = {
    new File("/tmp/k8s/spark.job.scheduled.template.json")
  }
  //case class HttpBinResponse(origin: String, headers: Map[String, String])

  var configEnvUrl: String = _
  var sparkTemplateUrl: String = _
  var sparkTemplateScheduledUrl: String = _
  var shareStateConfigUrl: String = _

  if (cic_region.equalsIgnoreCase("eu")) {
    configEnvUrl = config.getString("discover.eu.eu_spark_env_url")
    sparkTemplateUrl = config.getString("discover.eu.eu_spark_template_simple_url")
    sparkTemplateScheduledUrl = config.getString("discover.eu.eu_spark_template_scheduled_url")
    shareStateConfigUrl = config.getString("discover.eu.eu_shared_state_config_url")
  }

  logger.info("Retrieving environment settings from discover app...")
  val configJson: environment = downloadsResourceJson(configEnvUrl)

  if(configJson.!=(null)) {
    logger.info(s"K8S Cluster Name : ${configJson.k8s.K8S_CLUSTER_NAME}")
  } else {
    logger.error("Mandatory environment settings")
    logger.error("exiting....")
    sys.exit(101)
  }

  logger.info("Retrieving Single spark job template from discover app...")
  downloadsResourceFiles(sparkTemplateUrl, sparkJobDataFile)

  logger.info("Retrieving Scheduled spark job template from discover app...")
  downloadsResourceFiles(sparkTemplateScheduledUrl, sparkJobScheduledDataFile)

  logger.info("Retrieving Global setttings from Shared State from discover app...")

  val shareStateConfig: Map[String, String] = downloadsSSConfigMap(shareStateConfigUrl)

  val configSS: ConfigSS = mapToCaseClass[ConfigSS](shareStateConfig)

  val TcmUrl: String = configSS.messaging_endpoint
  val TcmKey: String = configSS.messaging_key

  val regex: Regex = "[+._, ]".r

  val _secretName: String = (regex.replaceAllIn(configJson.env, "-")).toLowerCase()

  generateSecretFile(_secretName)
  Try {
    logger.info("Deploying Secret..")
    deploySecretFile(_secretName)
  } match {
    case Success(v) => logger.info("ok ?")
    case Failure(exception) => logger.error(s"oops : ${exception.getMessage}")
  }


  sttpBackend.close()
  logger.info("Exiting classs discoverConfig")


  def downloadsResourceFiles(uri: String, dest: File): Unit = {
    logger.info(s"URL : $uri")
    val request: RequestT[Identity, Either[String, File], Nothing] = basicRequest.auth.bearer(cic_oauth).get(uri"${uri}").response(asFile(dest))
    val response: Identity[Response[Either[String, File]]] = request.send()

    response.body match {
      case Right(value) => logger.info("Download ok with code : " + response.code.code + " as " + value.getAbsoluteFile)
      case Left(fail) => logger.error("Download failed with error "+ fail.toString)
    }

  }


  def downloadsResourceJson(uri: String): environment = {
    logger.info(s"URL : $uri")
    val request: RequestT[Identity, Either[ResponseError[Error], environment], Nothing] = basicRequest.auth.bearer(cic_oauth).get(uri"${uri}").response(asJson[environment])
    val response: Identity[Response[Either[ResponseError[circe.Error], environment]]] = request.send()

    response.body match {
      case Right(value) => logger.info("get ok with code : " + response.code.code)
        logger.info(value.toString)
        return value
      case Left(fail) => logger.error("Download failed with error "+ fail.toString)
        return null
    }

  }

  def downloadsSSConfigMap(uri: String): Map[String, String] = {
    logger.info(s"URL : $uri")
    var SSConfigMap: Map[String, String] = Map[String,String]()
    val request = basicRequest.auth.bearer(cic_oauth).contentType("application/json").header("Accept", "application/json").get(uri"${uri}").response(asString)
    val response = request.send()
    //dirty trick...
    val regex = "^\\[|\\]$".r
    var JsonRaw: Json = Json.Null
    var finalJson: Json = Json.Null

    response.body match {
      case Right(value) => logger.info("get ok with code : " + response.code.code)
        logger.info(value.toString)
        val tmpString = regex.replaceAllIn(response.body.getOrElse(""), "")
        JsonRaw = parse(tmpString).getOrElse(Json.Null)
      case Left(fail) => logger.error("Download failed with error " + fail.toString)
        new Exception("Error requesting " + uri)
    }

    import io.circe.optics.JsonPath._

    val JsonRawFromCursor: Option[String] = JsonRaw.hcursor.
      downField("content").
      get[String]("json").
      toOption


    finalJson = parse(JsonRawFromCursor.getOrElse("")).getOrElse(Json.Null)

    //a shame i couldnt used a case class here...fails for some reasons... to investigate..


    val _tdv_enable= root.tdv.enable.boolean
    val tdv_enable: String = _tdv_enable.getOption(finalJson).getOrElse("").toString
    val _tdv_username= root.tdv.username.string
    val tdv_username: String = _tdv_username.getOption(finalJson).getOrElse("")
    val _tdv_password= root.tdv.password.string
    val tdv_password: String = _tdv_password.getOption(finalJson).getOrElse("")
    val _tdv_jdbcPort= root.tdv.jdbcPort.string
    val tdv_jdbcPort: String = _tdv_jdbcPort.getOption(finalJson).getOrElse("")
    val _tdv_workers= root.tdv.workers.string
    val tdv_workers: String = _tdv_workers.getOption(finalJson).getOrElse("")
    val _tdv_k8sEnable= root.tdv.k8sEnable.boolean
    val tdv_k8sEnable: String = _tdv_k8sEnable.getOption(finalJson).getOrElse("")toString
    val _tdv_k8sNamespace= root.tdv.k8sNamespace.string
    val tdv_k8sNamespace: String = _tdv_k8sNamespace.getOption(finalJson).getOrElse("")
    val _tdv_k8sPodName= root.tdv.k8sPodName.string
    val tdv_k8sPodName: String = _tdv_k8sPodName.getOption(finalJson).getOrElse("")

    val _messaging_endpoint= root.messaging.endpoint.string
    val messaging_endpoint: String = _messaging_endpoint.getOption(finalJson).getOrElse("")
    // key is a reserved word...let work around
    //val _messaging_key= root.messaging.key.string
    //val messaging_key: String = _messaging_key.getOption(finalJson).getOrElse("")
    val messaging_key: String = finalJson.hcursor.downField("messaging").get[String]("key").toOption.getOrElse("")
    val _messaging_configURL= root.messaging.configURL.string
    val messaging_configURL: String = _messaging_configURL.getOption(finalJson).getOrElse("")

    val _storage_type= root.storage.`type`.string
    val storage_type: String = _storage_type.getOption(finalJson).getOrElse("")
    val _storage_batchSize= root.storage.batchSize.int
    val storage_batchSize: String = _storage_batchSize.getOption(finalJson).getOrElse("").toString
    val _storage_partitions= root.storage.partitions.int
    val storage_partitions: String = _storage_partitions.getOption(finalJson).getOrElse("").toString
    val _storage_url= root.storage.url.string
    val storage_url: String = _storage_url.getOption(finalJson).getOrElse("")
    val _storage_driver= root.storage.driver.string
    val storage_driver: String = _storage_driver.getOption(finalJson).getOrElse("")
    val _storage_username= root.storage.username.string
    val storage_username: String = _storage_username.getOption(finalJson).getOrElse("")
    val _storage_password= root.storage.password.string
    val storage_password: String = _storage_password.getOption(finalJson).getOrElse("")

    SSConfigMap += ("tdv_enable" -> tdv_enable, "tdv_username" -> tdv_username , "tdv_password" -> tdv_password)
    SSConfigMap += ("tdv_jdbcPort" -> tdv_jdbcPort,"tdv_workers" -> tdv_workers, "tdv_k8sEnable" -> tdv_k8sEnable)
    SSConfigMap += ("tdv_k8sNamespace" -> tdv_k8sNamespace, "tdv_k8sPodName" -> tdv_k8sPodName)
    SSConfigMap += ("messaging_endpoint" -> messaging_endpoint, "messaging_key" -> messaging_key , "messaging_configURL" -> messaging_configURL)
    SSConfigMap += ("storage_type" -> storage_type, "storage_batchSize" -> storage_batchSize, "storage_partitions" -> storage_partitions)
    SSConfigMap += ("storage_url" -> storage_url, "storage_driver"->storage_driver, "storage_username" -> storage_username, "storage_password" -> storage_password )
    return SSConfigMap
  }
  def deploySecretFile(secretName: String): Unit = {

      import sys.process._

      //val stdout = new StringBuilder
      //val stderr = new StringBuilder
      //val process_logger: ProcessLogger = ProcessLogger(stdout append _, stderr append _)

      val cmd = s"kubectl delete -f /tmp/k8s/spark-${secretName}-secret.json"
      logger.info(s"$cmd")
      val status = Process(cmd).!
      logger.info(s"kubectl command delete exit with : $status")


    // ignoring not found errors
    // Error from server (NotFound)

      val cmd2 = s"kubectl apply -f /tmp/k8s/spark-${secretName}-secret.json"
      logger.info(s"$cmd2")
      val status2 = Process(cmd2).!
      logger.info(s"kubectl command create exit with : $status2")
  }

  def generateSecretFile(secretName: String): Unit = {
    logger.info(s"Generate Secret File for Spark Job : $secretName-secret")

    val secretString =s"""
         |{
         |  "apiVersion": "v1",
         |  "kind": "Secret",
         |  "metadata": {
         |    "name": "$secretName-secret",
         |    "namespace": "${configJson.k8s.K8S_NAMESPACE}"
         |  },
         |  "type": "Opaque",
         |  "data": {
         |    "TdvUsername": "${encodeBase64(configSS.tdv_username)}",
         |    "TdvPassword": "${encodeBase64(configSS.tdv_password)}",
         |    "TCIGetAnalysisPublicEndpoint": "${encodeBase64(configSS.messaging_configURL)}",
         |    "BackendJdbcUsername": "${encodeBase64(configSS.storage_username)}",
         |    "BackendJdbcPassword": "${encodeBase64(configSS.storage_password)}",
         |    "BackendType": "${encodeBase64(configSS.storage_type)}",
         |    "BackendSize": "${encodeBase64(configSS.storage_batchSize)}",
         |    "BackendNumParts": "${encodeBase64(configSS.storage_partitions)}",
         |    "BackendJdbcDriver": "${encodeBase64(configSS.storage_driver)}",
         |    "BackendJdbcUrl": "${encodeBase64(configSS.storage_url)}",
         |    "TCMKey": "${encodeBase64(configSS.messaging_key)}",
         |    "TCMUrl": "${encodeBase64(configSS.messaging_endpoint)}",
         |    "CIC_OAUTH_KEY": "${encodeBase64(cic_oauth)}",
         |    "CIC_REGION": "${encodeBase64(cic_region)}",
         |    "CIC_APPID": "${encodeBase64(cic_app_id)}"
         |  }
         |}
        |""".stripMargin
    import better.files.{File => ScalaFile}
    val secretFile = ScalaFile(s"/tmp/k8s/spark-$secretName-secret.json")

    Try{
      secretFile.write(secretString)
    } match {
      case Success(v) => logger.info(s"Spark Secret File Generated")
      case Failure(e) => logger.error("ERROR : " + e.getMessage)
        throw e
    }



  }

  def encodeBase64(input: String): String = {
    import java.nio.charset.StandardCharsets
    val encodedString = java.util.Base64.getEncoder.encodeToString(input.getBytes(StandardCharsets.UTF_8))
    return encodedString
  }

  def decodeBase64(input: String): String = {
    import java.util.Base64
    val _decoder: Base64.Decoder = Base64.getDecoder
    val decodedString = new String(_decoder.decode(input))
    return decodedString
  }

  def mapToJson(map: Map[String, Any]): Json =
    map.mapValues(anyToJson).asJson

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
    case map: Map[_,_] if map.keySet.forall(_.isInstanceOf[String]) => mapToJson(map.asInstanceOf[Map[String, Any]])
  }

  def mapToCaseClass[T : Decoder](map: Map[String, Any]): T = mapToJson(map).as[T].right.get


}
