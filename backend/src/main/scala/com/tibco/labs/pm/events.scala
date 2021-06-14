/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import java.time.LocalDateTime
import com.tibco.labs.utils.DataFrameUtils
import com.tibco.labs.utils.Status.sendBottleToTheSea
import com.tibco.labs.utils.commons._
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types.{IntegerType, LongType, StructField, StructType, TimestampType}
import org.apache.spark.sql.{Column, DataFrame, Row, SparkSession}

import java.util
import scala.jdk.CollectionConverters.asScalaBufferConverter
import scala.collection.mutable.ListBuffer
import scala.util.{Failure, Success, Try}

// scalastyle:off println
object events {




  def transformEvents(df: DataFrame): tFEvents  = {
    var df_events = spark.emptyDataFrame
    var df_attributes_binary = spark.emptyDataFrame
    Try {
      import spark.implicits._
      println(s"###########  Processing df_events EventLogs ##########")
      println(s"Normalizing Columns Name")

      //val _columns: Array[String] = df.columns
      //val NormalizationRegexColName = """[+._, ()]+"""
      //val replacingColumns = _columns.map(NormalizationRegexColName.r.replaceAllIn(_, "_"))
      //val df2: DataFrame = replacingColumns.zip(_columns).foldLeft(df) { (tempdf, name) => tempdf.withColumnRenamed(name._2, name._1) }
      val df2: DataFrame = df.toDF(normalizer(df.columns):_*)



      //required in all case
      val defaultCols = scala.collection.immutable.Map(columnCaseId -> "CASE_ID", columnCaseStart -> "ACTIVITY_START_TIMESTAMP", columnActivityId -> "ACTIVITY_ID")
      //optionals
      val optionScheduleStart: Option[(String, String)] = if (columnScheduleStart != "") Some(columnScheduleStart -> "scheduled_start") else None
      val optionScheduleEnd: Option[(String, String)] = if (columnScheduleEnd != "") Some(columnScheduleEnd -> "scheduled_end") else None
      val optionResourceID: Option[(String, String)] = if (columnResourceId != "") Some(columnResourceId -> "RESOURCE_ID") else None
      val optionActivityEnd: Option[(String, String)] = if (columnCaseEnd != "") Some(columnCaseEnd -> "ACTIVITY_END_TIMESTAMP") else None
      val optionResourceGroup: Option[(String, String)] = if (columnResourceGroup != "") Some(columnResourceGroup -> "resource_group") else None
      val optionRequester: Option[(String, String)] = if (columnRequester != "") Some(columnRequester -> "requester") else None


      val lookupTmp: Map[String, String] = defaultCols ++ optionRequester ++ optionScheduleStart ++ optionScheduleEnd ++ optionResourceID ++ optionActivityEnd ++ optionResourceGroup
      //removing empty keys if any

      val lookup: Map[String, String] = lookupTmp.-("")


      val columnsFinalTmp: ListBuffer[String] = new ListBuffer[String]()
      lookup.foreach((key) => columnsFinalTmp += key._2)

      val columnsFinal: Seq[String] = columnsFinalTmp.toSeq ++ columnNamesToKeep

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
      println(s"Filtering list of columns")
      df_events = df_events.select(columnsToKeep: _*)

      println(s"Casting CASE ID as String")
      df_events = df_events.withColumn("CtmpID", col("CASE_ID").cast("string")).drop("CASE_ID").withColumnRenamed("CtmpID", "CASE_ID")

      println(s"Casting ACTIVITY_START_TIMESTAMP to TimeStampType")
      df_events = df_events.withColumn("tmpStartTime", date_format(to_timestamp(col("ACTIVITY_START_TIMESTAMP"), timeStampMap(columnCaseStart)), isoDatePattern).cast(TimestampType))
        .drop(col("ACTIVITY_START_TIMESTAMP"))
        .withColumnRenamed("tmpStartTime", "ACTIVITY_START_TIMESTAMP")
      val start_ts: Column = date_format(to_timestamp(col("ACTIVITY_START_TIMESTAMP"), timeStampMap(columnCaseStart)), isoDatePattern).cast(TimestampType)
      println(s"Build Windowspsec")
      val windowSpec = Window.partitionBy(col("CASE_ID")).orderBy(start_ts)

      // count null values

      val countCaseNull: Long = df_events.filter(col("CASE_ID").isNull || col("CASE_ID") === "").count()
      val countStartNull: Long = df_events.filter(col("ACTIVITY_START_TIMESTAMP").isNull || col("ACTIVITY_START_TIMESTAMP") === "").count()
      val countActivitiesNull: Long = df_events.filter(col("ACTIVITY_ID").isNull || col("ACTIVITY_ID") === "").count()

      sendBottleToTheSea(analysisId,"info", s"""{"nullCases": $countCaseNull, "nullStarts": $countStartNull, "nullActivities": $countActivitiesNull}""", 18,organisation)
      val rowsCount = df_events.rdd.count()
      // filtering out null/empty values on case_id, activity, and start
     df_events =  df_events
       .filter(col("CASE_ID").isNotNull || col("CASE_ID") =!= "")
       .filter(col("ACTIVITY_START_TIMESTAMP").isNotNull || col("ACTIVITY_START_TIMESTAMP") =!= "")
       .filter(col("ACTIVITY_ID").isNotNull || col("ACTIVITY_ID") =!= "")

      val rowsCountAfter = df_events.rdd.count()
      println(s"""{"nullCases": $countCaseNull, "nullStarts": $countStartNull, "nullActivities": $countActivitiesNull}, "totalRowsBefore": $rowsCount, "totalRowsBefore": $rowsCountAfter""")


      println(s"Sorting and partionning the table")
      df_events = df_events.orderBy(asc("ACTIVITY_START_TIMESTAMP")).repartition(col("CASE_ID"))

      println(s"Adding Application ID column")
      df_events = df_events.withColumn("ANALYSIS_ID", lit(analysisId))


      println(s"Calculating Row IDs")
      df_events = spark.createDataFrame(df_events.sort(asc("ACTIVITY_START_TIMESTAMP")).rdd.zipWithUniqueId().map {
        case (rowline, index) => Row.fromSeq(rowline.toSeq :+ index + 1)
      }, StructType(df_events.schema.fields :+ StructField("row_id", LongType, nullable = false))
      )



      println("Saving attributes for later")
      val columnNamesToKeepAttr = Seq("row_id", "ANALYSIS_ID") ++ columnNamesToKeep
      println("Attributes cols table for binary support : " + columnNamesToKeepAttr)
      df_attributes_binary = df_events.select(columnNamesToKeepAttr.head, columnNamesToKeepAttr.tail: _*)
      df_attributes_binary.printSchema()
      df_attributes_binary = df_attributes_binary.select(df_attributes_binary.columns.map(x => col(x).as(x.toLowerCase)): _*)
      println("To lowercase...")
      df_attributes_binary.printSchema()
      //println(s"Combining columns into combinedOthers")
      //Have to cast to string as MapType are not supported yet by Alpine
      /*
      val colnms_n_vals = columnNamesToKeep.flatMap { c => Array(lit(c), col(c).cast("String")) }
      df_events = df_events.withColumn("CASES_EXTRA_ATTRIBUTES", map(colnms_n_vals: _*)) // <-- MapType
      val convert_map_to_json = udf(
        (map: Map[String, String]) => DataFrameUtils.convtoJson(map)
      )
      df_events = df_events.withColumn("tmp_CASES_EXTRA_ATTRIBUTES", convert_map_to_json($"CASES_EXTRA_ATTRIBUTES")).drop("CASES_EXTRA_ATTRIBUTES").withColumnRenamed("tmp_CASES_EXTRA_ATTRIBUTES", "CASES_EXTRA_ATTRIBUTES")
*/
      //df_events.printSchema()

      println(s"Dropping extra Columns")
      df_events = df_events.select(df_events.columns.filter(colName => !columnNamesToKeep.contains(colName)).map(colName => new Column(colName)): _*)

      //var end_ts: Column = null
      if (columnCaseEnd.equalsIgnoreCase("")) {
        println(s"Auto calculating missing ACTIVITY_END_TIMESTAMP")
        df_events = df_events.withColumn("ACTIVITY_END_TIMESTAMP", lead(start_ts, 1) over windowSpec)
      } else {
        println(s"Casting ACTIVITY_END_TIMESTAMP as Timestamp, using " + timeStampMap(columnCaseEnd))
        df_events = df_events.withColumn("tmpEndTime", date_format(to_timestamp(col("ACTIVITY_END_TIMESTAMP"), timeStampMap(columnCaseEnd)), isoDatePattern).cast(TimestampType))
          .drop(col("ACTIVITY_END_TIMESTAMP"))
          .withColumnRenamed("tmpEndTime", "ACTIVITY_END_TIMESTAMP")
        //end_ts = date_format(to_timestamp(col("ACTIVITY_END_TIMESTAMP"), timeStampMap(columnCaseEnd)), isoDatePattern).cast(TimestampType)
      }

      val end_ts = date_format(col("ACTIVITY_END_TIMESTAMP"), isoDatePattern).cast(TimestampType)
      //schedule start
      if (columnScheduleStart.equalsIgnoreCase("")) {
        //send it back to the stone age
        println(s"Creating scheduled_start as ACTIVITY_START_TIMESTAMP")
        df_events = df_events.withColumn("tmp_scheduled_start", col("ACTIVITY_START_TIMESTAMP"))
          .drop(col("scheduled_start"))
          .withColumnRenamed("tmp_scheduled_start", "scheduled_start")
      } else {
        println(s"Casting scheduled_start as Timestamp, using " + timeStampMap(columnScheduleStart))
        df_events = df_events.withColumn("tmp_scheduled_start", date_format(to_timestamp(col("scheduled_start"), timeStampMap(columnScheduleStart)), isoDatePattern).cast(TimestampType))
          .drop(col("scheduled_start"))
          .withColumnRenamed("tmp_scheduled_start", "scheduled_start")
      }


      //schedule end

      if (columnScheduleEnd.equalsIgnoreCase("")) {
        println(s"Creating scheduled_start as ACTIVITY_END_TIMESTAMP")
        df_events = df_events.withColumn("tmp_scheduled_end", col("ACTIVITY_END_TIMESTAMP"))
          .drop(col("scheduled_end"))
          .withColumnRenamed("tmp_scheduled_end", "scheduled_end")

      } else {
        println(s"Casting scheduled_end as Timestamp, using " + timeStampMap(columnScheduleEnd))
        df_events = df_events.withColumn("tmp_scheduled_end", date_format(to_timestamp(col("scheduled_end"), timeStampMap(columnScheduleEnd)), isoDatePattern).cast(TimestampType))
          .drop(col("scheduled_end"))
          .withColumnRenamed("tmp_scheduled_end", "scheduled_end")
      }

      if (columnResourceId.equalsIgnoreCase("")) {
        println(s"Auto calculating missing RESOURCE_ID")
        df_events = df_events.withColumn("tmpRss", lit("unknown"))
          .drop(col("RESOURCE_ID"))
          .withColumnRenamed("tmpRss", "RESOURCE_ID")
      }

      if (columnResourceGroup.equalsIgnoreCase("")) {
        println(s"Auto calculating missing resource_group")
        df_events = df_events.withColumn("tmpRss", lit("unknown"))
          .drop(col("resource_group"))
          .withColumnRenamed("tmpRss", "resource_group")
      }

      if (columnRequester.equalsIgnoreCase("")) {
        println(s"Auto calculating missing requester")
        df_events = df_events.withColumn("tmpRss", lit("unknown"))
          .drop(col("requester"))
          .withColumnRenamed("tmpRss", "requester")
      }

      println(s"Replacing null values if any by unknown, in Resource ID, resource_group, requester")
      val naMapper = Map("RESOURCE_ID" -> "system", "requester" -> "system", "resource_group" -> "system")
      df_events = df_events.na.fill(naMapper)

      println(s"Calculating...")
      df_events = df_events.withColumn("DURATION_DAYS", datediff(end_ts, start_ts))
        .withColumn("DURATION_SEC", end_ts.cast("double") - start_ts.cast("double"))
        .withColumn("NEXT_ACTIVITY_ID", lead(col("ACTIVITY_ID"), 1) over windowSpec)
        .withColumn("NEXT_RESOURCE_ID", lead(col("RESOURCE_ID"), 1) over windowSpec)
        .withColumn("next_resource_group", lead(col("resource_group"), 1) over windowSpec)
        //.withColumn("PREV_RESOURCE_ID", lag(col("RESOURCE_ID"), 1) over windowSpec)
        //.withColumn("EDGE", when(col("NEXT_ACTIVITY_ID").isNotNull, concat_ws("->", col("ACTIVITY_ID"), col("NEXT_ACTIVITY_ID"))).otherwise(null))
        .withColumn("PREV_ACTIVITY_ID", lag(col("ACTIVITY_ID"), 1) over windowSpec)
        .withColumn("REPEAT_SELF_LOOP_FLAG", when(col("NEXT_ACTIVITY_ID") === col("ACTIVITY_ID") && col("NEXT_RESOURCE_ID") === col("RESOURCE_ID"), 1).otherwise(0))
        .withColumn("REDO_SELF_LOOP_FLAG", when(col("NEXT_ACTIVITY_ID") === col("ACTIVITY_ID") && col("NEXT_RESOURCE_ID") =!= col("RESOURCE_ID"), 1).otherwise(0))
        .withColumn("START_FLAG", when(col("PREV_ACTIVITY_ID").isNull, 1).otherwise(0))
        .withColumn("END_FLAG", when(col("NEXT_ACTIVITY_ID").isNull, 1).otherwise(0))


      //df_events = df_events.withColumn("row_id", row_number().over(Window.orderBy(desc("CASE_ID"))))
      // row id
   /*   df_events = spark.createDataFrame(df_events.sort(asc("ACTIVITY_START_TIMESTAMP")).rdd.zipWithUniqueId().map {
        case (rowline, index) => Row.fromSeq(rowline.toSeq :+ index + 1)
      }, StructType(df_events.schema.fields :+ StructField("row_id", LongType, nullable = false))
      )*/

      //df_events = df_events.drop("PREV_RESOURCE_ID")
      /*
CREATE TABLE IF NOT EXISTS events
(
  case_id text COLLATE pg_catalog."default" NOT NULL,
  activity_id bigint,
  activity_start_timestamp timestamp without time zone,
  activity_end_timestamp timestamp without time zone,
  resource_id text COLLATE pg_catalog."default",
  resource_group text COLLATE pg_catalog."default",
  requester text COLLATE pg_catalog."default",
  scheduled_start  timestamp without time zone,
  scheduled_end  timestamp without time zone,
  duration_days integer,
  duration_sec bigint,
  next_activity_id bigint,
  next_resource_id text COLLATE pg_catalog."default",
  next_resource_group text COLLATE pg_catalog."default",
  repeat_self_loop_flag integer,
  redo_self_loop_flag integer,
  start_flag integer,
  end_flag integer,
  analysis_id text COLLATE pg_catalog."default",
  row_id bigint
)
 */
      val finalColumnsOrderedName: Array[String] = Array(
        "CASE_ID",
        "ACTIVITY_ID",
        "ACTIVITY_START_TIMESTAMP",
        "ACTIVITY_END_TIMESTAMP",
        "RESOURCE_ID",
        "resource_group",
        "requester",
        "scheduled_start",
        "scheduled_end",
        //"CASES_EXTRA_ATTRIBUTES",
        "DURATION_DAYS",
        "DURATION_SEC",
        "NEXT_ACTIVITY_ID",
        "NEXT_RESOURCE_ID",
        "next_resource_group",
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
      case Success(_) => tFEvents(df_events, df_attributes_binary)
      case Failure(e) => println("Error in events : " + e.getMessage)
        //sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}", 0, databaseName, LocalDateTime.now().toString)
        sendBottleToTheSea(s"$analysisId","error",e.getMessage,0, organisation)
        tFEvents(spark.emptyDataFrame, spark.emptyDataFrame)
    }
  }

  def FinalizeEvents(dfEvents: DataFrame, dfActivities: DataFrame): DataFrame = {
    var df_eventsF = spark.emptyDataFrame

    Try {

      df_eventsF = Seq("activity_id",
        "next_activity_id", "prev_activity_id").foldLeft(dfEvents) {
        case (df, colName) => joinByColumn(colName, df, dfActivities)
      }

      val finalColumnsOrderedName: Array[String] = Array(
        "CASE_ID",
        "ACTIVITY_ID",
        "ACTIVITY_START_TIMESTAMP",
        "ACTIVITY_END_TIMESTAMP",
        "RESOURCE_ID",
        "resource_group",
        "requester",
        "scheduled_start",
        "scheduled_end",
        "DURATION_DAYS",
        "DURATION_SEC",
        "NEXT_ACTIVITY_ID",
        "NEXT_RESOURCE_ID",
        "next_resource_group",
        "REPEAT_SELF_LOOP_FLAG",
        "REDO_SELF_LOOP_FLAG",
        "START_FLAG",
        "END_FLAG",
        "ANALYSIS_ID",
        "row_id")


      df_eventsF = df_eventsF.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

    } match {
      case Success(_) => df_eventsF
      case Failure(e) => println("Error in events : " + e.getMessage)
        //sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}", 0, databaseName, LocalDateTime.now().toString)
        sendBottleToTheSea(s"$analysisId","error",e.getMessage,0, organisation)
        spark.emptyDataFrame
    }

  }

  def FinalizeEventsForDB(dfEvents: DataFrame): DataFrame = {
    var df_eventsF = spark.emptyDataFrame

    Try {

      df_eventsF = dfEvents
        .withColumn("temp_duration", col("DURATION_SEC").cast(LongType))
        .drop("DURATION_SEC")
        .withColumnRenamed("temp_duration","DURATION_SEC")

      val finalColumnsOrderedName: Array[String] = Array(
        "CASE_ID",
        "ACTIVITY_ID",
        "ACTIVITY_START_TIMESTAMP",
        "ACTIVITY_END_TIMESTAMP",
        "RESOURCE_ID",
        "resource_group",
        "requester",
        "scheduled_start",
        "scheduled_end",
        "DURATION_DAYS",
        "DURATION_SEC",
        "NEXT_ACTIVITY_ID",
        "NEXT_RESOURCE_ID",
        "next_resource_group",
        "REPEAT_SELF_LOOP_FLAG",
        "REDO_SELF_LOOP_FLAG",
        "START_FLAG",
        "END_FLAG",
        "ANALYSIS_ID",
        "row_id")


      df_eventsF = df_eventsF.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

    } match {
      case Success(_) => df_eventsF
      case Failure(e) => println("Error in events : " + e.getMessage)
        //sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}", 0, databaseName, LocalDateTime.now().toString)
        sendBottleToTheSea(s"$analysisId","error",e.getMessage,0, organisation)
        spark.emptyDataFrame
    }

  }

  private def joinByColumn(colName: String, sourceDf: DataFrame, destDf: DataFrame): DataFrame = {
    import org.apache.spark.sql.functions._
    import org.apache.spark.sql.types.{LongType, StructField, StructType}
    import org.apache.spark.sql.{DataFrame, Row, SparkSession}
    import spark.implicits._
    sourceDf.as("src") // alias it to help selecting appropriate columns in the result
      // the join
      .join(broadcast(destDf).as("look"), $"look.activity_name" === $"src.$colName", "left")
      .drop($"src.$colName")
      // select all previous columns, plus the one that contains the match
      .select("src.*", "look.id")
      // rename the resulting column to have the name of the source one
      .withColumnRenamed("id", colName)
  }

}

// scalastyle:on println
