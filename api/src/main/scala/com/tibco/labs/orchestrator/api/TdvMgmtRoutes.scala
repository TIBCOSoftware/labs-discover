package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import akka.util.Timeout
import com.tibco.labs.orchestrator.api.registry.TdvMgmtRegistry._
import com.tibco.labs.orchestrator.models.{UnManageDataSetCopy, tdvJob}
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.media.{Content, ExampleObject, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.{Operation, Parameter}
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import com.tibco.labs.orchestrator.api.registry.TdvMgmtRegistry

import javax.ws.rs._
import javax.ws.rs.core.MediaType
import scala.concurrent.Future
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import io.circe.generic.auto._

import scala.concurrent.duration.DurationInt


//#import-json-formats
//#user-routes-class

@Path("/tdv")
class TdvMgmtRoutes(tdvMgmtRegistry: ActorRef[TdvMgmtRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {

  //#user-routes-class

  //import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  //import com.tibco.labs.orchestrator.models.JsonFormatsTdv._
  //#import-json-formats

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout: Timeout = Timeout.create(system.settings.config.getDuration("tdv.routes.ask-timeout"))


  def updateTDVJob(config: tdvJob): Future[ActionPerformedUpdate] =
    tdvMgmtRegistry.ask(updateDatasourceTdvMgmtRegistry(config, _))

  def createTDVJob(config: tdvJob): Future[ActionPerformedTDVCreate] = {
    tdvMgmtRegistry.ask(createDatasourceTdvMgmtRegistry(config, _))
  }

  def copyUnManagedTDVJob(config: UnManageDataSetCopy): Future[ActionPerformedCopyUnManaged] = {
    tdvMgmtRegistry.ask(copyUnManagedLinkTdvMgmtRegistry(config, _))
  }


  def deleteTDVJob(orgid: String, dsName: String): Future[ActionPerformedDeleted] =
    tdvMgmtRegistry.ask(deleteDatasourceTdvMgmtRegistry(orgid, dsName, _))

  def getTDVSchemaJob(orgid: String, dsName: String): Future[ActionPerformedDataSchema] =
    tdvMgmtRegistry.ask(getDatasourceSchemaTdvMgmtRegistry(orgid, dsName, _))

  def getTDVDataJob(orgid: String, dsName: String): Future[ActionPerformedGetData] =
    tdvMgmtRegistry.ask(getDatasourceDataTdvMgmtRegistry(orgid, dsName, _))

  def getTDVPubDSJob(orgid: String): Future[ActionPerformedUnmanagedPublishedViews] =
    tdvMgmtRegistry.ask(getPublishedDatasetsMgmtRegistry(orgid, _))

  def getTDVManagedDSJob(orgid: String): Future[ActionPerformedAllManagedDatasets] =
    tdvMgmtRegistry.ask(getAllManagedDatasetsMgmtRegistry(orgid, _))

  def getTDVUnManagedDSJob(orgid: String): Future[ActionPerformedAllManagedDatasets] =
    tdvMgmtRegistry.ask(getAllUnManagedDatasetsMgmtRegistry(orgid, _))

  def getTDVPubDSDetailsJob(orgid: String, dsName: String): Future[ActionPerformedDetailsAssets] =
    tdvMgmtRegistry.ask(getManagedDatasetsDetailsMgmtRegistry(orgid, dsName, _))

  def getTDVPubDSDetailsUnManagedJob(orgid: String, dsName: String): Future[ActionPerformedDetailsAssetsUnManaged] =
    tdvMgmtRegistry.ask(getUnManagedDatasetsDetailsMgmtRegistry(orgid, dsName, _))

  def getTDVHealthJob(): Future[ActionPerformedCheck] =
    tdvMgmtRegistry.ask(checkTdvMgmtRegistry)
  //#all-routes
  //#users-get-post
  //#users-get-delete

  //val PreviewRoutes: Route = postJobTdvRoute ~ deleteJobTdvRoute ~ updateJobTdvRoute
  val TdvRoutes: Route =
      postJobTdvRoute ~
      putJobTdvRoute ~
      postUnManagedJobTdvRoute ~
      deleteJobTdvRoute ~
      getSchemaJobTdvRoute ~
      getDataJobTdvRoute ~
      getDatasetsPublishedRoute ~
      getDatasetsDetailsRoute ~
      getDatasetsAllManagedRoute ~
      getDatasetsAllUnManagedRoute ~
        getDatasetsDetailsUnManagedRoute ~ getTdvHealthCheckRoute


  @POST
  @Path("/managed/csv")
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Create a new CSV datasource with introspection in TDV", description = "Create a new datasource with introspection in TDV", tags = Array("Tibco DataVirtualization"),
    requestBody = new RequestBody(content = Array(new Content(schema = new Schema(implementation = classOf[tdvJob]),
      examples = Array(new ExampleObject(value =
        """		{
                                                           "DatasetName": "CallCenter",
                                                           "DatasetDescription": "Some Call center logs",
                                                           "DatasetSource": {
                                                               "DatasourceType": "File-Delimited",
                                                               "Encoding": "UTF-8",
                                                               "EscapeChar": "\\",
                                                               "FileName": "CallcenterExample.csv",
                                                               "FilePath": "s3a://discover-cic/01xxxxxxxxxxxxxxxxxxxxxxxx/CallcenterExample.csv",
                                                               "QuoteChar": "\"",
                                                               "CommentsChar": "#",
                                                               "Separator": ",",
                                                               "Headers": "true"
                                                           },
                                                       "Organization": "01xxxxxxxxxxxxxxxxxxxxxxxx"
                                                       }"""
      ))))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Add response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedTDVCreate])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedTDVCreate]))))))
  def postJobTdvRoute: Route = {
    cors() {
      path("tdv" / "managed" / "csv") {
        withRequestTimeout(30.seconds) {
          concat(
            //#post-sparkapp
            pathEnd {
              concat(
                post {
                  entity(as[tdvJob]) { config =>
                    onSuccess(createTDVJob(config)) { performed =>
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
  }

  @PUT
  @Path("/managed/csv")
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Update a CSV datasource with introspection in TDV", description = "Re-introspect a given data source", tags = Array("Tibco DataVirtualization"),
    requestBody = new RequestBody(content = Array(new Content(schema = new Schema(implementation = classOf[tdvJob]),
      examples = Array(new ExampleObject(value =
        """		{
                                                            "DatasetID": "something",
                                                           "DatasetName": "CallCenter",
                                                           "DatasetDescription": "Some Call center logs",
                                                           "DatasetSource": {
                                                               "DatasourceType": "File-Delimited",
                                                               "Encoding": "UTF-8",
                                                               "EscapeChar": "\\",
                                                               "FileName": "CallcenterExample.csv",
                                                               "FilePath": "s3a://discover-cic/01xxxxxxxxxxxxxxxxxxxxxxxx/CallcenterExample.csv",
                                                               "QuoteChar": "\"",
                                                               "CommentsChar": "#",
                                                               "Separator": ",",
                                                               "Headers": "true"
                                                           },
                                                       "Organization": "01xxxxxxxxxxxxxxxxxxxxxxxx"
                                                       }"""
      ))))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUpdate])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUpdate]))))
    )
  )
  def putJobTdvRoute: Route = {
    cors() {
      path("tdv" / "managed" / "csv") {
        withRequestTimeout(60.seconds) {
          concat(
            //#post-sparkapp
            pathEnd {
              concat(
                put {
                  entity(as[tdvJob]) { config =>
                    onSuccess(updateTDVJob(config)) { performed =>
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
  }

  @POST
  @Path("/unmanaged/copy")
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Copy an unmanaged views into our system", description = "Copy an unmanaged views into our system", tags = Array("Tibco DataVirtualization"),
    requestBody = new RequestBody(content = Array(new Content(schema = new Schema(implementation = classOf[UnManageDataSetCopy]),
      examples = Array(new ExampleObject(value =
        """		{
                "DatasetName": "CallCenter",
                "Annotation": "Some Call center logs",
                "DatasetPath": "/somewhere/in/dark/path",
                "Organization": "01dxjp1rpa35bzcv1kvem9ffyk"
              }"""
      ))))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedCopyUnManaged])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedCopyUnManaged]))))
    )
  )
  def postUnManagedJobTdvRoute: Route = {
    cors() {
      path("tdv" / "unmanaged" / "copy") {
        withRequestTimeout(60.seconds) {
          concat(
            //#post-sparkapp
            pathEnd {
              concat(
                post {
                  entity(as[UnManageDataSetCopy]) { config =>
                    onSuccess(copyUnManagedTDVJob(config)) { performed =>
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
  }


  @DELETE
  @Path("/managed/csv/{orgId}/{DatasetID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Delete the specified datasource in TDV", description = "Delete the specified datasource in TDV", tags = Array("Tibco DataVirtualization"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where te datasource is stored"),
      new Parameter(name = "DatasetID", in = ParameterIn.PATH, description = "DatasetID to be deleted")
      //new Parameter(name = "dataViewName", in = ParameterIn.QUERY, description = "View name to be deleted", required = true),
      //new Parameter(name = "publishedDataViewName", in = ParameterIn.QUERY, description = "View name to be deleted", required = true)
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleted])))),
      new ApiResponse(responseCode = "500", description = "Internal server error"),
      new ApiResponse(responseCode = "404", description = "Job not found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleted]))))
    )
  )
  def deleteJobTdvRoute: Route = {
    cors() {
      path("tdv" / "managed" /"csv" / Segment / Segment) { (orgid, dataSourceName) =>
        withRequestTimeout(30.seconds) {
          delete {
            //parameters("dataview", "publishedview") { (dataview, publishedview) =>
            //#delete-sparkapp
            onSuccess(deleteTDVJob(orgid.toLowerCase, dataSourceName)) { performed =>
              if (performed.code == 0) {
                complete((StatusCodes.OK, performed))
              } else if (performed.code == 404) {
                complete((StatusCodes.NotFound, performed))
              } else {
                complete((StatusCodes.BadGateway, performed))
              }

              //delete-onsuccess
            }
            //}
            //#delete-sparkapp
          }
        }
      }
    }
  }


  @GET
  @Path("/metadata/{orgId}/{DatasetID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get Schema of a specified DataSource", description = "Get Schema of a specified DataSource", tags = Array("Tibco DataVirtualization"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is stored"),
      new Parameter(name = "DatasetID", in = ParameterIn.PATH, description = "DatasetID to be retrieve")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDataSchema])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDataSchema]))))
    )
  )
  def getSchemaJobTdvRoute: Route = {
    cors() {
      path("tdv" / "metadata" / Segment / Segment) { (orgid, dataSourceName) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getTDVSchemaJob(orgid.toLowerCase, dataSourceName)) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else {
              complete((StatusCodes.BadGateway, performed))
            }

            //delete-onsuccess
          }
          //}
          //#delete-sparkapp
        }
      }
    }
  }

  @GET
  @Path("/data/{orgId}/{DatasetID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get Data preview of a specified DataSource", description = "Get Data preview of a specified DataSource", tags = Array("Tibco DataVirtualization"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is stored"),
      new Parameter(name = "DatasetID", in = ParameterIn.PATH, description = "dataSourceName to be retrieve")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetData])))),
      new ApiResponse(responseCode = "404", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetData])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedGetData]))))
    )
  )
  def getDataJobTdvRoute: Route = {
    cors() {
      path("tdv" / "data" / Segment / Segment) { (orgid, dataSourceName) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getTDVDataJob(orgid.toLowerCase, dataSourceName)) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else if (performed.code == 404) {
              complete((StatusCodes.NotFound, performed))
            } else {
              complete((StatusCodes.BadGateway, performed))
            }

            //delete-onsuccess
          }
          //}
          //#delete-sparkapp
        }
      }
    }
  }

  @GET
  @Path("/unmanaged/views/{orgId}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get List of customer published views in unmanaged TDV", description = "Get List of published views", tags = Array("Tibco DataVirtualization"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is published")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUnmanagedPublishedViews])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedUnmanagedPublishedViews]))))
    )
  )
  def getDatasetsPublishedRoute: Route = {
    cors() {
      path("tdv" / "unmanaged" /"views"  / Segment) { (orgid) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getTDVPubDSJob(orgid.toLowerCase)) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else {
              complete((StatusCodes.BadGateway, performed))
            }

            //delete-onsuccess
          }
          //}
          //#delete-sparkapp
        }
      }
    }
  }
  @GET
  @Path("/unmanaged/datasets/{orgId}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get List of all managed Datasets in  TDV", description = "Get List of managed Datasets in  TDV", tags = Array("Tibco DataVirtualization"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is published")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedAllManagedDatasets])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedAllManagedDatasets]))))
    )
  )
  def getDatasetsAllUnManagedRoute: Route = {
    cors() {
      path("tdv" / "unmanaged" / "datasets"  / Segment) { (orgid) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getTDVUnManagedDSJob(orgid.toLowerCase)) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else {
              complete((StatusCodes.BadGateway, performed))
            }

            //delete-onsuccess
          }
          //}
          //#delete-sparkapp
        }
      }
    }
  }

  @GET
  @Path("/managed/datasets/{orgId}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get List of all managed Datasets in  TDV", description = "Get List of managed Datasets in  TDV", tags = Array("Tibco DataVirtualization"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is published")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedAllManagedDatasets])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedAllManagedDatasets]))))
    )
  )
  def getDatasetsAllManagedRoute: Route = {
    cors() {
      path("tdv" / "managed" / "datasets"  / Segment) { (orgid) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getTDVManagedDSJob(orgid.toLowerCase)) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else {
              complete((StatusCodes.BadGateway, performed))
            }

            //delete-onsuccess
          }
          //}
          //#delete-sparkapp
        }
      }
    }
  }

  @GET
  @Path("/managed/datasets/{orgId}/details/{DatasetID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get details of a managed dataset", description = "Get details of a given dataset", tags = Array("Tibco DataVirtualization"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is published"),
      new Parameter(name = "DatasetID", in = ParameterIn.PATH, description = "datasetName where the datasource is identified")

    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDetailsAssets])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDetailsAssets]))))
    )
  )
  def getDatasetsDetailsRoute: Route = {
    cors() {
      path("tdv" / "managed" / "datasets" / Segment / "details" / Segment) { (orgid, dsName) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getTDVPubDSDetailsJob(orgid.toLowerCase, dsName)) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else {
              complete((StatusCodes.BadGateway, performed))
            }

            //delete-onsuccess
          }
          //}
          //#delete-sparkapp
        }
      }
    }
  }

  @GET
  @Path("/unmanaged/datasets/{orgId}/details/{DatasetID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get details of a managed dataset", description = "Get details of a given dataset", tags = Array("Tibco DataVirtualization"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is published"),
      new Parameter(name = "DatasetID", in = ParameterIn.PATH, description = "datasetName where the datasource is identified")

    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDetailsAssetsUnManaged])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDetailsAssetsUnManaged]))))
    )
  )
  def getDatasetsDetailsUnManagedRoute: Route = {
    cors() {
      path("tdv" / "unmanaged" / "datasets" / Segment / "details" / Segment) { (orgid, dsName) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getTDVPubDSDetailsUnManagedJob(orgid.toLowerCase, dsName)) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else {
              complete((StatusCodes.BadGateway, performed))
            }

            //delete-onsuccess
          }
          //}
          //#delete-sparkapp
        }
      }
    }
  }

  @GET
  @Path("/health")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get alive from TDV", description = "Get alive from TDV", tags = Array("Tibco DataVirtualization"),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedCheck])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedCheck]))))
    )
  )
  def getTdvHealthCheckRoute: Route = {
    cors() {
      path("tdv" / "health" ) {
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getTDVHealthJob()) { performed =>
            if (performed.code == 0) {
              complete((StatusCodes.OK, performed))
            } else {
              complete((StatusCodes.InternalServerError, performed))
            }

            //delete-onsuccess
          }
          //}
          //#delete-sparkapp
        }
      }
    }
  }
  //#all-routes
}
