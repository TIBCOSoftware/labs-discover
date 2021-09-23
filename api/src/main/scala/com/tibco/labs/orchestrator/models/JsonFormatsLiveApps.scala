package com.tibco.labs.orchestrator.models


import com.tibco.labs.orchestrator.api.registry.LoginRegistry.ActionPerformedLoginValidate

import spray.json.RootJsonFormat

//#json-formats
import spray.json.DefaultJsonProtocol

object JsonFormatsLiveApps {
  // import the default encoders for primitive types (Int, String, Lists etc)

  import DefaultJsonProtocol._

  implicit val actionPerformedLoginJsonFormat: RootJsonFormat[ActionPerformedLoginValidate] = jsonFormat3(ActionPerformedLoginValidate)

  implicit val validLoginJsonFormat: RootJsonFormat[LoginCredentials] = jsonFormat1(LoginCredentials)

}
//#json-formats
