package com.tibco.labs
package utils

/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/


import utils.common.{spark, token}

import org.apache.spark.internal.Logging
import sttp.model.StatusCode

import java.time.{LocalDateTime, ZoneOffset}

object MetricsSend extends Logging{

  case class Metrics(
                     Organisation: String,
                     JobName: String,
                     DatasetID: String,
                     Metrics: List[profiles],
                     DurationDB: Long,
                     DurationJob: Long,
                     TotalRows: Long,
                     DuplicatedRows : Long,
                     TimeStamp: Long
                   )


  def sendMetricsToRedis(DatasetID: String, data: List[profiles], DurationDB: Long, DurationJob: Long, orgId: String, total: Long, dup: Long): Unit = {
    val time = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC)
    val jobName = normalizerStringDNS(s"spark-preview-${orgId.toLowerCase}-${DatasetID}")

    val payload: Metrics = Metrics(orgId,jobName, DatasetID, data, DurationDB, DurationJob, total, dup,time)
    import io.circe._, io.circe.generic.auto._, io.circe.syntax._, io.circe.generic.JsonCodec
    logInfo(payload.asJson.spaces2)

    import io.circe.generic.auto._
    import sttp.client3._
    import sttp.client3.circe._
    val sttpBackend: SttpBackend[Identity, Any] = HttpURLConnectionBackend()

    val statusRequest: Request[Either[String, String], Any] = basicRequest
      .auth.bearer(token)
      .contentType("application/json")
      .body(payload)
      .post(uri"http://orchestrator-service-pub:8080/metrics/datasets")

    val statusResponse: Identity[Response[Either[String, String]]] = statusRequest.send(sttpBackend)

    //Fire and Forget
    statusResponse.code match {
      case StatusCode.Ok => logInfo("Metrics Updated")
      case _ => {
        statusResponse.body match {
          case Left(value) => logError("Metrics not updated, failed with" + value )
          case Right(value) => logError("Metrics not updated, failed with" + value )
        }
      }
    }
    sttpBackend.close()
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
