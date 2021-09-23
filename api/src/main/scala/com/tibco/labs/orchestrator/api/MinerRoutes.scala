package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import akka.util.Timeout
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import com.tibco.labs.orchestrator.api.registry.MiningDataRegistry
import com.tibco.labs.orchestrator.api.registry.MiningDataRegistry.{ActionPerformedActivities, ActionPerformedDeleteAnalysis, ActionPerformedGetAllAnalysis, ActionPerformedGetReference, deleteAnalysisRegistry, getActivitiesRegistry, getAllAnalysisRegistry, getReferenceRegistry}
import com.tibco.labs.orchestrator.api.registry.ProcessMiningRegistry._
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import io.circe.generic.auto._
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.security.{SecurityRequirement, SecurityRequirements}
import io.swagger.v3.oas.annotations.{Operation, Parameter}
import org.slf4j.LoggerFactory

import java.lang.annotation.Annotation
import javax.ws.rs._
import javax.ws.rs.core.MediaType
import scala.concurrent.Future


//#import-json-formats
//#user-routes-class

@Path("/mining")
class MinerRoutes(miningDataRegistry: ActorRef[MiningDataRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {

  //#user-routes-class
  //#import-json-formats

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout = Timeout.create(system.settings.config.getDuration("processmining.routes.ask-timeout"))

  val log = LoggerFactory.getLogger(this.getClass.getName)


  /**
   * @param id
   * @return
   */
  def getAllAnalysisAPI(token: String): Future[ActionPerformedGetAllAnalysis] =
    miningDataRegistry.ask(getAllAnalysisRegistry(token, _))

  def getReferenceVariantsAPI(token: String, id: String): Future[ActionPerformedGetReference] =
    miningDataRegistry.ask(getReferenceRegistry(token, id, _))

  def getActivitiesAPI(token: String, id: String): Future[ActionPerformedActivities] =
    miningDataRegistry.ask(getActivitiesRegistry(token, id, _))

  def deleteAnalysisAPI(token: String, id: String): Future[ActionPerformedDeleteAnalysis] =
    miningDataRegistry.ask(deleteAnalysisRegistry(token, id, _))

  /*  def createSparkJob(config: pmConfigLiveApps): Future[ActionPerformedSparkSingle] = {
      processMiningRegistry.ask(createSparkJobRegistry(config, _))
    }

    def deleteSparkJob(id: String): Future[ActionPerformedSparkSingle] =
      processMiningRegistry.ask(deleteSparkJobRegistry(id, _))*/

  //#all-routes
  //#users-get-post
  //#users-get-delete

  val MinerRoutes: Route = getAllAnalysisRoute ~ getReferenceRoute ~ getActivitiesRoute ~ deleteAnalysisRoute


  @GET
  @Path("analysis/all")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Get all Analysis in an org",
    description = "Get all Analysis in an org",
    tags = Array("Mining Data"),
    security  = Array(new SecurityRequirement(name = "bearer")),
    //parameters = Array(new Parameter(name = "sparkAppName", in = ParameterIn.PATH, description = "Spark Job Name")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetAllAnalysis])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetAllAnalysis])))),
      new ApiResponse(responseCode = "404", description = "Job not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetAllAnalysis]))))
    )
  )
  def getAllAnalysisRoute: Route = {
    cors() {
      path("mining" / "analysis" / "all") {

          extractCredentials { creds =>
          get {
            //#retrieve-sparkapp-info/status
            rejectEmptyResponse {
                log.info(creds.getOrElse("None").toString)
                val token = creds.getOrElse("None").toString.replaceAll("Bearer ","")
                onSuccess(getAllAnalysisAPI(token)) { response =>
                  if (response.code == 0) {
                    complete((StatusCodes.OK, response))
                  } else if (response.code == 401) {
                    complete((StatusCodes.Unauthorized, response))
                  } else {
                    complete((StatusCodes.BadGateway, response))
                  }
                }
              }
            }
            //#retrieve-sparkapp-info/status
          }

      }
    }
  }


  @GET
  @Path("variants/reference/{analysis_id}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Get all reference variants in an org",
    description = "Get all reference variants in an org",
    tags = Array("Mining Data"),
    security  = Array(new SecurityRequirement(name = "bearer")),
    parameters = Array(new Parameter(name = "analysis_id", in = ParameterIn.PATH, description = "Id of analysis")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetReference])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetReference])))),
      new ApiResponse(responseCode = "401", description = "Un authorized",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetReference]))))
    )
  )
  def getReferenceRoute: Route = {
    cors() {
      path("mining" / "variants" / "reference" / Segment) { analysisId =>
        extractCredentials { creds =>
          get {
            //#retrieve-sparkapp-info/status
            rejectEmptyResponse {
              log.info(creds.getOrElse("None").toString)
              val token = creds.getOrElse("None").toString.replaceAll("Bearer ","")
              onSuccess(getReferenceVariantsAPI(token, analysisId)) { response =>
                if (response.code == 0) {
                  complete((StatusCodes.OK, response))
                } else if (response.code == 401) {
                  complete((StatusCodes.Unauthorized, response))
                } else {
                  complete((StatusCodes.BadGateway, response))
                }
              }
            }
          }
          //#retrieve-sparkapp-info/status
        }

      }
    }
  }


  @GET
  @Path("activities/{analysis_id}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Get all activities  in an org for a given analysis",
    description = "Get all activities  in an org for a given analysis",
    tags = Array("Mining Data"),
    security  = Array(new SecurityRequirement(name = "bearer")),
    parameters = Array(new Parameter(name = "analysis_id", in = ParameterIn.PATH, description = "Id of analysis")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedActivities])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedActivities])))),
      new ApiResponse(responseCode = "401", description = "Un authorized",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedActivities]))))
    )
  )
  def getActivitiesRoute: Route = {
    cors() {
      path("mining" / "activities"  / Segment) { analysisId =>
        extractCredentials { creds =>
          get {
            //#retrieve-sparkapp-info/status
            rejectEmptyResponse {
              log.info(creds.getOrElse("None").toString)
              val token = creds.getOrElse("None").toString.replaceAll("Bearer ","")
              onSuccess(getActivitiesAPI(token, analysisId)) { response =>
                if (response.code == 0) {
                  complete((StatusCodes.OK, response))
                } else if (response.code == 401) {
                  complete((StatusCodes.Unauthorized, response))
                } else {
                  complete((StatusCodes.BadGateway, response))
                }
              }
            }
          }
          //#retrieve-sparkapp-info/status
        }

      }
    }
  }


  @DELETE
  @Path("analysis/{analysis_id}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "Delete all data  in an org for a given analysis",
    description = "Delete all data  in an org for a given analysis",
    tags = Array("Mining Data"),
    security  = Array(new SecurityRequirement(name = "bearer")),
    parameters = Array(new Parameter(name = "analysis_id", in = ParameterIn.PATH, description = "Id of analysis")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteAnalysis])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteAnalysis])))),
      new ApiResponse(responseCode = "401", description = "Un authorized",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteAnalysis]))))
    )
  )
  def deleteAnalysisRoute: Route = {
    cors() {
      path("mining" / "analysis"  / Segment) { analysisId =>
        extractCredentials { creds =>
          delete {
            //#retrieve-sparkapp-info/status
            rejectEmptyResponse {
              log.info(creds.getOrElse("None").toString)
              val token = creds.getOrElse("None").toString.replaceAll("Bearer ","")
              onSuccess(deleteAnalysisAPI(token, analysisId)) { response =>
                if (response.code == 0) {
                  complete((StatusCodes.OK, response))
                } else if (response.code == 401) {
                  complete((StatusCodes.Unauthorized, response))
                } else {
                  complete((StatusCodes.BadGateway, response))
                }
              }
            }
          }
          //#retrieve-sparkapp-info/status
        }

      }
    }
  }
  //#all-routes
}
