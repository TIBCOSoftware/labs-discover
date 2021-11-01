package com.tibco.labs.orchestrator.api.registry

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}

import com.tibco.labs.orchestrator.api.methods.csvUploadS3
import com.tibco.labs.orchestrator.models.{RedisContent, redisFileInfo}
import org.slf4j.{Logger, LoggerFactory}
//#user-case-classes

object FilesListRegistry {

  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class getListFilesV2Registry(orgID: String, replyTo: ActorRef[RedisContent]) extends Command

  // response
  final case class ActionPerformedFiles(message: String, file: String, code: Int)
  final case class ActionPerformedFilesUrl(message: String, code: Int, url: String)
  final case class ActionPerformedFilesPreview(message: String, code: Int, data: List[String])


  def apply(): Behavior[Command] = registry()

  private def registry(): Behavior[Command] = {
    Behaviors.receiveMessage {
      case getListFilesV2Registry(id, replyTo) =>
        log.info("getListFilesRegistry called")
        replyTo.!(uploadJob().listv2(id))
        Behaviors.same
    }
  }

  case class uploadJob() {

    def listv2(id: String): RedisContent = {
      val slist: (String, Int, List[redisFileInfo]) = new csvUploadS3().listInRedis(id)
      RedisContent(slist._1, slist._2, slist._3)
    }


  }

}

//#user-registry-actor
