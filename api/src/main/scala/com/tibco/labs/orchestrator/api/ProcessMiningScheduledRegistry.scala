package com.tibco.labs.orchestrator.api

//#user-registry-actor
//import akka.actor.TypedActor.context

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import com.tibco.labs.orchestrator.models.pmConfigLiveApps
import org.slf4j.LoggerFactory

//


//#user-case-classes

object ProcessMiningScheduledRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class getSparkJobStatusScheduledRegistry(jobID: String, replyTo: ActorRef[ActionPerformedSchedules]) extends Command

  final case class createSparkJobScheduledRegistry(config: pmConfigLiveApps, replyTo: ActorRef[ActionPerformedSchedules]) extends Command

  final case class deleteSparkJobScheduledRegistry(jobID: String, replyTo: ActorRef[ActionPerformedSchedules]) extends Command

  // response
  final case class ActionPerformedSchedules(message: String, code: Int, status: String, jobId: String)

  def apply(): Behavior[Command] = registry2(null)

  private def registry2(config: sparkJob): Behavior[Command] = {
    Behaviors.receiveMessage {
      case getSparkJobStatusScheduledRegistry(id, replyTo) =>
        log.info("GetSparkJobStatusRegistry called")
        replyTo ! sparkJob(null).status(id)
        Behaviors.same
      case createSparkJobScheduledRegistry(configPM, replyTo) =>
        log.info("createSparkJobRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! sparkJob(configPM).launch()
        Behaviors.same
      case deleteSparkJobScheduledRegistry(id, replyTo) =>
        log.info("deleteSparkJobRegistry called")
        replyTo ! sparkJob(null).delete(id)
        Behaviors.same
    }
  }

  case class sparkJob(pmConfig: pmConfigLiveApps) {
    def launch() = {
      val job: (String, Int, String, String) = new SparkScheduledOnK8s().sparkApplication(pmConfig)
      ActionPerformedSchedules(s"${job._1}", job._2, job._3, job._4)
    }

    def delete(id: String) = {
      val job: (String, Int, String, String) = new SparkScheduledOnK8s().sparkDeleteApplication(id)
      ActionPerformedSchedules(s"${job._1}", job._2, job._3, job._4)
    }

    def status(id: String) = {
      //kubectl logs  spark-pm-997291-driver --namespace spark-operator
      // kubectl describe sparkapplications spark-pm-997291 --namespace spark-operator
      val job: (String, Int, String, String) = new SparkScheduledOnK8s().sparkGetStatusApplication(id)
      ActionPerformedSchedules(s"${job._1}", job._2, job._3, job._4)
    }
  }
}
//#user-registry-actor
