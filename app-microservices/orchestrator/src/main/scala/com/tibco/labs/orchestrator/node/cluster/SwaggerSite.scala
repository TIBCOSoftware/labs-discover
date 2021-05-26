package com.tibco.labs.orchestrator.node.cluster

import akka.http.scaladsl.server.{Directives, Route}
import ch.megard.akka.http.cors.scaladsl.CorsDirectives.cors

trait SwaggerSite extends Directives {
  val swaggerSiteRoute: Route = cors() {
    path("backswagger") {
      getFromResource("swagger-ui/index.html")
    } ~ getFromResourceDirectory("swagger-ui")
  }
}