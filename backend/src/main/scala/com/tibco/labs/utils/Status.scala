/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import com.tibco.labs.utils.commons.{analysisVersion, spark, tokenCic}
import org.apache.spark.internal.Logging

import java.time.LocalDateTime
import sttp.capabilities
import sttp.model.{MediaType, StatusCode}

object Status extends Logging{

  case class Status(
                     organisation: String,
                     jobName: String,
                     analysisId: String,
                     message: String,
                     level: String,
                     progression: Long,
                     timestamp: String
                   )


  def sendBottleToTheSea(analysisID: String, analysisStatus: String, message: String, progress: Long, orgId: String): Unit = {
    val time = LocalDateTime.now().toString
    val level = if(analysisStatus.equalsIgnoreCase("error")) "ERROR" else "INFO"
    val jobName = s"spark-pm-${analysisID.toLowerCase}"

    val fullId = s"$analysisID-$analysisVersion"

    val payload: Status = Status(orgId, jobName, analysisID, message, level, progress, time)


    import sttp.client3.circe._
    import io.circe.generic.auto._
    import io.circe.syntax._
    import sttp.client3._
    val sttpBackend: SttpBackend[Identity, Any] = HttpURLConnectionBackend()
    logInfo(s"Status payload for $fullId : $payload")
    val statusRequest: Request[Either[String, String], Any] = basicRequest
      .auth.bearer(tokenCic)
      .contentType("application/json")
      .body(payload)
      .post(uri"http://analysis-service-pub:8080/repository/analysis/${fullId}/status")

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


}
