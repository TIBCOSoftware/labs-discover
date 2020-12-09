/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs

import java.util.Properties

import akka.actor.{ActorSystem, Props}
import com.tibco.eftl._
import com.tibco.labs.k8s.DiscoverConfig
import com.typesafe.scalalogging.Logger



// Main class
object Orchestrator extends App {

  val logger = Logger("spark-orchestrator:orchestrator")
  val system = ActorSystem("k8sSystem")

  // create and start the actor
  val cmdLaunchActor = system.actorOf(
    Props[CommandLauncherActor],
    name = "sendCommandCreate"
  )
  // create and start the actor
  val cmdDeleteActor = system.actorOf(
    Props[CommandRemoveActor],
    name = "sendCommandDelete"
  )


  def uuid = java.util.UUID.randomUUID.toString

  logger.info("Call config")

  import com.tibco.labs.k8s.DiscoverConfig._

  logger.info(s"Num of Drivers : ${configJson.processMiner.PROCESS_MINER_DRIVERS}")

  logger.info("EFTL version " + EFTL.getVersion)
  logger.info("URL : " + TcmUrl)
  logger.info("Key : " + TcmKey)

  val props: Properties = new Properties()

  props.setProperty(EFTL.PROPERTY_PASSWORD, TcmKey)
  props.setProperty(EFTL.PROPERTY_CLIENT_ID, s"spark-$uuid")
  props.setProperty(EFTL.PROPERTY_DURABLE_KEY, tcmDurableKey)
  props.setProperty(EFTL.PROPERTY_DURABLE_TYPE, EFTL.DURABLE_TYPE_SHARED)

  // initialiase the Database

  logger.info("Call Init DB")
  import com.tibco.labs.k8s.InitDatabase
  val initdb = new InitDatabase()
  val _regex = "jdbc:\\w+:.*\\/\\/(.*):([0-9]+)\\/(.*)$".r
  var _JdbcHost,  _JdbcPort, _jdbcBase = ""
  _regex.findFirstMatchIn(DiscoverConfig.configSS.storage_url) match {
    case Some(i) => {
      _JdbcHost = i.group(1)
      _JdbcPort = i.group(2)
      _jdbcBase = i.group(3)
    }
    case None => "regex_error"
  }

  initdb.initDBPostgres(DiscoverConfig.configSS.storage_username,DiscoverConfig.configSS.storage_password,_JdbcPort,_JdbcHost, _jdbcBase)



  // Start a connection to TIBCO Cloud Messaging.
  //
  // Durable subscriptions require a unique client identifier.
  //
  // ConnectionListener.onConnect() is invoked following a
  // successful connection to TIBCO Cloud Messaging.
  //
  // ConnectionListener.OnDisconnect() is invoked upon
  // disconnect or a failure.

  EFTL.connect(TcmUrl, props, new ConnectionListener {

    override def onConnect(connection: Connection): Unit = {
      logger.info("Connected to TIBCO Cloud Messaging")

      val matcher: String = String.format("{\"%s\": \"%s\"}",
        Message.FIELD_NAME_DESTINATION, tcmDurableKey)
      //connection.subscribe("{\"status\": true }","state", new SubscriptionListener
      logger.info(s"matcher = $matcher")
      connection.subscribe(matcher, "state", new SubscriptionListener {

        override def onMessages(messages: Array[Message]): Unit = {
          messages.foreach { msg =>
            logger.info(s"Received : $msg")
            val caseRef: String = msg.getString("caseRef")
            val status: String = msg.getString("status")
            val analysis_id: String = msg.getString("analysis_id")
            if (status.equals("submit")) {
              logger.info(s"$caseRef")
              logger.info(s"$status")
              logger.info(s"$analysis_id")
              //TODO : launch kubernetes
              cmdLaunchActor ! Command(s"$caseRef", s"$analysis_id")
            }

            if (status.equals("remove")) {
              cmdDeleteActor ! Command(s"$caseRef", s"$analysis_id")
            }
            //kill switch
            if (status.equals("kill")) {
              logger.info("Kill command received...terminating")
              system.terminate()
              connection.disconnect()
            }
          }
        }

        override def onSubscribe(subscriptionId: String): Unit = {
          logger.info("onSubscribe...")
        }

        override def onError(subscriptionId: String, code: Int, reason: String): Unit = {
          logger.error(s"Subscription failed : ${reason}")
          connection.disconnect()
        }

      })
    }

    override def onReconnect(connection: Connection): Unit = {
      logger.info(s"Reconnected TIBCO Cloud Messaging")
    }

    override def onDisconnect(connection: Connection, code: Int, reason: String): Unit = {
      logger.info(s"Disconnected from TIBCO Cloud Messaging: ${reason} with code ${code}")
    }

    override def onError(connection: Connection, code: Int, reason: String): Unit = {
      logger.error(s"Error from TIBCO Cloud Messaging: ${reason} with code ${code}")
    }
  })
}