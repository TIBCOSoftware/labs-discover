package com.tibco.labs.orchestrator.api

import akka.NotUsed
import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem, DispatcherSelector}
import akka.http.caching.LfuCache
import akka.http.caching.scaladsl.{Cache, CachingSettings, LfuCacheSettings}
import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.model.{ContentTypes, HttpEntity, HttpResponse, StatusCodes, Uri}
import akka.http.scaladsl.server.directives.CachingDirectives.cache
import akka.http.scaladsl.server.directives.FileInfo
import akka.http.scaladsl.server.{Directives, RequestContext, Route, RouteResult}
import akka.stream.alpakka.s3.ObjectMetadata
import akka.stream.scaladsl.{Sink, Source}
import akka.util.{ByteString, Timeout}
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import com.tibco.labs.orchestrator.api.registry.UIAssetsRegistry
import com.tibco.labs.orchestrator.api.registry.UIAssetsRegistry._
import com.tibco.labs.orchestrator.conf.DiscoverConfig
import com.tibco.labs.orchestrator.models.S3Content
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import akka.http.scaladsl.server.Directives._
import io.circe.generic.auto._
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.{ArraySchema, Content, Encoding, ExampleObject, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import akka.stream.alpakka.s3.scaladsl.S3
import io.swagger.v3.oas.annotations.extensions.Extension
import io.swagger.v3.oas.annotations.{Operation, Parameter}
import org.slf4j.LoggerFactory

import java.io.File
import java.lang.annotation.Annotation
import javax.ws.rs._
import javax.ws.rs.core.MediaType

//import jakarta.ws.rs.core.MediaType
//import jakarta.ws.rs.{Consumes, DELETE, GET, POST, Path, Produces}
import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}

//#import-json-formats
//#user-routes-class
@Path("/uiassets")
class UIAssetsRoutes(filesRegistry: ActorRef[UIAssetsRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {


  case class FileUploadUI(
                           @Schema(`type` = "string", format = "binary", description = "file", required = true) file: File
                         )


  val log = LoggerFactory.getLogger(this.getClass.getName)
  val bucketName: String = DiscoverConfig.config.backend.storage.filesystem.s3_bucket

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout: Timeout = Timeout.create(system.settings.config.getDuration("files.routes.ask-timeout"))

  // dedicated dispatcher

  implicit val blockingDispatcher: ExecutionContextExecutor = system.dispatchers.lookup(DispatcherSelector.fromConfig("ui-ops-blocking-dispatcher"))

  def getListFiles(id: String): Future[S3Content] =
    filesRegistry.ask(getListUIAssetsRegistry(id, _))

  def getURLFile(token: String, fileName: String): Future[ActionPerformedUIAssetsUrl] =
    filesRegistry.ask(getS3UIAssetsContentRegistry(token, fileName, _))

  def uploadFile2S3(id: String, fileInfo: FileInfo, data: Source[ByteString, Any]): Future[ActionPerformedUIAssets] = {
    filesRegistry.ask(uploadUIAssetsRegistry(id, fileInfo, data, _))
  }

  def deleteFile(id: String, fileName: String): Future[ActionPerformedUIAssets] =
    filesRegistry.ask(deleteUIAssetsRegistry(id, fileName, _))

  //#all-routes
  //#users-get-post
  //#users-get-delete


  val UiAssetsRoutes: Route = (postRouteFile ~ getRouteFile ~ deleteRouteSegment ~ getRouteDirectFile)

  @POST
  @Path("{orgid}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Upload files to S3 under <Bucket>/{orgId}/assets/", security = Array(new SecurityRequirement(name = "bearer")), description = "Upload files to S3 under <Bucket>/{orgId}/assets/", tags = Array("Assets Storage Operations"),
    requestBody = new RequestBody(content = Array(
      new Content(
        mediaType = MediaType.MULTIPART_FORM_DATA,
        schema = new Schema(implementation = classOf[FileUploadUI])
      )),
      description = "file"),
    parameters = Array(new Parameter(name = "orgid", in = ParameterIn.PATH, description = "Organization Id")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Add response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUIAssets])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUIAssets]))))))
  def postRouteFile: Route = {
    cors() {
      path("uiassets" / Segment) { orgid =>
        concat(
          withRequestTimeout(900.seconds) {
            withSizeLimit(1073741824) {
              fileUpload("file") {
                case (metadata, file) =>
                  onSuccess(uploadFile2S3(orgid.toLowerCase, metadata, file)) { uploadFuture =>
                    if (uploadFuture.code == 0) {
                      complete((StatusCodes.Created, uploadFuture))
                    } else {
                      complete((StatusCodes.InternalServerError, uploadFuture))
                    }
                  }
              }
              //}
            }
            //}
          }

        )
      }
    }
  }


  @GET
  @Path("{orgid}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Return list of files stored in this org for web assets", security = Array(new SecurityRequirement(name = "bearer")), description = "Return list of files stored in this org for web assets", tags = Array("Assets Storage Operations"),
    parameters = Array(new Parameter(name = "orgid", in = ParameterIn.PATH, description = "Organization Id")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[S3Content])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"))
  )
  def getRouteFile: Route = {
    cors() {
      concat(
        // /files/<orgid>/
        path("uiassets" / Segment) { orgid =>
          concat(
            get {
              //#retrieve-sparkapp-info/status
              rejectEmptyResponse {
                onSuccess(getListFiles(orgid.toLowerCase)) { response =>
                  complete(response)
                }
              }
              //#retrieve-sparkapp-info/status
            }
          )
        }
      )
    }
  }

  @GET
  @Path("/download/{orgid}/{filename}")
  @Produces(Array(MediaType.APPLICATION_OCTET_STREAM))
  @Operation(summary = "Return stream of file from S3", security = Array(new SecurityRequirement(name = "bearer")), description = "Return stream of file from S3", tags = Array("Assets Storage Operations"),
    parameters = Array(
      new Parameter(name = "orgid", in = ParameterIn.PATH, description = "Organization Id"),
      new Parameter(name = "filename", in = ParameterIn.PATH, description = "filename")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "filestream", content = Array(new Content(mediaType = "applicetion/octet-stream"))),
      new ApiResponse(responseCode = "500", description = "Internal Error")
    )
  )
  def getRouteDirectFile: Route = {
    cors() {
      concat(
        // /files/<orgid>/
        path("uiassets" / "download" / Segment / Segment) { (orgid, filename) =>
          concat(
            get {
              //#retrieve-sparkapp-info/status
              val key = s"${orgid.toLowerCase()}/assets/${filename}"
              val src: Source[Option[(Source[ByteString, NotUsed], ObjectMetadata)], NotUsed] = S3.download(bucketName, key)
              val rss: Future[(Source[ByteString, NotUsed], ObjectMetadata)] = src.runWith(Sink.head).map(_.getOrElse((Source.empty[ByteString], null)))
              onComplete(rss) {
                case Failure(exception) => complete((StatusCodes.NotFound, exception.getMessage))
                case Success(value) => {
                  val headers = List(RawHeader("Content-Disposition", s"""attachment; filename="${filename}""""))
                  //complete(HttpResponse(StatusCodes.OK, headers, HttpEntity(ContentTypes.`application/octet-stream`, value._1)))
                  complete(HttpEntity(ContentTypes.`application/octet-stream`, value._1))

                }
              }
            }
          )
        }
      )
    }
  }

  @GET
  @Path("download/{filename}")
  @Deprecated
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(
    summary = "return signed url for 1 h to get you file from",
    description = "Return list of files stored in this org",
    tags = Array("Assets Storage Operations"),
    security = Array(new SecurityRequirement(name = "bearer")),
    parameters = Array(new Parameter(name = "filename", in = ParameterIn.PATH, description = "filename")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUIAssetsUrl])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUIAssetsUrl])))))
  )
  def getRouteFileContent: Route = {
    cors() {
      concat(
        // /files/<orgid>/
        path("uiassets" / "download" / Segment) { filename =>
          extractCredentials { creds =>
            concat(
              get {
                //#retrieve-sparkapp-info/status
                rejectEmptyResponse {
                  log.info(creds.getOrElse("None").toString)
                  val token = creds.getOrElse("None").toString.replaceAll("Bearer ", "")
                  onSuccess(getURLFile(token, filename)) { response =>
                    complete(response)
                  }
                }
                //#retrieve-sparkapp-info/status
              }
            )
          }
        }
      )
    }
  }

  @DELETE
  @Path("{orgid}/{filename}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Delete the specified file on storage", security = Array(new SecurityRequirement(name = "bearer")), description = "Delete the specified file on storage", tags = Array("Assets Storage Operations"),
    parameters = Array(
      new Parameter(name = "orgid", in = ParameterIn.PATH, description = "Organization Id"),
      new Parameter(name = "filename", in = ParameterIn.PATH, description = "FileName to be deleted")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUIAssets])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"))
  )
  def deleteRouteSegment: Route = {
    cors() {
      concat(
        path("uiassets" / Segment / Segment) { (orgid, fileName) =>
          concat(
            delete {
              //#delete-sparkapp
              log.info(s"org id 2 : ${orgid}")
              log.info(s"FileName 2 : ${fileName}")
              onSuccess(deleteFile(orgid.toLowerCase, fileName)) { performed =>
                if (performed.code == 0) {
                  complete((StatusCodes.OK, performed))
                } else {
                  complete((StatusCodes.InternalServerError, performed))
                }

              }
              //#delete-sparkapp
            }

          )

        }

      )
    }
  }


  //#all-routes
}
