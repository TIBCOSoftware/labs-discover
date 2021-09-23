package com.tibco.labs
package utils

case class profiles (`ColumnName`:Option[String],
                     `Completeness`:Option[String],
                     `ApproxDistinctValues`:Int,
                     `DataType`:Option[String],
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