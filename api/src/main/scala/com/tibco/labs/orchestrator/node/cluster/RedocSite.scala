package com.tibco.labs.orchestrator.node.cluster

import akka.http.scaladsl.server.{Directives, Route}

// using RapiDoc
trait RedocSite extends Directives {
  val redocSiteRoute: Route = concat(path("core-docs") {
    getFromResource("core-docs/index.html")
  } ~ getFromResourceDirectory("core-docs")
    ~ path("core-docs"/ "api.yaml") {
    getFromResource("core-docs/api.yaml")
  }  ~ getFromResourceDirectory("core-docs")
  )
}