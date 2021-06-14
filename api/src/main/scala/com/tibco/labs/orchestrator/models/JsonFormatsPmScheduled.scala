package com.tibco.labs.orchestrator.models

import com.tibco.labs.orchestrator.api.ProcessMiningScheduledRegistry.ActionPerformedSchedules
import spray.json.RootJsonFormat

//#json-formats
import spray.json.DefaultJsonProtocol

object JsonFormatsPmScheduled {
  // import the default encoders for primitive types (Int, String, Lists etc)

  import DefaultJsonProtocol._

  implicit val actionPerformedJsonFormat: RootJsonFormat[ActionPerformedSchedules] = jsonFormat4(ActionPerformedSchedules)

  implicit val schemaJsonFormat: RootJsonFormat[Schema] = jsonFormat3(Schema)
  implicit val datasetSourceJsonFormat: RootJsonFormat[datasetSource] = jsonFormat1(datasetSource)
  implicit val filterJsonFormat: RootJsonFormat[Filter] = jsonFormat4(Filter)
  implicit val mappingJsonFormat: RootJsonFormat[Mapping] = jsonFormat10(Mapping)
  implicit val scheduleJsonFormat: RootJsonFormat[Schedule] = jsonFormat2(Schedule)
  implicit val pmConfigLiveAppsJsonFormat: RootJsonFormat[pmConfigLiveApps] = jsonFormat10(pmConfigLiveApps)
}
//#json-formats
