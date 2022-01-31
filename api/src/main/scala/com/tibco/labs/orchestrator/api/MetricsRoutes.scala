package com.tibco.labs.orchestrator.api

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.caching.LfuCache
import akka.http.caching.scaladsl.{Cache, CachingSettings, LfuCacheSettings}
import akka.http.scaladsl.model.{StatusCodes, Uri}
import akka.http.scaladsl.server.{Directives, RequestContext, Route, RouteResult}
import akka.util.Timeout
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import com.tibco.labs.orchestrator.api.registry.MetricsRegistry._
import com.tibco.labs.orchestrator.api.registry.TdvMgmtRegistry.ActionPerformedGetData
import com.tibco.labs.orchestrator.api.registry.MetricsRegistry
import com.tibco.labs.orchestrator.models.{MetricsAnalysis, MetricsDS}
import io.swagger.v3.oas.annotations.{Operation, Parameter}
import io.swagger.v3.oas.annotations.media.{Content, ExampleObject, Schema}
import io.swagger.v3.oas.annotations.parameters.RequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport._
import io.circe.generic.auto._
import io.swagger.v3.oas.annotations.enums.ParameterIn
import io.swagger.v3.oas.annotations.security.SecurityRequirement

//import jakarta.ws.rs.core.MediaType
//import jakarta.ws.rs.{Consumes, DELETE, GET, POST, Path, Produces}
import javax.ws.rs._
import javax.ws.rs.core.MediaType
import scala.concurrent.Future
import scala.concurrent.duration._


//#import-json-formats
//#user-routes-class

@Path("/metrics")
class MetricsRoutes(metricsRegistry: ActorRef[MetricsRegistry.Command])(implicit val system: ActorSystem[_]) extends Directives {

  //#user-routes-class

  //import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  //import com.tibco.labs.orchestrator.models.JsonFormatsLiveApps._
  //#import-json-formats

  // If ask takes more time than this to complete the request is failed
  private implicit val timeout = Timeout.create(system.settings.config.getDuration("processmining.routes.ask-timeout"))


  def storeMetricsDS(data: MetricsDS): Future[ActionPerformedStoreMetrics] = {
    metricsRegistry.ask(storeMetricsRegistry(data, _))
  }

  def getMetricsDS(orgId: String, assetId: String): Future[ActionPerformedRenderedMetrics] = {
    metricsRegistry.ask(getDetailsMetricsRegistry(orgId, assetId, _))
  }

  def deleteMetricsDS(orgId: String, assetId: String): Future[ActionPerformedDeleteMetrics] = {
    metricsRegistry.ask(deleteMetricsRegistry(orgId, assetId, _))
  }

  def storeMetricsAS(data: MetricsAnalysis): Future[ActionPerformedStoreMetrics] = {
    metricsRegistry.ask(storeMetricsASRegistry(data, _))
  }

  def getMetricsAS(orgId: String, assetId: String): Future[ActionPerformedRenderedMetricsAS] = {
    metricsRegistry.ask(getDetailsMetricsASRegistry(orgId, assetId, _))
  }

  def deleteMetricsAS(orgId: String, assetId: String): Future[ActionPerformedDeleteMetrics] = {
    metricsRegistry.ask(deleteMetricsASRegistry(orgId, assetId, _))
  }

  /*  def getMetricsAnalysis(orgId: String, analysisId: String): Future[ActionPerformedRenderedAnalysisMetrics] = {
      metricsRegistry.ask(getDetailsMetricsAnalysisRegistry(orgId, analysisId, _))
    }*/


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


  val MetricsRoutes: Route =
    postDatasetsMetricsRoute ~
      deleteDatasetsMetricsRoute ~
      getDatasetsMetricsRoute ~
      getAnalysisMetricsRoute ~
      postAnalysisMetricsRoute ~
      deleteAnalysisMetricsRoute

  @POST
  @Path("/datasets")
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Store Metrics for Datasets", security = Array(new SecurityRequirement(name = "bearer")), description = "Store Metrics for Datasets", tags = Array("Metrics"),
    requestBody = new RequestBody(content = Array(new Content(schema = new Schema(implementation = classOf[MetricsDS]),
      examples = Array(new ExampleObject(value =
        """{
          "credentials": "CIC~azertyuiopqldlcnc"
    }"""))
    ))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "ok",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedStoreMetrics])))),
      new ApiResponse(responseCode = "404", description = "Not Found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedStoreMetrics]))))))
  def postDatasetsMetricsRoute: Route = {
    cors() {
      //cache(lfuCache, keyerFunction) {
      path("metrics" / "datasets") {
        concat(
          //#post-sparkapp
          pathEnd {
            concat(
              post {
                entity(as[MetricsDS]) { config =>
                  onSuccess(storeMetricsDS(config)) { performed =>
                    if (performed.code == 0) {
                      complete((StatusCodes.OK, performed))
                    } else {
                      complete((StatusCodes.NotFound, performed))
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

  @POST
  @Path("/analysis")
  @Consumes(Array(MediaType.APPLICATION_JSON))
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Store Metrics for analysis", security = Array(new SecurityRequirement(name = "bearer")), description = "Store Metrics for analysis", tags = Array("Metrics"),
    requestBody = new RequestBody(content = Array(new Content(schema = new Schema(implementation = classOf[MetricsAnalysis]),
      examples = Array(new ExampleObject(value =
        """{
          "credentials": "CIC~azertyuiopqldlcnc"
    }"""))
    ))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "ok",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedStoreMetrics])))),
      new ApiResponse(responseCode = "404", description = "Not Found",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedStoreMetrics]))))))
  def postAnalysisMetricsRoute: Route = {
    cors() {
      //cache(lfuCache, keyerFunction) {
      path("metrics" / "analysis") {
        concat(
          //#post-sparkapp
          pathEnd {
            concat(
              post {
                entity(as[MetricsAnalysis]) { config =>
                  onSuccess(storeMetricsAS(config)) { performed =>
                    if (performed.code == 0) {
                      complete((StatusCodes.OK, performed))
                    } else {
                      complete((StatusCodes.NotFound, performed))
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

  @DELETE
  @Path("/datasets/{orgId}/{DatasetID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Delete Datasets metrics ", security = Array(new SecurityRequirement(name = "bearer")), description = "Delete Datasets metrics", tags = Array("Metrics"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is stored"),
      new Parameter(name = "DatasetID", in = ParameterIn.PATH, description = "dataSourceName to be retrieve")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteMetrics])))),
      new ApiResponse(responseCode = "404", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteMetrics])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteMetrics]))))
    )
  )
  def deleteDatasetsMetricsRoute: Route = {
    cors() {
      path("metrics" / "datasets" / Segment / Segment) { (orgid, datasetsId) =>
        delete {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(deleteMetricsDS(orgid.toLowerCase, datasetsId)) { performed =>
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
  @Path("/datasets/{orgId}/{DatasetID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get Datasets metrics", security = Array(new SecurityRequirement(name = "bearer")), description = "Get Datasets metrics", tags = Array("Metrics"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is stored"),
      new Parameter(name = "DatasetID", in = ParameterIn.PATH, description = "dataSourceName to be retrieve")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedMetrics])))),
      new ApiResponse(responseCode = "404", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedMetrics])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedMetrics]))))
    )
  )
  def getDatasetsMetricsRoute: Route = {
    cors() {
      path("metrics" / "datasets" / Segment / Segment) { (orgid, datasetsId) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getMetricsDS(orgid.toLowerCase, datasetsId)) { performed =>
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

  @DELETE
  @Path("/analysis/{orgId}/{AnalysisID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Delete Datasets metrics ", security = Array(new SecurityRequirement(name = "bearer")), description = "Delete Datasets metrics", tags = Array("Metrics"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is stored"),
      new Parameter(name = "AnalysisID", in = ParameterIn.PATH, description = "AnalysisID to be retrieve")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteMetrics])))),
      new ApiResponse(responseCode = "404", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteMetrics])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedDeleteMetrics]))))
    )
  )
  def deleteAnalysisMetricsRoute: Route = {
    cors() {
      path("metrics" / "analysis" / Segment / Segment) { (orgid, analysisId) =>
        delete {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(deleteMetricsAS(orgid.toLowerCase, analysisId)) { performed =>
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
  @Path("/analysis/{orgId}/{AnalysisID}")
  //@QueryParam("dataViewName") dataViewName: String
  //@QueryParam("publishedDataViewName")
  @Produces(Array(MediaType.APPLICATION_JSON))
  @Operation(summary = "Get Datasets metrics", security = Array(new SecurityRequirement(name = "bearer")), description = "Get Datasets metrics", tags = Array("Metrics"),
    parameters = Array(
      new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is stored"),
      new Parameter(name = "AnalysisID", in = ParameterIn.PATH, description = "dataSourceName to be retrieve")
    ),
    responses = Array(
      new ApiResponse(responseCode = "200", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedMetricsAS])))),
      new ApiResponse(responseCode = "404", description = "response",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedMetricsAS])))),
      new ApiResponse(responseCode = "500", description = "Internal server error",
        content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedMetricsAS]))))
    )
  )
  def getAnalysisMetricsRoute: Route = {
    cors() {
      path("metrics" / "analysis" / Segment / Segment) { (orgid, analysisId) =>
        get {
          //parameters("dataview", "publishedview") { (dataview, publishedview) =>
          //#delete-sparkapp
          onSuccess(getMetricsAS(orgid.toLowerCase, analysisId)) { performed =>
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

  /* @GET
   @Path("/analysis/{orgId}/{AnalysisID}")
   @Produces(Array(MediaType.APPLICATION_JSON))
   @Operation(summary = "Get Analysis metrics", description = "Get Analysis metrics", tags = Array("Metrics"),
     parameters = Array(
       new Parameter(name = "orgId", in = ParameterIn.PATH, description = "orgId where the datasource is stored"),
       new Parameter(name = "AnalysisID", in = ParameterIn.PATH, description = "Analysis to be retrieve")
     ),
     responses = Array(
       new ApiResponse(responseCode = "200", description = "response",
         content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedAnalysisMetrics])))),
       new ApiResponse(responseCode = "404", description = "response",
         content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedAnalysisMetrics])))),
       new ApiResponse(responseCode = "500", description = "Internal server error",
         content = Array(new Content(schema = new Schema(implementation = classOf[ActionPerformedRenderedAnalysisMetrics]))))
     )
   )
   def getAnalysisMetricsRoute: Route = {
     cors() {
       path("metrics" / "analysis" / Segment / Segment) { (orgid, analysisId) =>
         get {
           onSuccess(getMetricsAnalysis(orgid.toLowerCase, analysisId)) { performed =>
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
   }*/


}

