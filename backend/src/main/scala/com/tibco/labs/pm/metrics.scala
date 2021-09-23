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
        s"select count(case_id) as `num_of_cases`, " +
        s"double(avg(total_case_duration))  as `AvgTime`, " +
        s"double(min(total_case_duration))  as `MinTime`, " +
        s"double(max(total_case_duration))  as `MaxTime`, " +
        s"double(approx_percentile(total_case_duration, 0.5)) as `MedianTime`, " +
        s"count(distinct(variant_id)) as `num_of_variants`," +
        s"max(activities_per_case) as `max_activities`, " +
        s"min(activities_per_case) as `min_activities`, " +
        s"avg(activities_per_case) as `avg_activities` " +
        s"from cases")


      //df_casesMetrics.printSchema()

      val df_eventsMetrics =  spark.sql(
        s"select count(row_id) as `num_of_events`, " +
        s"count(distinct(activity_id))  as `num_of_activities`, " +
        s"count(distinct(resource_id))  as `num_of_res`, " +
        s"string(min(activity_start_timestamp))  as `minTimestamp`, " +
        s"string(max(activity_start_timestamp))  as `maxTimestamp` " +
        s"from events"
      )


      //df_cases.unpersist()
      //df_events.unpersist()

      val avgDuration = df_casesMetrics.first().getDouble(1).toInt
      val medianDuration = df_casesMetrics.first().getDouble(4).toInt
      val maxDuration = df_casesMetrics.first().getDouble(2).toInt
      val minDuration = df_casesMetrics.first().getDouble(3).toInt

      logger.info(s"###########  Avg : ${avgDuration.toString} Median : ${medianDuration.toString} ##########")

      val caseMetrics = df_casesMetrics.toJSON.first()
      val eventMetrics = df_eventsMetrics.toJSON.first

      logger.info(s"###########  Parse JSON ##########")
      val jsonStr: Json = parser.parse(raw"""$caseMetrics""").getOrElse(Json.Null)
      val jsonStr2: Json = parser.parse(raw"""$eventMetrics""").getOrElse(Json.Null)

      logger.info(s"###########  Optics Transformation JSON ##########")
      val avgDurationTran: Json => Json = root.AvgTime.double.modify(_ => doubleToStringTimeSpanDays(avgDuration))
      val medianDurationTran: Json => Json = root.MedianTime.double.modify(_ => doubleToStringTimeSpanDays(medianDuration))
      val minDurationTran: Json => Json = root.MedianTime.double.modify(_ => doubleToStringTimeSpanDays(minDuration))
      val maxDurationTran: Json => Json = root.MedianTime.double.modify(_ => doubleToStringTimeSpanDays(maxDuration))



      if (jsonStr.isNull || jsonStr2.isNull) {
        throw new Exception("Error parsing JSON")
      }

      val jsonStrTmp: Json = avgDurationTran(jsonStr)
      val jsonStrTmp2: Json = medianDurationTran(jsonStrTmp)
      val jsonStrTmp3: Json = minDurationTran(jsonStrTmp2)
      val jsonStrTmp4: Json = maxDurationTran(jsonStrTmp3)

      logger.info(s"###########  Deep Merge JSON ##########")
      val result: Json = jsonStrTmp4.deepMerge(jsonStr2)

      // .replaceAll("\\\"", Matcher.quoteReplacement(""))

      val out: RDD[String] = spark.sparkContext.parallelize(result.noSpaces :: Nil)

      import spark.sqlContext.implicits._
      df_out = spark.sqlContext.read.json(out.toDS())


      df_out = df_out.withColumn("ANALYSIS_ID", lit(analysisId))


      val finalColumnsOrderedName: Array[String]  =  Array(
        "num_of_events",
        "num_of_cases",
        "num_of_activities",
        "AvgTime",
        "MedianTime",
        "MinTime",
        "MaxTime",
        "num_of_variants",
        "max_activities",
        "min_activities",
        "avg_activities",
        "num_of_res",
        "minTimestamp",
        "maxTimestamp",
        "ANALYSIS_ID")

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
      logger.info("")
      logger.info(jsonStr2.noSpaces)
      logger.info(jsonStr.noSpaces)
      logger.info("Results :  " + result.noSpaces)
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
