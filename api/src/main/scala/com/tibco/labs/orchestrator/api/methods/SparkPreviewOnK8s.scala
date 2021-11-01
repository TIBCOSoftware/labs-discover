package com.tibco.labs.orchestrator.api.methods

import com.google.gson.Gson
import com.tibco.labs.orchestrator.conf.DiscoverConfig
import com.tibco.labs.orchestrator.models.previewConfigFile
import io.circe.optics.JsonPath.{root => Jsonroot}
import io.circe.{Json, parser}
import io.kubernetes.client.openapi.apis.{CoreV1Api, CustomObjectsApi}
import io.kubernetes.client.openapi.{ApiClient, ApiException, Configuration, JSON}
import io.kubernetes.client.util.ClientBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.yaml.snakeyaml.Yaml

import java.nio.file.{Files, Path}
import scala.io.BufferedSource
import scala.util.matching.Regex
import scala.util.{Failure, Success, Try}


class SparkPreviewOnK8s() {

  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)
  var client: ApiClient = ClientBuilder.cluster().build().setDebugging(false)

  val k8sSparkAppGroup = "sparkoperator.k8s.io"
  val k8sSparkVersion = "v1beta2"
  val k8sSparkKind = "sparkapplications"

  val namespace: String = sys.env.get("NAMESPACE").getOrElse("spark-operator")
  log.info(s"Namespace from env: $namespace")
  //val secretName = "testAPISecret".toLowerCase

  // set the global default api-client to the in-cluster one from above
  Configuration.setDefaultApiClient(client)
  val api: CoreV1Api = new CoreV1Api(client)


  def sparkApplication(previewConfig: previewConfigFile): (String, Int, String, String) = {
    val apiInstance: CustomObjectsApi = new CustomObjectsApi(client)
    var jsonk8s: Json = Json.Null

    import better.files.{File => ScalaFile}
    import io.circe.generic.auto._
    import io.circe.syntax._
    import io.circe.yaml.syntax._

    val domain: String = DiscoverConfig.config.spark.preview.image_domain
    val name: String = DiscoverConfig.config.spark.preview.image
    val version: String = DiscoverConfig.config.spark.preview.image_version
    val templateName: String = DiscoverConfig.sparkPreviewFile.toAbsolutePath.toString

    log.info(s"Docker image name ${name}")
    log.info(s"Docker image version ${version}")
    log.info(s"Docker image repo  ${domain}")

    val regex: Regex = "[+._, ]".r

    //val meta_name: String = (regex.replaceAllIn(previewConfig.DatasetId, "-")).toLowerCase()
    val meta_name: String = normalizerStringDNS(previewConfig.DatasetId)
    val orgId: String = normalizerStringDNS(previewConfig.Organization)

    import scala.io.Source

    //val k8sTemplate: String = Source.fromResource(s"${templateName}").mkString

    val k8sTemplateBuffer: BufferedSource = Source.fromFile(s"${templateName}")

    val k8sTemplate: String = k8sTemplateBuffer.mkString

    k8sTemplateBuffer.close()

    // convert a Java file to Scala

    val k8sFile = ScalaFile(s"/data/${orgId}/${meta_name}.yaml")
    val pmConfigFile = ScalaFile(s"/data/${orgId}/${meta_name}-preview-config.json")
    val pathToFile: Path = k8sFile.path.toAbsolutePath
    Files.createDirectories(pathToFile.getParent)
    //val k8sFile: File = root/"tmp"/"k8s"/s"${meta_name}.yaml"
    log.debug(s"Template to be used : ${k8sTemplate}")
    log.info(s"File to be produced : ${k8sFile}")

    val jobName = normalizerStringDNS(s"spark-preview-${orgId}-${meta_name}")
    //load the template and modify it..
    jsonk8s = io.circe.parser.parse(s"""${k8sTemplate}""").getOrElse(Json.Null)

    val _secret = DiscoverConfig._secretName
    val modImg: Json => Json = Jsonroot.spec.image.string.modify(_ => s"${domain}/${name}:${version}")
    val modName: Json => Json = Jsonroot.metadata.name.string.modify(_ => jobName)
    val modSecret: Json => Json = Jsonroot.spec.driver.envFrom(0).secretRef.name.string.modify(_ => s"${_secret}")
    val modSecret2: Json => Json = Jsonroot.spec.executor.envFrom(0).secretRef.name.string.modify(_ => s"${_secret}")
    val modArg0: Json => Json = Jsonroot.spec.arguments(0).string.modify(_ => s"${pmConfigFile.canonicalPath}")

    //val modArg0: Json => Json = Jsonroot.spec.arguments(0).string.modify(_ => s"${previewConfig.DatasetId}")
    val modArg1: Json => Json = Jsonroot.spec.arguments(1).string.modify(_ => s"${previewConfig.DatasetId}")
    //val modArg2: Json => Json = Jsonroot.spec.arguments(2).string.modify(_ => s"${previewConfig.Token}")

    jsonk8s = modName(jsonk8s)
    jsonk8s = modImg(jsonk8s)
    jsonk8s = modSecret(jsonk8s)
    jsonk8s = modSecret2(jsonk8s)
    jsonk8s = modArg0(jsonk8s)
    jsonk8s = modArg1(jsonk8s)
    //jsonk8s = modArg2(jsonk8s)


    //write the file to fs

    Try {
      k8sFile.overwrite(jsonk8s.spaces2)
    } match {
      case Success(v) => log.info(s"File written")
      case Failure(e) => log.error("ERROR : " + e.getMessage)
        throw e
    }
    Try {
      pmConfigFile.overwrite(previewConfig.asJson.spaces2)
    } match {
      case Success(v) => log.info(s"File written")
      case Failure(e) => log.error("ERROR : " + e.getMessage)
        throw e
    }
    var returnCode: Int = 0
    var returnMessage: String = ""
    val body: String = jsonk8s.asJson.asYaml.spaces2
    val yaml: Yaml = new Yaml
    val data: Object = yaml.load(body)
    log.info(data.toString)
    //apiInstance.createNamespacedCustomObject("sparkoperator.k8s.io", "v1beta2", namespace,"sparkapplications", data,"false",null,null)

    Try {
      val req: Object = apiInstance.createNamespacedCustomObject(k8sSparkAppGroup, k8sSparkVersion, namespace, k8sSparkKind, data, "false", null, null)
    } match {
      case Success(value) => {
        log.info("ok")
        (s"$jobName has been succesfully put to Orbit", returnCode, "CREATED", jobName)
      }
      case Failure(exception: ApiException) => {
        log.error(s"Error : ${exception.getCode} with ${exception.getResponseBody} ")
        (s"$jobName K8s Error : ${exception.getResponseBody} ", exception.getCode, "ERROR", jobName)
      }
      case Failure(x: Throwable) => {
        log.error(s"Error : ${x.getMessage}")
        (s"spark-preview-${orgId}-${meta_name} Error", 100, "YOUR_LAST_MISTAKE", s"spark-preview-${orgId}-${meta_name}")
      }
    }
  }

  def sparkDeleteApplication(jobName: String): (String, Int, String, String) = {
    val apiInstance: CustomObjectsApi = new CustomObjectsApi(client)
    var returnCode: Int = 0
    Try {
      val req: Object = apiInstance.deleteNamespacedCustomObject(k8sSparkAppGroup, k8sSparkVersion, namespace, k8sSparkKind, jobName, 0, true, null, null, null)
    } match {
      case Success(value) => {
        log.info("ok")
        (s"${jobName} has been blasted and send to outer space", returnCode, "DELETED", s"${jobName}")
      }
      case Failure(exception: ApiException) => {
        log.error(s"Error : ${exception.getCode} with ${exception.getResponseBody} ")
        if (exception.getCode == 404) {
          (s"${jobName}  Not Found", exception.getCode, "NOT_FOUND", s"${jobName}")
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
        log.info("ok")
        (s"${jobName} has been retrieved amongs objects in the galaxy", returnCode, returnStatus, s"${jobName}")
      }
      case Failure(exception: ApiException) => {
        log.error(s"Error : ${exception.getCode} with ${exception.getResponseBody} ")
        if (exception.getCode == 404) {
          (s"${jobName}  Not Found", exception.getCode, "NOT_FOUND", s"${jobName}")
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

  def normalizerStringDNS(aString: String): String = {
    val tmpString = org.apache.commons.lang3.StringUtils.stripAccents(aString.replaceAll("[ ,;{}()\n\t=._+]+", "-")).toLowerCase.take(63)
    val sClean: String = tmpString.takeRight(1) match {
      case "-" => tmpString.dropRight(1)
      case _ => tmpString
    }
    sClean
  }
  /*
    private def encodeBase64(input: String): String = {
      import java.nio.charset.StandardCharsets
      val encodedString = java.util.Base64.getEncoder.encodeToString(input.getBytes(StandardCharsets.UTF_8))
      encodedString
    }
  */
}
