package com.tibco.labs.orchestrator.api.registry

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import com.tibco.labs.orchestrator.api.methods.MetricsMgr
import com.tibco.labs.orchestrator.models.{MetricsDS, MetricsTable}
import org.slf4j.LoggerFactory

object MetricsRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class storeMetricsRegistry(data: MetricsDS, replyTo: ActorRef[ActionPerformedStoreMetrics]) extends Command

  final case class deleteMetricsRegistry(orgId: String, assetId: String, replyTo: ActorRef[ActionPerformedDeleteMetrics]) extends Command

  final case class getDetailsMetricsRegistry(orgId: String, assetId: String, replyTo: ActorRef[ActionPerformedRenderedMetrics]) extends Command

  final case class getDetailsMetricsAnalysisRegistry(orgId: String, analysisId: String, replyTo: ActorRef[ActionPerformedRenderedAnalysisMetrics]) extends Command


  // response
  final case class ActionPerformedStoreMetrics(status: String, code: Int, orgId: String)

  final case class ActionPerformedDeleteMetrics(status: String, code: Int, orgId: String)

  final case class ActionPerformedRenderedMetrics(status: String, code: Int, data: MetricsDS)

  final case class ActionPerformedRenderedAnalysisMetrics(status: String, code: Int, data: MetricsTable)

  def apply(): Behavior[Command] = registryLogin()

  private def registryLogin(): Behavior[Command] = {
    Behaviors.receiveMessage {

      case storeMetricsRegistry(data, replyTo) =>
        log.info("storeMetricsRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! metricsJob().storeDSMetrics(data)
        Behaviors.same

      case getDetailsMetricsRegistry(orgId, assetId, replyTo) =>
        log.info("getDetailsMetricsRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! metricsJob().getDSMetrics(orgId, assetId)
        Behaviors.same

      case deleteMetricsRegistry(orgId, assetId, replyTo) =>
        log.info("deleteMetricsRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! metricsJob().deleteDSMetrics(orgId, assetId)
        Behaviors.same

      case getDetailsMetricsAnalysisRegistry(orgId, analysisId, replyTo) =>
        log.info("getDetailsMetricsAnalysisRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! metricsJob().getAnalysisMetrics(orgId, analysisId)
        Behaviors.same


    }
  }

  case class metricsJob() {
    def storeDSMetrics(data: MetricsDS) = {
      val job: (String, Int, String) = new MetricsMgr().storeDSMetrics(data)
      ActionPerformedStoreMetrics(job._1, job._2, job._3)
    }

    def getDSMetrics(orgid: String, assetid: String) = {
      val job: (String, Int, MetricsDS) = new MetricsMgr().getDetailsDSMetrics(assetid, orgid)
      ActionPerformedRenderedMetrics(job._1, job._2, job._3)
    }

    def deleteDSMetrics(orgid: String, assetid: String) = {
      val job: (String, Int, String) = new MetricsMgr().deleteDSMetrics(assetid, orgid)
      ActionPerformedDeleteMetrics(job._1, job._2, job._3)
    }

    def getAnalysisMetrics(orgid: String, analysisId: String) = {
      val job: (String, Int, MetricsTable) = new MetricsMgr().getDetailsAnalysisMetrics(analysisId, orgid)
      ActionPerformedRenderedAnalysisMetrics(job._1, job._2, job._3)
    }

  }
}
