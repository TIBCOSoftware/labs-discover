package com.tibco.labs.orchestrator.node.cluster

import scala.concurrent.Future

import akka.actor.ActorSystem
import org.slf4j.LoggerFactory

// Enabled in application.conf
class HealthCheck(system: ActorSystem) extends (() => Future[Boolean]) {
  private val log = LoggerFactory.getLogger(getClass)

  override def apply(): Future[Boolean] = {
    log.info("HealthCheck called")
    Future.successful(true)
  }
}
