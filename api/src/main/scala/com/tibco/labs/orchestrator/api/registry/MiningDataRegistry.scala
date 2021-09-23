package com.tibco.labs.orchestrator.api.registry

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import com.tibco.labs.orchestrator.api.methods.{MinerData, SparkOnK8s}
import com.tibco.labs.orchestrator.models.{ActivitiesTable, AnalysisList, VariantsTable, pmConfigLiveApps}
import org.slf4j.LoggerFactory

object MiningDataRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class getAllAnalysisRegistry(token: String, replyTo: ActorRef[ActionPerformedGetAllAnalysis]) extends Command

  final case class getReferenceRegistry(token: String, id: String, replyTo: ActorRef[ActionPerformedGetReference]) extends Command

  final case class getActivitiesRegistry(token: String, id: String, replyTo: ActorRef[ActionPerformedActivities]) extends Command

  final case class deleteAnalysisRegistry(token: String, id: String, replyTo: ActorRef[ActionPerformedDeleteAnalysis]) extends Command


  //final case class createSparkJobRegistry(config: pmConfigLiveApps, replyTo: ActorRef[ActionPerformedSparkSingle]) extends Command

  //final case class deleteSparkJobRegistry(jobID: String, replyTo: ActorRef[ActionPerformedSparkSingle]) extends Command

  // response
  final case class ActionPerformedGetAllAnalysis(message: String, code: Int, data: List[AnalysisList] )
  final case class ActionPerformedGetReference(message: String, code: Int, data: List[VariantsTable] )
  final case class ActionPerformedActivities(message: String, code: Int, data: List[ActivitiesTable] )
  final case class ActionPerformedDeleteAnalysis(message: String, code: Int, NumRows: Int )


  def apply(): Behavior[Command] = registry()

  private def registry(): Behavior[Command] = {
    Behaviors.receiveMessage {
      case getAllAnalysisRegistry(token, replyTo) =>
        log.info("getAllAnalysisRegistry called")
        replyTo ! minerJob().getAllAnalysis(token)
        Behaviors.same
      case getReferenceRegistry(token, id, replyTo) =>
        log.info("getReferenceRegistry called")
        replyTo ! minerJob().getReferences(token, id)
        Behaviors.same
      case getActivitiesRegistry(token, id, replyTo) =>
        log.info("getActivitiesRegistry called")
        replyTo ! minerJob().getActivities(token, id)
        Behaviors.same
      case deleteAnalysisRegistry(token, id, replyTo) =>
        log.info("deleteAnalysisRegistry called")
        replyTo ! minerJob().delete(token, id)
        Behaviors.same
    }
  }

  case class minerJob() {
    def getAllAnalysis(token: String): ActionPerformedGetAllAnalysis = {
      val job: (String, Int, List[AnalysisList]) = new MinerData().getAllAnalysis(token)
      ActionPerformedGetAllAnalysis(s"${job._1}", job._2, job._3)
    }

    def getReferences(token: String, id: String): ActionPerformedGetReference = {
      val job: (String, Int, List[VariantsTable]) = new MinerData().getReference(token, id)
      ActionPerformedGetReference(s"${job._1}", job._2, job._3)
    }

    def getActivities(token: String, id: String): ActionPerformedActivities = {
      val job: (String, Int, List[ActivitiesTable]) = new MinerData().getActivities(token, id)
      ActionPerformedActivities(s"${job._1}", job._2, job._3)
    }

    def delete(token: String, id: String): ActionPerformedDeleteAnalysis = {
      val job: (String, Int, Int) = new MinerData().deleteAllDatas(token, id)
      ActionPerformedDeleteAnalysis(s"${job._1}", job._2, job._3)
    }

    /*
    def status(id: String) = {
      //kubectl logs  spark-pm-997291-driver --namespace spark-operator
      // kubectl describe sparkapplications spark-pm-997291 --namespace spark-operator
      val job: (String, Int, String, String) = new SparkOnK8s().sparkGetStatusApplication(id)
      ActionPerformedSparkSingle(s"${job._1}", job._2, job._3, job._4)
    }*/
  }
}
