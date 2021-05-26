package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import akka.util.Timeout
import com.tibco.labs.orchestrator.api.PreviewFileRegistry._
import com.tibco.labs.orchestrator.models.previewConfigFile
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.{Content, ExampleObject, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.{Operation, Parameter}
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._

import javax.ws.rs._
import javax.ws.rs.core.MediaType
import scala.concurrent.Future


//#import-json-formats
//#user-routes-class

@Path("/preview")
class PreviewFileRoutes(previewFileRegistry: ActorRef[PreviewFileRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {

  //#user-routes-class

  import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  import com.tibco.labs.orchestrator.models.JsonFormatsPreview._
  //#import-json-formats

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout = Timeout.create(system.settings.config.getDuration("processmining.routes.ask-timeout"))


  def getSparkJobStatus(id: String): Future[ActionPerformedPreview] =
    previewFileRegistry.ask(getSparkJobStatusPreviewRegistry(id, _))

  def createSparkJob(config: previewConfigFile): Future[ActionPerformedPreview] = {
    previewFileRegistry.ask(createSparkJobPreviewRegistry(config, _))
  }

  def deleteSparkJob(id: String): Future[ActionPerformedPreview] =
    previewFileRegistry.ask(deleteSparkJobPreviewRegistry(id, _))

  //#all-routes
  //#users-get-post
  //#users-get-delete

  val PreviewRoutes: Route = postJobPrevRoute ~ deleteJobPrevRoute ~ getJobPrevRoute

  @POST
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Spawn Spark job to preview and insert File as binary in DB", description = "Spawn Spark job to preview and insert File as binary in DB", tags = Array("Spark Preview Job"),
    requestBody = new RequestBody(content = Array(new Content(schema = new Schema(implementation = classOf[previewConfigFile]),
      examples = Array(new ExampleObject(value =
        """{
                                                     "Token": "CIC~IloveFoodAndWine",
                                                     "Organization": "01dxjp1rpa35bzcv1kvem9ffyk",
                                                     "DatasetId": "12"
                                                   }"""))
    ))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Add response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedPreview])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedPreview]))))))
  def postJobPrevRoute: Route = {
    cors() {
      path("preview") {
        concat(
          //#post-sparkapp
          pathEnd {
            concat(
              post {
                entity(as[previewConfigFile]) { config =>
                  onSuccess(createSparkJob(config)) { performed =>
                    if (performed.code == 0) {
                      complete((StatusCodes.Created, performed))
                    } else {
                      complete((StatusCodes.BadGateway, performed))
                    }
                  }
                }
              })
            //#post-sparkapp
          }
        )
      }
    }
  }

  @GET
  @Path("{sparkAppName}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Return Status of Spark Preview Job", description = "Return Status of Spark Preview Job", tags = Array("Spark Preview Job"),
    parameters = Array(new Parameter(name = "sparkAppName", in = ParameterIn.PATH, description = "Organization Id")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedPreview])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedPreview])))),
      new ApiResponse(responseCode = "404", description = "Job not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedPreview]))))
    )
  )
  def getJobPrevRoute: Route = {
    cors() {
      path("preview" / Segment) { sparkAppName =>
        concat(
          get {
            //#retrieve-sparkapp-info/status
            rejectEmptyResponse {
              onSuccess(getSparkJobStatus(sparkAppName)) { response =>
                if (response.code == 0) {
                  complete((StatusCodes.OK, response))
                } else if (response.code == 404) {
                  complete((StatusCodes.NotFound, response))
                } else {
                  complete((StatusCodes.BadGateway, response))
                }
              }
            }
            //#retrieve-sparkapp-info/status
          }
        )
      }
    }
  }

  @DELETE
  @Path("{sparkAppName}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Delete the specified spark application", description = "Delete the specified spark application", tags = Array("Spark Preview Job"),
    parameters = Array(
      new Parameter(name = "sparkAppName", in = ParameterIn.PATH, description = "sparkAppName Id")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedPreview])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"),
      new ApiResponse(responseCode = "404", description = "Job not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedPreview]))))
    )
  )
  def deleteJobPrevRoute: Route = {
    cors() {
      path("preview" / Segment) { sparkAppName =>
        delete {
          //#delete-sparkapp
          onSuccess(deleteSparkJob(sparkAppName)) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else if (performed.code == 404) {
              complete((StatusCodes.NotFound, performed))
            } else {
              complete((StatusCodes.BadGateway, performed))
            }
          }
          //#delete-sparkapp
        }
      }
    }
  }

  //#all-routes
}
