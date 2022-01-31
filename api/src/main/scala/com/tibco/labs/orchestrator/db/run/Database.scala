package com.tibco.labs.orchestrator.db.run

import com.tibco.labs.orchestrator.conf.DiscoverConfig
import com.tibco.labs.orchestrator.db.model.Tables
import com.tibco.labs.orchestrator.db.model.Tables.{Activities, AttributesBinary, Cases, Datasets, Events, Metrics, Variants, VariantsStatus}
import com.tibco.labs.orchestrator.models.databaseCreate
import org.slf4j.{Logger, LoggerFactory}
import slick.jdbc.PostgresProfile
import slick.jdbc.PostgresProfile.api._
import slick.jdbc.meta.MTable
import scala.reflect.ClassTag

import scala.concurrent.{Await, Future}
import scala.concurrent.duration.Duration
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

class Database() {

  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)
  log.info(s"url : ${DiscoverConfig.config.backend.storage.database.url}")
  log.info(s"user : ${DiscoverConfig.config.backend.storage.database.username}")
  log.info(s"driver : ${DiscoverConfig.config.backend.storage.database.driver}")
  val db = Database.forURL(
    url = DiscoverConfig.config.backend.storage.database.url,
    user = DiscoverConfig.config.backend.storage.database.username,
    password = DiscoverConfig.config.backend.storage.database.password,
    driver = DiscoverConfig.config.backend.storage.database.driver)


  def createDBSchema(dbConfig: databaseCreate): (String, Int, String, String, String, String) = {

    import timeUtil._

    log.info("createDBSchema called")
    val dbName = DiscoverConfig.config.backend.storage.database.url.split("/").last
    val schemaName = s"org_${dbConfig.Organization.toLowerCase}"
    val schema = Array(Activities(schemaName).schema, AttributesBinary(schemaName).schema, Cases(schemaName).schema, Datasets(schemaName).schema, Events(schemaName).schema, Metrics(schemaName).schema, Variants(schemaName).schema, VariantsStatus(schemaName).schema).reduceLeft(_ ++ _)
    var returnCode = 0
    var msg = ""
    val ro_passwd = newPassword("TIBCO123", 24, true)
    val rw_passwd = newPassword("TIBCO123", 24, true)


    sqlu"""CREATE USER #${schemaName}_ro WITH PASSWORD '#${ro_passwd}';""".statements.foreach(f => log.info(f))
    val setup = DBIO.seq(
      // create Schema for org
      sqlu"""create schema #${schemaName} AUTHORIZATION postgres""",
      // create table schemas
      schema.createIfNotExists,
      // add rights
      sqlu"""CREATE USER #${schemaName}_ro WITH PASSWORD '#${ro_passwd}';""",
      sqlu"""GRANT CONNECT ON DATABASE #${dbName} TO #${schemaName}_ro;""",
      sqlu"""GRANT USAGE ON SCHEMA #${schemaName} TO #${schemaName}_ro;""",
      sqlu"""GRANT SELECT ON ALL TABLES IN SCHEMA #${schemaName} TO #${schemaName}_ro;""",
      sqlu"""ALTER DEFAULT PRIVILEGES IN SCHEMA #${schemaName} GRANT SELECT ON TABLES TO #${schemaName}_ro;""",
      sqlu"""CREATE USER #${schemaName}_rw WITH PASSWORD '#$rw_passwd';""",
      sqlu"""GRANT CONNECT ON DATABASE #${dbName} TO #${schemaName}_rw;""",
      sqlu"""GRANT USAGE, CREATE ON SCHEMA #${schemaName} TO #${schemaName}_rw;""",
      sqlu"""GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO #${schemaName}_rw;""",
      sqlu"""ALTER DEFAULT PRIVILEGES IN SCHEMA #${schemaName} GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO #${schemaName}_rw;""",
      sqlu"""GRANT USAGE ON ALL SEQUENCES IN SCHEMA #${schemaName} TO #${schemaName}_rw;""",
      sqlu"""ALTER DEFAULT PRIVILEGES IN SCHEMA #${schemaName} GRANT USAGE ON SEQUENCES TO #${schemaName}_rw;""",
      sqlu"""INSERT INTO #${schemaName}.datasets (dataset_id, content, content_type) VALUES ('0', decode('<TIBCO Discover sample Dataset>', 'hex'), 'RDS');""",
      // insert default dataS
      //Attributes(schemaName).map(p => (p.analysisId, p.rowId, p.key, p.value)) +=  (Some("PAM_000000"),Some(1), Some("key1") , Some("value1")),
      //Attributes(schemaName).map(p => (p.analysisId, p.rowId, p.key, p.value)) +=  (Some("PAM_000000"),Some(1), Some("key1") , Some("value1")),
      //Attributes(schemaName).map(p => (p.analysisId, p.rowId, p.key, p.value)) +=  (Some("PAM_000000"),Some(2), Some("key1") , Some("value1")),
      //Attributes(schemaName).map(p => (p.analysisId, p.rowId, p.key, p.value)) +=  (Some("PAM_000000"),Some(2), Some("key1") , Some("value1")),
      //Attributes(schemaName).map(p => (p.analysisId, p.rowId, p.key, p.value)) +=  (Some("PAM_000000"),Some(3), Some("key1") , Some("value1")),
      //Attributes(schemaName).map(p => (p.analysisId, p.rowId, p.key, p.value)) +=  (Some("PAM_000000"),Some(3), Some("key2") , Some("value2")),
      Cases(schemaName).map(p => (p.variantId, p.caseId, p.caseStartTimestamp, p.caseEndTimestamp, p.totalCaseDuration, p.activitiesPerCase, p.analysisId, p.bucketedduration, p.bucketeddurationLabel)) += (Some(1), Some("ID1"), Some(t"2020-01-01T00:00:00.00Z"), Some(t"2020-01-01T00:01:01.00Z"), Some(60), Some(3), Some("PAM-000000"), Some(1), Some("Bucket1")),
      Variants(schemaName).map(p => (p.variant, p.variantId, p.frequency, p.occurencesPercent, p.analysisId, p.bucketedfrequency, p.bucketedfrequencyLabel)) += (Some("1,2,3"), Some(1), Some(1), Some(1.0), Some("PAM-000000"), Some(1.0), Some("Bucket1")),
      VariantsStatus(schemaName).map(p => (p.analysisId, p.variantId, p.label, p.caseType, p.caseState, p.timestamp, p.lacaseref, p.isreference)) += ("PAM-000000", 1, Some("Unchecked"), Some("None"), Some("None"), Some(t"2020-01-01T00:00:00.00Z"), Some("None"), Some(0)),
      Activities(schemaName).map(p => (p.analysisId, p.activityName, p.id, p.totalOccurrences, p.totalFirst, p.totalLast, p.isend, p.isstart)) += (Some("PAM_000000"), Some("A"), Some(1), Some(1), Some(1), Some(0), Some(0), Some(1)),
      Activities(schemaName).map(p => (p.analysisId, p.activityName, p.id, p.totalOccurrences, p.totalFirst, p.totalLast, p.isend, p.isstart)) += (Some("PAM_000000"), Some("B"), Some(2), Some(1), Some(0), Some(0), Some(0), Some(0)),
      Activities(schemaName).map(p => (p.analysisId, p.activityName, p.id, p.totalOccurrences, p.totalFirst, p.totalLast, p.isend, p.isstart)) += (Some("PAM_000000"), Some("C"), Some(3), Some(1), Some(0), Some(1), Some(1), Some(0)),
      Events(schemaName).map(p => (p.caseId, p.activityId, p.activityStartTimestamp, p.activityEndTimestamp, p.resourceId, p.resourceGroup, p.requester, p.scheduledStart, p.scheduledEnd, p.durationDays, p.durationSec, p.nextActivityId, p.nextResourceId, p.nextResourceGroup, p.repeatSelfLoopFlag, p.redoSelfLoopFlag, p.startFlag, p.endFlag, p.analysisId, p.rowId)) += ("ID1", Some(1), Some(t"2020-01-01T00:00:00.00Z"), Some(t"2020-01-01T00:00:15.00Z"), Some("HAL9000"), Some("Discovery One"), Some("Dave Bowman"), Some(t"2020-01-01T00:00:00.00Z"), Some(t"2020-01-01T00:00:15.00Z"), Some(0), Some(15), Some(2), Some("HAL9000"), Some("Discovery One"), Some(0), Some(0), Some(1), Some(0), Some("PAM-000000"), Some(1)),
      Events(schemaName).map(p => (p.caseId, p.activityId, p.activityStartTimestamp, p.activityEndTimestamp, p.resourceId, p.resourceGroup, p.requester, p.scheduledStart, p.scheduledEnd, p.durationDays, p.durationSec, p.nextActivityId, p.nextResourceId, p.nextResourceGroup, p.repeatSelfLoopFlag, p.redoSelfLoopFlag, p.startFlag, p.endFlag, p.analysisId, p.rowId)) += ("ID1", Some(2), Some(t"2020-01-01T00:00:16.00Z"), Some(t"2020-01-01T00:00:18.00Z"), Some("HAL9000"), Some("Discovery One"), Some("Dave Bowman"), Some(t"2020-01-01T00:00:00.00Z"), Some(t"2020-01-01T00:00:15.00Z"), Some(0), Some(15), Some(2), Some("HAL9000"), Some("Discovery One"), Some(0), Some(0), Some(1), Some(0), Some("PAM-000000"), Some(1)),
      Events(schemaName).map(p => (p.caseId, p.activityId, p.activityStartTimestamp, p.activityEndTimestamp, p.resourceId, p.resourceGroup, p.requester, p.scheduledStart, p.scheduledEnd, p.durationDays, p.durationSec, p.nextActivityId, p.nextResourceId, p.nextResourceGroup, p.repeatSelfLoopFlag, p.redoSelfLoopFlag, p.startFlag, p.endFlag, p.analysisId, p.rowId)) += ("ID1", Some(3), Some(t"2020-01-01T00:00:19.00Z"), Some(t"2020-01-01T00:01:15.00Z"), Some("HAL9000"), Some("Discovery One"), Some("Dave Bowman"), Some(t"2020-01-01T00:00:00.00Z"), Some(t"2020-01-01T00:00:15.00Z"), Some(0), Some(15), Some(2), Some("HAL9000"), Some("Discovery One"), Some(0), Some(0), Some(1), Some(0), Some("PAM-000000"), Some(1))
      //Metrics(schemaName) += (Some(3),Some(1), Some(3), Some(60.0),Some(60.0),Some(1),Some(3),Some(3),Some("PAM_000000")),

    )
    val setupFuture: Future[Unit] = db.run(setup)
    Await.result(setupFuture, Duration.Inf)
    setupFuture.onComplete {
      case Success(value) => {
        log.info("Database schema created successfully")
        db.close()
        returnCode = 0
        msg = "Database Schema created successfully"
      }
      case Failure(exception) => {
        log.error(exception.getMessage)
        returnCode = 120
        msg = s"Error : ${exception.getMessage}"
      }
    }

    if (returnCode == 0) {
      (s"${msg}", 0, s"${schemaName}_rw", s"${rw_passwd}", s"${schemaName}_ro", s"${ro_passwd}")
    } else {
      (s"${msg}", 120, "None", "None", "None", "None")
    }
  }

  def newPassword(salt: String = "", length: Int = 13, strong: Boolean = true): String = {

    val saltHash = salt.hashCode & ~(1 << 31)

    import java.util.Calendar._

    val cal = java.util.Calendar.getInstance()
    val rand = new scala.util.Random((cal.getTimeInMillis + saltHash).toLong)
    val lower = ('a' to 'z').mkString
    val upper = ('A' to 'Z').mkString
    val nums = ('0' to '9').mkString
    val strongs = "!#$%&()*+,-./:;<=>?@[]^_{|}~"
    val unwanted = if (strong) "" else "0Ol"

    val pool = (lower + upper + nums + (if (strong) strongs else "")).
      filterNot(c => unwanted.contains(c))

    val pwdStream = Stream.continually((for (n <- 1 to length; c = pool(rand.nextInt(pool.length))) yield c).mkString)

    // Drop passwords that don't have at least one of each required character
    pwdStream.filter(pwd =>
      pwd.exists(_.isUpper) &&
        pwd.exists(_.isLower) &&
        pwd.exists(_.isDigit) &&
        (if (strong) pwd.exists(!_.isLetterOrDigit) else true)
    ).head
  }

  object timeUtil {

    import java.sql.Timestamp
    import java.time.Instant

    implicit class StringTimeConversions(sc: StringContext) {
      def t(args: Any*): Timestamp =
        Timestamp.from(Instant.parse(sc.s(args: _*)))
    }
  }

}
