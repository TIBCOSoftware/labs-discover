package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import akka.util.Timeout
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import com.tibco.labs.orchestrator.api.registry.ProcessMiningRegistry
import com.tibco.labs.orchestrator.api.registry.ProcessMiningRegistry._
import com.tibco.labs.orchestrator.models.pmConfigLiveApps
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.{Content, ExampleObject, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.{Operation, Parameter}

//import jakarta.ws.rs.core.MediaType
//import jakarta.ws.rs.{Consumes, DELETE, GET, POST, Path, Produces}
import javax.ws.rs._
import javax.ws.rs.core.MediaType
import scala.concurrent.Future
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import io.circe.generic.auto._


//#import-json-formats
//#user-routes-class

@Path("/processmining")
class ProcessMiningRoutes(processMiningRegistry: ActorRef[ProcessMiningRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {

  //#user-routes-class

  import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  //#import-json-formats

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout = Timeout.create(system.settings.config.getDuration("processmining.routes.ask-timeout"))


  /**
   * @param id
   * @return
   */
  def getSparkJobStatus(id: String): Future[ActionPerformedSparkSingle] =
    processMiningRegistry.ask(getSparkJobStatusRegistry(id, _))

  def createSparkJob(config: pmConfigLiveApps): Future[ActionPerformedSparkSingle] = {
    processMiningRegistry.ask(createSparkJobRegistry(config, _))
  }

  def deleteSparkJob(id: String): Future[ActionPerformedSparkSingle] =
    processMiningRegistry.ask(deleteSparkJobRegistry(id, _))

  //#all-routes
  //#users-get-post
  //#users-get-delete

  val ProcessMiningRoutes: Route = postJobRoute ~ deleteJobRoute ~ getJobRoute

  @POST
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Creates a spark job with a given config", description = "Creates a spark job with a given config", tags = Array("Spark One time Job"),
    requestBody = new RequestBody(content = Array(new Content(
      schema = new Schema(implementation = classOf[pmConfigLiveApps]),
      examples = Array(new ExampleObject(value =
        """{
                                                     "schema": [
                                                               {
                                                                   "format": "",
                                                                   "columnName": "Service ID",
                                                                   "dataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "columnName": "Operation",
                                                                   "dataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "columnName": "Agent",
                                                                   "dataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "columnName": "Service Type",
                                                                   "dataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "columnName": "Product",
                                                                   "dataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "columnName": "Customer ID",
                                                                   "dataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "columnName": "Agent Position",
                                                                   "dataType": "string"
                                                               },
                                                               {
                                                                   "format": "d.M.yy H:m",
                                                                   "columnName": "End Date",
                                                                   "dataType": "timestamp"
                                                               },
                                                               {
                                                                   "format": "d.M.yy H:m",
                                                                   "columnName": "Start Date",
                                                                   "dataType": "timestamp"
                                                               }
                                                           ],
                                                     "datasetSource": {
                                                       "source": "/services/databases/org_01xxxxxxxxxxxxxxxxxxxxxxxx/datasets/CallCenter"
                                                     },
                                                     "filters": [
                                                       {
                                                         "description": "",
                                                         "name": "",
                                                         "filterType": "",
                                                         "value": ""
                                                       }
                                                     ],
                                                     "groups": [
                                                       {
                                                         "description": "",
                                                         "name": "",
                                                         "filterType": "",
                                                         "value": ""
                                                       }
                                                     ],
                                                     "id": "00000-00000-0000-0000",
                                                     "version": "12929039330202",
                                                     "token": "CIC~PaellaIsGood",
                                                     "mappings": {
                                                       "activity": "Operation",
                                                       "caseId": "Service ID",
                                                       "endTime": "End Date",
                                                       "otherAttributes": "true",
                                                       "requester": "",
                                                       "resource": "Agent",
                                                       "resourceGroup": "Agent Position",
                                                       "scheduledEnd": "",
                                                       "scheduledStart": "",
                                                       "startTime": "Start Date"
                                                     },
                                                     "organization": "01xxxxxxxxxxxxxxxxxxxxxxxx",
                                                     "schedule": {
                                                       "schedule": "every5min",
                                                       "isSchedule": "false"

                                                     }
                                                   }"""))
    ))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Add response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSparkSingle])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSparkSingle]))))))
  def postJobRoute: Route = {
    cors() {
      path("processmining") {
        concat(
          //#post-sparkapp
          pathEnd {
            concat(
              post {
                entity(as[pmConfigLiveApps]) { config =>
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
  @Operation(summary = "Get status of the spark job for PM", description = "Get status of the spark job for PM", tags = Array("Spark One time Job"),
    parameters = Array(new Parameter(name = "sparkAppName", in = ParameterIn.PATH, description = "Spark Job Name")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSparkSingle])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSparkSingle])))),
      new ApiResponse(responseCode = "404", description = "Job not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSparkSingle]))))
    )
  )
  def getJobRoute: Route = {
    cors() {
      path("processmining" / Segment) { sparkAppName =>
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
  @Operation(summary = "Delete the specified spark application", description = "Delete the specified spark application", tags = Array("Spark One time Job"),
    parameters = Array(
      new Parameter(name = "sparkAppName", in = ParameterIn.PATH, description = "sparkAppName Id")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSparkSingle])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"),
      new ApiResponse(responseCode = "404", description = "Job not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSparkSingle]))))
    )
  )
  def deleteJobRoute: Route = {
    cors() {
      path("processmining" / Segment) { sparkAppName =>
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
