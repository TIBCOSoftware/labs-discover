package com.tibco.labs.orchestrator.conf

case class Common(
                   cluster_name: String,
                   persistant_claim: String
                 )
case class Process_mining(
                           namespace: String,
                           image_domain: String,
                           image: String,
                           image_version: String,
                           drivers: Double,
                           drivers_cpu: Double,
                           drivers_mem: String,
                           workers: Double,
                           workers_cpu: Double,
                           workers_memory: String
                         )
case class Spark(
                  common: Common,
                  process_mining: Process_mining,
                  preview: Process_mining
                )
case class Aws(
                region: String
              )
case class TIBCO(
                  cic_region: String
                )
case class Clouds(
                   provider: String,
                   aws: Aws,
                   TIBCO: TIBCO
                 )
case class Tdv(
                username: String,
                password: String,
                jdbcPort: String,
                domain: String,
                hostname: String,
                soapPort: String,
                ssl: String,
                workers: String
              )
case class Database(
                     flavor: String,
                     batchSize: String,
                     partitions: String,
                     url: String,
                     driver: String,
                     username: String,
                     password: String
                   )
case class Filesystem(
                       s3_bucket: String
                     )
case class Services(
                     name: String,
                     service: String,
                     port: String,
                     protocol: String
                   )
case class Storage(
                    database: Database,
                    filesystem: Filesystem,
                    services: List[Services]
                  )
case class Backend(
                    tdv: Tdv,
                    storage: Storage
                  )
case class DiscoverConfiguration(
                                  spark: Spark,
                                  clouds: Clouds,
                                  orgId: String,
                                  backend: Backend
                                )