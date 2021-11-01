/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import com.tibco.labs.utils.DataFrameUtils
import com.tibco.labs.utils.commons._
import io.circe.optics.JsonPath.root
import io.circe.{Json, parser}
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.functions.lit
import org.apache.spark.sql.{DataFrame, SparkSession}

import scala.util.{Failure, Success, Try}

object metrics {

  def AnalysisMetrics(df_cases: DataFrame, df_events: DataFrame, spark: SparkSession): DataFrame = {

    var df_out = spark.emptyDataFrame
    Try{
      logger.info(s"###########  Starting Metrics ##########")
      logger.info(s"###########  Fetching Datas and Aggregates ##########")

      df_cases.printSchema()
      df_cases.repartition(numParts.toInt).createOrReplaceTempView("cases")
      df_events.repartition(numParts.toInt).createOrReplaceTempView("events")

      val df_casesMetrics = spark.sql(
        s"select count(case_id) as `numCases`, " +
        s"double(avg(total_case_duration))  as `avgTime`, " +
        s"double(min(total_case_duration))  as `minTime`, " +
        s"double(max(total_case_duration))  as `maxTime`, " +
        s"double(approx_percentile(total_case_duration, 0.5)) as `medianTime`, " +
        s"count(distinct(variant_id)) as `numVariants`," +
        s"max(activities_per_case) as `maxActivities`, " +
        s"min(activities_per_case) as `minActivities`, " +
        s"avg(activities_per_case) as `avgActivities` " +
        s"from cases")


      //df_casesMetrics.printSchema()

      val df_eventsMetrics =  spark.sql(
        s"select count(row_id) as `numEvents`, " +
        s"count(distinct(activity_id))  as `numActivities`, " +
        s"count(distinct(resource_id))  as `numResources`, " +
        s"min(activity_start_timestamp)  as `minTimestamp`, " +
        s"max(activity_start_timestamp)  as `maxTimestamp` " +
        s"from events"
      )

      val df_eventsResources = spark.sql(
        s"select avg(sub.rss) as `avgResourcesPerCase`, max(sub.rss) as `maxResourcesPerCase`, min(sub.rss) as `minResourcesPerCase` from " +
          s"(select count(resource_id) as rss, case_id " +
          s"from events " +
          s"group by case_id) as sub"
      )

      //df_cases.unpersist()
      //df_events.unpersist()

      val avgDuration = df_casesMetrics.first().getDouble(1).toInt
      val medianDuration = df_casesMetrics.first().getDouble(4).toInt
      val maxDuration = df_casesMetrics.first().getDouble(3).toInt
      val minDuration = df_casesMetrics.first().getDouble(2).toInt

      logger.info(s"###########  Avg : ${avgDuration.toString} Median : ${medianDuration.toString} ##########")

      val caseMetrics = df_casesMetrics.toJSON.first()
      val eventMetrics = df_eventsMetrics.toJSON.first
      val rssMetrics = df_eventsResources.toJSON.first()

      logger.info(s"###########  Parse JSON ##########")
      val jsonStr: Json = parser.parse(raw"""$caseMetrics""").getOrElse(Json.Null)
      val jsonStr2: Json = parser.parse(raw"""$eventMetrics""").getOrElse(Json.Null)
      val jsonStr3: Json = parser.parse(raw"""$rssMetrics""").getOrElse(Json.Null)

      logger.info(s"###########  Optics Transformation JSON ##########")
      val avgDurationTran: Json => Json = root.avgTime.double.modify(_ => doubleToStringTimeSpanDays(avgDuration))
      val medianDurationTran: Json => Json = root.medianTime.double.modify(_ => doubleToStringTimeSpanDays(medianDuration))
      val minDurationTran: Json => Json = root.minTime.double.modify(_ => doubleToStringTimeSpanDays(minDuration))
      val maxDurationTran: Json => Json = root.maxTime.double.modify(_ => doubleToStringTimeSpanDays(maxDuration))



      if (jsonStr.isNull || jsonStr2.isNull || jsonStr3.isNull) {
        throw new Exception("Error parsing JSON")
      }

      val jsonStrTmp: Json = avgDurationTran(jsonStr)
      val jsonStrTmp2: Json = medianDurationTran(jsonStrTmp)
      val jsonStrTmp3: Json = minDurationTran(jsonStrTmp2)
      val jsonStrTmp4: Json = maxDurationTran(jsonStrTmp3)

      logger.info(s"###########  Deep Merge JSON ##########")
      val result: Json = jsonStrTmp4.deepMerge(jsonStr2).deepMerge(jsonStr3)

      // .replaceAll("\\\"", Matcher.quoteReplacement(""))

      val out: RDD[String] = spark.sparkContext.parallelize(result.noSpaces :: Nil)

      import spark.sqlContext.implicits._
      df_out = spark.sqlContext.read.json(out.toDS())


      df_out = df_out.withColumn("analysis_id", lit(analysisId))


      val finalColumnsOrderedName: Array[String]  =  Array(
        "numEvents",
        "numCases",
        "numActivities",
        "avgTime",
        "medianTime",
        "minTime",
        "maxTime",
        "numVariants",
        "maxActivities",
        "minActivities",
        "avgActivities",
        "numResources",
        "avgResourcesPerCase",
        "maxResourcesPerCase",
        "minResourcesPerCase",
        "minTimestamp",
        "maxTimestamp",
        "analysis_id")

      //val currentCols = df_out.columns

      // almost there

      df_out = df_out.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

      // Delete any previous analysisID in DB
      //DataFrameUtils.deleteAnalysisJDBC(databaseName, "metrics")
      //Write Events table
      //if (backEndType.equals("aurora")) {
      //  DataFrameUtils.writeAnalysisJDBC(df_out, databaseName, "metrics")
     // }

      logger.info(df_out.schema.toString())
      logger.info(df_out.show(1))
      logger.info(df_out.toJSON.first())
    }match {
      case Success(_) => {
        logger.info("Metrics Done")
        df_out
      }
      case Failure(e) => logger.info("Error in metrics : " +e.getMessage)
        throw e
    }

  }

  def doubleToStringTimeSpan(input: Int): String = {
    val week_r:Int = input % 604800
    val week:Int = (input - week_r)/604800
    val day_r:Int = week_r % 86400
    val day:Int = (week_r - day_r)/86400
    val hour_r:Int = day_r % 3600
    val hour:Int = (day_r - hour_r)/3600
    val minute_r:Int = hour_r % 60
    val minute:Int = (hour_r - minute_r)/60
    val sec:Int = minute_r % 60
    s"$week W $day D $hour:$minute:$sec"
  }

  def doubleToStringTimeSpanDays(input: Int): Double = {
    val week_r:Int = input % 604800
    val week:Int = (input - week_r)/604800
    val day_r:Int = week_r % 86400
    val day:Int = (week_r - day_r)/86400

    val ret = (week * 7) + day
    ret.toDouble
  }


}
