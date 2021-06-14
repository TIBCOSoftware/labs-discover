package com.tibco.labs.orchestrator.models


import spray.json.RootJsonFormat

//#json-formats
import spray.json.DefaultJsonProtocol

object JsonFormatsDatabase {
  // import the default encoders for primitive types (Int, String, Lists etc)

  import DefaultJsonProtocol._

  //implicit val actionPerformedJsonFormat: RootJsonFormat[ActionPerformedDbCreate] = jsonFormat6(ActionPerformedDbCreate)

  //implicit val schemaJsonFormat: RootJsonFormat[SchemaCsv] = jsonFormat3(SchemaCsv)
  implicit val databaseCreateJsonFormat: RootJsonFormat[databaseCreate] = jsonFormat1(databaseCreate)
}
//#json-formats
