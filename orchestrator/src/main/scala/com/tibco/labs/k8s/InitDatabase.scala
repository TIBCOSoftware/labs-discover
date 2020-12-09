package com.tibco.labs.k8s

import com.typesafe.scalalogging.Logger

import scala.io.{BufferedSource, Source}
import scala.util.{Failure, Success, Try}
import better.files.{File => ScalaFile}

class InitDatabase {

  val logger = Logger("spark-orchestrator:InitDatabase")
  logger.info("InitDatabase  Class")

  def initDBPostgres(username: String, password: String, port: String, host: String, db: String): Unit = {
    logger.info(s"Initialize DB on $host:$port")

    // exec the psql command..
    Try {
      import sys.process._
      val stdout = new StringBuilder
      val stderr = new StringBuilder
      val process_logger: ProcessLogger = ProcessLogger(stdout append _, stderr append _)

      val sqlFileSrc: String = Source.fromResource("discover.sql").mkString
      val sqlFile = ScalaFile(s"/tmp/k8s/discover.sql")
      Try {
        sqlFile.write(sqlFileSrc)
      } match {
        case Success(v) => logger.info(s"Sql File written")
        case Failure(e) => logger.error("ERROR : " + e.getMessage)
          throw e
      }


      val cmd = s"psql -h $host -p $port -d $db -U $username -f ${sqlFile.path.toAbsolutePath.toString}"
      logger.info(s"PSQL CMD : $cmd")
      val status: Int = Process(cmd, None ,"PGPASSWORD" -> password).!(process_logger)
      //val status = cmd ! process_logger

      logger.info(s"psql command exit with : $status")
      logger.info("stdout: " + stdout)
      if (!stderr.isEmpty) {
        logger.error("stderr: " + stderr)
      }
    } match {
      case Success(v) => logger.info(s"Initialize DB Done")
      case Failure(e) => logger.error("ERROR : " + e.getMessage)
        throw e
    }

  }

}
