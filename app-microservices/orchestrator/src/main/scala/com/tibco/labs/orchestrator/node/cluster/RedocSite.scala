package com.tibco.labs.orchestrator.node.cluster

import akka.http.scaladsl.server.{Directives, Route}

trait RedocSite extends Directives {
  val redocSiteRoute: Route = path("docs") {
    getFromResource("docs-ui/index.html")
  } ~ getFromResourceDirectory("docs-ui")
}