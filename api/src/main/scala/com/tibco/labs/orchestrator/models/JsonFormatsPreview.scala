package com.tibco.labs.orchestrator.models

import com.tibco.labs.orchestrator.api.PreviewFileRegistry.ActionPerformedPreview
import spray.json.RootJsonFormat

//#json-formats
import spray.json.DefaultJsonProtocol

object JsonFormatsPreview {
  // import the default encoders for primitive types (Int, String, Lists etc)

  import DefaultJsonProtocol._

  implicit val actionPerformedJsonFormat: RootJsonFormat[ActionPerformedPreview] = jsonFormat4(ActionPerformedPreview)

  //implicit val schemaJsonFormat: RootJsonFormat[SchemaCsv] = jsonFormat3(SchemaCsv)
  implicit val previewConfigJsonFormat: RootJsonFormat[previewConfigFile] = jsonFormat3(previewConfigFile)
}
//#json-formats
