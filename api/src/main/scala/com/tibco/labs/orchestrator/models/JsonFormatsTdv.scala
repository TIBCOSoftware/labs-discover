package com.tibco.labs.orchestrator.models

import com.tibco.labs.orchestrator.api.registry.TdvMgmtRegistry.{ActionPerformedUpdate, ActionPerformedDataSchema, ActionPerformedUnmanagedPublishedViews, ActionPerformedTDVCreate}
import spray.json.RootJsonFormat

//#json-formats
import spray.json.DefaultJsonProtocol

object JsonFormatsTdv {
  // import the default encoders for primitive types (Int, String, Lists etc)

  import DefaultJsonProtocol._

  implicit val actionPerformedJsonFormat: RootJsonFormat[ActionPerformedUpdate] = jsonFormat4(ActionPerformedUpdate)

  implicit val actionPerformedJsonFormat2: RootJsonFormat[ActionPerformedTDVCreate] = jsonFormat7(ActionPerformedTDVCreate)


  //implicit val datasetSourceTdvFormat: RootJsonFormat[DatasetSourceTdv] = jsonFormat9(DatasetSourceTdv)
  //implicit val schemaJsonFormat: RootJsonFormat[SchemaTdv] = jsonFormat3(SchemaTdv)
  //implicit val tdvConfigJsonFormat: RootJsonFormat[tdvJob] = jsonFormat8(tdvJob)

  implicit val schemaInnerJsonFormat: RootJsonFormat[SchemaTdv] = jsonFormat4(SchemaTdv)
  //implicit  val publishedInnerJsonFormat: RootJsonFormat[PublishedViews] = jsonFormat2(PublishedViews)
  implicit val tdvSchemaJsonFormat: RootJsonFormat[TDV] = jsonFormat1(TDV)
  //implicit  val tdvPubJsonFormat: RootJsonFormat[TDVPublished] = jsonFormat1(TDVPublished)
  //implicit val actionPerformedJsonFormat3: RootJsonFormat[ActionPerformedDataSchema] = jsonFormat3(ActionPerformedDataSchema)
  //implicit val actionPerformedJsonFormat5: RootJsonFormat[ActionPerformed5] = jsonFormat3(ActionPerformed5)
  //implicit val actionPerformedJsonFormat4: RootJsonFormat[ActionPerformedUnmanagedPublishedViews] = jsonFormat2(ActionPerformedUnmanagedPublishedViews)
}
//#json-formats
