package com.tibco.labs.orchestrator.api

//#user-registry-actor
//import akka.actor.TypedActor.context

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import org.slf4j.LoggerFactory

//


//#user-case-classes

object LoginRegistry {

  val log = LoggerFactory.getLogger(this.getClass.getName)

  // actor protocol
  sealed trait Command

  final case class validateCredentialsRegistry(token: String, replyTo: ActorRef[ActionPerformedLoginValidate]) extends Command

  // response
  final case class ActionPerformedLoginValidate(status: String, code: Int, orgId: String)

  def apply(): Behavior[Command] = registryLogin()

  private def registryLogin(): Behavior[Command] = {
    Behaviors.receiveMessage {

      case validateCredentialsRegistry(token, replyTo) =>
        log.info("createDatabaseSchemaRegistry called")
        //replyTo ! ActionPerformed(s"JOB ${configPM.reference} created.", 0)
        replyTo ! loginJob().validate(token)
        Behaviors.same
    }
  }

  case class loginJob() {
    def validate(token: String) = {
      val job: (String, Int, String) = new LiveApps().validateLogin(token)
      ActionPerformedLoginValidate(job._1, job._2, job._3)
    }

  }
}
//#user-registry-actor
