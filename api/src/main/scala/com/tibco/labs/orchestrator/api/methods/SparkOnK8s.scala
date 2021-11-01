package com.tibco.labs.orchestrator.api.methods

import com.google.gson.Gson
import com.tibco.labs.orchestrator.conf.DiscoverConfig
import com.tibco.labs.orchestrator.models.pmConfigLiveApps
import io.circe.optics.JsonPath.{root => Jsonroot}
import io.circe.{Json, parser}
import io.kubernetes.client.openapi.apis.{CoreV1Api, CustomObjectsApi}
import io.kubernetes.client.openapi.models.V1SecretList
import io.kubernetes.client.openapi.{ApiClient, ApiException, Configuration, JSON}
import io.kubernetes.client.util.ClientBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.yaml.snakeyaml.Yaml

import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path}
import scala.collection.mutable
import scala.io.BufferedSource
import scala.util.matching.Regex
import scala.util.{Failure, Success, Try}


class SparkOnK8s() {

  //pmConfig: pmConfigLiveApps

  import scala.collection.JavaConverters._

  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)
  var client: ApiClient = ClientBuilder.cluster().build().setDebugging(false)

  val k8sSparkAppGroup = "sparkoperator.k8s.io"
  val k8sSparkVersion = "v1beta2"
  val k8sSparkKind = "sparkapplications"

  val namespace: String = sys.env.getOrElse("NAMESPACE", "spark-operator")
  //val secretName = "testAPISecret".toLowerCase

  // set the global default api-client to the in-cluster one from above
  Configuration.setDefaultApiClient(client)
  val api: CoreV1Api = new CoreV1Api(client)


  def sparkEnvironmentSecret(dataToEncode: Map[String, String], secretName: String): Any = {

    import io.kubernetes.client.openapi.models.V1SecretBuilder

    var dataMap: mutable.Map[String, Array[Byte]] = scala.collection.mutable.Map[String, Array[Byte]]()

    try {
      dataToEncode.foreach(map => {
        log.info(s"encoding ${map._1} ...")
        // Already encoded in base64...
        dataMap += (map._1 -> map._2.getBytes(StandardCharsets.UTF_8))
      }
      )
      val secretBody = new V1SecretBuilder()
        .withApiVersion("v1")
        .withKind("Secret")
        .withNewMetadata()
        .withName(secretName)
        .withNamespace(namespace)
        .endMetadata()
        .withData(dataMap.asJava)
        .withType("Opaque")
        .build()

      val previousSecrets: V1SecretList = api.listNamespacedSecret(namespace, "false", null, null, null, null, null, null, null, null, null)
      var foundedSecrets = 0
      for (item <- previousSecrets.getItems.asScala) {
        log.info(s"Found secret : ${item.getMetadata.getName}")
        if (item.getMetadata.getName == secretName) {
          log.info(s"Secret ${secretName} already exists...deleting first")
          //First Delete
          api.deleteNamespacedSecret(secretName, namespace, "false", null, null, null, null, null)
          // then create/update
          log.info(s"Secret ${secretName} creation...")
          api.createNamespacedSecret(namespace, secretBody, "false", null, null)
          foundedSecrets += 1
        }
      }
      if (foundedSecrets.equals(0)) {
        log.info(s"First time Secret ${secretName} creation...")
        api.createNamespacedSecret(namespace, secretBody, "false", null, null)
      }
    } catch {
      case ae: ApiException => log.error(s"Error : ${ae.getMessage}")
    }

  }


  def sparkApplication(pmConfig: pmConfigLiveApps): (String, Int, String, String) = {
    val apiInstance: CustomObjectsApi = new CustomObjectsApi(client)
    var jsonk8s: Json = Json.Null

    import better.files.{File => ScalaFile}
    import io.circe.generic.auto._
    import io.circe.syntax._
    import io.circe.yaml.syntax._

    val domain: String = DiscoverConfig.config.spark.process_mining.image_domain
    val name: String = DiscoverConfig.config.spark.process_mining.image
    val version: String = DiscoverConfig.config.spark.process_mining.image_version
    val templateName: String = DiscoverConfig.sparkFile.toAbsolutePath.toString

    log.info(s"Docker image name ${name}")
    log.info(s"Docker image version ${version}")
    log.info(s"Docker image repo  ${domain}")

    val regex: Regex = "[+._, ]".r

    val meta_name: String = (regex.replaceAllIn(pmConfig.id, "-")).toLowerCase()
    val orgId: String = (regex.replaceAllIn(pmConfig.organization, "-")).toLowerCase()

    import scala.io.Source

    //val k8sTemplate: String = Source.fromResource(s"${templateName}").mkString

    val k8sTemplateBuffer: BufferedSource = Source.fromFile(s"${templateName}")

    val k8sTemplate: String = k8sTemplateBuffer.mkString

    k8sTemplateBuffer.close()

    // convert a Java file to Scala

    val k8sFile = ScalaFile(s"/data/${orgId}/${meta_name}.yaml")
    val pmConfigFile = ScalaFile(s"/data/${orgId}/${meta_name}-config.json")
    val pathToFile: Path = k8sFile.path.toAbsolutePath
    Files.createDirectories(pathToFile.getParent)
    //val k8sFile: File = root/"tmp"/"k8s"/s"${meta_name}.yaml"
    log.debug(s"Template to be used : ${k8sTemplate}")
    log.info(s"File to be produced : ${k8sFile}")

    //load the template and modify it..
    jsonk8s = io.circe.parser.parse(s"""${k8sTemplate}""").getOrElse(Json.Null)

    val _secret = DiscoverConfig._secretName
    val modName: Json => Json = Jsonroot.metadata.name.string.modify(_ => s"spark-pm-${meta_name}")
    val modArg: Json => Json = Jsonroot.spec.arguments(0).string.modify(_ => s"${pmConfig.id}")
    val modImg: Json => Json = Jsonroot.spec.image.string.modify(_ => s"${domain}/${name}:${version}")
    val modSecret: Json => Json = Jsonroot.spec.driver.envFrom(0).secretRef.name.string.modify(_ => s"${_secret}")
    val modSecret2: Json => Json = Jsonroot.spec.executor.envFrom(0).secretRef.name.string.modify(_ => s"${_secret}")
    val modArgs: Json => Json = Jsonroot.spec.arguments(1).string.modify(_ => s"${pmConfigFile.canonicalPath}")

    val modOpts1: Json => Json = Jsonroot.spec.sparkConf.`spark.driver.extraJavaOptions`.string.modify(_ => s"-Dlog4j.configuration=file:///log4j.properties -Dlogfile.name=spark-pm-${meta_name}")
    val modOpts2: Json => Json = Jsonroot.spec.sparkConf.`spark.executor.extraJavaOptions`.string.modify(_ => s"-Dlog4j.configuration=file:///log4j.properties -Dlogfile.name=spark-pm-${meta_name}")


    jsonk8s = modName(jsonk8s)
    jsonk8s = modArg(jsonk8s)
    jsonk8s = modImg(jsonk8s)
    jsonk8s = modSecret(jsonk8s)
    jsonk8s = modSecret2(jsonk8s)
    jsonk8s = modArgs(jsonk8s)

    jsonk8s = modOpts1(jsonk8s)
    jsonk8s = modOpts2(jsonk8s)

    //logger.info(jsonk8s.spaces2)

    //write the file to fs

    Try {
      k8sFile.overwrite(jsonk8s.spaces2)
    } match {
      case Success(v) => log.info(s"File written ${v.path}")
      case Failure(e) => log.error("ERROR : " + e.getMessage)
        throw e
    }
    Try {
      pmConfigFile.overwrite(pmConfig.asJson.spaces2)
    } match {
      case Success(v) => log.info(s"File written  ${v.path}")
      case Failure(e) => log.error("ERROR : " + e.getMessage)
        throw e
    }
    var returnCode: Int = 0
    //var returnMessage: String = ""
    val body: String = jsonk8s.asJson.asYaml.spaces2
    val yaml: Yaml = new Yaml
    val data: Object = yaml.load(body)
    log.info(data.toString)
    //apiInstance.createNamespacedCustomObject("sparkoperator.k8s.io", "v1beta2", namespace,"sparkapplications", data,"false",null,null)

    Try {
      apiInstance.createNamespacedCustomObject(k8sSparkAppGroup, k8sSparkVersion, namespace, k8sSparkKind, data, "false", null, null)
    } match {
      case Success(value) => {
        log.info(s"$value")
        (s"spark-pm-${meta_name} has been successfully put to Orbit", returnCode, "CREATED", s"spark-pm-${meta_name}")
      }
      case Failure(exception: ApiException) => {
        log.error(s"Error : ${exception.getCode} with ${exception.getResponseBody} ")
        returnCode = exception.getCode
        (s"spark-pm-${meta_name} K8s Error : ${exception.getResponseBody} ", returnCode, "ERROR", s"spark-pm-${meta_name}")
      }
      case Failure(x: Throwable) => {
        log.error(s"Error : ${x.getMessage}")
        returnCode = 100
        (s"spark-pm-${meta_name} Error", returnCode, "YOUR_LAST_MISTAKE", s"spark-pm-${meta_name}")
      }
    }
  }

  def sparkDeleteApplication(jobName: String): (String, Int, String, String) = {
    val apiInstance: CustomObjectsApi = new CustomObjectsApi(client)
    var returnCode: Int = 0
    Try {
      apiInstance.deleteNamespacedCustomObject(k8sSparkAppGroup, k8sSparkVersion, namespace, k8sSparkKind, jobName, 10, true, null, null, null)
    } match {
      case Success(value) => {
        log.info(s"$value")
        (s"${jobName} has been blasted and send to outer space", returnCode, "DELETED", s"${jobName}")
      }
      case Failure(exception: ApiException) => {
        log.error(s"Error : ${exception.getCode} with ${exception.getResponseBody} ")
        if (exception.getCode == 404) {
          returnCode = exception.getCode
          (s"${jobName}  Not Found", returnCode, "NOT_FOUND", s"${jobName}")
        } else {
          returnCode = exception.getCode
          (s"${jobName}  K8s Error : ${exception.getResponseBody} ", returnCode, "ERROR", s"${jobName}")

        }
      }
      case Failure(x: Throwable) => {
        log.error(s"Error : ${x.getMessage}")
        (s"${jobName}  Error", 100, "YOUR_LAST_MISTAKE", s"${jobName}")
      }
    }
  }

  def sparkGetStatusApplication(jobName: String): (String, Int, String, String) = {
    val apiInstance: CustomObjectsApi = new CustomObjectsApi(client)
    var returnCode: Int = 0
    var returnStatus: String = ""
    Try {
      val req: Object = apiInstance.getNamespacedCustomObjectStatus(k8sSparkAppGroup, k8sSparkVersion, namespace, k8sSparkKind, jobName)
      val jRaw = convertObjectToJsonString(req)
      log.info(s" convert to Json ${jRaw}")

      val jsonRawValue: Json = parser.parse(jRaw).getOrElse(Json.Null)
      if (!jsonRawValue.isNull) {
        val jsonRawFromCursor: Option[String] = jsonRawValue
          .hcursor
          .downField("status")
          .downField("applicationState")
          .get[String]("state")
          .toOption

        log.info(s"Status : ${jsonRawFromCursor.getOrElse("null")}")
        returnStatus = jsonRawFromCursor.getOrElse("null")
      } else if (jsonRawValue.isNull) {
        log.error(s"Fail parsing return")
      } else {
        log.error(s"unreachable ??")
      }


    } match {
      case Success(value) => {
        log.info(s"$value")
        (s"${jobName} has been retrieved amongs objects in the galaxy", returnCode, returnStatus, s"${jobName}")
      }
      case Failure(exception: ApiException) => {
        log.error(s"Error : ${exception.getCode} with ${exception.getResponseBody} ")
        if (exception.getCode == 404) {
          returnCode = exception.getCode
          (s"${jobName}  Not Found", returnCode, "NOT_FOUND", s"${jobName}")
        } else {
          (s"${jobName}  K8s Error : ${exception.getResponseBody} ", exception.getCode, "ERROR", s"${jobName}")
        }
      }
      case Failure(x: Throwable) => {
        log.error(s"Error : ${x.getMessage}")
        (s"${jobName}  Error", 100, "YOUR_LAST_MISTAKE", s"${jobName}")
      }
    }
  }

  private def convertObjectToJsonString(o: Object): String = {
    if (o == null) return null
    val gson: Gson = new JSON().getGson
    val json = gson.toJson(o)
    return json
  }
  /*
    private def encodeBase64(input: String): String = {
      import java.nio.charset.StandardCharsets
      val encodedString = java.util.Base64.getEncoder.encodeToString(input.getBytes(StandardCharsets.UTF_8))
      encodedString
    }
  */
}
