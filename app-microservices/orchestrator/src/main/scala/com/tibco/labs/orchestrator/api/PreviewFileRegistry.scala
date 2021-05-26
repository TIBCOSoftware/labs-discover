package com.tibco.labs.orchestrator.api

//#user-registry-actor
//import akka.actor.TypedActor.context

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import com.tibco.labs.orchestrator.models.previewConfigFile
import org.slf4j.LoggerFactory

//


//#user-case-classes

object PreviewFileRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class getSparkJobStatusPreviewRegistry(jobID: String, replyTo: ActorRef[ActionPerformedPreview]) extends Command

  final case class createSparkJobPreviewRegistry(config: previewConfigFile, replyTo: ActorRef[ActionPerformedPreview]) extends Command

  final case class deleteSparkJobPreviewRegistry(jobID: String, replyTo: ActorRef[ActionPerformedPreview]) extends Command

  // response
  final case class ActionPerformedPreview(message: String, code: Int, status: String, jobId: String)

  def apply(): Behavior[Command] = registry3()

  private def registry3(): Behavior[Command] = {
    Behaviors.receiveMessage {
      case getSparkJobStatusPreviewRegistry(id, replyTo) =>
        log.info("GetSparkJobStatusRegistry called")
        replyTo ! sparkJob().status(id)
        Behaviors.same
      case createSparkJobPreviewRegistry(configPM, replyTo) =>
        log.info("createSparkJobRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! sparkJob().launch(configPM)
        Behaviors.same
      case deleteSparkJobPreviewRegistry(id, replyTo) =>
        log.info("deleteSparkJobRegistry called")
        replyTo ! sparkJob().delete(id)
        Behaviors.same
    }
  }

  case class sparkJob() {
    def launch(previewConfig: previewConfigFile) = {
      val job: (String, Int, String, String) = new SparkPreviewOnK8s().sparkApplication(previewConfig)
      ActionPerformedPreview(s"${job._1}", job._2, job._3, job._4)
    }

    def delete(id: String) = {
      val job: (String, Int, String, String) = new SparkPreviewOnK8s().sparkDeleteApplication(id)
      ActionPerformedPreview(s"${job._1}", job._2, job._3, job._4)
    }

    def status(id: String) = {
      //kubectl logs  spark-pm-997291-driver --namespace spark-operator
      // kubectl describe sparkapplications spark-pm-997291 --namespace spark-operator
      val job: (String, Int, String, String) = new SparkPreviewOnK8s().sparkGetStatusApplication(id)
      ActionPerformedPreview(s"${job._1}", job._2, job._3, job._4)
    }
  }
}
//#user-registry-actor
