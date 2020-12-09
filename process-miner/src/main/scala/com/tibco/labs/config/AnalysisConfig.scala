/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.config

  case class Columns(
                      _id: Option[Double],
                      _value: Option[String]
                    )
  case class File(
                   DateTimeFormat: String,
                   Encoding: String,
                   EscapeChar: String,
                   FileName: String,
                   FilePath: String,
                   QuoteChar: String,
                   Separator: String,
                   UseFirstLineAsHeader: String
                 )
  case class TDV(
                  Database: String,
                  DateTimeFormat: String,
                  Domain: String,
                  Endpoint: String,
                  Partitions: Int,
                  PrimaryKey: String,
                  Query: String,
                  Site: String,
                  Table: String
                )
  case class Datasource(
                         File: File,
                         TDV: TDV
                       )
  case class Ends(
                   activities: String
                 )
case class Starts(
                 activities: String
               )
  case class Endpoints(
                        Ends: Ends,
                        Starts: Starts
                      )
  case class EventMap(
                       activity_end_time: String,
                       activity_id: String,
                       activity_start_time: String,
                       case_id: String,
                       otherAttributes: String,
                       resource_id: String
                     )
  case class Schedule_1(
                         Schedule: String,
                         isSchedule: String
                       )
  case class DiscoverAnalysisConfig(
                                     Columns: Option[List[Columns]],
                                     Datasource: Datasource,
                                     Description: String,
                                     Endpoints: Endpoints,
                                     EventMap: EventMap,
                                     ID: String,
                                     InputType: String,
                                     Name: String,
                                     Organisation: String,
                                     Schedule_1: Schedule_1,
                                     caseRef: String
                                   )

