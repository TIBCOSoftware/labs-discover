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
      sqlu"""INSERT INTO #${schemaName}.datasets (dataset_id, content, content_type) VALUES ('0', decode('1f8b0800000000000003e556516bdb301056eda469eaa52d04c61efb0716b297b1bd8c2631a5818c069242df8290154f104b9e24a7a44ffd2bfb277b6b1f0afd07fb279b27db921bbbcdd63d986ecc60eeee93eebbd371f2f97c170060839a7aedba5241fd6c7afcfa9dc2daca7000b00ef486a6925b03a3f48dd203a066258a065e4e4226e784e3015b4401fd882574a1848aa89dee02a0a5252879d6290cb050cac11af82a244b263b88d139f1238ebd90092209a36aed47f61632b487ee9b0d6a1a6d2bde9c891597838fd3e0833cf8f841707b2fa1efddbefd72770540226f4026bf3e724279c9282e05b1cfa683f23eb480c254c2d260637c3a199e23a9cdedd494559fea9b3ecd9d96d75786d72ef3de1fa4163f63ee8576689cf446efbbddee6fccea1369b94420b6c47c7578aa5ae0e960f5a9392e5ce2c33ebb08207d22f46c57e96f6dba7ffac2b4d266283c95c4496b74f4216339ea146535310b7e8ef6db81489225912b536c04059e11cfd09ae5999090cb99246a2c49188466c2e5eb987a0f561d8e058b385a23dccb219fb3c86c6c72fc3952ae986b605fa04fd88b16d8cb029befc13dace219d08b384c8e3af3e04a68f0450e0a8c4a23a5c9d945c70cd8a4b056d297711c7f2f75a071d8f5d4d4eeccb9722951ed4ffaeef130081997d35598105aebd5dd9e484ea8ffa8b5a37e05f054556c83fd2bdf3f636a0ca9c47e5e5b67c4a86fa0ffba2bb29bf113998449daf7090000', 'hex'), 'RDS');""",
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
