package com.tibco.labs.orchestrator.api

//#user-registry-actor
//import akka.actor.TypedActor.context

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import com.tibco.labs.orchestrator.models._
import org.slf4j.LoggerFactory

//


//#user-case-classes

object TdvMgmtRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class updateDatasourceTdvMgmtRegistry(config: tdvJob, replyTo: ActorRef[ActionPerformedUpdate]) extends Command

  final case class createDatasourceTdvMgmtRegistry(config: tdvJob, replyTo: ActorRef[ActionPerformedTDVCreate]) extends Command

  final case class deleteDatasourceTdvMgmtRegistry(orgId: String, dataSourceName: String, replyTo: ActorRef[ActionPerformedDeleted]) extends Command

  final case class getDatasourceSchemaTdvMgmtRegistry(orgId: String, dataSourceName: String, replyTo: ActorRef[ActionPerformedDataSchema]) extends Command

  final case class getDatasourceDataTdvMgmtRegistry(orgId: String, dataSourceName: String, replyTo: ActorRef[ActionPerformedGetData]) extends Command

  final case class getPublishedDatasetsMgmtRegistry(orgId: String, replyTo: ActorRef[ActionPerformedUnmanagedPublishedViews]) extends Command

  final case class getManagedDatasetsDetailsMgmtRegistry(orgId: String, dataSourceName: String, replyTo: ActorRef[ActionPerformedDetailsAssets]) extends Command

  final case class getUnManagedDatasetsDetailsMgmtRegistry(orgId: String, dataSourceName: String, replyTo: ActorRef[ActionPerformedDetailsAssetsUnManaged]) extends Command

  final case class getAllManagedDatasetsMgmtRegistry(orgId: String, replyTo: ActorRef[ActionPerformedAllManagedDatasets]) extends Command

  final case class getAllUnManagedDatasetsMgmtRegistry(orgId: String, replyTo: ActorRef[ActionPerformedAllManagedDatasets]) extends Command

  final case class copyUnManagedLinkTdvMgmtRegistry(config: UnManageDataSetCopy, replyTo: ActorRef[ActionPerformedCopyUnManaged]) extends Command



  // response
  final case class ActionPerformedUpdate(message: String, code: Int, resource: String, DatasetId: String)

  final case class ActionPerformedDeleted(message: String, code: Int, resource: String)

  final case class ActionPerformedTDVCreate(message: String, code: Int, datasource: String, dataview: String, publishedview: String, dataSourceName: String, dataSetId: String)

  final case class ActionPerformedDataSchema(message: String, code: Int, tdv: TDV)

  final case class ActionPerformedUnmanagedPublishedViews(message: String, code: Int, Datasets: List[PublishedViews])

  final case class ActionPerformedAllManagedDatasets(message: String, code: Int, ManagedDatasets: List[ManagedDatasetsInfo])

  final case class ActionPerformedDetailsAssets(message: String, code: Int, tdv: tdvJob)
  final case class ActionPerformedDetailsAssetsUnManaged(message: String, code: Int, tdv: UnManageDataSetInfoStored)

  final case class ActionPerformedGetData(Data: String, code: Int)

  final case class ActionPerformedCopyUnManaged(message: String, code: Int, DatasetId: String)

  def apply(): Behavior[Command] = registry4()

  private def registry4(): Behavior[Command] = {
    Behaviors.receiveMessage {
      case updateDatasourceTdvMgmtRegistry(config, replyTo) =>
        log.info("updateDatasourceTdvMgmtRegistry called")
        replyTo ! tdvJobs().update(config)
        Behaviors.same
      case createDatasourceTdvMgmtRegistry(config, replyTo) =>
        log.info("createDatasourceTdvMgmtRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! tdvJobs().create(config)
        Behaviors.same
      case deleteDatasourceTdvMgmtRegistry(orgId, dsName, replyTo) =>
        log.info("deleteDatasourceTdvMgmtRegistry called")
        replyTo ! tdvJobs().delete(orgId, dsName)
        Behaviors.same
      case getDatasourceSchemaTdvMgmtRegistry(orgId, dsName, replyTo) =>
        log.info("getDatasourceSchemaTdvMgmtRegistry called")
        replyTo ! tdvJobs().getSchema(orgId, dsName)
        Behaviors.same
      case getDatasourceDataTdvMgmtRegistry(orgId, dsName, replyTo) =>
        log.info("getDatasourceDataTdvMgmtRegistry called")
        replyTo ! tdvJobs().getData(orgId, dsName)
        Behaviors.same
      case getPublishedDatasetsMgmtRegistry(orgId, replyTo) =>
        log.info("getPublishedDatasetsMgmtRegistry called")
        replyTo ! tdvJobs().getPubDs(orgId)
        Behaviors.same
      case getAllManagedDatasetsMgmtRegistry(orgId, replyTo) =>
        log.info("getAllManagedDatasetsMgmtRegistry called")
        replyTo ! tdvJobs().getManagedDataSets(orgId)
        Behaviors.same
      case getAllUnManagedDatasetsMgmtRegistry(orgId, replyTo) =>
        log.info("getAllManagedDatasetsMgmtRegistry called")
        replyTo ! tdvJobs().getUnManagedDataSets(orgId)
        Behaviors.same
      case getManagedDatasetsDetailsMgmtRegistry(orgId, dsName, replyTo) =>
        log.info("getManagedDatasetsDetailsMgmtRegistry called")
        replyTo ! tdvJobs().getManagedDataSetsDetails(orgId, dsName)
        Behaviors.same
      case getUnManagedDatasetsDetailsMgmtRegistry(orgId, dsName, replyTo) =>
        log.info("getUnManagedDatasetsDetailsMgmtRegistry called")
        replyTo ! tdvJobs().getUnManagedDataSetsDetails(orgId, dsName)
        Behaviors.same
      case copyUnManagedLinkTdvMgmtRegistry(config, replyTo) =>
        log.info("copyUnManagedLinkTdvMgmtRegistry called")
        replyTo ! tdvJobs().copyUnManaged(config)
        Behaviors.same
    }
  }

  case class tdvJobs() {
    def create(tdvConf: tdvJob): ActionPerformedTDVCreate = {
      log.info("call TDV 1")
      val job: (String, Int, String, String, String, String, String) = new TibcoDataVirtualization().createCsvDataSource(tdvConf)
      ActionPerformedTDVCreate(job._1, job._2, job._3, job._4, job._5, job._6, job._7)
    }

    def copyUnManaged(tdvConf: UnManageDataSetCopy): ActionPerformedCopyUnManaged = {
      log.info("call TDV 1")
      val job: (String, Int, String) = new TibcoDataVirtualization().copyUnManaged(tdvConf)
      ActionPerformedCopyUnManaged(job._1, job._2, job._3)
    }

    def delete(orgId: String, dsName: String): ActionPerformedDeleted = {
      val job: (String, Int, String) = new TibcoDataVirtualization().deleteCsvDataSource(orgId, dsName)
      ActionPerformedDeleted(job._1, job._2, job._3)
    }

    def update(tdvConf: tdvJob): ActionPerformedUpdate = {
      val job: (String, Int, String, String) = new TibcoDataVirtualization().updateCsvDataSource(tdvConf)
      ActionPerformedUpdate(job._1, job._2, job._3, job._4)
    }

    def getSchema(orgId: String, dsName: String): ActionPerformedDataSchema = {
      val job: (String, Int, TDV) = new TibcoDataVirtualization().getDataSourceSchema(orgId, dsName)
      ActionPerformedDataSchema(job._1, job._2, job._3)
    }

    def getData(orgId: String, dsName: String): ActionPerformedGetData = {
      val job: (String, Int) = new TibcoDataVirtualization().getDataSourcePreviewV2(orgId, dsName)
      ActionPerformedGetData(job._1, job._2)
    }

    def getPubDs(orgId: String): ActionPerformedUnmanagedPublishedViews = {
      val job: (String, Int, List[PublishedViews]) = new TibcoDataVirtualization().getPublishedViewsOrg(orgId)
      ActionPerformedUnmanagedPublishedViews(job._1, job._2, job._3)
    }

    def getManagedDataSets(orgId: String): ActionPerformedAllManagedDatasets = {
      val job: (String, Int, List[ManagedDatasetsInfo]) = new TibcoDataVirtualization().getAllManagedDatasets(orgId)
      ActionPerformedAllManagedDatasets(job._1, job._2, job._3)
    }

    def getUnManagedDataSets(orgId: String): ActionPerformedAllManagedDatasets = {
      val job: (String, Int, List[ManagedDatasetsInfo]) = new TibcoDataVirtualization().getAllUnManagedDatasets(orgId)
      ActionPerformedAllManagedDatasets(job._1, job._2, job._3)
    }

    def getManagedDataSetsDetails(orgId: String, dsName: String): ActionPerformedDetailsAssets = {
      val job: (String, Int, tdvJob) = new TibcoDataVirtualization().getManagedDataSetsDetails(orgId, dsName)
      ActionPerformedDetailsAssets(job._1, job._2, job._3)
    }

    def getUnManagedDataSetsDetails(orgId: String, dsName: String): ActionPerformedDetailsAssetsUnManaged = {
      val job: (String, Int, UnManageDataSetInfoStored) = new TibcoDataVirtualization().getUnManagedDataSetsDetails(orgId, dsName)
      ActionPerformedDetailsAssetsUnManaged(job._1, job._2, job._3)
    }
  }
}
//#user-registry-actor
