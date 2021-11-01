package com.tibco.labs.utils

/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/


import com.tibco.labs.config.analysisMetrics
import com.tibco.labs.utils.commons.{logger, tokenCic}
import sttp.model.StatusCode

import java.time.{LocalDateTime, ZoneOffset}

object MetricsSend {
  case class MetricsAnalysis(
                      Organisation: String,
                      jobName: String,
                      analysisID: String,
                      Metrics: analysisMetrics,
                      durationDB: Long,
                      durationJob: Long,
                      timeStamp: Long
                    )

  def sendMetricsToRedis(analysisID: String, data: analysisMetrics, DurationDB: Long, DurationJob: Long, orgId: String): Unit = {
    val time = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC)
    val jobName = s"spark-pm-${analysisID.toLowerCase}"

    val payload: MetricsAnalysis = MetricsAnalysis(orgId,jobName, analysisID, data, DurationDB, DurationJob,time)
    import io.circe.generic.auto._
    import io.circe.syntax._
    logger.info(payload.asJson.spaces2)

    import io.circe.generic.auto._
    import sttp.client3._
    import sttp.client3.circe._
    val sttpBackend: SttpBackend[Identity, Any] = HttpURLConnectionBackend()

    val statusRequest: Request[Either[String, String], Any] = basicRequest
      .auth.bearer(tokenCic)
      .contentType("application/json")
      .body(payload)
      .post(uri"http://orchestrator-service-pub:8080/metrics/analysis")

    val statusResponse: Identity[Response[Either[String, String]]] = statusRequest.send(sttpBackend)

    //Fire and Forget
    statusResponse.code match {
      case StatusCode.Ok => logger.info("Metrics Updated")
      case _ => {
        statusResponse.body match {
          case Left(value) => logger.error("Metrics not updated, failed with" + value )
          case Right(value) => logger.error("Metrics not updated, failed with" + value )
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
