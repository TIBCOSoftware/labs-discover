package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem, DispatcherSelector}
import akka.http.scaladsl.model.{HttpEntity, Multipart, StatusCodes}
import akka.http.scaladsl.server.directives.FileInfo
import akka.http.scaladsl.server.{Directive1, Directives, MissingFormFieldRejection, Route}
import akka.stream.Materializer
import akka.stream.scaladsl.{Sink, Source}
import akka.util.{ByteString, Timeout}
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import com.tibco.labs.orchestrator.api.registry.FilesListRegistry
import com.tibco.labs.orchestrator.api.registry.FilesListRegistry.getListFilesV2Registry
import com.tibco.labs.orchestrator.models.RedisContent
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import io.circe.generic.auto._
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.{Operation, Parameter}
import org.slf4j.LoggerFactory

import java.io.File
//import jakarta.ws.rs.core.MediaType
//import jakarta.ws.rs.{Consumes, DELETE, GET, POST, Path, Produces}
import javax.ws.rs._
import javax.ws.rs.core.MediaType
import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContextExecutor, Future}


//#import-json-formats
//#user-routes-class
@Path("/files")
class FilesListRoutes(filesRegistry: ActorRef[FilesListRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {


  val log = LoggerFactory.getLogger(this.getClass.getName)

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout: Timeout = Timeout.create(system.settings.config.getDuration("files.routes.ask-timeout"))

  // dedicated dispatcher

  //val blockingDispatcher: ExecutionContextExecutor = system.dispatchers.lookup(DispatcherSelector.fromConfig("file-ops-blocking-dispatcher"))
  //implicit val GetDispatcher: ExecutionContextExecutor = system.dispatchers.lookup(DispatcherSelector.fromConfig("file2-ops-blocking-dispatcher"))


  def getListFilesV2(id: String): Future[RedisContent] =
    filesRegistry.ask(getListFilesV2Registry(id, _))

  //#all-routes
  //#users-get-post
  //#users-get-delete


  val FilesRoutes: Route = getRouteFileV2

  @GET
  @Path("{orgid}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Return list of files stored in this org", security = Array(new SecurityRequirement(name = "bearer")), description = "Return list of files stored in this org", tags = Array("Files Operations"),
    parameters = Array(new Parameter(name = "orgid", in = ParameterIn.PATH, description = "Organization Id")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[RedisContent])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"))
  )
  def getRouteFileV2: Route = {
    cors() {
      concat(
        // /files/<orgid>/
        path("files" / Segment) { orgid =>
          concat(
            get {
              // withExecutionContext(GetDispatcher) {
              //#retrieve-sparkapp-info/status
              rejectEmptyResponse {
                onSuccess(getListFilesV2(orgid.toLowerCase)) { response =>
                  complete(response)
                }
              }
              //#retrieve-sparkapp-info/status
              //}
            }
          )
        }
      )
    }
  }

  //#all-routes
}
