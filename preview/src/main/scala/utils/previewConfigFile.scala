package com.tibco.labs
package utils


case class schemaPreview(
                          format: Option[String],
                          columnName: Option[String],
                          dataType: Option[String]
                        )
case class previewConfigFile(
                              Token: String,
                              Organization: String,
                              DatasetId: String,
                              schema: Option[List[schemaPreview]]
                            )
