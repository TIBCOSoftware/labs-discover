package com.tibco.labs.orchestrator.api.registry

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import akka.http.scaladsl.server.directives.FileInfo
import akka.stream.scaladsl.Source
import akka.util.ByteString
import com.tibco.labs.orchestrator.api.methods.AssetsUploadS3
import com.tibco.labs.orchestrator.models.{S3Content}
import org.slf4j.LoggerFactory
//#user-case-classes

object UIAssetsRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class getListUIAssetsRegistry(orgID: String, replyTo: ActorRef[S3Content]) extends Command
  final case class uploadUIAssetsRegistry(orgID: String, fileMetadata: FileInfo, fileData: Source[ByteString, Any], replyTo: ActorRef[ActionPerformedUIAssets]) extends Command
  final case class deleteUIAssetsRegistry(orgID: String, fileName: String, replyTo: ActorRef[ActionPerformedUIAssets]) extends Command
  final case class getS3UIAssetsContentRegistry(token: String, fileName: String,  replyTo: ActorRef[ActionPerformedUIAssetsUrl]) extends Command

  // response
  final case class ActionPerformedUIAssets(message: String, file: String, code: Int)
  final case class ActionPerformedUIAssetsUrl(message: String, code: Int, url: String)


  def apply(): Behavior[Command] = registry()

  private def registry(): Behavior[Command] = {
    Behaviors.receiveMessage {
      case getListUIAssetsRegistry(id, replyTo) =>
        log.info("getListFilesRegistry called")
        replyTo ! uploadUIJob().list(id)
        Behaviors.same
      case uploadUIAssetsRegistry(id, fileInf, fileBodyData, replyTo) =>
        log.info("uploadFileRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! uploadUIJob().uploadS3(id, fileInf, fileBodyData)
        Behaviors.same
      case getS3UIAssetsContentRegistry(token, filename, replyTo) =>
        log.info("getS3FileContentRegistry called")
        replyTo ! uploadUIJob().getS3(token, filename)
        Behaviors.same
      case deleteUIAssetsRegistry(id, file, replyTo) =>
        log.info("deleteFileRegistry called")
        replyTo ! uploadUIJob().delete(id, file)
        Behaviors.same
    }
  }

  case class uploadUIJob() {

    //val bucketName = DiscoverConfig.config.backend.storage.filesystem.s3_bucket
    def list(id: String): S3Content = {
      val slist: S3Content = new AssetsUploadS3().list(id)
      slist
    }

    def delete(id: String, file: String): ActionPerformedUIAssets = {

      val job: (String, String, Int) = new AssetsUploadS3().delete(id, file)
      ActionPerformedUIAssets(job._1, job._2, job._3)
    }

    def uploadS3(id: String, fileInfo: FileInfo, body: Source[ByteString, Any]): ActionPerformedUIAssets = {

      val job: (String, String, Int) = new AssetsUploadS3().uploadS3(id, fileInfo, body)
      ActionPerformedUIAssets(job._1, job._2, job._3)
    }

    def getS3(token: String, filename: String): ActionPerformedUIAssetsUrl = {
      val job: (String, Int, String) = new AssetsUploadS3().getFileContent(token, filename)
      ActionPerformedUIAssetsUrl(job._1, job._2, job._3)
    }

  }

}

//#user-registry-actor
