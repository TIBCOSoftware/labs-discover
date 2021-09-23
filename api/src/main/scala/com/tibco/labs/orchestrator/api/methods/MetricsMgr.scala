/*
 * Copyright (c) $today.year.TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this project.
 */

package com.tibco.labs.orchestrator.api.methods

import com.tibco.labs.orchestrator.models.{MetricsDS, MetricsTable, profiles}
import doobie.Fragment
import io.circe.generic.auto._
import org.slf4j.LoggerFactory
import doobie._
import doobie.implicits._
import cats.effect.{Blocker, IO, IOApp, Resource}
import com.tibco.labs.orchestrator.utils.Doobie.transactor
import doobie.util.transactor.Transactor.Aux
import doobie.Fragment
import doobie._
import doobie.implicits._
import cats.effect.{Blocker, IO, IOApp, Resource}

import scala.util.{Failure, Success, Try}

class MetricsMgr {

  import com.tibco.labs.orchestrator.utils.Redis._

  import collection.JavaConverters._

  val log = LoggerFactory.getLogger(this.getClass.getName)

  def storeDSMetrics(config: MetricsDS): (String, Int, String) = {

    import io.circe.generic.auto._
    import io.circe.syntax._
    log.info(s"Storing Metrics for Datasets : ${config.DatasetID}")

    Try {
      withRedis { jedis =>

        jedis.select(9)
        jedis.hmset(s"metrics:datasets:${config.Organisation}:${config.DatasetID}", Map(
          "Organisation" -> config.Organisation,
          "DatasetID" -> config.DatasetID,
          "JobName" -> config.JobName,
          "Metrics" -> config.Metrics.asJson.spaces2,
          "TotalRows" -> config.TotalRows.toString,
          "DuplicatedRows" -> config.DuplicatedRows.toString,
          "DatabaseInsertionPerformance" -> config.DurationDB.toString,
          "SparkJobTime" -> config.DurationJob.toString,
          "TimeStamp" -> config.TimeStamp.toString,
          "rawMessage" -> config.asJson.spaces2
        ).asJava)
        jedis.close()

      }
    } match {
      case Failure(exception) => ("Stored Metrics failed", 10, config.Organisation)
      case Success(value) => ("Stored Metrics", 0, config.Organisation)
    }

  }

  def getDetailsDSMetrics(assetId: String, OrgId: String): (String, Int, MetricsDS) = {


    log.info("Retrieving key from REDIS")
    val emptyMetrics = new MetricsDS(
      OrgId,
      "None",
      "None",
      List(new profiles(Some("None"), Some("None"), 0, Some("None"), Some("None"), Some("None"),Some("None"),Some("None"),Some("None"), Some("None"), Some("None"), Some("None"), Some("None"), Some("None"), Some("None"))),
      0,
      0,
      0,
      0,
      0
    )

    val key = s"metrics:datasets:$OrgId:$assetId"
    var fetchRes: String = ""
    withRedis { jedis =>
      jedis.select(9)
      if (jedis.exists(key)) {
        fetchRes = jedis.hget(key, "rawMessage")
      }
    }

    log.info(fetchRes)
    if (!fetchRes.isEmpty) {
      log.info(":::key Found:::")
      io.circe.parser.decode[MetricsDS](fetchRes) match {
        case Left(value) => {
          log.error("Error in parsing")
          return ("Key found but parsing in error", 404, emptyMetrics)
        }
        case Right(value) => {
          log.info("Yipicai")
          return ("Key found", 0, value)
        }
      }

    } else {
      return ("Key not found", 120, emptyMetrics)
    }


  }

  def deleteDSMetrics(assetId: String, OrgId: String): (String, Int, String) = {


    log.info("Retrieving key from REDIS")

    val key = s"metrics:datasets:$OrgId:$assetId"
    withRedis { jedis =>
      jedis.select(9)
      if (jedis.exists(key)) {
        jedis.del(key)
        jedis.close()
      } else {
        return ("Key not found", 404, "Skipped")
      }
    }
    (s"$key is deleted", 0, "OK")

  }


  //returns All variants from a given analysis. can be huge
  def findMetricsById(analysidId: String, orgId:String): doobie.Query0[MetricsTable] = {
    (Fragment.const(
      s"""
         |SELECT m."num_of_events", m."num_of_cases", m."num_of_activities", m."avgtime", m."mediantime", m."num_of_variants", m."max_activities", m."min_activities", m."analysis_id"
         |FROM org_$orgId.metrics m
         |where m."analysis_id" = """.stripMargin) ++ fr"$analysidId").query[MetricsTable]
  }

  def getDetailsAnalysisMetrics(analysisId: String, OrgId: String): (String, Int, MetricsTable) = {
    val emptyMetrics = MetricsTable(Some(0L),Some(0L),Some(0L),Some(0L),Some(0L),Some(0L),Some(0L),Some(0L),Some(analysisId))
    Try {
      transactor.use{ xa =>
         findMetricsById(analysisId, OrgId).stream.compile.toList.transact(xa)
      }.unsafeRunSync()
    } match {
      case Failure(exception) => {
        log.error(s"db exception : ${exception.getMessage}")
        ("Error getting data", 10, emptyMetrics)
      }
      case Success(value) => {
        if (value.nonEmpty) {
          val res = value.head
          ("OK", 0, res)
        } else {
          log.error("Analysis Metrics missing " + value)
          ("Analysis Metrics missing", 404, emptyMetrics)
        }

      }
    }
  }
}
