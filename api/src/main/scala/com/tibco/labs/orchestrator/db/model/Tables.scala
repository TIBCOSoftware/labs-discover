package com.tibco.labs.orchestrator.db.model
//import com.tibco.labs.orchestrator.db.model.Tables.schemaName
// AUTO-GENERATED Slick data model

/** Stand-alone Slick data model for immediate use */
object Tables extends {
  val profile = slick.jdbc.PostgresProfile
} with Tables

/** Slick data model trait for extension, choice of backend or usage in the cake pattern. (Make sure to initialize this late.) */
trait Tables {
  val profile: slick.jdbc.JdbcProfile

  import profile.api._
  import slick.model.ForeignKeyAction
  // NOTE: GetResult mappers for plain SQL are only generated for tables where Slick knows how to map the types of all columns.
  import slick.jdbc.{GetResult => GR}

  val _defaultSchema = "public"
  /** DDL for all tables. Call .create to execute. */
  lazy val schema: profile.SchemaDescription = Array(Activities(_defaultSchema).schema, AttributesBinary(_defaultSchema).schema, Cases(_defaultSchema).schema, Datasets(_defaultSchema).schema, Events(_defaultSchema).schema, Metrics(_defaultSchema).schema, Variants(_defaultSchema).schema, VariantsStatus(_defaultSchema).schema).reduceLeft(_ ++ _)

  @deprecated("Use .schema instead of .ddl", "3.0")
  def ddl = schema

  /** Entity class storing rows of table Activities
   *
   * @param analysisId       Database column analysis_id SqlType(varchar), Default(None)
   * @param activityName     Database column activity_name SqlType(varchar), Default(None)
   * @param id               Database column id SqlType(int8), Default(None)
   * @param totalOccurrences Database column total_occurrences SqlType(int8), Default(None)
   * @param totalFirst       Database column total_first SqlType(int8), Default(None)
   * @param totalLast        Database column total_last SqlType(int8), Default(None)
   * @param isend            Database column isEnd SqlType(int4), Default(None)
   * @param isstart          Database column isStart SqlType(int4), Default(None) */
  case class ActivitiesRow(analysisId: Option[String] = None, activityName: Option[String] = None, id: Option[Long] = None, totalOccurrences: Option[Long] = None, totalFirst: Option[Long] = None, totalLast: Option[Long] = None, isend: Option[Int] = None, isstart: Option[Int] = None)

  /** GetResult implicit for fetching ActivitiesRow objects using plain SQL queries */
  implicit def GetResultActivitiesRow(implicit e0: GR[Option[String]], e1: GR[Option[Long]], e2: GR[Option[Int]]): GR[ActivitiesRow] = GR {
    prs =>
      import prs._
      ActivitiesRow.tupled((<<?[String], <<?[String], <<?[Long], <<?[Long], <<?[Long], <<?[Long], <<?[Int], <<?[Int]))
  }

  /** Table description of table activities. Objects of this class serve as prototypes for rows in queries. */
  class Activities(_tableTag: Tag, schemaName: String) extends profile.api.Table[ActivitiesRow](_tableTag, Some(schemaName), "activities") {
    def * = (analysisId, activityName, id, totalOccurrences, totalFirst, totalLast, isend, isstart) <> (ActivitiesRow.tupled, ActivitiesRow.unapply)

    /** Database column analysis_id SqlType(varchar), Default(None) */
    val analysisId: Rep[Option[String]] = column[Option[String]]("analysis_id", O.Default(None))
    /** Database column activity_name SqlType(varchar), Default(None) */
    val activityName: Rep[Option[String]] = column[Option[String]]("activity_name", O.Default(None))
    /** Database column id SqlType(int8), Default(None) */
    val id: Rep[Option[Long]] = column[Option[Long]]("id", O.Default(None))
    /** Database column total_occurrences SqlType(int8), Default(None) */
    val totalOccurrences: Rep[Option[Long]] = column[Option[Long]]("total_occurrences", O.Default(None))
    /** Database column total_first SqlType(int8), Default(None) */
    val totalFirst: Rep[Option[Long]] = column[Option[Long]]("total_first", O.Default(None))
    /** Database column total_last SqlType(int8), Default(None) */
    val totalLast: Rep[Option[Long]] = column[Option[Long]]("total_last", O.Default(None))
    /** Database column isEnd SqlType(int4), Default(None) */
    val isend: Rep[Option[Int]] = column[Option[Int]]("isEnd", O.Default(None))
    /** Database column isStart SqlType(int4), Default(None) */
    val isstart: Rep[Option[Int]] = column[Option[Int]]("isStart", O.Default(None))

    /** Index over (analysisId,id) (database name idx_activities) */
    val index1 = index("idx_activities", (analysisId, id))
  }


  /** Collection-like TableQuery object for table Activities */
  def Activities(schema: String) = new TableQuery(tag => new Activities(tag, schemaName = schema))

  /** Entity class storing rows of table AttributesBinary
   *
   * @param analysisId  Database column analysis_id SqlType(varchar), Default(None)
   * @param content     Database column content SqlType(bytea), Default(None)
   * @param contentType Database column content_type SqlType(varchar), Default(None) */
  case class AttributesBinaryRow(analysisId: Option[String] = None, content: Option[Array[Byte]] = None, contentType: Option[String] = None)

  /** GetResult implicit for fetching AttributesBinaryRow objects using plain SQL queries */
  implicit def GetResultAttributesBinaryRow(implicit e0: GR[Option[String]], e1: GR[Option[Array[Byte]]]): GR[AttributesBinaryRow] = GR {
    prs =>
      import prs._
      AttributesBinaryRow.tupled((<<?[String], <<?[Array[Byte]], <<?[String]))
  }

  /** Table description of table attributes_binary. Objects of this class serve as prototypes for rows in queries. */
  class AttributesBinary(_tableTag: Tag, schemaName: String) extends profile.api.Table[AttributesBinaryRow](_tableTag, Some(schemaName), "attributes_binary") {
    def * = (analysisId, content, contentType) <> (AttributesBinaryRow.tupled, AttributesBinaryRow.unapply)

    /** Database column analysis_id SqlType(varchar), Default(None) */
    val analysisId: Rep[Option[String]] = column[Option[String]]("analysis_id", O.Default(None))
    /** Database column content SqlType(bytea), Default(None) */
    val content: Rep[Option[Array[Byte]]] = column[Option[Array[Byte]]]("content", O.Default(None))
    /** Database column content_type SqlType(varchar), Default(None) */
    val contentType: Rep[Option[String]] = column[Option[String]]("content_type", O.Default(None))

    /** Index over (analysisId) (database name idx_attributes_binary) */
    val index1 = index("idx_attributes_binary", analysisId)
  }

  /** Collection-like TableQuery object for table AttributesBinary */
  def AttributesBinary(schema: String) = new TableQuery(tag => new AttributesBinary(tag, schemaName = schema))

  /** Entity class storing rows of table Cases
   *
   * @param variantId             Database column variant_id SqlType(int8), Default(None)
   * @param caseId                Database column case_id SqlType(varchar), Default(None)
   * @param caseStartTimestamp    Database column case_start_timestamp SqlType(timestamp), Default(None)
   * @param caseEndTimestamp      Database column case_end_timestamp SqlType(timestamp), Default(None)
   * @param totalCaseDuration     Database column total_case_duration SqlType(int8), Default(None)
   * @param activitiesPerCase     Database column activities_per_case SqlType(int8), Default(None)
   * @param analysisId            Database column analysis_id SqlType(varchar), Default(None)
   * @param bucketedduration      Database column bucketedDuration SqlType(float8), Default(None)
   * @param bucketeddurationLabel Database column bucketedDuration_label SqlType(varchar), Default(None) */
  case class CasesRow(variantId: Option[Long] = None, caseId: Option[String] = None, caseStartTimestamp: Option[java.sql.Timestamp] = None, caseEndTimestamp: Option[java.sql.Timestamp] = None, totalCaseDuration: Option[Long] = None, activitiesPerCase: Option[Long] = None, analysisId: Option[String] = None, bucketedduration: Option[Double] = None, bucketeddurationLabel: Option[String] = None)

  /** GetResult implicit for fetching CasesRow objects using plain SQL queries */
  implicit def GetResultCasesRow(implicit e0: GR[Option[Long]], e1: GR[Option[String]], e2: GR[Option[java.sql.Timestamp]], e3: GR[Option[Double]]): GR[CasesRow] = GR {
    prs =>
      import prs._
      CasesRow.tupled((<<?[Long], <<?[String], <<?[java.sql.Timestamp], <<?[java.sql.Timestamp], <<?[Long], <<?[Long], <<?[String], <<?[Double], <<?[String]))
  }

  /** Table description of table cases. Objects of this class serve as prototypes for rows in queries. */
  class Cases(_tableTag: Tag, schemaName: String) extends profile.api.Table[CasesRow](_tableTag, Some(schemaName), "cases") {
    def * = (variantId, caseId, caseStartTimestamp, caseEndTimestamp, totalCaseDuration, activitiesPerCase, analysisId, bucketedduration, bucketeddurationLabel) <> (CasesRow.tupled, CasesRow.unapply)

    /** Database column variant_id SqlType(int8), Default(None) */
    val variantId: Rep[Option[Long]] = column[Option[Long]]("variant_id", O.Default(None))
    /** Database column case_id SqlType(varchar), Default(None) */
    val caseId: Rep[Option[String]] = column[Option[String]]("case_id", O.Default(None))
    /** Database column case_start_timestamp SqlType(timestamp), Default(None) */
    val caseStartTimestamp: Rep[Option[java.sql.Timestamp]] = column[Option[java.sql.Timestamp]]("case_start_timestamp", O.Default(None))
    /** Database column case_end_timestamp SqlType(timestamp), Default(None) */
    val caseEndTimestamp: Rep[Option[java.sql.Timestamp]] = column[Option[java.sql.Timestamp]]("case_end_timestamp", O.Default(None))
    /** Database column total_case_duration SqlType(int8), Default(None) */
    val totalCaseDuration: Rep[Option[Long]] = column[Option[Long]]("total_case_duration", O.Default(None))
    /** Database column activities_per_case SqlType(int8), Default(None) */
    val activitiesPerCase: Rep[Option[Long]] = column[Option[Long]]("activities_per_case", O.Default(None))
    /** Database column analysis_id SqlType(varchar), Default(None) */
    val analysisId: Rep[Option[String]] = column[Option[String]]("analysis_id", O.Default(None))
    /** Database column bucketedDuration SqlType(float8), Default(None) */
    val bucketedduration: Rep[Option[Double]] = column[Option[Double]]("bucketedDuration", O.Default(None))
    /** Database column bucketedDuration_label SqlType(varchar), Default(None) */
    val bucketeddurationLabel: Rep[Option[String]] = column[Option[String]]("bucketedDuration_label", O.Default(None))

    /** Index over (analysisId) (database name idx_cases) */
    val index1 = index("idx_cases", (analysisId, caseId, variantId))
  }

  /** Collection-like TableQuery object for table Cases */
  def Cases(schema: String) = new TableQuery(tag => new Cases(tag, schemaName = schema))

  /** Entity class storing rows of table Datasets
   *
   * @param datasetId   Database column dataset_id SqlType(varchar), PrimaryKey
   * @param content     Database column content SqlType(bytea), Default(None)
   * @param contentType Database column content_type SqlType(varchar), Default(None) */
  case class DatasetsRow(datasetId: String, content: Option[Array[Byte]] = None, contentType: Option[String] = None)

  /** GetResult implicit for fetching DatasetsRow objects using plain SQL queries */
  implicit def GetResultDatasetsRow(implicit e0: GR[Option[Int]], e1: GR[Option[Array[Byte]]], e2: GR[Option[String]]): GR[DatasetsRow] = GR {
    prs =>
      import prs._
      DatasetsRow.tupled((<<[String], <<?[Array[Byte]], <<?[String]))
  }

  /** Table description of table datasets. Objects of this class serve as prototypes for rows in queries. */
  class Datasets(_tableTag: Tag, schemaName: String) extends profile.api.Table[DatasetsRow](_tableTag, Some(schemaName), "datasets") {
    def * = (datasetId, content, contentType) <> (DatasetsRow.tupled, DatasetsRow.unapply)

    /** Maps whole row to an option. Useful for outer joins. */
    def ? = ((Rep.Some(datasetId), content, contentType)).shaped.<>({ r => import r._; _1.map(_ => DatasetsRow.tupled((_1.get, _2, _3))) }, (_: Any) => throw new Exception("Inserting into ? projection not supported."))

    /** Database column dataset_id SqlType(int4), Default(None) */
    val datasetId: Rep[String] = column[String]("dataset_id", O.PrimaryKey)
    /** Database column content SqlType(bytea), Default(None) */
    val content: Rep[Option[Array[Byte]]] = column[Option[Array[Byte]]]("content", O.Default(None))
    /** Database column content_type SqlType(varchar), Default(None) */
    val contentType: Rep[Option[String]] = column[Option[String]]("content_type", O.Default(None))

    /** Index over (analysisId) (database name idx_cases) */
    val index1 = index("idx_datasets", (datasetId))
  }

  /** Collection-like TableQuery object for table Datasets */
  def Datasets(schema: String) = new TableQuery(tag => new Datasets(tag, schemaName = schema))

  /** Entity class storing rows of table Events
   *
   * @param caseId                 Database column case_id SqlType(varchar)
   * @param activityId             Database column activity_id SqlType(int8), Default(None)
   * @param activityStartTimestamp Database column activity_start_timestamp SqlType(timestamp), Default(None)
   * @param activityEndTimestamp   Database column activity_end_timestamp SqlType(timestamp), Default(None)
   * @param resourceId             Database column resource_id SqlType(varchar), Default(None)
   * @param resourceGroup          Database column resource_group SqlType(varchar), Default(None)
   * @param requester              Database column requester SqlType(varchar), Default(None)
   * @param scheduledStart         Database column scheduled_start SqlType(timestamp), Default(None)
   * @param scheduledEnd           Database column scheduled_end SqlType(timestamp), Default(None)
   * @param durationDays           Database column duration_days SqlType(int4), Default(None)
   * @param durationSec            Database column duration_sec SqlType(int8), Default(None)
   * @param nextActivityId         Database column next_activity_id SqlType(int8), Default(None)
   * @param nextResourceId         Database column next_resource_id SqlType(varchar), Default(None)
   * @param nextResourceGroup      Database column next_resource_group SqlType(varchar), Default(None)
   * @param repeatSelfLoopFlag     Database column repeat_self_loop_flag SqlType(int4), Default(None)
   * @param redoSelfLoopFlag       Database column redo_self_loop_flag SqlType(int4), Default(None)
   * @param startFlag              Database column start_flag SqlType(int4), Default(None)
   * @param endFlag                Database column end_flag SqlType(int4), Default(None)
   * @param analysisId             Database column analysis_id SqlType(varchar), Default(None)
   * @param rowId                  Database column row_id SqlType(int8), Default(None) */
  case class EventsRow(caseId: String, activityId: Option[Long] = None, activityStartTimestamp: Option[java.sql.Timestamp] = None, activityEndTimestamp: Option[java.sql.Timestamp] = None, resourceId: Option[String] = None, resourceGroup: Option[String] = None, requester: Option[String] = None, scheduledStart: Option[java.sql.Timestamp] = None, scheduledEnd: Option[java.sql.Timestamp] = None, durationDays: Option[Int] = None, durationSec: Option[Long] = None, nextActivityId: Option[Long] = None, nextResourceId: Option[String] = None, nextResourceGroup: Option[String] = None, repeatSelfLoopFlag: Option[Int] = None, redoSelfLoopFlag: Option[Int] = None, startFlag: Option[Int] = None, endFlag: Option[Int] = None, analysisId: Option[String] = None, rowId: Option[Long] = None)

  /** GetResult implicit for fetching EventsRow objects using plain SQL queries */
  implicit def GetResultEventsRow(implicit e0: GR[String], e1: GR[Option[Long]], e2: GR[Option[java.sql.Timestamp]], e3: GR[Option[String]], e4: GR[Option[Int]]): GR[EventsRow] = GR {
    prs =>
      import prs._
      EventsRow.tupled((<<[String], <<?[Long], <<?[java.sql.Timestamp], <<?[java.sql.Timestamp], <<?[String], <<?[String], <<?[String], <<?[java.sql.Timestamp], <<?[java.sql.Timestamp], <<?[Int], <<?[Long], <<?[Long], <<?[String], <<?[String], <<?[Int], <<?[Int], <<?[Int], <<?[Int], <<?[String], <<?[Long]))
  }

  /** Table description of table events. Objects of this class serve as prototypes for rows in queries. */
  class Events(_tableTag: Tag, schemaName: String) extends profile.api.Table[EventsRow](_tableTag, Some(schemaName), "events") {
    def * = (caseId, activityId, activityStartTimestamp, activityEndTimestamp, resourceId, resourceGroup, requester, scheduledStart, scheduledEnd, durationDays, durationSec, nextActivityId, nextResourceId, nextResourceGroup, repeatSelfLoopFlag, redoSelfLoopFlag, startFlag, endFlag, analysisId, rowId) <> (EventsRow.tupled, EventsRow.unapply)

    /** Maps whole row to an option. Useful for outer joins. */
    def ? = ((Rep.Some(caseId), activityId, activityStartTimestamp, activityEndTimestamp, resourceId, resourceGroup, requester, scheduledStart, scheduledEnd, durationDays, durationSec, nextActivityId, nextResourceId, nextResourceGroup, repeatSelfLoopFlag, redoSelfLoopFlag, startFlag, endFlag, analysisId, rowId)).shaped.<>({ r => import r._; _1.map(_ => EventsRow.tupled((_1.get, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20))) }, (_: Any) => throw new Exception("Inserting into ? projection not supported."))

    /** Database column case_id SqlType(varchar) */
    val caseId: Rep[String] = column[String]("case_id")
    /** Database column activity_id SqlType(int8), Default(None) */
    val activityId: Rep[Option[Long]] = column[Option[Long]]("activity_id", O.Default(None))
    /** Database column activity_start_timestamp SqlType(timestamp), Default(None) */
    val activityStartTimestamp: Rep[Option[java.sql.Timestamp]] = column[Option[java.sql.Timestamp]]("activity_start_timestamp", O.Default(None))
    /** Database column activity_end_timestamp SqlType(timestamp), Default(None) */
    val activityEndTimestamp: Rep[Option[java.sql.Timestamp]] = column[Option[java.sql.Timestamp]]("activity_end_timestamp", O.Default(None))
    /** Database column resource_id SqlType(varchar), Default(None) */
    val resourceId: Rep[Option[String]] = column[Option[String]]("resource_id", O.Default(None))
    /** Database column resource_group SqlType(varchar), Default(None) */
    val resourceGroup: Rep[Option[String]] = column[Option[String]]("resource_group", O.Default(None))
    /** Database column requester SqlType(varchar), Default(None) */
    val requester: Rep[Option[String]] = column[Option[String]]("requester", O.Default(None))
    /** Database column scheduled_start SqlType(timestamp), Default(None) */
    val scheduledStart: Rep[Option[java.sql.Timestamp]] = column[Option[java.sql.Timestamp]]("scheduled_start", O.Default(None))
    /** Database column scheduled_end SqlType(timestamp), Default(None) */
    val scheduledEnd: Rep[Option[java.sql.Timestamp]] = column[Option[java.sql.Timestamp]]("scheduled_end", O.Default(None))
    /** Database column duration_days SqlType(int4), Default(None) */
    val durationDays: Rep[Option[Int]] = column[Option[Int]]("duration_days", O.Default(None))
    /** Database column duration_sec SqlType(int8), Default(None) */
    val durationSec: Rep[Option[Long]] = column[Option[Long]]("duration_sec", O.Default(None))
    /** Database column next_activity_id SqlType(int8), Default(None) */
    val nextActivityId: Rep[Option[Long]] = column[Option[Long]]("next_activity_id", O.Default(None))
    /** Database column next_resource_id SqlType(varchar), Default(None) */
    val nextResourceId: Rep[Option[String]] = column[Option[String]]("next_resource_id", O.Default(None))
    /** Database column next_resource_group SqlType(varchar), Default(None) */
    val nextResourceGroup: Rep[Option[String]] = column[Option[String]]("next_resource_group", O.Default(None))
    /** Database column repeat_self_loop_flag SqlType(int4), Default(None) */
    val repeatSelfLoopFlag: Rep[Option[Int]] = column[Option[Int]]("repeat_self_loop_flag", O.Default(None))
    /** Database column redo_self_loop_flag SqlType(int4), Default(None) */
    val redoSelfLoopFlag: Rep[Option[Int]] = column[Option[Int]]("redo_self_loop_flag", O.Default(None))
    /** Database column start_flag SqlType(int4), Default(None) */
    val startFlag: Rep[Option[Int]] = column[Option[Int]]("start_flag", O.Default(None))
    /** Database column end_flag SqlType(int4), Default(None) */
    val endFlag: Rep[Option[Int]] = column[Option[Int]]("end_flag", O.Default(None))
    /** Database column analysis_id SqlType(varchar), Default(None) */
    val analysisId: Rep[Option[String]] = column[Option[String]]("analysis_id", O.Default(None))
    /** Database column row_id SqlType(int8), Default(None) */
    val rowId: Rep[Option[Long]] = column[Option[Long]]("row_id", O.Default(None))

    /** Index over (analysisId) (database name idx_events) */
    val index1 = index("idx_events", (analysisId, rowId))
  }

  /** Collection-like TableQuery object for table Events */
  def Events(schema: String) = new TableQuery(tag => new Events(tag, schemaName = schema))

  /** Entity class storing rows of table Metrics
   *
   * @param numOfEvents     Database column num_of_events SqlType(int8), Default(None)
   * @param numOfCases      Database column num_of_cases SqlType(int8), Default(None)
   * @param numOfActivities Database column num_of_activities SqlType(int8), Default(None)
   * @param avgtime         Database column avgtime SqlType(float8), Default(None)
   * @param mediantime      Database column mediantime SqlType(float8), Default(None)
   * @param numOfVariants   Database column num_of_variants SqlType(int8), Default(None)
   * @param maxActivities   Database column max_activities SqlType(int8), Default(None)
   * @param minActivities   Database column min_activities SqlType(int8), Default(None)
   * @param analysisId      Database column analysis_id SqlType(varchar), Default(None) */
  case class MetricsRow(numOfEvents: Option[Long] = None, numOfCases: Option[Long] = None, numOfActivities: Option[Long] = None, avgtime: Option[Double] = None, mediantime: Option[Double] = None, numOfVariants: Option[Long] = None, maxActivities: Option[Long] = None, minActivities: Option[Long] = None, analysisId: Option[String] = None)

  /** GetResult implicit for fetching MetricsRow objects using plain SQL queries */
  implicit def GetResultMetricsRow(implicit e0: GR[Option[Long]], e1: GR[Option[Double]], e2: GR[Option[String]]): GR[MetricsRow] = GR {
    prs =>
      import prs._
      MetricsRow.tupled((<<?[Long], <<?[Long], <<?[Long], <<?[Double], <<?[Double], <<?[Long], <<?[Long], <<?[Long], <<?[String]))
  }

  /** Table description of table metrics. Objects of this class serve as prototypes for rows in queries. */
  class Metrics(_tableTag: Tag, schemaName: String) extends profile.api.Table[MetricsRow](_tableTag, Some(schemaName), "metrics") {
    def * = (numOfEvents, numOfCases, numOfActivities, avgtime, mediantime, numOfVariants, maxActivities, minActivities, analysisId) <> (MetricsRow.tupled, MetricsRow.unapply)

    /** Database column num_of_events SqlType(int8), Default(None) */
    val numOfEvents: Rep[Option[Long]] = column[Option[Long]]("num_of_events", O.Default(None))
    /** Database column num_of_cases SqlType(int8), Default(None) */
    val numOfCases: Rep[Option[Long]] = column[Option[Long]]("num_of_cases", O.Default(None))
    /** Database column num_of_activities SqlType(int8), Default(None) */
    val numOfActivities: Rep[Option[Long]] = column[Option[Long]]("num_of_activities", O.Default(None))
    /** Database column avgtime SqlType(float8), Default(None) */
    val avgtime: Rep[Option[Double]] = column[Option[Double]]("avgtime", O.Default(None))
    /** Database column mediantime SqlType(float8), Default(None) */
    val mediantime: Rep[Option[Double]] = column[Option[Double]]("mediantime", O.Default(None))
    /** Database column num_of_variants SqlType(int8), Default(None) */
    val numOfVariants: Rep[Option[Long]] = column[Option[Long]]("num_of_variants", O.Default(None))
    /** Database column max_activities SqlType(int8), Default(None) */
    val maxActivities: Rep[Option[Long]] = column[Option[Long]]("max_activities", O.Default(None))
    /** Database column min_activities SqlType(int8), Default(None) */
    val minActivities: Rep[Option[Long]] = column[Option[Long]]("min_activities", O.Default(None))
    /** Database column analysis_id SqlType(varchar), Default(None) */
    val analysisId: Rep[Option[String]] = column[Option[String]]("analysis_id", O.Default(None))
  }

  /** Collection-like TableQuery object for table Metrics */
  def Metrics(schema: String) = new TableQuery(tag => new Metrics(tag, schemaName = schema))

  /** Entity class storing rows of table Variants
   *
   * @param variant                Database column variant SqlType(varchar), Default(None)
   * @param variantId              Database column variant_id SqlType(int8), Default(None)
   * @param frequency              Database column frequency SqlType(int8), Default(None)
   * @param occurencesPercent      Database column occurences_percent SqlType(float8), Default(None)
   * @param analysisId             Database column analysis_id SqlType(varchar), Default(None)
   * @param bucketedfrequency      Database column bucketedFrequency SqlType(float8), Default(None)
   * @param bucketedfrequencyLabel Database column bucketedFrequency_label SqlType(varchar), Default(None) */
  case class VariantsRow(variant: Option[String] = None, variantId: Option[Long] = None, frequency: Option[Long] = None, occurencesPercent: Option[Double] = None, analysisId: Option[String] = None, bucketedfrequency: Option[Double] = None, bucketedfrequencyLabel: Option[String] = None)

  /** GetResult implicit for fetching VariantsRow objects using plain SQL queries */
  implicit def GetResultVariantsRow(implicit e0: GR[Option[String]], e1: GR[Option[Long]], e2: GR[Option[Double]]): GR[VariantsRow] = GR {
    prs =>
      import prs._
      VariantsRow.tupled((<<?[String], <<?[Long], <<?[Long], <<?[Double], <<?[String], <<?[Double], <<?[String]))
  }

  /** Table description of table variants. Objects of this class serve as prototypes for rows in queries. */
  class Variants(_tableTag: Tag, schemaName: String) extends profile.api.Table[VariantsRow](_tableTag, Some(schemaName), "variants") {
    def * = (variant, variantId, frequency, occurencesPercent, analysisId, bucketedfrequency, bucketedfrequencyLabel) <> (VariantsRow.tupled, VariantsRow.unapply)

    /** Database column variant SqlType(varchar), Default(None) */
    val variant: Rep[Option[String]] = column[Option[String]]("variant", O.Default(None))
    /** Database column variant_id SqlType(int8), Default(None) */
    val variantId: Rep[Option[Long]] = column[Option[Long]]("variant_id", O.Default(None))
    /** Database column frequency SqlType(int8), Default(None) */
    val frequency: Rep[Option[Long]] = column[Option[Long]]("frequency", O.Default(None))
    /** Database column occurences_percent SqlType(float8), Default(None) */
    val occurencesPercent: Rep[Option[Double]] = column[Option[Double]]("occurences_percent", O.Default(None))
    /** Database column analysis_id SqlType(varchar), Default(None) */
    val analysisId: Rep[Option[String]] = column[Option[String]]("analysis_id", O.Default(None))
    /** Database column bucketedFrequency SqlType(float8), Default(None) */
    val bucketedfrequency: Rep[Option[Double]] = column[Option[Double]]("bucketedFrequency", O.Default(None))
    /** Database column bucketedFrequency_label SqlType(varchar), Default(None) */
    val bucketedfrequencyLabel: Rep[Option[String]] = column[Option[String]]("bucketedFrequency_label", O.Default(None))

    /** Index over (analysisId) (database name idx_variants) */
    val index1 = index("idx_variants", (analysisId, variantId))
  }

  /** Collection-like TableQuery object for table Variants */
  def Variants(schema: String) = new TableQuery(tag => new Variants(tag, schemaName = schema))

  /** Entity class storing rows of table VariantsStatus
   *
   * @param analysisId  Database column analysis_id SqlType(varchar)
   * @param variantId   Database column variant_id SqlType(int8)
   * @param label       Database column label SqlType(varchar), Default(None)
   * @param caseType    Database column case_type SqlType(varchar), Default(None)
   * @param caseState   Database column case_state SqlType(varchar), Default(None)
   * @param timestamp   Database column timestamp SqlType(timestamp), Default(None)
   * @param lacaseref   Database column LACaseRef SqlType(varchar), Default(None)
   * @param isreference Database column isReference SqlType(int4), Default(None) */
  case class VariantsStatusRow(analysisId: String, variantId: Long, label: Option[String] = None, caseType: Option[String] = None, caseState: Option[String] = None, timestamp: Option[java.sql.Timestamp] = None, lacaseref: Option[String] = None, isreference: Option[Int] = None)

  /** GetResult implicit for fetching VariantsStatusRow objects using plain SQL queries */
  implicit def GetResultVariantsStatusRow(implicit e0: GR[String], e1: GR[Long], e2: GR[Option[String]], e3: GR[Option[java.sql.Timestamp]], e4: GR[Option[Int]]): GR[VariantsStatusRow] = GR {
    prs =>
      import prs._
      VariantsStatusRow.tupled((<<[String], <<[Long], <<?[String], <<?[String], <<?[String], <<?[java.sql.Timestamp], <<?[String], <<?[Int]))
  }

  /** Table description of table variants_status. Objects of this class serve as prototypes for rows in queries. */
  class VariantsStatus(_tableTag: Tag, schemaName: String) extends profile.api.Table[VariantsStatusRow](_tableTag, Some(schemaName), "variants_status") {
    def * = (analysisId, variantId, label, caseType, caseState, timestamp, lacaseref, isreference) <> (VariantsStatusRow.tupled, VariantsStatusRow.unapply)

    /** Maps whole row to an option. Useful for outer joins. */
    def ? = ((Rep.Some(analysisId), Rep.Some(variantId), label, caseType, caseState, timestamp, lacaseref, isreference)).shaped.<>({ r => import r._; _1.map(_ => VariantsStatusRow.tupled((_1.get, _2.get, _3, _4, _5, _6, _7, _8))) }, (_: Any) => throw new Exception("Inserting into ? projection not supported."))

    /** Database column analysis_id SqlType(varchar) */
    val analysisId: Rep[String] = column[String]("analysis_id")
    /** Database column variant_id SqlType(int8) */
    val variantId: Rep[Long] = column[Long]("variant_id", O.PrimaryKey, O.Unique)
    /** Database column label SqlType(varchar), Default(None) */
    val label: Rep[Option[String]] = column[Option[String]]("label", O.Default(None))
    /** Database column case_type SqlType(varchar), Default(None) */
    val caseType: Rep[Option[String]] = column[Option[String]]("case_type", O.Default(None))
    /** Database column case_state SqlType(varchar), Default(None) */
    val caseState: Rep[Option[String]] = column[Option[String]]("case_state", O.Default(None))
    /** Database column timestamp SqlType(timestamp), Default(None) */
    val timestamp: Rep[Option[java.sql.Timestamp]] = column[Option[java.sql.Timestamp]]("timestamp", O.Default(None))
    /** Database column LACaseRef SqlType(varchar), Default(None) */
    val lacaseref: Rep[Option[String]] = column[Option[String]]("LACaseRef", O.Default(None))
    /** Database column isReference SqlType(int4), Default(None) */
    val isreference: Rep[Option[Int]] = column[Option[Int]]("isReference", O.Default(None))

    /** Index over (analysisId) (database name idx_variants_status) */
    val index1 = index("idx_variants_status", (analysisId, variantId))
  }

  /** Collection-like TableQuery object for table VariantsStatus */
  def VariantsStatus(schema: String) = new TableQuery(tag => new VariantsStatus(tag, schemaName = schema))
}


