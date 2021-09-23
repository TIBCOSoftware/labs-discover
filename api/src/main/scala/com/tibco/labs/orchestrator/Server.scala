package com.tibco.labs.orchestrator

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import com.tibco.labs.orchestrator.api.registry.{FilesRegistry, LoginRegistry, MetricsRegistry, MiningDataRegistry, PreviewFileRegistry, ProcessMiningRegistry, ProcessMiningScheduledRegistry, TdvMgmtRegistry}
import com.tibco.labs.orchestrator.api.{MetricsRoutes, MinerRoutes}
//import akka.cluster.ClusterEvent
//import akka.cluster.typed.{Cluster, Subscribe}
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
//import akka.management.cluster.bootstrap.ClusterBootstrap
//import akka.management.javadsl.AkkaManagement
import akka.stream.{ActorMaterializer, Materializer}
import akka.{actor => classic}
import com.tibco.labs.orchestrator.api.{FilesRoutes, LoginRoutes, PreviewFileRoutes, ProcessMiningRoutes, ProcessMiningScheduledRoutes, TdvMgmtRoutes}
import com.tibco.labs.orchestrator.node.cluster.{SwaggerDocService, SwaggerSite, RedocSite}
import com.tibco.labs.orchestrator.node.cluster.HealthRoutes

import scala.concurrent.ExecutionContextExecutor
import scala.util.Failure
import scala.util.Success

object Server extends App with SwaggerSite with RedocSite with HealthRoutes {


  val rootBehavior = Behaviors.setup[Nothing] { context =>
    import akka.actor.typed.scaladsl.adapter._
    implicit val system: classic.ActorSystem = context.system.toClassic
    implicit val ec: ExecutionContextExecutor = context.system.executionContext
    //implicit val materializer = system.classicSystem

    //val internalRegistryActor = context.spawn(InternalRegistry(), "InternalRegistryActor")
    //context.watch(internalRegistryActor)
    val pmRegistryActor = context.spawn(ProcessMiningRegistry(), "ProcessMiningRegistryActor")
    context.watch(pmRegistryActor)
    val pmRegistryScheduledActor = context.spawn(ProcessMiningScheduledRegistry(), "ProcessMiningScheduledRegistryActor")
    context.watch(pmRegistryScheduledActor)
    val previewRegistryActor = context.spawn(PreviewFileRegistry(), "PreviewFileRegistryActor")
    context.watch(previewRegistryActor)
    val fileRegistryActor = context.spawn(FilesRegistry(), "FileRegistryActor")
    context.watch(fileRegistryActor)
    val tdvRegistryActor = context.spawn(TdvMgmtRegistry(), "TDVRegistryActor")
    context.watch(tdvRegistryActor)
    val loginRegistryActor = context.spawn(LoginRegistry(), "LoginRegistryActor")
    context.watch(loginRegistryActor)
    val metricsRegistryActor = context.spawn(MetricsRegistry(), "MetricsRegistryActor")
    context.watch(metricsRegistryActor)
    val minerRegistryActor = context.spawn(MiningDataRegistry(), "MinerRegistryActor")
    context.watch(minerRegistryActor)

    //val cluster = Cluster(context.system)
    //context.log.info("Started [" + context.system + "], cluster.selfAddress = " + cluster.selfMember.address + ")")

    import com.tibco.labs.orchestrator.conf.DiscoverConfig._
    context.log.info(s"Org ID : ${config.orgId}")


    //val nodeId = cluster.selfMember.address.system
    //val nodeAddress = cluster.selfMember.address.host.getOrElse("")
    //val nodePort = cluster.selfMember.address.port.getOrElse("")

    //val internalRoutes = new InternalRoutes(internalRegistryActor)(context.system)
    val pmRoutes = new ProcessMiningRoutes(pmRegistryActor)(context.system)
    val fileRoutes = new FilesRoutes(fileRegistryActor)(context.system)
    val pmScheduledRoutes = new ProcessMiningScheduledRoutes(pmRegistryScheduledActor)(context.system)
    val prevRoutes = new PreviewFileRoutes(previewRegistryActor)(context.system)
    val tdvRoutes = new TdvMgmtRoutes(tdvRegistryActor)(context.system)
    val loginRoutes = new LoginRoutes(loginRegistryActor)(context.system)
    val metricsRoutes = new MetricsRoutes(metricsRegistryActor)(context.system)
    val minerRoutes = new MinerRoutes(minerRegistryActor)(context.system)

    lazy val routes: Route = //internalRoutes.InternalRoutes ~
      pmRoutes.ProcessMiningRoutes ~
      pmScheduledRoutes.ProcessMiningScheduledRoutes ~
      tdvRoutes.TdvRoutes ~
      prevRoutes.PreviewRoutes ~
      fileRoutes.FilesRoutes ~
      loginRoutes.LoginRoutes ~
        metricsRoutes.MetricsRoutes ~
        minerRoutes.MinerRoutes ~
      SwaggerDocService.routes ~
      swaggerSiteRoute ~
      redocSiteRoute

    lazy val mgmtRoutes = HealthCheckRoutes

    startHttpServer(routes)(context.system)
    startHttpServerMgmt(mgmtRoutes)(context.system)

    /*   val futureBinding = Http().newServerAt("0.0.0.0", 8080).bind(routes)
       futureBinding.onComplete {
         case Success(binding) =>
           val address = binding.localAddress
           system.log.info("Server online at http://{}:{}/", address.getHostString, address.getPort)
         case Failure(ex) =>
           system.log.error("Failed to bind HTTP endpoint, terminating system", ex)
           system.terminate()
       }
       val futureBindingMgmt = Http().newServerAt("0.0.0.0", 8558).bind(mgmtRoutes)
       futureBindingMgmt.onComplete {
         case Success(binding) =>
           val address = binding.localAddress
           system.log.info("Server online at http://{}:{}/", address.getHostString, address.getPort)
         case Failure(ex) =>
           system.log.error("Failed to bind HTTP endpoint, terminating system", ex)
           system.terminate()
       }*/
    //println(s"Node $nodeId is listening at http://$nodeAddress:$nodePort")

    // Create an actor that handles cluster domain events
    //val listener = context.spawn(Behaviors.receive[ClusterEvent.MemberEvent]((ctx, event) => {
    //  ctx.log.info("MemberEvent: {}", event)
    //  Behaviors.same
    //}), "listener")

    //Cluster(context.system).subscriptions ! Subscribe(listener, classOf[ClusterEvent.MemberEvent])

    //AkkaManagement.get(system).start()
    //ClusterBootstrap.get(system).start()
    Behaviors.empty
  }

  implicit val system: ActorSystem[Nothing] = ActorSystem[Nothing](rootBehavior, "appka")
  implicit val materializer: Materializer = Materializer(system.classicSystem)


  private def startHttpServer(routes: Route)(implicit system: ActorSystem[_]): Unit = {
    // Akka HTTP still needs a classic ActorSystem to start
    import system.executionContext

    val futureBinding = Http().newServerAt("0.0.0.0", 8080).bind(routes)
    futureBinding.onComplete {
      case Success(binding) =>
        val address = binding.localAddress
        system.log.info("Server online at http://{}:{}/", address.getHostString, address.getPort)
      case Failure(ex) =>
        system.log.error("Failed to bind HTTP endpoint, terminating system", ex)
        system.terminate()
    }
  }

  private def startHttpServerMgmt(routes: Route)(implicit system: ActorSystem[_]): Unit = {
    // Akka HTTP still needs a classic ActorSystem to start
    import system.executionContext

    val futureBindingMgmt = Http().newServerAt("0.0.0.0", 8558).bind(routes)
    futureBindingMgmt.onComplete {
      case Success(binding) =>
        val address = binding.localAddress
        system.log.info("Server online at http://{}:{}/", address.getHostString, address.getPort)
      case Failure(ex) =>
        system.log.error("Failed to bind HTTP endpoint, terminating system", ex)
        system.terminate()
    }
  }


}
