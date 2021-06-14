package com.tibco.labs.orchestrator.api

//#user-registry-actor
//import akka.actor.TypedActor.context

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import akka.http.scaladsl.server.directives.FileInfo
import akka.stream.scaladsl.Source
import akka.util.ByteString
import com.tibco.labs.orchestrator.models.JsonFormatsS3.redisFileInfo
import org.slf4j.LoggerFactory

//

final case class ListBucket(
                             bucketName: String,
                             key: String,
                             eTag: String,
                             size: Long,
                             lastModified: String,
                             storageClass: String
                           )

final case class S3Content(list: List[ListBucket])

final case class RedisContent(message: String, code: Int , list: List[redisFileInfo])

//#user-case-classes

object FilesRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class getListFilesRegistry(orgID: String, replyTo: ActorRef[S3Content]) extends Command

  final case class getListFilesV2Registry(orgID: String, replyTo: ActorRef[RedisContent]) extends Command

  final case class getPreviewFileRegistry(orgID: String, fileName: String,  replyTo: ActorRef[ActionPerformedFilesPreview]) extends Command

  final case class uploadFileRegistry(orgID: String, fileMetadata: FileInfo, fileData: Source[ByteString, Any], forms: Map[String, String], replyTo: ActorRef[ActionPerformedFiles]) extends Command

  final case class deleteFileRegistry(orgID: String, fileName: String, replyTo: ActorRef[ActionPerformedFiles]) extends Command

  // response
  final case class ActionPerformedFiles(message: String, file: String, code: Int)
  final case class ActionPerformedFilesPreview(message: String, code: Int, data: List[String])


  def apply(): Behavior[Command] = registry()

  private def registry(): Behavior[Command] = {
    Behaviors.receiveMessage {
      case getListFilesRegistry(id, replyTo) =>
        log.info("getListFilesRegistry called")
        replyTo ! uploadJob().list(id)
        Behaviors.same
      case getListFilesV2Registry(id, replyTo) =>
        log.info("getListFilesRegistry called")
        replyTo ! uploadJob().listv2(id)
        Behaviors.same
      case getPreviewFileRegistry(id, filename, replyTo) =>
        log.info("getPreviewFileRegistry called")
        replyTo ! uploadJob().preview(id, filename)
        Behaviors.same
      case uploadFileRegistry(id, fileInf, fileBodyData,forms, replyTo) =>
        log.info("uploadFileRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! uploadJob().uploadS3(id, fileInf, fileBodyData, forms)
        Behaviors.same
      case deleteFileRegistry(id, file, replyTo) =>
        log.info("deleteFileRegistry called")
        replyTo ! uploadJob().delete(id, file)
        Behaviors.same
    }
  }

  case class uploadJob() {

    //val bucketName = DiscoverConfig.config.backend.storage.filesystem.s3_bucket
    def list(id: String): S3Content = {
      val slist: S3Content = new S3Upload().list(id)
      slist
    }

    def listv2(id: String): RedisContent = {
      val slist: (String, Int, List[redisFileInfo]) = new S3Upload().listInRedis(id)
      RedisContent(slist._1, slist._2, slist._3)
    }

    def preview(id: String, filename: String): ActionPerformedFilesPreview = {
      val prev: (String, Int, List[String]) = new S3Upload().previewS3Files(id, filename)
      ActionPerformedFilesPreview(prev._1, prev._2, prev._3)
    }


    def delete(id: String, file: String): ActionPerformedFiles = {

      val job: (String, String, Int) = new S3Upload().delete(id, file)
      ActionPerformedFiles(job._1, job._2, job._3)
    }

    def uploadS3(id: String, fileInfo: FileInfo, body: Source[ByteString, Any], forms: Map[String, String]): ActionPerformedFiles = {

      val job: (String, String, Int) = new S3Upload().uploadS3(id, fileInfo, body, forms)
      ActionPerformedFiles(job._1, job._2, job._3)

    }

  }

}

//#user-registry-actor
