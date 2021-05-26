package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.model.Multipart.BodyPart
import akka.http.scaladsl.model.{HttpEntity, Multipart, StatusCodes}
import akka.http.scaladsl.server.directives.FileInfo
import akka.http.scaladsl.server.{Directive1, Directives, MissingFormFieldRejection, Route}
import akka.stream.{IOResult, Materializer}
import akka.stream.scaladsl.{FileIO, Sink, Source}
import akka.util.{ByteString, Timeout}
import com.tibco.labs.orchestrator.api.FilesRegistry._
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.{Operation, Parameter}
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import org.slf4j.LoggerFactory
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import io.circe.generic.auto._

import java.io.File
import java.nio.file.Paths
import javax.ws.rs._
import javax.ws.rs.core.MediaType
import scala.concurrent.Future
import scala.concurrent.duration.DurationInt


//#import-json-formats
//#user-routes-class
@Path("/files")
class FilesRoutes(filesRegistry: ActorRef[FilesRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {

  case class FileUpload(
                        @Schema(`type` = "string", format = "string", description = "newline", defaultValue = "\r\n", required = true) newline: String,
                        @Schema(`type` = "string", format = "string", description = "separator", defaultValue = ",", required = true) separator: String,
                        @Schema(`type` = "string", format = "string", description = "quoteChar", defaultValue = "\"", required = true) quoteChar: String,
                        @Schema(`type` = "string", format = "string", description = "encoding", defaultValue = "UTF-8", required = true) encoding: String,
                        @Schema(`type` = "string", format = "string", description = "escapeChar", defaultValue = "\\", required = true) escapeChar: String,
                        @Schema(`type` = "string", format = "binary", description = "file") csv: File
                       )


  //import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  //import com.tibco.labs.orchestrator.models.JsonFormatsS3._
  //#import-json-formats

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout: Timeout = Timeout.create(system.settings.config.getDuration("files.routes.ask-timeout"))


  def getListFiles(id: String): Future[S3Content] =
    filesRegistry.ask(getListFilesRegistry(id, _))

  def getListFilesV2(id: String): Future[RedisContent] =
    filesRegistry.ask(getListFilesV2Registry(id, _))

  def getPreviewFile(id: String, fileName: String): Future[ActionPerformedFilesPreview] =
    filesRegistry.ask(getPreviewFileRegistry(id, fileName, _))


  def uploadFile2S3(id: String, fileInfo: FileInfo, data: Source[ByteString, Any], forms: Map[String, String]): Future[ActionPerformedFiles] = {
    filesRegistry.ask(uploadFileRegistry(id, fileInfo, data, forms, _))
  }

  def deleteFile(id: String, fileName: String): Future[ActionPerformedFiles] =
    filesRegistry.ask(deleteFileRegistry(id, fileName, _))

  //#all-routes
  //#users-get-post
  //#users-get-delete


  val FilesRoutes: Route = postRouteFile ~ getRouteFile ~ deleteRouteSegment ~ getRouteFileV2 ~ getPreviewRoute

  @POST
  @Path("{orgid}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Upload files to backend storage", description = "Upload files to backend storage", tags = Array("Files Operations"),
    requestBody = new RequestBody(content = Array(
      new Content(
        mediaType = MediaType.MULTIPART_FORM_DATA,
        schema = new Schema(implementation = classOf[FileUpload])
      )),
      description = "csv"),
    parameters = Array(new Parameter(name = "orgid", in = ParameterIn.PATH, description = "Organization Id")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Add response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedFiles])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedFiles]))))))
  def postRouteFile: Route = {
    cors() {
      path("files" / Segment) { orgid =>
        concat(
          withRequestTimeout(900.seconds) {
            withSizeLimit(1073741824) {
              //toStrictEntity(900.seconds, 1073741824) {
            //  formFields(
            //    "newline".?,
            //    "separator".?,
            //    "quoteChar".?,
            //    "encoding".?,
            //    "escapeChar".?
             // ) { (newline, separator, quoteChar, encoding, escapeChar) =>
                //log.info(s"Forms : ${newline.getOrElse("\r\n")} -- ${separator.getOrElse(",")} -- ${quoteChar.getOrElse("\"")} -- ${encoding.getOrElse("UTF-8")}")
                //val forms: Map[String, String] = Map("separator" -> separator.getOrElse(","), "newline" -> newline.getOrElse("\n\r"), "quoteChar" -> quoteChar.getOrElse("\""), "encoding" -> encoding.getOrElse("UTF-8"), "escapeChar" -> escapeChar.getOrElse("\\"))
                fileUploadWithFields("csv") {
                    case (fields, metadata, file) =>
                        log.info(s"${metadata.fileName} at ")
                        log.info(s"org id 2 : ${orgid}")
                         log.info(s"Forms : ${fields("separator")} -- ${fields("newline")}")
                        onSuccess(uploadFile2S3(orgid.toLowerCase, metadata, file, fields)) { uploadFuture =>
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
  @Path("V1/{orgid}")
  @Deprecated
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Return list of files stored in this org", description = "Return list of files stored in this org", tags = Array("Files Operations"),
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
        path("files" / "V1" / Segment) { orgid =>
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
  @Path("{orgid}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Return list of files stored in this org", description = "Return list of files stored in this org", tags = Array("Files Operations"),
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
              //#retrieve-sparkapp-info/status
              rejectEmptyResponse {
                onSuccess(getListFilesV2(orgid.toLowerCase)) { response =>
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
  @Path("preview/{orgid}/{filename}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Return list of files stored in this org", description = "Return list of files stored in this org", tags = Array("Files Operations"),
    parameters = Array(new Parameter(name = "orgid", in = ParameterIn.PATH, description = "Organization Id"),
      new Parameter(name = "filename", in = ParameterIn.PATH, description = "filename to preview (original name)")),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "raw data in json",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedFilesPreview])))),
      new ApiResponse(responseCode = "404", description = "key not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedFilesPreview])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"))
  )
  def getPreviewRoute: Route = {
    cors() {
      concat(
        // /files/<orgid>/
        path("files" / "preview" / Segment / Segment) { (orgid, filename) =>
          concat(
            get {
              //#retrieve-sparkapp-info/status
              rejectEmptyResponse {
                onSuccess(getPreviewFile(orgid.toLowerCase, filename)) { response =>
                  if (response.code == 404) {
                    complete((StatusCodes.NotFound, response))
                  } else {
                    complete((StatusCodes.OK, response))
                  }

                }
              }
              //#retrieve-sparkapp-info/status
            }
          )
        }
      )
    }
  }

  @DELETE
  @Path("{orgid}/{filename}")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Delete the specified file on storage", description = "Delete the specified file on storage", tags = Array("Files Operations"),
    parameters = Array(
      new Parameter(name = "orgid", in = ParameterIn.PATH, description = "Organization Id"),
      new Parameter(name = "filename", in = ParameterIn.PATH, description = "FileName to be deleted")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedFiles])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"))
  )
  def deleteRouteSegment: Route = {
    cors() {
      concat(
        path("files" / Segment / Segment) { (orgid, fileName) =>
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

  def fileUploadWithFields(fieldName: String): Directive1[(Map[String, String], FileInfo, Source[ByteString, Any])] =
    entity(as[Multipart.FormData]).flatMap { formData ⇒
      extractRequestContext.flatMap { ctx ⇒
        implicit val mat: Materializer = ctx.materializer

        // Because it's continuous stream of fields we MUST consume each field before switching to next one. [https://stackoverflow.com/q/52765993/226895]
        val fut = formData.parts
          .takeWhile(part ⇒ !(part.filename.isDefined && part.name == fieldName), inclusive = true)
          .fold((Map.empty[String, String], Option.empty[(FileInfo, Source[ByteString, Any])])) { case ((fields, pairOpt), part) ⇒
            if (part.filename.nonEmpty && part.name == fieldName) {
              //println(s"Got file field: $part")
              fields → Some((FileInfo(part.name, part.filename.get, part.entity.contentType), part.entity.dataBytes))
            } else if (part.filename.isEmpty && part.entity.contentType.mediaType.isText && part.entity.isInstanceOf[HttpEntity.Strict]) {
              //println(s"Got text field: $part")
              val text = part.entity.asInstanceOf[HttpEntity.Strict].data.utf8String
              fields.updated(part.name, text) → pairOpt
            } else {
              //println(s"IGNORING field: $part")
              part.entity.discardBytes()
              fields → pairOpt
            }
          }
          .collect {
            case (fields, Some((info, stream))) ⇒
              //println(s"Completed scanning fields: ${(fields, info, stream)}")
              (fields, info, stream)
          }
          .runWith(Sink.headOption[(Map[String, String], FileInfo, Source[ByteString, Any])])

        onSuccess(fut)
      }
    }.flatMap {
      case Some(tuple) ⇒ provide(tuple)
      case None ⇒ reject(MissingFormFieldRejection(fieldName))
    }

  //#all-routes
}
