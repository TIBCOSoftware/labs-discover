package com.tibco.labs.orchestrator.node.cluster

import akka.actor.typed.ActorSystem
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import akka.util.Timeout
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse

import javax.ws.rs._


//#import-json-formats
//#user-routes-class

@Path("/")
trait HealthRoutes extends Directives {

  val HealthCheckRoutes: Route = getAliveRoute ~ getReadyRoute //~ deleteJobPrevRoute ~ getJobPrevRoute

  @GET
  @Operation(summary = "Get Alive", description = "Get Alive", tags = Array("HealtCheck"),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Add response"),
      new ApiResponse(responseCode = "500", description = "Internal server error"))
  )
  def getAliveRoute: Route = {
    cors() {
      path("alive") {
        concat(
          pathEnd {
            concat(
              get {
                complete(StatusCodes.OK)
              })
          }
        )
      }
    }
  }

  @GET
  @Operation(summary = "Get Ready", description = "Create DB schema fr the relevnt org", tags = Array("HealtCheck"),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Add response"),
      new ApiResponse(responseCode = "500", description = "Internal server error")))
  def getReadyRoute: Route = {
    cors() {
      path("ready") {
        concat(
          pathEnd {
            concat(
              get {
                complete(StatusCodes.OK)
              })
          }
        )
      }
    }
  }

}
