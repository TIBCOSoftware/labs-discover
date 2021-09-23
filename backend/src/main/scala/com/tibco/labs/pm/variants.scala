/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import com.tibco.labs.utils.DataFrameUtils
import com.tibco.labs.utils.commons.{backEndType, databaseName, _}
import org.apache.spark.sql.catalyst.expressions.GenericRow
import org.apache.spark.sql.expressions.{MutableAggregationBuffer, Window}
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types.{LongType, StructField, StructType}
import org.apache.spark.sql.{DataFrame, Row, SparkSession}

import scala.util.{Failure, Success, Try}

object variants {

  def transformVariants(df_events: DataFrame): DataFrame = {
    var df_variants_final = spark.emptyDataFrame
    Try {
      import spark.implicits._

      logger.info(s"###########  Creating Variants ID ##########")

      val df_variants = df_events.withColumn("variant", collect_list("activity_id").over(Window.partitionBy("case_id").orderBy($"ACTIVITY_START_TIMESTAMP".asc, $"row_id".asc)))
        .groupBy("case_id")
        .agg(max("variant").as("variant"))
        .groupBy("variant")
        .agg(count("variant").as("Frequency"))
        .orderBy(col("Frequency").desc)

      /*
            val case_id_glue = "case_id"
            val activity_key = "activity_id"
            val timestamp_key= "activity_start_timestamp"
            val offset = 1

            val windowSpec = Window.partitionBy(col(case_id_glue)).orderBy(col(case_id_glue))
            var df_reduced_shift = df_events.withColumn(case_id_glue + "_1", lag(case_id_glue, offset, "NaN").over(windowSpec))
            df_reduced_shift = df_reduced_shift.withColumn(activity_key + "_1", lag(activity_key, offset, "NaN").over(windowSpec))
            df_reduced_shift = df_reduced_shift.withColumn(timestamp_key + "_1", lag(timestamp_key, offset, "NaN").over(windowSpec))
            var df_successive_rows = df_reduced_shift.filter(df_reduced_shift(case_id_glue) === df_reduced_shift(case_id_glue + "_1"))
            df_successive_rows = df_successive_rows.withColumn("caseDuration",unix_timestamp(df_successive_rows(timestamp_key+"_1")) - unix_timestamp(df_successive_rows(timestamp_key)))
            val directly_follows_grouping = df_successive_rows.groupBy(activity_key, activity_key + "_1")


            val dfg_frequency = directly_follows_grouping.count().rdd.map {
              case (activityFrom, activityTo, count) =>
            }
      */


     


      val shufflePartitim = spark.sqlContext.getConf("spark.sql.shuffle.partitions")
      logger.info(s"###########  spark.sql.shuffle.partitions default : $shufflePartitim ##########")
      //snSession.sqlContext.setConf("spark.sql.shuffle.partitions", "1")
      df_variants_final = spark.createDataFrame(df_variants.sort(desc("Frequency")).rdd.zipWithUniqueId().map {
        case (rowline, index) => Row.fromSeq(rowline.toSeq :+ index + 1)
      }, StructType(df_variants.schema.fields :+ StructField("variant_id", LongType, nullable = false))
      )


      df_variants.unpersist()
      // Array type to formated string
      df_variants_final = df_variants_final.as[(Array[String], Long, Long)].map { case (variants, count, id) => (variants.mkString(","), count, id) }.toDF("variant", "Frequency", "variant_id")
      //Occurences over total of number of Activity grouped by Cases

      df_variants_final = df_variants_final.groupBy("variant", "variant_id").agg(sum("Frequency") as "Frequency").withColumn("Occurences_percent", (col("Frequency") / sum("Frequency").over()) * 100)
      logger.info(s"Aggregation for Variants done")
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

      splits = Array(Double.NegativeInfinity , 0.0, perctil15Val+0.01, perctil25Val+0.02, perctil50Val+0.03, perctil75Val+0.04, perctil95Val+0.05, maxVal+0.06, Double.PositiveInfinity)
      // sort array with 0 included, ordered ASC
      //splits = splits.toList.filter(_ >= 0).sortWith(_ < _).distinct.toArray
      splits = splits.toList.sortWith(_ < _).distinct.toArray

      val bucketizer = new Bucketizer()
        .setInputCol("Frequency")
        .setOutputCol("bucketedFrequency")
        .setSplits(splits)
      // Transform original data into its bucket index.
      df_variants_final = bucketizer.transform(df_variants_final)

      val lengh_bck = bucketizer.getSplits.length - 1
      var buckets_labels: Map[Double, String] = null
      logger.info(s"Bucketizer output with $lengh_bck buckets")
      if (lengh_bck == 8) {
        buckets_labels = Map(
          -1.0 -> "Negative Values",
          0.0 -> "00th - 15th percentile",
          1.0 -> "15 - 25th percentile",
          2.0 -> "25th percentile - 50th percentile",
          3.0 -> "50th percentile} - 75th percentile",
          4.0 -> "75th percentile - 95th percentile",
          5.0 -> "95th percentile - 100Th Percentile",
          6.0 -> "Positive Infinity")
      }

      val bucketL = buckets_labels.toSeq.toDF("bucketedFrequency", "bucketedFrequency_label")
      logger.info(s"Variants size before join ${df_variants_final.count()}")
      df_variants_final = df_variants_final.join(bucketL, Seq("bucketedFrequency"))

      logger.info(s"Variants size After join ${df_variants_final.count()}")

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
      case Failure(e) => logger.error("Error in cases : " + e.getMessage)
        throw e
    }

  }
}
