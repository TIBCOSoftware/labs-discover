/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import com.tibco.labs.utils.DataFrameUtils
import com.tibco.labs.utils.commons._
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types.LongType
import org.apache.spark.sql.{DataFrame, SparkSession}

import scala.util.{Failure, Success, Try}
object cases {


  def transformCases (df_events: DataFrame, df_variants: DataFrame): DataFrame = {
    var df_cases_f = spark.emptyDataFrame
Try {
  import spark.implicits._
  println(s"###########  Creating variants ##########")

  println(s"###########  Ordering Cases Dataframe ##########")
  //val df_cases_ordered = df_events.repartition(100,$"case_id").sortWithinPartitions("activity_start_timestamp", asc("row_id"))
  println(s"###########  creating Cases Dataframe ##########")
  val _Start = System.nanoTime()
  val df_cases = df_events.repartition(100, $"case_id").withColumn("variant", collect_list("activity_id")
    .over(Window.partitionBy("case_id")
      .orderBy($"activity_start_timestamp".asc, $"row_id".asc)))
    .groupBy("case_id")
    .agg(min("activity_start_timestamp").as("case_start_timestamp"),
      max("activity_start_timestamp").as("case_end_timestamp"),
      sum("duration_sec").as("total_case_duration"),
      count("activity_id").as("activities_per_case"),
//      last("CASES_EXTRA_ATTRIBUTES").as("CASES_EXTRA_ATTRIBUTES"),
      max("variant").as("variants_cases"))
  val _End = System.nanoTime()
  val time = (_End - _Start) / 1000000
  println(s"time for agg  : $time ms")
  println(s"########### Cast ##########")
  val df_cases_0 = df_cases.withColumn("tmpVariants", concat_ws(",", $"variants_cases")).drop("variants_cases").withColumnRenamed("tmpVariants", "variants_cases")
  println(s"########### join  ##########")
  df_cases_f = broadcast(df_cases_0.as("cases")).join(df_variants.as("variants"), $"cases.variants_cases" === $"variants.variant")
  df_cases_f = df_cases_f.withColumn("analysis_id", lit(analysisId)) //.withColumn("idPK",sha2(concat_ws("||",col("VARIANT_ID"),col("analysis_id")),256))
  //val df_cases_finale_2 = df_cases_finale_1.withColumn("idPK", sha2(concat_ws("||", col("VARIANT_ID"), col("analysis_id"), col("case_id"), col("case_start_timestamp")), 256))


  df_cases_f = df_cases_f.withColumn("tmpStart", col("case_start_timestamp").cast("timestamp")).drop("case_start_timestamp").withColumnRenamed("tmpStart", "case_start_timestamp")

  df_cases_f = df_cases_f.withColumn("tmpEnd", col("case_end_timestamp").cast("timestamp")).drop("case_end_timestamp").withColumnRenamed("tmpEnd", "case_end_timestamp")

  df_cases_f = df_cases_f.withColumn("total_case_duration", when($"total_case_duration"=== "NULL", 0).otherwise($"total_case_duration"))
  df_cases_f = df_cases_f.withColumn("total_case_duration", when($"total_case_duration".isNull, 0).otherwise($"total_case_duration"))

  import org.apache.spark.ml.feature.Bucketizer

  //val minVal = df_cases_f.select(min("total_case_duration")).first.getLong(0).toDouble
  //val avgVal = df_cases_finale_4.select(avg("total_case_duration")).first.getDouble(0)
  //val medianVal = df_cases_finale_4.selectExpr("Double(approx_percentile(total_case_duration, 0.5, 100))").first.getDouble(0)
  val perctil15Val = df_cases_f.selectExpr("Double(approx_percentile(total_case_duration, 0.15))").first.getDouble(0)
  val perctil25Val = df_cases_f.selectExpr("Double(approx_percentile(total_case_duration, 0.25))").first.getDouble(0)
  val perctil50Val = df_cases_f.selectExpr("Double(approx_percentile(total_case_duration, 0.50))").first.getDouble(0)
  val perctil75Val = df_cases_f.selectExpr("Double(approx_percentile(total_case_duration, 0.75))").first.getDouble(0)
  val perctil95Val = df_cases_f.selectExpr("Double(approx_percentile(total_case_duration, 0.95))").first.getDouble(0)
  //val perctil99Val = df_cases_finale_4.selectExpr("Double(approx_percentile(total_case_duration, 0.99, 100))").first.getDouble(0)
  val maxVal = df_cases_f.select(max("total_case_duration")).first.getDouble(0)

  var splits = Array[Double]()
  splits = Array(Double.NegativeInfinity, 0.0, perctil15Val+0.01, perctil25Val+0.02, perctil50Val+0.03, perctil75Val+0.04, perctil95Val+0.05, maxVal+0.06, Double.PositiveInfinity)
  // sort array with 0 included, ordered ASC
  //splits = splits.toList.filter(_ >= 0).sortWith(_ < _).distinct.toArray
  splits = splits.toList.sortWith(_ < _).distinct.toArray

  val bucketizer = new Bucketizer()
    .setInputCol("total_case_duration")
    .setOutputCol("bucketedDuration")
    .setSplits(splits)
  // Transform original data into its bucket index.
  df_cases_f = bucketizer.transform(df_cases_f)

  val lengh_bck = bucketizer.getSplits.length - 1



  var buckets_labels: Map[Double, String] = null
  println(s"Bucketizer output with $lengh_bck buckets")

  if (lengh_bck == 8) {
    buckets_labels = Map(
      -1.0 -> "Negative Values",
      0.0 -> "00th - 15th percentile",
      1.0 -> "15 - 25th percentile",
      2.0 -> "25th percentile - 50th percentile",
      3.0 -> "50th percentile} - 75th percentile",
      4.0 -> "75th percentile - 95th percentile",
      5.0 -> "95th percentile - 100Th Percentile",
      6.0 -> "Positive Infinity (beyond max)"
    )
  }
  val bucketL = buckets_labels.toSeq.toDF("bucketedDuration", "bucketedDuration_label")

  df_cases_f = df_cases_f.join(bucketL, Seq("bucketedDuration"))

  //df_cases_f = df_cases_f.drop("variant", "CASES_EXTRA_ATTRIBUTES")

  df_cases_f = df_cases_f.withColumn("temp_duration", round(col("total_case_duration")).cast(LongType))
    .drop("total_case_duration")
    .withColumnRenamed("temp_duration","total_case_duration")




  val finalColumnsOrderedName: Array[String] = Array(
//    "variant",
    "variant_id",
    "case_id",
    "case_start_timestamp",
    "case_end_timestamp",
    "total_case_duration",
    "activities_per_case",
//    "CASES_EXTRA_ATTRIBUTES",
    "analysis_id",
    "bucketedDuration",
    "bucketedDuration_label")



  df_cases_f = df_cases_f.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)


/*  // Delete any previous analysisID in DB
  DataFrameUtils.deleteAnalysisJDBC(databaseName, "cases")
  //Write Events table
  if (backEndType.equals("aurora")) {
    DataFrameUtils.writeAnalysisJDBC(df_cases_f, databaseName, "cases")
  }*/
}match{
  case Success(_) => df_cases_f
  case Failure(e) => println("Error in cases : " +e.getMessage)
    throw e
}
  }

  def doubleToStringTimeSpan(input: Int): String = {
    val week_r: Int = input % 604800
    val week: Int = (input - week_r) / 604800
    val day_r: Int = week_r % 86400
    val day: Int = (week_r - day_r) / 86400
    val hour_r: Int = day_r % 3600
    val hour: Int = (day_r - hour_r) / 3600
    val minute_r: Int = hour_r % 60
    val minute: Int = (hour_r - minute_r) / 60
    val sec: Int = minute_r % 60
    s"$week W $day D $hour:$minute:$sec"
  }

}
