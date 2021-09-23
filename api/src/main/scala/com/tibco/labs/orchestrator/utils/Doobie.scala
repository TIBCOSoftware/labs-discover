package com.tibco.labs.orchestrator.utils

import com.tibco.labs.orchestrator.conf.DiscoverConfig

import scala.concurrent.{ExecutionContext, ExecutionContextExecutor}
import doobie._
import doobie.util.ExecutionContexts
import doobie.implicits._
import doobie.hikari._
import cats.effect._
import monix.eval.Task

import java.util.concurrent.Executors
import scala.concurrent.duration._

object Doobie {

  implicit val contextShift: ContextShift[IO] = IO.contextShift(ExecutionContext.global)
  implicit val E: ConcurrentEffect[IO] = IO.ioConcurrentEffect
  implicit def timer: Timer[IO] = IO.timer(ExecutionContext.global)


  private val DefaultTimeout = 10.seconds

  val transactor: Resource[IO, HikariTransactor[IO]] =
    for {
      ce <- ExecutionContexts.fixedThreadPool[IO](32) // our connect EC
      be <- Blocker[IO]    // our blocking EC
      xa <- HikariTransactor.newHikariTransactor[IO](
        "org.postgresql.Driver", // driver classname
        DiscoverConfig.config.backend.storage.database.url,   // connect URL
        DiscoverConfig.config.backend.storage.database.username, // username
        DiscoverConfig.config.backend.storage.database.password,// password
        ce,                                     // await connection here
        be                                      // execute JDBC operations here
      )
    } yield xa


}
