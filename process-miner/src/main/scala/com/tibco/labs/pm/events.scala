/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import java.time.LocalDateTime

import com.tibco.labs.utils.DataFrameUtils
import com.tibco.labs.utils.commons._
import com.tibco.labs.utils.tibcoCloudMessaging.sendTCMMessage
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types.TimestampType
import org.apache.spark.sql.{Column, DataFrame, SparkSession}

import scala.util.{Failure, Success, Try}

// scalastyle:off println
object events {

  var lookup: Map[String, String] = Map[String, String]()

  def transformEvents (df: DataFrame): DataFrame = {
    var df_events = spark.emptyDataFrame
    Try {
      import spark.implicits._
      println(s"###########  Processing df_events EventLogs ##########")
      println(s"Normalizing Columns Name")

      val _columns = df.columns
      //val NormalizationRegexColName = """[+._, ()]+"""
      val replacingColumns = _columns.map(NormalizationRegexColName.r.replaceAllIn(_, "_"))
      val df2: DataFrame = replacingColumns.zip(_columns).foldLeft(df){ (tempdf, name) => tempdf.withColumnRenamed(name._2, name._1)}

      import com.tibco.labs.utils.DataFrameUtils.isEmpty

      if (columnCaseEnd.equals("None") && columnResourceId.equals("None")) { //Both empty
        println(s"No End time, no Resource")
        columnsFinal = "CASE_ID" +: "ACTIVITY_START_TIMESTAMP" +: "ACTIVITY_ID" +: columnNamesToKeep
        lookup = Map(columnCaseId -> "CASE_ID", columnCaseStart -> "ACTIVITY_START_TIMESTAMP", columnActivityId -> "ACTIVITY_ID")
      } else if (columnCaseEnd.equals("None") && !columnResourceId.equals("None")) { // End missing but Rss is there
        println(s"No End time, but Resource")
        columnsFinal = "CASE_ID" +: "ACTIVITY_START_TIMESTAMP" +: "ACTIVITY_ID" +: "RESOURCE_ID" +: columnNamesToKeep
        lookup = Map(columnCaseId -> "CASE_ID", columnCaseStart -> "ACTIVITY_START_TIMESTAMP", columnActivityId -> "ACTIVITY_ID", columnResourceId -> "RESOURCE_ID")
      } else if (!columnCaseEnd.equals("None") && columnResourceId.equals("None")) { //End is there and Rss is missing
        println(s" End time, but no Resource")
        columnsFinal = "CASE_ID" +: "ACTIVITY_START_TIMESTAMP" +: "ACTIVITY_END_TIMESTAMP" +: "ACTIVITY_ID" +: columnNamesToKeep
        lookup = Map(columnCaseId -> "CASE_ID", columnCaseStart -> "ACTIVITY_START_TIMESTAMP", columnCaseEnd -> "ACTIVITY_END_TIMESTAMP", columnActivityId -> "ACTIVITY_ID")
      } else { // both are there...
        println(s" End time, and Resource are here")
        columnsFinal = "CASE_ID" +: "ACTIVITY_START_TIMESTAMP" +: "ACTIVITY_END_TIMESTAMP" +: "ACTIVITY_ID" +: "RESOURCE_ID" +: columnNamesToKeep
        lookup = Map(columnCaseId -> "CASE_ID", columnCaseStart -> "ACTIVITY_START_TIMESTAMP", columnCaseEnd -> "ACTIVITY_END_TIMESTAMP", columnActivityId -> "ACTIVITY_ID", columnResourceId -> "RESOURCE_ID")
      }

      println(s"Renamed schema : " + columnsFinal)
      //to be deleted
      println(s"lookup content : ")
      lookup foreach (x => println(x._1 + "-->" + x._2))
      println(lookup) // show Map (str1 -> str2, ...)
      //to be deleted
      df_events = df2.select(df2.columns.map(c => col(c).as(lookup.getOrElse(c, c))): _*)

      // map the list of column names to DataFrame column definitions.
      val columnsToKeep: Seq[Column] = columnsFinal.map(name => df_events.col(name))
      //Use the select function on the DataFrame to select all the columns to keep.

      df_events.cache()
      println(s"Filtering 01 list of columns")
      df_events = df_events.select(columnsToKeep: _*)
      println(s"Combining columns into combinedOthers")
      //Have to cast to string as MapType are not supported yet by Alpine
      val colnms_n_vals = columnNamesToKeep.flatMap { c => Array(lit(c), col(c).cast("String")) }
      df_events = df_events.withColumn("CASES_EXTRA_ATTRIBUTES", map(colnms_n_vals: _*)) // <-- MapType
      val convert_map_to_json = udf(
        (map: Map[String, String]) => DataFrameUtils.convtoJson(map)
      )
      df_events = df_events.withColumn("tmp_CASES_EXTRA_ATTRIBUTES", convert_map_to_json($"CASES_EXTRA_ATTRIBUTES")).drop("CASES_EXTRA_ATTRIBUTES").withColumnRenamed("tmp_CASES_EXTRA_ATTRIBUTES", "CASES_EXTRA_ATTRIBUTES")

      df_events.printSchema()
      println(s"Casting CASE ID as String")
      df_events = df_events.withColumn("CtmpID", col("CASE_ID").cast("string")).drop("CASE_ID").withColumnRenamed("CtmpID", "CASE_ID")


      println(s"Dropping extra Columns")
      df_events = df_events.select(df_events.columns.filter(colName => !columnNamesToKeep.contains(colName)).map(colName => new Column(colName)): _*)
      println(s"Casting ACTIVITY_START_TIMESTAMP to TimeStampType")
      df_events = df_events.withColumn("tmpStartTime", date_format(to_timestamp(col("ACTIVITY_START_TIMESTAMP"), dateFormatString),isoDatePattern).cast(TimestampType))
        .drop(col("ACTIVITY_START_TIMESTAMP"))
        .withColumnRenamed("tmpStartTime", "ACTIVITY_START_TIMESTAMP")
      val start_ts = date_format(to_timestamp(col("ACTIVITY_START_TIMESTAMP"), dateFormatString),isoDatePattern).cast(TimestampType)
      println(s"Build Windowspsec")
      val windowSpec = Window.partitionBy(col("CASE_ID")).orderBy(start_ts)

      if (columnCaseEnd.equalsIgnoreCase("None")) {
        println(s"Auto calculating missing ACTIVITY_END_TIMESTAMP")
        df_events = df_events.withColumn("ACTIVITY_END_TIMESTAMP", lead(start_ts, 1) over windowSpec)
      } else {
        println(s"Casting ACTIVITY_END_TIMESTAMP as Timestamp, using " + dateFormatString)
        df_events = df_events.withColumn("tmpEndTime", date_format(to_timestamp(col("ACTIVITY_END_TIMESTAMP"), dateFormatString),isoDatePattern).cast(TimestampType))
          .drop(col("ACTIVITY_END_TIMESTAMP"))
          .withColumnRenamed("tmpEndTime", "ACTIVITY_END_TIMESTAMP")
      }
      val end_ts = date_format(to_timestamp(col("ACTIVITY_END_TIMESTAMP"), dateFormatString),isoDatePattern).cast(TimestampType)


      if (columnResourceId.equalsIgnoreCase("None")) {
        println(s"Auto calculating missing RESOURCE_ID")
        df_events = df_events.withColumn("tmpRss", lit("unknown"))
          .drop(col("RESOURCE_ID"))
          .withColumnRenamed("tmpRss", "RESOURCE_ID")
      }

      println(s"Replacing null values if any by unknown, in Resource ID")
      val naMapper = Map("RESOURCE_ID" -> "system")
      df_events = df_events.na.fill(naMapper)

      println(s"Calculating...")
      df_events = df_events.withColumn("DURATION_DAYS", datediff(end_ts, start_ts))
        .withColumn("DURATION_SEC", end_ts.cast("double") - start_ts.cast("double"))
        .withColumn("NEXT_ACTIVITY_ID", lead(col("ACTIVITY_ID"), 1) over windowSpec)
        .withColumn("NEXT_RESOURCE_ID", lead(col("RESOURCE_ID"), 1) over windowSpec)
        .withColumn("PREV_RESOURCE_ID", lag(col("RESOURCE_ID"), 1) over windowSpec)
        //.withColumn("EDGE", when(col("NEXT_ACTIVITY_ID").isNotNull, concat_ws("->", col("ACTIVITY_ID"), col("NEXT_ACTIVITY_ID"))).otherwise(null))
        .withColumn("PREV_ACTIVITY_ID", lag(col("ACTIVITY_ID"), 1) over windowSpec)
        .withColumn("REPEAT_SELF_LOOP_FLAG", when(col("NEXT_ACTIVITY_ID") === col("ACTIVITY_ID") && col("NEXT_RESOURCE_ID") === col("RESOURCE_ID"), 1).otherwise(0))
        .withColumn("REDO_SELF_LOOP_FLAG", when(col("NEXT_ACTIVITY_ID") === col("ACTIVITY_ID") && col("NEXT_RESOURCE_ID") =!= col("RESOURCE_ID"), 1).otherwise(0))
        .withColumn("START_FLAG", when(col("PREV_ACTIVITY_ID").isNull, 1).otherwise(0))
        .withColumn("END_FLAG", when(col("NEXT_ACTIVITY_ID").isNull, 1).otherwise(0))


      println(s"Adding Application ID column")
      df_events = df_events.withColumn("ANALYSIS_ID", lit(analysisId))


      df_events = df_events.withColumn("row_id", row_number().over(Window.orderBy(desc("CASE_ID"))))
      //df_events = df_events.withColumn("idPK", sha2(concat_ws("||", col("row_id"), col("ANALYSIS_ID"), col("CASE_ID"), col("ACTIVITY_ID"), col("ACTIVITY_START_TIMESTAMP")), 256))

      df_events = df_events.drop("PREV_RESOURCE_ID")
      val finalColumnsOrderedName: Array[String] = Array(
        "CASE_ID",
        "ACTIVITY_ID",
        "ACTIVITY_START_TIMESTAMP",
        "ACTIVITY_END_TIMESTAMP",
        "RESOURCE_ID",
        "CASES_EXTRA_ATTRIBUTES",
        "DURATION_DAYS",
        "DURATION_SEC",
        "NEXT_ACTIVITY_ID",
        "NEXT_RESOURCE_ID",
//        "PREV_RESOURCE_ID",
//        "EDGE",
        "PREV_ACTIVITY_ID",
        "REPEAT_SELF_LOOP_FLAG",
        "REDO_SELF_LOOP_FLAG",
        "START_FLAG",
        "END_FLAG",
        "ANALYSIS_ID",
        "row_id")

      //val currentCols = df_events.columns

      // almost there

      df_events = df_events.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

/*      // Delete any previous analysisID in DB
      DataFrameUtils.deleteAnalysisJDBC(databaseName, "events")
      //Write Events table
      if (backEndType.equals("aurora")) {
        DataFrameUtils.writeAnalysisJDBC(df_events, databaseName, "events")
      }*/

    } match {
      case Success(_) => df_events
      case Failure(e) => println("Error in events : " +e.getMessage)
        sendTCMMessage(s"$analysisId",s"$caseRef","error",s"${e.getMessage}",0, databaseName, LocalDateTime.now().toString)
        throw new Exception(e.getMessage)
    }
  }

  private def  joinByColumn(colName: String, sourceDf: DataFrame, destDf: DataFrame): DataFrame = {
    import org.apache.spark.sql.functions._
    import org.apache.spark.sql.types.{LongType, StructField, StructType}
    import org.apache.spark.sql.{DataFrame, Row, SparkSession}
    import spark.implicits._
    sourceDf.as("src") // alias it to help selecting appropriate columns in the result
      // the join
      .join(broadcast(destDf).as("look"), $"look.activity_name" === $"src.$colName","left")
      .drop($"src.$colName")
      // select all previous columns, plus the one that contains the match
      .select("src.*", "look.id")
      // rename the resulting column to have the name of the source one
      .withColumnRenamed("id", colName)
  }

  def FinalizeEvents(dfEvents:DataFrame, dfActivities: DataFrame): DataFrame ={
    var df_eventsF = spark.emptyDataFrame

    Try{

      df_eventsF = Seq("activity_id",
        "next_activity_id","prev_activity_id").foldLeft(dfEvents) {
        case(df, colName) => joinByColumn(colName, df, dfActivities)
      }

      val finalColumnsOrderedName: Array[String] = Array(
        "CASE_ID",
        "ACTIVITY_ID",
        "ACTIVITY_START_TIMESTAMP",
        "ACTIVITY_END_TIMESTAMP",
        "RESOURCE_ID",
        "DURATION_DAYS",
        "DURATION_SEC",
        "NEXT_ACTIVITY_ID",
        "NEXT_RESOURCE_ID",
        "REPEAT_SELF_LOOP_FLAG",
        "REDO_SELF_LOOP_FLAG",
        "START_FLAG",
        "END_FLAG",
        "ANALYSIS_ID",
        "row_id")

      //val currentCols = df_events.columns

      // almost there

      df_eventsF = df_eventsF.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

  } match {
    case Success(_) => df_eventsF
    case Failure(e) => println("Error in events : " +e.getMessage)
      sendTCMMessage(s"$analysisId",s"$caseRef","error",s"${e.getMessage}",0, databaseName, LocalDateTime.now().toString)
      throw new Exception(e.getMessage)
  }

  }

}
// scalastyle:on println
