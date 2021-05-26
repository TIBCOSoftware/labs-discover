package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import akka.util.Timeout
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import com.tibco.labs.orchestrator.api.LoginRegistry._
import com.tibco.labs.orchestrator.models.{LoginCredentials, databaseCreate}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.{Content, ExampleObject, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import akka.http.caching.scaladsl.{Cache, CachingSettings, LfuCacheSettings}
import akka.http.caching.LfuCache
import akka.http.scaladsl.server.RequestContext
import akka.http.scaladsl.server.RouteResult
import akka.http.scaladsl.model.Uri
import akka.http.scaladsl.server.directives.CachingDirectives._

import scala.concurrent.duration._
import javax.ws.rs._
import javax.ws.rs.core.MediaType
import scala.concurrent.Future


//#import-json-formats
//#user-routes-class

@Path("/login")
class LoginRoutes(loginRegistry: ActorRef[LoginRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {

  //#user-routes-class

  import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  import com.tibco.labs.orchestrator.models.JsonFormatsLiveApps._
  //#import-json-formats

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout = Timeout.create(system.settings.config.getDuration("processmining.routes.ask-timeout"))


  def validateCredentials(token: String): Future[ActionPerformedLoginValidate] = {
    loginRegistry.ask(validateCredentialsRegistry(token, _))
  }



  //#all-routes
  // cache

  // Use the request's URI as the cache's key
  val keyerFunction: PartialFunction[RequestContext, Uri] = {
    case r: RequestContext => r.request.uri
  }
  val defaultCachingSettings: CachingSettings = CachingSettings(system)
  val lfuCacheSettings: LfuCacheSettings =
    defaultCachingSettings.lfuCacheSettings
      .withInitialCapacity(40)
      .withMaxCapacity(80)
      .withTimeToLive(10.minutes)
      .withTimeToIdle(5.minutes)
  val cachingSettings: CachingSettings =
    defaultCachingSettings.withLfuCacheSettings(lfuCacheSettings)
  val lfuCache: Cache[Uri, RouteResult] = {
    LfuCache(cachingSettings)
  }


  val LoginRoutes: Route = postValidCredsRoute //~ deleteJobPrevRoute ~ getJobPrevRoute

  @POST
  @Path("/validate")
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Validate Bearer and LA groupe", description = "Validate Bearer and LA groupe", tags = Array("login"),
    requestBody = new RequestBody(content = Array(new Content(schema = new Schema(implementation = classOf[LoginCredentials]),
      examples = Array(new ExampleObject(value =
        """{
          "credentials": "slslslslslsl"
    }"""))
    ))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Valid Credentials",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedLoginValidate])))),
      new ApiResponse(responseCode = "401", description = "Unauthorize",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedLoginValidate]))))))
  def postValidCredsRoute: Route = {
    cors() {
      //cache(lfuCache, keyerFunction) {
      path("login" / "validate") {
        concat(
          //#post-sparkapp
          pathEnd {
            concat(
              post {
                entity(as[LoginCredentials]) { config =>
                  onSuccess(validateCredentials(config.credentials)) { performed =>
                    if (performed.code == 0) {
                      complete((StatusCodes.OK, performed))
                    } else {
                      complete((StatusCodes.Unauthorized, performed))
                    }
                  }
                }
              })
            //#post-sparkapp
          }
        )
      }
    //}
    }
  }

}
