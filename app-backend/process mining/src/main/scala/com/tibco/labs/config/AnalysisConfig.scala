/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.config


case class Schema(
                   format: String,
                   columnName: String,
                   dataType: String
                 )
case class datasetSource(
                           source: String
                         )
case class Filter(
                   description: Option[String],
                   name: Option[String],
                   filterType: Option[String],
                   value: Option[String]
                 )
case class Mapping(
                    activity: Option[String],
                    caseId: Option[String],
                    endTime: Option[String],
                    otherAttributes: Option[String],
                    requester: Option[String],
                    resource: Option[String],
                    resourceGroup: Option[String],
                    scheduledEnd: Option[String],
                    scheduledStart: Option[String],
                    startTime: Option[String]
                  )
case class Schedule(
                     schedule: String,
                     isSchedule: String
                   )
case class DiscoverAnalysisConfig(
                             schema: List[Schema],
                             //Dataset_Name: String,
                             //Dataset_Description: String,
                             datasetSource: datasetSource,
                             //Description: String,
                             filters: Option[List[Filter]],
                             groups: Option[List[Filter]],
                             id: String,
                             version: String,
                             token: String,
                             mappings: Mapping,
                             //Name: String,
                             organization: String,
                             schedule: Option[Schedule],
                             //reference: String
                           )