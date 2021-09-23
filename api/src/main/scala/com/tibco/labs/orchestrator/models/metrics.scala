/*
 * Copyright (c) $today.year.TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this project.
 */

package com.tibco.labs.orchestrator.models


case class profiles (`ColumnName`:Option[String],
                     `Completeness`:Option[String],
                     `ApproxDistinctValues`:Int,
                     `DataType`:Option[String],
                     //`Stats (Min / Max / Mean / Std Dev)`:Option[String],
                     //`Stats (Min_Max_Mean_Std_Dev)`:Option[String],
                     `StatsMin`:Option[String],
                     `StatsMax`:Option[String],
                     `StatsMean`:Option[String],
                     `StatsStdDev`:Option[String],
                     `RecordCount`: Option[String],
                     `UniqueValues`: Option[String],
                     `EmptyStrings`: Option[String] ,
                     `NullValues`: Option[String],
                     `PercentFill`: Option[String],
                     `PercentNumeric`: Option[String],
                     `MaxLength`: Option[String]
                    )

case class MetricsDS(
                    Organisation: String,
                    JobName: String,
                    DatasetID: String,
                    Metrics: List[profiles],
                    DurationDB: Long,
                    DurationJob: Long,
                    TotalRows: Long,
                    DuplicatedRows : Long,
                    TimeStamp: Long
                  )

case class MetricsTable(numOfEvents: Option[Long] = None, numOfCases: Option[Long] = None, numOfActivities: Option[Long] = None, avgtime: Option[Double] = None, mediantime: Option[Double] = None, numOfVariants: Option[Long] = None, maxActivities: Option[Long] = None, minActivities: Option[Long] = None, analysisId: Option[String] = None)