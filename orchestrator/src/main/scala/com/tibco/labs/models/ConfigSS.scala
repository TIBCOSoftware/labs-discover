/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.models

case class ConfigSS(
                     tdv_enable: String,
                     tdv_username: String,
                     tdv_password: String,
                     tdv_jdbcPort: String,
                     tdv_workers: String,
                     tdv_k8sEnable: String,
                     tdv_k8sNamespace: String,
                     tdv_k8sPodName: String,
                     messaging_endpoint: String,
                     messaging_key: String,
                     messaging_configURL: String,
                     storage_type: String,
                     storage_batchSize: String,
                     storage_partitions: String,
                     storage_url: String,
                     storage_driver: String,
                     storage_username: String,
                     storage_password: String
                   )
