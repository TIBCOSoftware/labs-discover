package com.tibco.labs

import akka.actor.Actor
import com.tibco.labs.k8s.Kubernetes

class CommandLauncherActor extends Actor {
  def receive = {
    case Command(caseRef, analysis_id) => new Kubernetes().kubernetesLaunch(caseRef,analysis_id)
    case _ => println("huh?")
  }
}
