/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import java.util.Properties

import com.tibco.labs.k8s.DiscoverConfig._
import com.tibco.eftl._

object RespondTCM {

  def uuid: String = java.util.UUID.randomUUID.toString

  val props: Properties = new Properties()

  props.setProperty(EFTL.PROPERTY_PASSWORD, TcmKey)
  props.setProperty(EFTL.PROPERTY_CLIENT_ID, s"orchestrator-client-$uuid")
  props.setProperty(EFTL.PROPERTY_DURABLE_KEY, tcmDurableKey)
  //props.setProperty(EFTL.PROPERTY_DURABLE_TYPE, EFTL.DURABLE_TYPE_SHARED)

  def sendTCMMessage(analysis_ID: String, analysis_caseRef: String, analysisStatus: String, message: String,  progress: Long, org: String, timestamp: String): Unit = {

    /*
    {
    "caseRef":"",
    "analysis_id":"",
    "status":""
    }
     */
    EFTL.connect(TcmUrl, props, new ConnectionListener {
      override def onConnect(connection: Connection): Unit = {
        println("Connected to TIBCO Cloud Messaging")
        val msg: Message = connection.createMessage()

        msg.setString("status", analysisStatus)
        msg.setString("caseRef", analysis_caseRef)
        msg.setString("analysis_id", analysis_ID)
        if (!message.equals("")) {
          msg.setString("message", message)
        } else {
          msg.setString("message", "None")
        }
        msg.setString("organisation", org)
        msg.setLong("progress", progress)
        msg.setString("timestamp", timestamp)
        import com.tibco.eftl.Message
        msg.setString(Message.FIELD_NAME_DESTINATION, tcmDurableKey)

        connection.publish(msg, new CompletionListener {
          override def onCompletion(message: Message): Unit = {
            printf("Published message:\n%s\n", msg)
            //connection.disconnect()
          }

          override def onError(message: Message, code: Int, reason: String): Unit = {
            printf("Publish error: %s\n", reason)
            connection.disconnect()
          }
        })

      }

      override def onReconnect(connection: Connection): Unit = {
        println(s"Reconnected TIBCO Cloud Messaging")
      }

      override def onDisconnect(connection: Connection, code: Int, reason: String): Unit = {
        println(s"Disconnected from TIBCO Cloud Messaging: $reason with code $code")
      }

      override def onError(connection: Connection, code: Int, reason: String): Unit = {
        println(s"Error from TIBCO Cloud Messaging: $reason with code $code")
      }
    })

  }


}

