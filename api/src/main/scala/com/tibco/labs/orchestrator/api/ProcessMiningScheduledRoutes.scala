package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import akka.util.Timeout
import com.tibco.labs.orchestrator.api.ProcessMiningScheduledRegistry._
import com.tibco.labs.orchestrator.models.pmConfigLiveApps
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

@Path("/processmining/scheduled")
class ProcessMiningScheduledRoutes(processMiningScheduledRegistry: ActorRef[ProcessMiningScheduledRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {

  //#user-routes-class

  import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  import com.tibco.labs.orchestrator.models.JsonFormatsPmScheduled._
  //#import-json-formats

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout = Timeout.create(system.settings.config.getDuration("processmining.routes.ask-timeout"))


  def getSparkJobStatus(id: String): Future[ActionPerformedSchedules] =
    processMiningScheduledRegistry.ask(getSparkJobStatusScheduledRegistry(id, _))

  def createSparkJob(config: pmConfigLiveApps): Future[ActionPerformedSchedules] = {
    processMiningScheduledRegistry.ask(createSparkJobScheduledRegistry(config, _))
  }

  def deleteSparkJob(id: String): Future[ActionPerformedSchedules] =
    processMiningScheduledRegistry.ask(deleteSparkJobScheduledRegistry(id, _))

  //#all-routes
  //#users-get-post
  //#users-get-delete

  val ProcessMiningScheduledRoutes: Route = postJobSchedRoute ~ deleteJobSchedRoute ~ getJobSchedRoute

  @POST
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Upload files to backend storage", description = "Upload files to backend storage", tags = Array("Spark Scheduled Job"),
    requestBody = new RequestBody(content = Array(new Content(
      schema = new Schema(implementation = classOf[pmConfigLiveApps]),
      examples = Array(new ExampleObject(value =
        """{
                                                     "schema": [
                                                               {
                                                                   "format": "",
                                                                   "ColumnName": "Service ID",
                                                                   "DataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "ColumnName": "Operation",
                                                                   "DataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "ColumnName": "Agent",
                                                                   "DataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "ColumnName": "Service Type",
                                                                   "DataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "ColumnName": "Product",
                                                                   "DataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "ColumnName": "Customer ID",
                                                                   "DataType": "string"
                                                               },
                                                               {
                                                                   "format": "",
                                                                   "ColumnName": "Agent Position",
                                                                   "DataType": "string"
                                                               },
                                                               {
                                                                   "format": "d.M.yy H:m",
                                                                   "ColumnName": "End Date",
                                                                   "DataType": "timestamp"
                                                               },
                                                               {
                                                                   "format": "d.M.yy H:m",
                                                                   "ColumnName": "Start Date",
                                                                   "DataType": "timestamp"
                                                               }
                                                           ],
                                                     "Dataset_Source": {
                                                       "Source": "/services/databases/org_01xxxxxxxxxxxxxxxxxxxxxxxx/datasets/CallCenter"
                                                     },
                                                     "Filter": [
                                                       {
                                                         "Description": "",
                                                         "Name": "",
                                                         "Type": "",
                                                         "Value": ""
                                                       }
                                                     ],
                                                     "Groups": [
                                                       {
                                                         "Description": "",
                                                         "Name": "",
                                                         "Type": "",
                                                         "Value": ""
                                                       }
                                                     ],
                                                     "id": "PAM_000001",
                                                     "token": "CIC~PaellaIsGood",
                                                     "Mapping": {
                                                       "Activity": "Operation",
                                                       "CaseID": "Service ID",
                                                       "Endtime": "End Date",
                                                       "Otherattributes": "true",
                                                       "Requester": "",
                                                       "Resource": "Agent",
                                                       "Resourcegroup": "Agent Position",
                                                       "Scheduledend": "",
                                                       "Scheduledstart": "",
                                                       "Starttime": "Start Date"
                                                     },
                                                     "Organization": "01xxxxxxxxxxxxxxxxxxxxxxxx",
                                                     "Schedule": {
                                                       "Schedule": "every5min",
                                                       "isSchedule": "false"

                                                     }
                                                   }"""))
    ))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Add response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSchedules])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSchedules]))))))
  def postJobSchedRoute: Route = {
    cors() {
      path("processmining" / "scheduled") {
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
  @Operation(summary = "Return list of files stored in this org", description = "Return list of files stored in this org", tags = Array("Spark Scheduled Job"),
    parameters = Array(new Parameter(name = "sparkAppName", in = ParameterIn.PATH, description = "Organization Id")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSchedules])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSchedules])))),
      new ApiResponse(responseCode = "404", description = "Job not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSchedules]))))
    )
  )
  def getJobSchedRoute: Route = {
    cors() {
      path("processmining" / "scheduled" / Segment) { sparkAppName =>
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
  @Operation(summary = "Delete the specified spark application", description = "Delete the specified spark application", tags = Array("Spark Scheduled Job"),
    parameters = Array(
      new Parameter(name = "sparkAppName", in = ParameterIn.PATH, description = "sparkAppName Id")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSchedules])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"),
      new ApiResponse(responseCode = "404", description = "Job not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedSchedules]))))
    )
  )
  def deleteJobSchedRoute: Route = {
    cors() {
      path("processmining" / "scheduled" / Segment) { sparkAppName =>
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
