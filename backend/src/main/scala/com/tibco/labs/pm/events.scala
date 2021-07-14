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
      //spark.sql("set spark.sql.legacy.timeParserPolicy=CORRECTED")
      import spark.implicits._
      println(s"###########  Processing df_events EventLogs ##########")
      println(s"Normalizing Columns Name")

      //val _columns: Array[String] = df.columns
      //val NormalizationRegexColName = """[+._, ()]+"""
      //val replacingColumns = _columns.map(NormalizationRegexColName.r.replaceAllIn(_, "_"))
      //val df2: DataFrame = replacingColumns.zip(_columns).foldLeft(df) { (tempdf, name) => tempdf.withColumnRenamed(name._2, name._1) }
      val dftmp: DataFrame = df.toDF(normalizer(df.columns): _*)


      val prefixColsInternal = "input_"
      val renamedColumns = dftmp.columns.map(c => dftmp(c).as(s"$prefixColsInternal$c"))
      val df2 = dftmp.select(renamedColumns: _*)


      //required in all case
      val defaultCols = scala.collection.immutable.Map(s"$prefixColsInternal$columnCaseId" -> "case_id", s"$prefixColsInternal$columnCaseStart" -> "activity_start_timestamp", s"$prefixColsInternal$columnActivityId" -> "activity_id")
      //optionals
      val optionScheduleStart: Option[(String, String)] = if (columnScheduleStart != "") Some(s"$prefixColsInternal$columnScheduleStart" -> "scheduled_start") else None
      val optionScheduleEnd: Option[(String, String)] = if (columnScheduleEnd != "") Some(s"$prefixColsInternal$columnScheduleEnd" -> "scheduled_end") else None
      val optionResourceID: Option[(String, String)] = if (columnResourceId != "") Some(s"$prefixColsInternal$columnResourceId" -> "resource_id") else None
      val optionActivityEnd: Option[(String, String)] = if (columnCaseEnd != "") Some(s"$prefixColsInternal$columnCaseEnd" -> "activity_end_timestamp") else None
      val optionResourceGroup: Option[(String, String)] = if (columnResourceGroup != "") Some(s"$prefixColsInternal$columnResourceGroup" -> "resource_group") else None
      val optionRequester: Option[(String, String)] = if (columnRequester != "") Some(s"$prefixColsInternal$columnRequester" -> "requester") else None


      val lookupTmp: Map[String, String] = defaultCols ++ optionRequester ++ optionScheduleStart ++ optionScheduleEnd ++ optionResourceID ++ optionActivityEnd ++ optionResourceGroup
      //removing empty keys if any

      val lookup: Map[String, String] = lookupTmp.-("")


      val columnsFinalTmp: ListBuffer[String] = new ListBuffer[String]()
      lookup.foreach((key) => columnsFinalTmp += key._2)

      val newColNamesToKeep = columnNamesToKeep.map(prefixColsInternal + _)
      val columnsFinal: Seq[String] = columnsFinalTmp.toSeq ++ newColNamesToKeep

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
      df_events = df_events.withColumn("CtmpID", col("case_id").cast("string")).drop("case_id").withColumnRenamed("CtmpID", "case_id")

      println(s"Casting activity_start_timestamp to TimeStampType")
      df_events = df_events.withColumn("tmpStartTime", date_format(to_timestamp(col("activity_start_timestamp"), timeStampMap(columnCaseStart)), isoDatePattern).cast(TimestampType))
        .drop(col("activity_start_timestamp"))
        .withColumnRenamed("tmpStartTime", "activity_start_timestamp")
      val start_ts: Column = date_format(to_timestamp(col("activity_start_timestamp"), timeStampMap(columnCaseStart)), isoDatePattern).cast(TimestampType)
      println(s"Build Windowspsec")
      val windowSpec = Window.partitionBy(col("case_id")).orderBy(start_ts)

      // count null values

      val countCaseNull: Long = df_events.filter(col("case_id").isNull || col("case_id") === "").count()
      val countStartNull: Long = df_events.filter(col("activity_start_timestamp").isNull || col("activity_start_timestamp") === "").count()
      val countActivitiesNull: Long = df_events.filter(col("activity_id").isNull || col("activity_id") === "").count()

      sendBottleToTheSea(analysisId, "info", s"""{"nullCases": $countCaseNull, "nullStarts": $countStartNull, "nullActivities": $countActivitiesNull}""", 18, organisation)
      val rowsCount = df_events.rdd.count()
      // filtering out null/empty values on case_id, activity, and start
      df_events = df_events
        .filter(col("case_id").isNotNull || col("case_id") =!= "")
        .filter(col("activity_start_timestamp").isNotNull || col("activity_start_timestamp") =!= "")
        .filter(col("activity_id").isNotNull || col("activity_id") =!= "")

      val rowsCountAfter = df_events.rdd.count()
      println(s"""{"nullCases": $countCaseNull, "nullStarts": $countStartNull, "nullActivities": $countActivitiesNull}, "totalRowsBefore": $rowsCount, "totalRowsBefore": $rowsCountAfter""")


      println(s"Sorting and partionning the table")
      df_events = df_events.orderBy(asc("activity_start_timestamp")).repartition(col("case_id"))

      println(s"Adding Application ID column")
      df_events = df_events.withColumn("analysis_id", lit(analysisId))


      println(s"Calculating Row IDs")
      df_events = spark.createDataFrame(df_events.sort(asc("activity_start_timestamp")).rdd.zipWithUniqueId().map {
        case (rowline, index) => Row.fromSeq(rowline.toSeq :+ index + 1)
      }, StructType(df_events.schema.fields :+ StructField("row_id", LongType, nullable = false))
      )


      println("Saving attributes for later")
      val columnNamesToKeepAttr = Seq("row_id", "analysis_id") ++ newColNamesToKeep
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
      df_events = df_events.select(df_events.columns.filter(colName => !newColNamesToKeep.contains(colName)).map(colName => new Column(colName)): _*)

      //var end_ts: Column = null
      if (columnCaseEnd.equalsIgnoreCase("")) {
        println(s"Auto calculating missing activity_end_timestamp")
        df_events = df_events.withColumn("activity_end_timestamp", lead(start_ts, 1) over windowSpec)
      } else {
        println(s"Casting activity_end_timestamp as Timestamp, using " + timeStampMap(columnCaseEnd))
        df_events = df_events.withColumn("tmpEndTime", date_format(to_timestamp(col("activity_end_timestamp"), timeStampMap(columnCaseEnd)), isoDatePattern).cast(TimestampType))
          .drop(col("activity_end_timestamp"))
          .withColumnRenamed("tmpEndTime", "activity_end_timestamp")
        //end_ts = date_format(to_timestamp(col("activity_end_timestamp"), timeStampMap(columnCaseEnd)), isoDatePattern).cast(TimestampType)
      }

      val end_ts = date_format(col("activity_end_timestamp"), isoDatePattern).cast(TimestampType)
      //schedule start
      if (columnScheduleStart.equalsIgnoreCase("")) {
        //send it back to the stone age
        println(s"Creating scheduled_start as activity_start_timestamp")
        df_events = df_events.withColumn("tmp_scheduled_start", col("activity_start_timestamp"))
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
        println(s"Creating scheduled_start as activity_end_timestamp")
        df_events = df_events.withColumn("tmp_scheduled_end", col("activity_end_timestamp"))
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
          .drop(col("resource_id"))
          .withColumnRenamed("tmpRss", "resource_id")
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
      val naMapper = Map("resource_id" -> "system", "requester" -> "system", "resource_group" -> "system")
      df_events = df_events.na.fill(naMapper)

      println(s"Calculating...")
      df_events = df_events.withColumn("duration_days", datediff(end_ts, start_ts))
        .withColumn("duration_sec", end_ts.cast("double") - start_ts.cast("double"))
        .withColumn("next_activity_id", lead(col("activity_id"), 1) over windowSpec)
        .withColumn("next_resource_id", lead(col("resource_id"), 1) over windowSpec)
        .withColumn("next_resource_group", lead(col("resource_group"), 1) over windowSpec)
        //.withColumn("PREV_RESOURCE_ID", lag(col("resource_id"), 1) over windowSpec)
        //.withColumn("EDGE", when(col("next_activity_id").isNotNull, concat_ws("->", col("activity_id"), col("next_activity_id"))).otherwise(null))
        .withColumn("prev_activity_id", lag(col("activity_id"), 1) over windowSpec)
        .withColumn("repeat_self_loop_flag", when(col("next_activity_id") === col("activity_id") && col("next_resource_id") === col("resource_id"), 1).otherwise(0))
        .withColumn("redo_self_loop_flag", when(col("next_activity_id") === col("activity_id") && col("next_resource_id") =!= col("resource_id"), 1).otherwise(0))
        .withColumn("start_flag", when(col("prev_activity_id").isNull, 1).otherwise(0))
        .withColumn("end_flag", when(col("next_activity_id").isNull, 1).otherwise(0))


      //df_events = df_events.withColumn("row_id", row_number().over(Window.orderBy(desc("case_id"))))
      // row id
      /*   df_events = spark.createDataFrame(df_events.sort(asc("activity_start_timestamp")).rdd.zipWithUniqueId().map {
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
        "case_id",
        "activity_id",
        "activity_start_timestamp",
        "activity_end_timestamp",
        "resource_id",
        "resource_group",
        "requester",
        "scheduled_start",
        "scheduled_end",
        //"CASES_EXTRA_ATTRIBUTES",
        "duration_days",
        "duration_sec",
        "next_activity_id",
        "next_resource_id",
        "next_resource_group",
        //        "PREV_RESOURCE_ID",
        //        "EDGE",
        "prev_activity_id",
        "repeat_self_loop_flag",
        "redo_self_loop_flag",
        "start_flag",
        "end_flag",
        "analysis_id",
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
      case Failure(exception) => exception.getCause.getMessage match {
        case parse if parse.matches(".*DateTimeFormatter.*") => {
          println("Error in events for time parsing : " + parse)
          sendBottleToTheSea(s"$analysisId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html or send an email to our Pattern Master nmarzin@tibco.com", 0, organisation)
          tFEvents(spark.emptyDataFrame,spark.emptyDataFrame)
        }
        case x => {
          println("Error in events : " + x)
          //sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}", 0, databaseName, LocalDateTime.now().toString)
          sendBottleToTheSea(s"$analysisId", "error", s"Undefined error yet, ${x}", 0, organisation)
          tFEvents(spark.emptyDataFrame,spark.emptyDataFrame)
        }
      }
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
        "case_id",
        "activity_id",
        "activity_start_timestamp",
        "activity_end_timestamp",
        "resource_id",
        "resource_group",
        "requester",
        "scheduled_start",
        "scheduled_end",
        "duration_days",
        "duration_sec",
        "next_activity_id",
        "next_resource_id",
        "next_resource_group",
        "repeat_self_loop_flag",
        "redo_self_loop_flag",
        "start_flag",
        "end_flag",
        "analysis_id",
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
        .withColumn("temp_duration", col("duration_sec").cast(LongType))
        .drop("duration_sec")
        .withColumnRenamed("temp_duration", "duration_sec")

      val finalColumnsOrderedName: Array[String] = Array(
        "case_id",
        "activity_id",
        "activity_start_timestamp",
        "activity_end_timestamp",
        "resource_id",
        "resource_group",
        "requester",
        "scheduled_start",
        "scheduled_end",
        "duration_days",
        "duration_sec",
        "next_activity_id",
        "next_resource_id",
        "next_resource_group",
        "repeat_self_loop_flag",
        "redo_self_loop_flag",
        "start_flag",
        "end_flag",
        "analysis_id",
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
