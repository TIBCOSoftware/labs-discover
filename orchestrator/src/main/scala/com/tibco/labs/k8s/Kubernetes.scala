package com.tibco.labs.k8s

import java.nio.file.{Files, Path}
import java.time.LocalDateTime

import _root_.io.circe.optics.JsonPath.{root => Jsonroot}
import _root_.io.circe.{Json, parser}
import better.files.{File => ScalaFile}
import com.typesafe.config.ConfigFactory
import com.typesafe.scalalogging.Logger

import scala.util.matching.Regex
import scala.util.{Failure, Success, Try}
import com.tibco.labs.utils.RespondTCM.sendTCMMessage



class Kubernetes {

  var jsonk8s: Json = Json.Null

  val logger = Logger("spark-orchestrator-kubernetes")
/*  val config = ConfigFactory.load("application.conf")
  val domain: String = sys.env.getOrElse("K8S_DOMAIN", config.getString("K8S.domain"))
  val name: String = sys.env.getOrElse("K8S_NAME", config.getString("K8S.name"))
  val version: String = sys.env.getOrElse("K8S_VERSION", config.getString("K8S.version"))
  val templateName: String = sys.env.getOrElse("K8S_TEMPLATE", config.getString("K8S.template"))*/

  val domain: String = DiscoverConfig.configJson.k8s.K8S_DOCKER_DOMAIN
  val name: String = DiscoverConfig.configJson.k8s.K8S_DOCKER_IMAGE
  val version: String = DiscoverConfig.configJson.k8s.K8S_DOCKER_VERSION
  val templateName: String = DiscoverConfig.sparkJobDataFile.getAbsolutePath


  logger.info("Kubernetes Class")
  logger.info(s"Docker image name ${name}")
  logger.info(s"Docker image version ${version}")
  logger.info(s"Docker image repo  ${domain}")

  def kubernetesLaunch(caseRef: String, analysis_id: String) = {

    val regex: Regex = "[+._, ]".r

    val meta_name: String = (regex.replaceAllIn(caseRef, "-")).toLowerCase()

    import scala.io.Source

    //val k8sTemplate: String = Source.fromResource(s"${templateName}").mkString

    val k8sTemplate: String = Source.fromFile(s"${templateName}").mkString

    // convert a Java file to Scala
    val k8sFile = ScalaFile(s"/tmp/k8s/${meta_name}.yaml")
    val pathToFile: Path = k8sFile.path.toAbsolutePath
    Files.createDirectories(pathToFile.getParent)
    //val k8sFile: File = root/"tmp"/"k8s"/s"${meta_name}.yaml"
    logger.debug(s"Template to be used : ${k8sTemplate}")
    logger.info(s"File to be produced : ${k8sFile}")

    //load the template and modify it..
    jsonk8s = parser.parse(s"""${k8sTemplate}""").getOrElse(Json.Null)

    val _secret: String = (regex.replaceAllIn(DiscoverConfig.configJson.env, "-")).toLowerCase()

    val modName: Json => Json = Jsonroot.metadata.name.string.modify(_ => s"spark-pm-${meta_name}")
    val modArg: Json => Json = Jsonroot.spec.arguments(0).string.modify(_ => s"${analysis_id}")
    val modImg: Json => Json = Jsonroot.spec.image.string.modify(_ => s"${domain}/${name}:${version}")
    val modSecret: Json => Json = Jsonroot.spec.driver.envFrom(0).secretRef.name.string.modify(_ => s"${_secret}-secret")
    val modSecret2: Json => Json = Jsonroot.spec.executor.envFrom(0).secretRef.name.string.modify(_ => s"${_secret}-secret")
    val modArgs: Json => Json = Jsonroot.spec.arguments(1).string.modify(_ => s"${DiscoverConfig.configJson.env}")


    jsonk8s = modName(jsonk8s)
    jsonk8s = modArg(jsonk8s)
    jsonk8s = modImg(jsonk8s)
    jsonk8s = modSecret(jsonk8s)
    jsonk8s = modSecret2(jsonk8s)
    jsonk8s = modArgs(jsonk8s)

    //logger.info(jsonk8s.spaces2)

    //write the file to fs

    Try {
      k8sFile.overwrite(jsonk8s.spaces2)
    } match {
      case Success(v) => logger.info(s"File written")
      case Failure(e) => logger.error("ERROR : " + e.getMessage)
        throw e
    }

    // exec the kubectl command..
    Try {
      import sys.process._
      val stdout = new StringBuilder
      val stderr = new StringBuilder
      val process_logger: ProcessLogger = ProcessLogger(stdout append _, stderr append _)

      //val cmd = s"ls -la ${k8sFile}"
      val cmd = s"kubectl create -f ${k8sFile}"
      val status = cmd ! process_logger

      logger.info(s"kubectl command exit with : $status")
      logger.info("stdout: " + stdout)
      if (!stderr.isEmpty) {
        logger.error("stderr: " + stderr)
        sendTCMMessage(s"$analysis_id",s"$caseRef","error","Orchestrator kubctl error : " + stderr, 0, DiscoverConfig.configJson.env , LocalDateTime.now().toString)
      }
    } match {
      case Success(v) => logger.info(s"Spark application launched")
        sendTCMMessage(s"$analysis_id",s"$caseRef","progress","Submit",6, DiscoverConfig.configJson.env, LocalDateTime.now().toString)
      case Failure(e) => logger.error("ERROR : " + e.getMessage)
        throw e
    }
  }

  def kubernetesRemove(caseRef: String, analysis_id: String) = {

    val regex: Regex = "[+._, ]".r

    val meta_name: String = (regex.replaceAllIn(caseRef, "-")).toLowerCase()

    import scala.io.Source

    val k8sTemplate: String = Source.fromFile(s"${templateName}").mkString

    // convert a Java file to Scala
    val k8sFile = ScalaFile(s"/tmp/k8s/${meta_name}.yaml")

    Try {
      import sys.process._
      val stdout = new StringBuilder
      val stderr = new StringBuilder
      val process_logger: ProcessLogger = ProcessLogger(stdout append _, stderr append _)

      //val cmd = s"ls -la ${k8sFile}"
      val cmd = s"kubectl delete -f ${k8sFile}"
      val status = cmd ! process_logger


      logger.info(s"kubectl command exit with : $status")
      logger.info("stdout: " + stdout)
      if (!stderr.isEmpty) {
        logger.error("stderr: " + stderr)
      }
      if (status.equals(0)) {
        k8sFile.delete()
        logger.info(s"File deleted")
      }
    } match {
      case Success(v) => logger.info(s"Spark application deleted")
      case Failure(e) => logger.error("ERROR : " + e.getMessage)
        throw e
    }
  }
}
