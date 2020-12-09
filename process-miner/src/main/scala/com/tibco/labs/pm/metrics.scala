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

  def AnalysisMetrics(df_cases: DataFrame, df_events: DataFrame, spark: SparkSession): Unit = {

    Try{
      println(s"###########  Starting Metrics ##########")
      println(s"###########  Fetching Datas and Aggregates ##########")

      df_cases.repartition(numParts.toInt).createOrReplaceTempView("cases")
      df_events.repartition(numParts.toInt).createOrReplaceTempView("events")

      val df_casesMetrics = spark.sql(s" select count(cases.case_id) as `num_of_cases`," +
        s"double(avg(cases.total_case_duration))  as `AvgTime`," +
        s"double(approx_percentile(cases.total_case_duration, 0.5)) as `MedianTime`," +
        s"count(distinct(cases.variant_id)) as `num_of_variants`," +
        s"max(cases.activities_per_case) as `max_activities`," +
        s"min(cases.activities_per_case) as `min_activities` " +
        s"from cases")


      //df_casesMetrics.printSchema()

      val df_eventsMetrics =  spark.sql(s" select count(row_id) as `num_of_events`," +
        s"count(distinct(activity_id))  as `num_of_activities` " +
        s"from events")


      //df_cases.unpersist()
      //df_events.unpersist()

      val avgDuration = df_casesMetrics.first().getDouble(1).toInt
      val medianDuration = df_casesMetrics.first().getDouble(2).toInt

      println(s"###########  Avg : ${avgDuration.toString} Median : ${medianDuration.toString} ##########")

      val caseMetrics = df_casesMetrics.toJSON.first()
      val eventMetrics = df_eventsMetrics.toJSON.first

      println(s"###########  Parse JSON ##########")
      val jsonStr: Json = parser.parse(raw"""$caseMetrics""").getOrElse(Json.Null)
      val jsonStr2: Json = parser.parse(raw"""$eventMetrics""").getOrElse(Json.Null)

      println(s"###########  Optics Transformation JSON ##########")
      val avgDurationTran: Json => Json = root.AvgTime.double.modify(_ => doubleToStringTimeSpanDays(avgDuration))
      val medianDurationTran: Json => Json = root.MedianTime.double.modify(_ => doubleToStringTimeSpanDays(medianDuration))

      if (jsonStr.isNull || jsonStr2.isNull) {
        throw new Exception("Error parsing JSON")
      }

      val jsonStrTmp: Json = avgDurationTran(jsonStr)
      val jsonStrTmp2: Json = medianDurationTran(jsonStrTmp)

      println(s"###########  Deep Merge JSON ##########")
      val result: Json = jsonStrTmp2.deepMerge(jsonStr2)

      // .replaceAll("\\\"", Matcher.quoteReplacement(""))

      val out: RDD[String] = spark.sparkContext.parallelize(result.noSpaces :: Nil)

      import spark.sqlContext.implicits._
      var df_out = spark.sqlContext.read.json(out.toDS())


      df_out = df_out.withColumn("ANALYSIS_ID", lit(analysisId))


      val finalColumnsOrderedName: Array[String]  =  Array(
        "num_of_events",
        "num_of_cases",
        "num_of_activities",
        "AvgTime",
        "MedianTime",
        "num_of_variants",
        "max_activities",
        "min_activities",
        "ANALYSIS_ID")

      //val currentCols = df_out.columns

      // almost there

      df_out = df_out.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

      // Delete any previous analysisID in DB
      DataFrameUtils.deleteAnalysisJDBC(databaseName, "metrics")
      //Write Events table
      if (backEndType.equals("aurora")) {
        DataFrameUtils.writeAnalysisJDBC(df_out, databaseName, "metrics")
      }

      println(df_out.schema.toString())
      println("")
      println(jsonStr2.noSpaces)
      println(jsonStr.noSpaces)
      println("Results :  " + result.noSpaces)
    }match {
      case Success(_) => println("Metrics Done")
      case Failure(e) => println("Error in metrics : " +e.getMessage)
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
