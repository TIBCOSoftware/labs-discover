/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.models

case class K8s(
                K8S_NAMESPACE: String,
                K8S_DOCKER_DOMAIN: String,
                K8S_DOCKER_IMAGE: String,
                K8S_JOB_TEMPLATE: String,
                K8S_SCHEDULED_JOB_TEMPLATE: String,
                K8S_DOCKER_VERSION: String,
                K8S_CLUSTER_NAME: String,
                K8S_PERSISTANT_CLAIM: String
              )
case class ProcessMiner(
                         PROCESS_MINER_DRIVERS: Double,
                         PROCESS_MINER_DRIVERS_CPU: Double,
                         PROCESS_MINER_DRIVERS_MEMORY: String,
                         PROCESS_MINER_WORKERS: Double,
                         PROCESS_MINER_WORKERS_CPU: Double,
                         PROCESS_MINER_WORKERS_MEMORY: String
                       )
case class Docker(
                   DOCKER_LOGIN: Option[String],
                   DOCKER_EMAIL: Option[String],
                   DOCKER_PASSWORD: Option[String],
                   DOCKER_REGISTRY: Option[String]
                 )
case class Aws(
                AWS_ROLE_ARN: String,
                CLOUD_PROVIDER_REGION: String,
                CLOUD_PROVIDER: String
              )
case class environment(
                           k8s: K8s,
                           processMiner: ProcessMiner,
                           docker: Option[Docker],
                           aws: Aws,
                           env: String
                         )