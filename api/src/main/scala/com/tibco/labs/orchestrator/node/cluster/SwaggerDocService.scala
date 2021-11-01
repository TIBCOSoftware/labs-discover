package com.tibco.labs.orchestrator.node.cluster

import com.github.swagger.akka.SwaggerHttpService
import com.github.swagger.akka.model._
import com.tibco.labs.orchestrator.api.{FilesListRoutes, FilesRoutes, LoginRoutes, MetricsRoutes, MinerRoutes, PreviewFileRoutes, ProcessMiningRoutes, ProcessMiningScheduledRoutes, TdvMgmtRoutes, UIAssetsRoutes}
import io.swagger.annotations.BasicAuthDefinition
import io.swagger.v3.oas.models.ExternalDocumentation
import io.swagger.v3.oas.models.security.{SecurityRequirement, SecurityScheme}
import io.swagger.v3.oas.models.security.SecurityScheme.In

import java.util


object SwaggerDocService extends SwaggerHttpService {
  val bearerTokenScheme: SecurityScheme = new SecurityScheme()
    .bearerFormat("JWT")
    .description("my jwt token")
    .`type`(SecurityScheme.Type.HTTP)
    .in(SecurityScheme.In.HEADER)
    .scheme("bearer")

  val basicAuth: SecurityScheme = new SecurityScheme()
    .`type`(SecurityScheme.Type.HTTP)
    .description("Basic authenfication")
    .scheme("basic")


  override val apiClasses = Set(
    classOf[FilesRoutes],
    classOf[FilesListRoutes],
    classOf[ProcessMiningRoutes],
    classOf[ProcessMiningScheduledRoutes],
    classOf[TdvMgmtRoutes],
    classOf[PreviewFileRoutes],
    classOf[LoginRoutes],
    classOf[MetricsRoutes],
    classOf[MinerRoutes],
    classOf[UIAssetsRoutes]
  )
  override val host = "discover.labs.tibcocloud.com"
  override val info: Info = Info(
    description = "Api Layer for the backend of Project Discover",
    version = "1.0",
    title = "TIBCO DISCOVER backend microservice",
    contact = Option(Contact("Florent Cenedese", null, "fcenedes@tibco.com")),
    license = Option(License("TIBCO EULA", "https://terms.tibco.com/")),
    termsOfService = "https://terms.tibco.com/"
  )
  override val schemes = List("https")
  override val externalDocs: Option[ExternalDocumentation] = Some(new ExternalDocumentation().description("Find out more on TIBCO Discover").url("http://acme.com/docs"))
  //override val security: List[SecurityRequirement] = List(new SecurityRequirement("http", "basic"))
  override val securitySchemes: Map[String, SecurityScheme] = Map("basic" -> basicAuth, "bearer" -> bearerTokenScheme)
  override val unwantedDefinitions = Seq("Function1", "Function1RequestContextFutureRouteResult")
}
