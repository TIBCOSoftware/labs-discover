/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import com.tibco.labs.utils.commons._
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.functions._

import scala.util.{Failure, Success, Try}

object activities {


  def transformActivities(df: DataFrame): DataFrame = {
    var df_activities = spark.emptyDataFrame


    Try {
      import spark.implicits._

      //  some magic...
     df_activities = df.select("analysis_id", "activity_id", "start_flag", "end_flag")
        .groupBy("activity_id","analysis_id" )
        .agg(count("activity_id").as("total_occurrences"),count(when($"start_flag" === 1, true)).as("total_first"),count(when($"end_flag" === 1, true)).as("total_last"))
      import org.apache.spark.sql.Row
      import org.apache.spark.sql.functions._
      import org.apache.spark.sql.types.{LongType, StructField, StructType}

      // add the id....
      df_activities = spark.createDataFrame(df_activities.sort(desc("total_occurrences")).rdd.zipWithUniqueId().map {
        case (rowline, index) => Row.fromSeq(rowline.toSeq :+ index + 1)
      }, StructType(df_activities.schema.fields :+ StructField("ID", LongType, nullable = false))
      )

      val bcastStarts = spark.sparkContext.broadcast(startIds)
      val bcastEnds = spark.sparkContext.broadcast(endIds)

      // this should be only when running the first time (ie...endpoints.start || endpounts.end are empty/None
      df_activities = df_activities.withColumn("isEnd", when($"ID".isin(bcastEnds.value:_*),lit(1)).otherwise(lit(0))).withColumn("isStart", when($"ID".isin(bcastStarts.value:_*),lit(1)).otherwise(lit(0)))

      df_activities = df_activities.withColumnRenamed("activity_id", "activity_name")

      val finalColumnsOrderedName: Array[String] = Array(
        "analysis_id",
        "activity_name",
        "id",
        "total_occurrences",
        "total_first",
        "total_last",
        "isEnd",
        "isStart")


      // almost there

      df_activities = df_activities.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

/*
     // Delete any previous analysisID in DB
      DataFrameUtils.deleteAnalysisJDBC(databaseName, "activities")
      //Write Events table
      if (backEndType.equals("aurora")) {
        DataFrameUtils.writeAnalysisJDBC(df_activities, databaseName, "activities")
      }
*/

    } match {
      case Success(_) => df_activities
      case Failure(e) => logger.error("Error in activities : " + e.getMessage)
        //sendTCMMessage(s"$analysisId",s"$caseRef","error","Error in activities : " + e.getMessage,0, databaseName, LocalDateTime.now().toString)
        throw e
    }




  }

}
