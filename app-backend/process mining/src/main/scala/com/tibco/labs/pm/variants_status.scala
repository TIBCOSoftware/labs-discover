/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import com.tibco.labs.utils.DataFrameUtils
import com.tibco.labs.utils.commons.{backEndType, databaseName, _}
import org.apache.spark.sql.functions._
import org.apache.spark.sql.{DataFrame, SparkSession}

import scala.util.{Failure, Success, Try}


object variants_status {

  def transformVariantsStatus(df_variants: DataFrame): DataFrame = {
    var df_variants_status = spark.emptyDataFrame

    Try {

      df_variants_status = df_variants.select("analysis_id", "variant_id")
      df_variants_status = df_variants_status.withColumn("label", lit("Unchecked"))
      df_variants_status = df_variants_status.withColumn("case_type", lit("Variants"))
      df_variants_status = df_variants_status.withColumn("case_state", lit("None"))
      df_variants_status = df_variants_status.withColumn("LACaseRef", lit("None"))
      df_variants_status = df_variants_status.withColumn("timestamp", current_timestamp())
      df_variants_status = df_variants_status.withColumn("isReference", lit(0))


      val finalColumnsOrderedName: Array[String] = Array(
        "analysis_id",
        "variant_id",
        "label",
        "case_type",
        "case_state",
        "timestamp",
        "LACaseRef",
        "isReference")

      df_variants_status = df_variants_status.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)
      //df_variants_status.show(10, false)
      //println(" schema "+ df_variants_status.printSchema())
      // Delete any previous analysisID in DB
/*      DataFrameUtils.deleteAnalysisJDBC(databaseName, "variants_status")
      //Write Events table
      if (backEndType.equals("aurora")) {
        DataFrameUtils.writeAnalysisJDBC(df_variants_status, databaseName, "variants_status")
      }*/

    } match {
      case Success(_) => df_variants_status
      case Failure(e) => println("Error in variants_status : " + e.getMessage)
        throw e
    }
  }
}
