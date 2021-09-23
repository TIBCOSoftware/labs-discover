package com.tibco.labs.orchestrator.api.methods

import doobie.Fragment
import doobie._
import doobie.implicits._
import cats.effect.{Blocker, IO, IOApp, Resource}
import com.tibco.labs.orchestrator.models.{ActivitiesTable, AnalysisList, VariantsTable}
import com.tibco.labs.orchestrator.utils.Doobie.transactor

import scala.util.{Failure, Success, Try}
//import com.tibco.labs.orchestrator.api.methods.minerData.{xa}
import com.tibco.labs.orchestrator.conf.DiscoverConfig
import doobie.util.transactor.Transactor.Aux

import scala.concurrent.ExecutionContext
import org.slf4j.{Logger, LoggerFactory}
import com.tibco.labs.orchestrator.utils.Doobie

class MinerData {

  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)

  // returns all Referenced  variants for an analysis
  def findReferenceVariants(analysidId: String, orgId:String): doobie.Query0[VariantsTable] = {
    (Fragment.const(
      s"""
         |SELECT v.variant, v.variant_id, v.frequency,  v.occurences_percent, v.analysis_id, v."bucketedFrequency" ,v."bucketedFrequency_label"
         |FROM $orgId.variants v
         |INNER JOIN $orgId.variants_status s
         |on v.analysis_id = s.analysis_id and v.variant_id = s.variant_id
         |where s."isReference" = 1 and v.analysis_id = """.stripMargin) ++ fr"$analysidId").query[VariantsTable]
  }

  //returns All variants from a given analysis. can be huge
  def findAllVariants(analysidId: String, orgId:String): doobie.Query0[VariantsTable] = {
    (Fragment.const(
      s"""
         |SELECT v.variant, v.variant_id, v.frequency,  v.occurences_percent, v.analysis_id, v."bucketedFrequency" ,v."bucketedFrequency_label"
         |FROM $orgId.variants v
         |where v.analysis_id = """.stripMargin) ++ fr"$analysidId").query[VariantsTable]
  }

  //returns All Activities
  def findAllActivities(analysidId: String, orgId:String): doobie.Query0[ActivitiesTable] = {
    (Fragment.const(
      s"""
         |SELECT a.analysis_id, a.activity_name, a.id,  a.total_occurrences, a.total_first, a.total_last , a."isEnd", a."isStart"
         |FROM $orgId.activities a
         |where a.analysis_id = """.stripMargin) ++ fr"$analysidId").query[ActivitiesTable]
  }

  // returns all analysis_id
  def findAllAnalysis(orgId:String): doobie.Query0[AnalysisList] = {
    (Fragment.const(
      s"""
         |SELECT distinct(eb.analysis_id)
         |FROM $orgId.events_binary eb""".stripMargin)).query[AnalysisList]
  }


  //returns All Activities
  def deleteActivitiesByAnalysis(analysidId: String, orgId:String): doobie.Update0 = {
    (Fragment.const(
      s"""
         |DELETE FROM $orgId.activities a
         |where a.analysis_id = """.stripMargin) ++ fr"$analysidId").update
  }

  //returns All Activities
  def deleteAttributesByAnalysis(analysidId: String, orgId:String): doobie.Update0 = {
    (Fragment.const(
      s"""
         |DELETE FROM $orgId.attributes_binary a
         |where a.analysis_id = """.stripMargin) ++ fr"$analysidId").update
  }

  def deleteCasesByAnalysis(analysidId: String, orgId:String): doobie.Update0 = {
    (Fragment.const(
      s"""
         |DELETE FROM $orgId.cases c
         |where c.analysis_id = """.stripMargin) ++ fr"$analysidId").update
  }

  def deleteEventsByAnalysis(analysidId: String, orgId:String): doobie.Update0 = {
    (Fragment.const(
      s"""
         |DELETE FROM $orgId.events_binary e
         |where e.analysis_id = """.stripMargin) ++ fr"$analysidId").update
  }

  def deleteDatasetsByAnalysis(analysidId: String, orgId:String): doobie.Update0 = {
    (Fragment.const(
      s"""
         |DELETE FROM $orgId.datasets d
         |where d.analysis_id = """.stripMargin) ++ fr"$analysidId").update
  }

  def deleteMetricsByAnalysis(analysidId: String, orgId:String): doobie.Update0 = {
    (Fragment.const(
      s"""
         |DELETE FROM $orgId.metrics m
         |where m.analysis_id = """.stripMargin) ++ fr"$analysidId").update
  }

  def deleteVariantsByAnalysis(analysidId: String, orgId:String): doobie.Update0 = {
    (Fragment.const(
      s"""
         |DELETE FROM $orgId.variants v
         |where v.analysis_id = """.stripMargin) ++ fr"$analysidId").update
  }

  def deleteVariantsStatusByAnalysis(analysidId: String, orgId:String): doobie.Update0 = {
    (Fragment.const(
      s"""
         |DELETE FROM $orgId.variants_status v
         |where v.analysis_id = """.stripMargin) ++ fr"$analysidId").update
  }

def getAllAnalysis(token: String): (String, Int, List[AnalysisList]) = {

  val emptyAnalysis = List(new AnalysisList(Some("")))
  //get the org from the token
  val checkOrg: (String, Int, String) = new LiveApps().validateLogin(token)

  var orgId = ""
  if (checkOrg._3.nonEmpty) orgId = s"org_${checkOrg._3.toLowerCase}" else return ("Error getting OrgId, check your credentials", 401, emptyAnalysis)

  var res: List[AnalysisList] = List[AnalysisList]()
  Try {
    transactor.use{ xa =>
      findAllAnalysis(orgId).stream.compile.toList.transact(xa)
    }.unsafeRunSync()
  } match {
    case Failure(exception) => {
      log.error(s"db exception : ${exception.getMessage}")
      ("Error getting data", 10, emptyAnalysis)
    }
    case Success(value) => ("OK", 0, value)
  }

}

  def getReference(token: String, analysidId: String): (String, Int, List[VariantsTable]) = {

    val emptyVariants = List(new VariantsTable(Some(""),Some(0L),Some(0L),Some(0L),Some(""),Some(0L),Some("")))
    //get the org from the token
    val checkOrg: (String, Int, String) = new LiveApps().validateLogin(token)

    var orgId = ""
    if (checkOrg._3.nonEmpty) orgId = s"org_${checkOrg._3.toLowerCase}" else return ("Error getting OrgId, check your credentials", 401, emptyVariants)

    //var res: List[VariantsTable] = List[VariantsTable]()
    Try {
      transactor.use{ xa =>
        findReferenceVariants(analysidId, orgId).stream.compile.toList.transact(xa)
      }.unsafeRunSync()
    } match {
      case Failure(exception) => {
        log.error(s"db exception : ${exception.getMessage}")
        ("Error getting data", 10, emptyVariants)
      }
      case Success(value) => ("OK", 0, value)
    }

  }

  def getActivities(token: String, analysidId: String): (String, Int, List[ActivitiesTable]) = {

    val emptyVariants = List(new ActivitiesTable(Some(""),Some(""),Some(0L),Some(0L),Some(0L),Some(0L),Some(0)))
    //get the org from the token
    val checkOrg: (String, Int, String) = new LiveApps().validateLogin(token)

    var orgId = ""
    if (checkOrg._3.nonEmpty) orgId = s"org_${checkOrg._3.toLowerCase}" else return ("Error getting OrgId, check your credentials", 401, emptyVariants)

    //var res: List[ActivitiesTable] = List[ActivitiesTable]()
    Try {
      transactor.use{ xa =>
        findAllActivities(analysidId, orgId).stream.compile.toList.transact(xa)
      }.unsafeRunSync()
    } match {
      case Failure(exception) => {
        log.error(s"db exception : ${exception.getMessage}")
        ("Error getting data", 10, emptyVariants)
      }
      case Success(value) => ("OK", 0, value)
    }

  }

  def deleteAllDatas(token: String, analysidId: String): (String, Int, Int) = {

    //val emptyVariants = List(new ActivitiesTable(Some(""),Some(""),Some(0L),Some(0L),Some(0L),Some(0L),Some(0)))
    //get the org from the token
    val checkOrg: (String, Int, String) = new LiveApps().validateLogin(token)

    var orgId = ""
    if (checkOrg._3.nonEmpty) orgId = s"org_${checkOrg._3.toLowerCase}" else return ("Error getting OrgId, check your credentials", 401, 0)

    val _startJobTimer = System.nanoTime()

    //var res: List[ActivitiesTable] = List[ActivitiesTable]()
    Try {
      transactor.use{ xa =>
        for {
          n <- deleteVariantsByAnalysis(analysidId, orgId).run.transact(xa)
          m <- deleteVariantsStatusByAnalysis(analysidId, orgId).run.transact(xa)
          //o <- deleteDatasetsByAnalysis(analysidId, orgId).run.transact(xa)
          p <- deleteCasesByAnalysis(analysidId, orgId).run.transact(xa)
          q <- deleteEventsByAnalysis(analysidId, orgId).run.transact(xa)
          r <- deleteActivitiesByAnalysis(analysidId, orgId).run.transact(xa)
          s <- deleteAttributesByAnalysis(analysidId, orgId).run.transact(xa)
          t <- deleteMetricsByAnalysis(analysidId, orgId).run.transact(xa)
        } yield n + m  + p + q + r + s + t
      }.unsafeRunSync()
    } match {
      case Failure(exception) => {
        log.error(s"db exception : ${exception.getMessage}")
        ("Error getting data", 10, 0)
      }
      case Success(value) => {
        val _stopJobTimer = System.nanoTime()
        val time_jdbc_job =  (_stopJobTimer - _startJobTimer) / 1000000000
        (s"Delete OK in $time_jdbc_job secs", 0, value)
      }
    }

  }

}
