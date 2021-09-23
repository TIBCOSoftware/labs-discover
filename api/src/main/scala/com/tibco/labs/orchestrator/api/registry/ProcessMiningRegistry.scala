package com.tibco.labs.orchestrator.api.registry

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import com.tibco.labs.orchestrator.api.methods.SparkOnK8s
import com.tibco.labs.orchestrator.models.pmConfigLiveApps
import org.slf4j.LoggerFactory

object ProcessMiningRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class getSparkJobStatusRegistry(jobID: String, replyTo: ActorRef[ActionPerformedSparkSingle]) extends Command

  final case class createSparkJobRegistry(config: pmConfigLiveApps, replyTo: ActorRef[ActionPerformedSparkSingle]) extends Command

  final case class deleteSparkJobRegistry(jobID: String, replyTo: ActorRef[ActionPerformedSparkSingle]) extends Command

  // response
  final case class ActionPerformedSparkSingle(message: String, code: Int, status: String, jobName: String)

  def apply(): Behavior[Command] = registry()

  private def registry(): Behavior[Command] = {
    Behaviors.receiveMessage {
      case getSparkJobStatusRegistry(id, replyTo) =>
        log.info("GetSparkJobStatusRegistry called")
        replyTo ! sparkJob().status(id)
        Behaviors.same
      case createSparkJobRegistry(configPM, replyTo) =>
        log.info("createSparkJobRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! sparkJob().launch(configPM)
        Behaviors.same
      case deleteSparkJobRegistry(id, replyTo) =>
        log.info("deleteSparkJobRegistry called")
        replyTo ! sparkJob().delete(id)
        Behaviors.same
    }
  }

  case class sparkJob() {
    def launch(pmConfig: pmConfigLiveApps) = {
      val job: (String, Int, String, String) = new SparkOnK8s().sparkApplication(pmConfig)
      ActionPerformedSparkSingle(s"${job._1}", job._2, job._3, job._4)
    }

    def delete(id: String) = {
      val job: (String, Int, String, String) = new SparkOnK8s().sparkDeleteApplication(id)
      ActionPerformedSparkSingle(s"${job._1}", job._2, job._3, job._4)
    }

    def status(id: String) = {
      //kubectl logs  spark-pm-997291-driver --namespace spark-operator
      // kubectl describe sparkapplications spark-pm-997291 --namespace spark-operator
      val job: (String, Int, String, String) = new SparkOnK8s().sparkGetStatusApplication(id)
      ActionPerformedSparkSingle(s"${job._1}", job._2, job._3, job._4)
    }
  }
}
