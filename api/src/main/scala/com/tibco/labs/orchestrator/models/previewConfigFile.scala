package com.tibco.labs.orchestrator.models

case class SchemaCsv(
                      TimeStampFormat: Option[String],
                      ColumnName: String,
                      DataType: String
                    )

case class previewConfigFile(
                              Token: String,
                              Organization: String,
                              DatasetId: String
                            )
