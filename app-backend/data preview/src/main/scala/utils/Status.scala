package com.tibco.labs
package utils
/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/


import utils.common.{spark, token}
import org.apache.spark.internal.Logging

import java.time.{LocalDateTime, ZoneOffset}
import sttp.capabilities
import sttp.model.{MediaType, StatusCode}

object Status extends Logging{

  case class Status(
                     Organisation: String,
                     JobName: String,
                     DatasetID: String,
                     Message: String,
                     Level: String,
                     Progression: Long,
                     TimeStamp: Long
                   )


  def sendBottleToTheSea(DatasetID: String, analysisStatus: String, message: String, progress: Long, orgId: String): Unit = {
    val time = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC)
    val level = if(analysisStatus.equalsIgnoreCase("error")) "ERROR" else "INFO"
    val jobName = normalizerStringDNS(s"spark-preview-${orgId.toLowerCase}-${DatasetID}")

    val payload: Status = Status(orgId, jobName, DatasetID, message, level, progress, time)


    import sttp.client3.circe._
    import io.circe.generic.auto._
    import io.circe.syntax._
    import sttp.client3._
    val sttpBackend: SttpBackend[Identity, Any] = HttpURLConnectionBackend()

    val statusRequest: Request[Either[String, String], Any] = basicRequest
      .auth.bearer(token)
      .contentType("application/json")
      .body(payload)
      .post(uri"http://datasets-service-pub:8080/catalog/status")

    val statusResponse: Identity[Response[Either[String, String]]] = statusRequest.send(sttpBackend)

    //Fire and Forget
    statusResponse.code match {
      case StatusCode.Ok => logInfo("Status Updated")
      case _ => {
        statusResponse.body match {
          case Left(value) => logError("Status not updated, failed with" + value )
          case Right(value) => logError("Status not updated, failed with" + value )
        }
      }
    }
    sttpBackend.close()
    if(level.equals("ERROR")) errorHandler()
  }

  def errorHandler(): Unit = {
    logError("Exiting...")
    spark.stop()
    sys.exit(100)
  }

  def normalizerStringDNS(aString : String): String = {
    val tmpString = org.apache.commons.lang3.StringUtils.stripAccents(aString.replaceAll("[ ,;{}()\n\t=._+]+", "-")).toLowerCase.take(63)
    val sClean: String = tmpString.takeRight(1) match {
      case "-" => tmpString.dropRight(1)
      case _   => tmpString
    }
    sClean
  }


}
