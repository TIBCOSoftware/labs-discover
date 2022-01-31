/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import java.time.LocalDateTime
import com.tibco.labs.utils.DataFrameUtils
import com.tibco.labs.utils.DataFrameUtils.joinByColumn
import com.tibco.labs.utils.Status.sendBottleToTheSea
import com.tibco.labs.utils.commons._
import org.apache.spark.SparkException
import org.apache.spark.internal.Logging
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types.{IntegerType, LongType, StructField, StructType, TimestampType}
import org.apache.spark.sql.{Column, DataFrame, Row, SparkSession}

import java.text.SimpleDateFormat
import java.time.format.DateTimeParseException
import java.util
import scala.collection.mutable
import scala.jdk.CollectionConverters.asScalaBufferConverter
import scala.collection.mutable.ListBuffer
import scala.util.{Failure, Success, Try}

// scalastyle:off println
object events {

  def transformEvents(df: DataFrame): tFEvents = {
    var df_events = spark.emptyDataFrame
    var df_attributes_binary = spark.emptyDataFrame
    var df_events_casefilter = spark.emptyDataFrame
    Try {
      //spark.sql("set spark.sql.legacy.timeParserPolicy=CORRECTED")
      import spark.implicits._
      logger.info(s"###########  Processing df_events EventLogs ##########")
      logger.info(s"Normalizing Columns Name")

      //val _columns: Array[String] = df.columns
      //val NormalizationRegexColName = """[+._, ()]+"""
      //val replacingColumns = _columns.map(NormalizationRegexColName.r.replaceAllIn(_, "_"))
      //val df2: DataFrame = replacingColumns.zip(_columns).foldLeft(df) { (tempdf, name) => tempdf.withColumnRenamed(name._2, name._1) }
      val dftmp: DataFrame = df.toDF(normalizer(df.columns): _*)


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

      logger.info(s"Renamed schema : " + columnsFinal)
      //to be deleted
      logger.info(s"lookup content : ")
      lookup foreach (x => logger.info(x._1 + "-->" + x._2))
      logger.info(lookup) // show Map (str1 -> str2, ...)
      //to be deleted
      df_events = df2.select(df2.columns.map(c => col(c).as(lookup.getOrElse(c, c))): _*)

      // map the list of column names to DataFrame column definitions.
      val columnsToKeep: Seq[Column] = columnsFinal.map(name => df_events.col(name))
      //Use the select function on the DataFrame to select all the columns to keep.

      df_events.cache()
      logger.info(s"Filtering list of columns")
      df_events = df_events.select(columnsToKeep: _*)

      logger.info(s"Casting CASE ID as String")
      df_events = df_events.withColumn("CtmpID", col("case_id").cast("string")).drop("case_id").withColumnRenamed("CtmpID", "case_id")

      logger.info(s"Casting activity_start_timestamp to TimeStampType")
      df_events = df_events.withColumn("tmpStartTime", date_format(to_timestamp(col("activity_start_timestamp"), timeStampMap(columnCaseStart)), isoDatePattern).cast(TimestampType))
        .drop(col("activity_start_timestamp"))
        .withColumnRenamed("tmpStartTime", "activity_start_timestamp")
      val start_ts: Column = date_format(to_timestamp(col("activity_start_timestamp"), timeStampMap(columnCaseStart)), isoDatePattern).cast(TimestampType)
      logger.info(s"Build Windowspsec")
      val windowSpec = Window.partitionBy(col("case_id")).orderBy(start_ts)
      if (columnCaseEnd.equalsIgnoreCase("")) {
        logger.info(s"Auto calculating missing activity_end_timestamp")
        df_events = df_events.withColumn("activity_end_timestamp", lead(start_ts, 1) over windowSpec)
      } else {
        logger.info(s"Casting activity_end_timestamp as Timestamp, using " + timeStampMap(columnCaseEnd))
        df_events = df_events.withColumn("tmpEndTime", date_format(to_timestamp(col("activity_end_timestamp"), timeStampMap(columnCaseEnd)), isoDatePattern).cast(TimestampType))
          .drop(col("activity_end_timestamp"))
          .withColumnRenamed("tmpEndTime", "activity_end_timestamp")
        //end_ts = date_format(to_timestamp(col("activity_end_timestamp"), timeStampMap(columnCaseEnd)), isoDatePattern).cast(TimestampType)
      }

      val end_ts = date_format(col("activity_end_timestamp"), isoDatePattern).cast(TimestampType)
      val rowsCount = df_events.rdd.count()
      // filtering events table if any

      df_events.printSchema()
      println("################# Filtering events with Events:Col  type timestamp && range filters...")
      var eventsRangeFilterList: mutable.Seq[(String, String, String)] = collection.mutable.Seq[(String, String, String)]()
      if (!eventsRange.isEmpty) {
        //filter on time cols
        eventsRange.filter(l => l._2.equalsIgnoreCase("timestamp")).foreach { er =>
          val collookup = normalizerString(er._1)
          val minVal = er._4
          val maxVal = er._5
          if (s"${prefixColsInternal}$collookup".equals(s"${prefixColsInternal}$columnCaseStart")) {
            logger.info("Filtering events on activity_start_time")
            eventsRangeFilterList :+= (("activity_start_timestamp", minVal, maxVal))
            //df_events = df_events.where(col("activity_start_timestamp") >= changeDateFormat(er._4, er._3) && col("activity_start_timestamp") <= changeDateFormat(er._5, er._3))
          } else if (s"${prefixColsInternal}$collookup".equals(s"${prefixColsInternal}$columnCaseStart")) {
            logger.info("Filtering events on activity_end_time")
            eventsRangeFilterList :+= (("activity_end_timestamp", minVal, maxVal))
            //df_events = df_events.where(col("activity_end_timestamp") >= changeDateFormat(er._4, er._3) && col("activity_end_timestamp") <= changeDateFormat(er._5, er._3))
          } else {
            logger.info(s"Filtering events on ${prefixColsInternal}$collookup")
            eventsRangeFilterList :+= ((s"${prefixColsInternal}$collookup", minVal, maxVal))
            //df_events = df_events.where(col(s"${prefixColsInternal}$collookup") >= changeDateFormat(er._4, er._3) && col(s"${prefixColsInternal}$collookup") <= changeDateFormat(er._5, er._3))
          }

        }

        val filterCylc: Column = eventsRangeFilterList.map(v => col(v._1).geq(to_timestamp(lit(v._2), isoSpotPattern)) && col(v._1).leq(to_timestamp(lit(v._3), isoSpotPattern))).reduce(_ && _)
        logger.info("Filters conditions ")
        logger.info(filterCylc)
        logger.info("filtering...")
        df_events = df_events.filter(filterCylc)


      } else {
        logger.info("##### no filters sets######")
      }


      println("################# Filtering events with Events:Col   values filters...")
      var eventsFilterList: mutable.Seq[(String, List[String])] = collection.mutable.Seq[(String, List[String])]()
      if (eventsValues.nonEmpty) {
        logger.info(eventsValues)
        eventsValues.foreach { ev =>
          val collookup = normalizerString(ev._1)
          val list: List[String] = (ev._4)
          logger.info(s"Filtering on values for ${prefixColsInternal}$collookup")
          if (df_events.columns.exists(_.equals(s"${prefixColsInternal}$collookup"))) {
            logger.info(s"Filtering on values for $collookup")
            //df_events_tmp = df_events_tmp.filter(col(s"${prefixColsInternal}$collookup").isin(ev._4: _*))
            eventsFilterList :+= ((s"${prefixColsInternal}$collookup", list))
            //df_events_casefilter = df_events_tmp.select(s"case_id").distinct()
          } else if (s"$collookup".equals(columnCaseId)) {
            logger.info(s"Filtering on values for case_id")
            //df_events_tmp =  df_events_tmp.filter(col(s"case_id").isin(ev._4: _*))
            //df_events_casefilter = df_events_tmp.select(s"case_id").distinct()
            eventsFilterList :+= ((s"case_id", list))
          } else if (s"$collookup".equals(columnActivityId)) {
            logger.info(s"Filtering on values for activity_id")
            //df_events_tmp =  df_events_tmp.filter(col(s"activity_id").isin(ev._4: _*))
            //df_events_casefilter = df_events_tmp.select(s"case_id").distinct()
            eventsFilterList :+= ((s"activity_id", list))
          } else if (s"$collookup".equals(columnResourceId)) {
            logger.info(s"Filtering on values for resource_id")
            //df_events_tmp =  df_events_tmp.filter(col(s"resource_id").isin(ev._4: _*))
            //df_events_casefilter = df_events_tmp.select(s"case_id").distinct()
            eventsFilterList :+= ((s"resource_id", list))
          } else {
            logger.info(s"Nothing to filter for $collookup")
          }
        }
        val filterCylc: Column = eventsFilterList.map(v => col(v._1).isin(v._2: _*)).reduce(_ && _)
        logger.info("Filters conditions ")
        logger.info(filterCylc)
        logger.info("filtering...")
        df_events = df_events.filter(filterCylc)
      } else {
        logger.info("##### no filters sets######")
      }

      // filtering on Case...1first pass

      println("################# Filtering events with Case:Col filters...")
      df_events.printSchema()

      var colsFilterList: mutable.Seq[(String, List[String])] = collection.mutable.Seq[(String, List[String])]()
      if (casesValues.nonEmpty) {
        logger.info(casesValues)
        casesValues.foreach { ev =>
          val collookup = normalizerString(ev._1)
          val list: List[String] = (ev._4)
          logger.info("look up for col : " + collookup)
          if (df_events.columns.exists(_.equals(s"${prefixColsInternal}$collookup"))) {
            logger.info(s"Filtering on values for $collookup")
            //df_events_tmp = df_events_tmp.filter(col(s"${prefixColsInternal}$collookup").isin(ev._4: _*))
            colsFilterList :+= ((s"${prefixColsInternal}$collookup", list))
            //df_events_casefilter = df_events_tmp.select(s"case_id").distinct()
          } else if (s"$collookup".equals(columnCaseId)) {
            logger.info(s"Filtering on values for case_id")
            //df_events_tmp =  df_events_tmp.filter(col(s"case_id").isin(ev._4: _*))
            //df_events_casefilter = df_events_tmp.select(s"case_id").distinct()
            colsFilterList :+= ((s"case_id", list))
          } else if (s"$collookup".equals(columnActivityId)) {
            logger.info(s"Filtering on values for activity_id")
            //df_events_tmp =  df_events_tmp.filter(col(s"activity_id").isin(ev._4: _*))
            //df_events_casefilter = df_events_tmp.select(s"case_id").distinct()
            colsFilterList :+= ((s"activity_id", list))
          } else if (s"$collookup".equals(columnResourceId)) {
            logger.info(s"Filtering on values for resource_id")
            //df_events_tmp =  df_events_tmp.filter(col(s"resource_id").isin(ev._4: _*))
            //df_events_casefilter = df_events_tmp.select(s"case_id").distinct()
            colsFilterList :+= ((s"resource_id", list))
          } else {
            logger.info(s"Nothing to filter for $collookup")
          }
        }
        import org.apache.spark.sql.functions.{filter}
        val filterCylc: Column = colsFilterList.map(v => col(v._1).isin(v._2: _*)).reduce(_ && _)
        logger.info("Filters conditions ")
        logger.info(filterCylc)
        logger.info("filtering...")
        df_events_casefilter = df_events.filter(filterCylc).select(s"case_id").distinct()

        println(s"Size of case id filtered ${df_events_casefilter.rdd.count()}")
      } else {
        logger.info("##### no filters sets######")
      }







      // count null values

      val countCaseNull: Long = df_events.filter(col("case_id").isNull || col("case_id") === "").count()
      val countStartNull: Long = df_events.filter(col("activity_start_timestamp").isNull || col("activity_start_timestamp") === "").count()
      val countActivitiesNull: Long = df_events.filter(col("activity_id").isNull || col("activity_id") === "").count()

      sendBottleToTheSea(analysisId, "info", s"""{"nullCases": $countCaseNull, "nullStarts": $countStartNull, "nullActivities": $countActivitiesNull}""", 18, organisation)

      // filtering out null/empty values on case_id, activity, and start
      df_events = df_events
        .filter(col("case_id").isNotNull || col("case_id") =!= "")
        .filter(col("activity_start_timestamp").isNotNull || col("activity_start_timestamp") =!= "")
        .filter(col("activity_id").isNotNull || col("activity_id") =!= "")

      val rowsCountAfter = df_events.rdd.count()
      logger.info(s"""{"nullCases": $countCaseNull, "nullStarts": $countStartNull, "nullActivities": $countActivitiesNull}, "totalRowsBefore": $rowsCount, "totalRowsBefore": $rowsCountAfter""")


      logger.info(s"Sorting and partionning the table")
      df_events = df_events.orderBy(asc("activity_start_timestamp")).repartition(col("case_id"))

      logger.info(s"Adding Application ID column")
      df_events = df_events.withColumn("analysis_id", lit(analysisId))


      logger.info(s"Calculating Row IDs")
      df_events = spark.createDataFrame(df_events.sort(asc("activity_start_timestamp")).rdd.zipWithUniqueId().map {
        case (rowline, index) => Row.fromSeq(rowline.toSeq :+ index + 1)
      }, StructType(df_events.schema.fields :+ StructField("row_id", LongType, nullable = false))
      )


      logger.info("Saving attributes for later")
      val columnNamesToKeepAttr = Seq("row_id", "analysis_id") ++ newColNamesToKeep
      logger.info("Attributes cols table for binary support : " + columnNamesToKeepAttr)
      df_attributes_binary = df_events.select(columnNamesToKeepAttr.head, columnNamesToKeepAttr.tail: _*)
      logger.info("Print attributes schema")
      logger.info(df_attributes_binary.schema.treeString)
      logger.info("To lowercase...")
      df_attributes_binary = df_attributes_binary.select(df_attributes_binary.columns.map(x => col(x).as(x.toLowerCase)): _*)
      //df_attributes_binary.printSchema()
      //logger.info(s"Combining columns into combinedOthers")
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

      logger.info(s"Dropping extra Columns")
      df_events = df_events.select(df_events.columns.filter(colName => !newColNamesToKeep.contains(colName)).map(colName => new Column(colName)): _*)

      //var end_ts: Column = null

      //schedule start
      if (columnScheduleStart.equalsIgnoreCase("")) {
        //send it back to the stone age
        logger.info(s"Creating scheduled_start as activity_start_timestamp")
        df_events = df_events.withColumn("tmp_scheduled_start", col("activity_start_timestamp"))
          .drop(col("scheduled_start"))
          .withColumnRenamed("tmp_scheduled_start", "scheduled_start")
      } else {
        logger.info(s"Casting scheduled_start as Timestamp, using " + timeStampMap(columnScheduleStart))
        df_events = df_events.withColumn("tmp_scheduled_start", date_format(to_timestamp(col("scheduled_start"), timeStampMap(columnScheduleStart)), isoDatePattern).cast(TimestampType))
          .drop(col("scheduled_start"))
          .withColumnRenamed("tmp_scheduled_start", "scheduled_start")
      }


      //schedule end

      if (columnScheduleEnd.equalsIgnoreCase("")) {
        logger.info(s"Creating scheduled_start as activity_end_timestamp")
        df_events = df_events.withColumn("tmp_scheduled_end", col("activity_end_timestamp"))
          .drop(col("scheduled_end"))
          .withColumnRenamed("tmp_scheduled_end", "scheduled_end")

      } else {
        logger.info(s"Casting scheduled_end as Timestamp, using " + timeStampMap(columnScheduleEnd))
        df_events = df_events.withColumn("tmp_scheduled_end", date_format(to_timestamp(col("scheduled_end"), timeStampMap(columnScheduleEnd)), isoDatePattern).cast(TimestampType))
          .drop(col("scheduled_end"))
          .withColumnRenamed("tmp_scheduled_end", "scheduled_end")
      }

      if (columnResourceId.equalsIgnoreCase("")) {
        logger.info(s"Auto calculating missing RESOURCE_ID")
        df_events = df_events.withColumn("tmpRss", lit("unknown"))
          .drop(col("resource_id"))
          .withColumnRenamed("tmpRss", "resource_id")
      }

      if (columnResourceGroup.equalsIgnoreCase("")) {
        logger.info(s"Auto calculating missing resource_group")
        df_events = df_events.withColumn("tmpRss", lit("unknown"))
          .drop(col("resource_group"))
          .withColumnRenamed("tmpRss", "resource_group")
      }

      if (columnRequester.equalsIgnoreCase("")) {
        logger.info(s"Auto calculating missing requester")
        df_events = df_events.withColumn("tmpRss", lit("unknown"))
          .drop(col("requester"))
          .withColumnRenamed("tmpRss", "requester")
      }

      logger.info(s"Replacing null values if any by unknown, in Resource ID, resource_group, requester")
      val naMapper = Map("resource_id" -> "system", "requester" -> "system", "resource_group" -> "system")
      df_events = df_events.na.fill(naMapper)

      logger.info(s"Calculating...")
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
      case Success(_) => tFEvents(df_events, df_attributes_binary, df_events_casefilter)
      case Failure(exception) => {
        println(s"ERRRRRRROOOOORRR  ${exception.getClass.toString}")
        println(s"ERRRRRRROOOOORRR  ${exception.getCause.getMessage}")
        exception match {
          //java.time.format.DateTimeParseException
          case errorDate if exception.isInstanceOf[DateTimeParseException] => {
            println("Error in events for DateTimeParseException : " + errorDate.getCause.getMessage)
            sendBottleToTheSea(s"$analysisId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organisation)
            tFEvents(spark.emptyDataFrame, spark.emptyDataFrame, spark.emptyDataFrame)
          }
          case sparkError if exception.isInstanceOf[SparkException] => sparkError.getCause.getMessage match {
            case date if date contains ("You may get a different result due to the upgrading of Spark 3.0") => {
              println("Error in events for SparkException/DateTimeParseException : " + date)
              sendBottleToTheSea(s"$analysisId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organisation)
              tFEvents(spark.emptyDataFrame, spark.emptyDataFrame, spark.emptyDataFrame)
            }
            case x => {
              println("Error in events for SparkException/Unknown : " + x)
              sendBottleToTheSea(s"$analysisId", "error", s"Undefined SparkException , ${x}", 0, organisation)
              tFEvents(spark.emptyDataFrame, spark.emptyDataFrame, spark.emptyDataFrame)
            }
          }
          case x => {
            println("Error in events : " + x)
            sendBottleToTheSea(s"$analysisId", "error", s"Undefined error yet, ${x}", 0, organisation)
            tFEvents(spark.emptyDataFrame, spark.emptyDataFrame, spark.emptyDataFrame)
          }


          /*          case y => y.getCause.getMessage match {
                      case parse if parse.matches(".*DateTimeFormatter.*") || parse.matches(".*DateTimeParseException.*") || parse.matches(".*SparkUpgradeException.*") => {
                        println("Error in events for time parsing : " + parse)
                        sendBottleToTheSea(s"$assetId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html", 0, organization)
                      }
                      case x => {
                        println("Error in events : " + x)
                        sendBottleToTheSea(s"$assetId", "error", s"Undefined error yet, ${x}", 0, organization)
                      }
                    }*/
        }
      }
      /*      case Failure(exception) => exception.getCause.getMessage match {
              case parse if parse.matches(".*DateTimeFormatter.*") => {
                logger.error("Error in events for time parsing : " + parse)
                sendBottleToTheSea(s"$analysisId", "error", s"Error while parsing date, check your formats in the Datasets section. You can form a valid datetime pattern with the guide from https://spark.apache.org/docs/latest/sql-ref-datetime-pattern.html or send an email to our Pattern Master nmarzin@tibco.com", 0, organisation)
                tFEvents(spark.emptyDataFrame,spark.emptyDataFrame ,spark.emptyDataFrame)
              }
              case x => {
                logger.error("Error in events : " + x)
                //sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}", 0, databaseName, LocalDateTime.now().toString)
                sendBottleToTheSea(s"$analysisId", "error", s"Undefined error yet, ${x}", 0, organisation)
                tFEvents(spark.emptyDataFrame,spark.emptyDataFrame,spark.emptyDataFrame)
              }
            }*/
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
      case Failure(e) => logger.error("Error in events : " + e.getMessage)
        //sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}", 0, databaseName, LocalDateTime.now().toString)
        sendBottleToTheSea(s"$analysisId", "error", e.getMessage, 0, organisation)
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
      case Failure(e) => logger.error("Error in events : " + e.getMessage)
        //sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}", 0, databaseName, LocalDateTime.now().toString)
        sendBottleToTheSea(s"$analysisId", "error", e.getMessage, 0, organisation)
        spark.emptyDataFrame
    }
  }



  /*def changeDateFormat (inputDateString: String, inputDateFormatString: String): String = {
    var convertedDateFormat = ""
    try {
      val inputDateFormat: SimpleDateFormat = new SimpleDateFormat(inputDateFormatString)
      val date = inputDateFormat.parse(inputDateString)
      val df = new SimpleDateFormat(isoDatePattern)
      convertedDateFormat = df.format(date)
    } catch {
      case ex: Exception =>
        logger.info("[HandleDateTimeUtils] Exception while converting time to 'yyyy-MM-dd'T'HH:mm:sss' Format. Input is: " + inputDateString + " with format : " + inputDateFormatString, ex.getMessage)
    }
   convertedDateFormat
  }*/

}

// scalastyle:on println
