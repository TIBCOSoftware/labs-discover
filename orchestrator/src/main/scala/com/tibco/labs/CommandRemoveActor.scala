package com.tibco.labs

import akka.actor.Actor
import com.tibco.labs.k8s.Kubernetes

class CommandRemoveActor extends Actor {
  def receive = {
    case Command(caseRef, analysis_id) => new Kubernetes().kubernetesRemove(caseRef,analysis_id)
    case _ => println("huh?")
  }
}
