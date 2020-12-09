/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import com.tibco.labs.utils.DataFrameUtils
import com.tibco.labs.utils.commons.{backEndType, databaseName, _}
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types.{LongType, StructField, StructType}
import org.apache.spark.sql.{DataFrame, Row, SparkSession}

import scala.util.{Failure, Success, Try}

object variants {

  def transformVariants(df_events: DataFrame): DataFrame = {
    var df_variants_final = spark.emptyDataFrame
    Try {
      import spark.implicits._

      val df_variants = df_events.withColumn("VARIANT", collect_list("ACTIVITY_ID").over(Window.partitionBy("CASE_ID").orderBy($"ACTIVITY_START_TIMESTAMP".asc, $"row_id".asc)))
        .groupBy("CASE_ID")
        .agg(max("VARIANT").as("VARIANT"))
        .groupBy("VARIANT")
        .agg(count("VARIANT").as("Frequency"))
        .orderBy(col("Frequency").desc)

      println(s"###########  Creating Variants ID ##########")


      val shufflePartitim = spark.sqlContext.getConf("spark.sql.shuffle.partitions")
      println(s"###########  spark.sql.shuffle.partitions default : $shufflePartitim ##########")
      //snSession.sqlContext.setConf("spark.sql.shuffle.partitions", "1")
      df_variants_final = spark.createDataFrame(df_variants.sort(desc("Frequency")).rdd.zipWithUniqueId().map {
        case (rowline, index) => Row.fromSeq(rowline.toSeq :+ index + 1)
      }, StructType(df_variants.schema.fields :+ StructField("VARIANT_ID", LongType, nullable = false))
      )


      df_variants.unpersist()
      // Array type to formated string
      df_variants_final = df_variants_final.as[(Array[String], Long, Long)].map { case (variants, count, id) => (variants.mkString(","), count, id) }.toDF("VARIANT", "Frequency", "VARIANT_ID")
      //Occurences over total of number of Activity grouped by Cases

      df_variants_final = df_variants_final.groupBy("VARIANT", "VARIANT_ID").agg(sum("Frequency") as "Frequency").withColumn("Occurences_percent", (col("Frequency") / sum("Frequency").over()) * 100)
      println(s"Aggregation for Variants done")
      df_variants_final = df_variants_final.withColumn("ANALYSIS_ID", lit(analysisId))

      import org.apache.spark.ml.feature.Bucketizer

      //val minVal = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 0.0))").first.getDouble(0)
      //val avgVal = df_variants_final.select(avg("Frequency")).first.getDouble(0)
      //val medianVal = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 0.5, 100))").first.getDouble(0)
      val perctil15Val = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 0.15))").first.getDouble(0)
      val perctil25Val = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 0.25))").first.getDouble(0)
      val perctil50Val = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 0.5))").first.getDouble(0)
      val perctil75Val = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 0.75))").first.getDouble(0)
      val perctil95Val = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 0.95))").first.getDouble(0)
      //val perctil99Val = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 0.99, 100))").first.getDouble(0)
      val maxVal = df_variants_final.selectExpr("Double(approx_percentile(Frequency, 1.0))").first.getDouble(0)

      var splits = Array[Double]()

      splits = Array(0.0, perctil15Val+0.01, perctil25Val+0.02, perctil50Val+0.03, perctil75Val+0.04, perctil95Val+0.05, maxVal+0.06)
      // sort array with 0 included, ordered ASC
      splits = splits.toList.filter(_ >= 0).sortWith(_ < _).distinct.toArray

      val bucketizer = new Bucketizer()
        .setInputCol("Frequency")
        .setOutputCol("bucketedFrequency")
        .setSplits(splits)
      // Transform original data into its bucket index.
      df_variants_final = bucketizer.transform(df_variants_final)

      val lengh_bck = bucketizer.getSplits.length - 1
      var buckets_labels: Map[Double, String] = null
      println(s"Bucketizer output with $lengh_bck buckets")
      if (lengh_bck == 6) {
        buckets_labels = Map(
          0.0 -> "00th - 15th percentile",
          1.0 -> "15 - 25th percentile",
          2.0 -> "25th percentile - 50th percentile",
          3.0 -> "50th percentile} - 75th percentile",
          4.0 -> "75th percentile - 95th percentile",
          5.0 -> "95th percentile - 100Th Percentile")
      }

      val bucketL = buckets_labels.toSeq.toDF("bucketedFrequency", "bucketedFrequency_label")
      println(s"Variants size before join ${df_variants_final.count()}")
      df_variants_final = df_variants_final.join(bucketL, Seq("bucketedFrequency"))

      println(s"Variants size After join ${df_variants_final.count()}")

      val finalColumnsOrderedName: Array[String] = Array(
        "variant",
        "variant_id",
        "frequency",
        "occurences_percent",
         "analysis_id",
        "bucketedFrequency",
        "bucketedFrequency_label")

      df_variants_final = df_variants_final.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

/*      // Delete any previous analysisID in DB
      DataFrameUtils.deleteAnalysisJDBC(databaseName, "variants")
      //Write Events table
      if (backEndType.equals("aurora")) {
        DataFrameUtils.writeAnalysisJDBC(df_variants_final, databaseName, "variants")
      }*/
    } match {
      case Success(_) => df_variants_final
      case Failure(e) => println("Error in cases : " + e.getMessage)
        throw e
    }

  }
}
