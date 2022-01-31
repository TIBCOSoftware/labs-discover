package com.tibco.labs.orchestrator.models

object Examples {

  final val postSparkJobTemplateString =
    """{
      |  "schema": [
      |            {
      |                "format": "None",
      |                "ColumnName": "Service ID",
      |                "DataType": "string"
      |            },
      |            {
      |                "format": "None",
      |                "ColumnName": "Operation",
      |                "DataType": "string"
      |            },
      |            {
      |                "format": "None",
      |                "ColumnName": "Agent",
      |                "DataType": "string"
      |            },
      |            {
      |                "format": "None",
      |                "ColumnName": "Service Type",
      |                "DataType": "string"
      |            },
      |            {
      |                "format": "None",
      |                "ColumnName": "Product",
      |                "DataType": "string"
      |            },
      |            {
      |                "format": "None",
      |                "ColumnName": "Customer ID",
      |                "DataType": "string"
      |            },
      |            {
      |                "format": "None",
      |                "ColumnName": "Agent Position",
      |                "DataType": "string"
      |            },
      |            {
      |                "format": "d.M.yy H:m",
      |                "ColumnName": "End Date",
      |                "DataType": "timestamp"
      |            },
      |            {
      |                "format": "d.M.yy H:m",
      |                "ColumnName": "Start Date",
      |                "DataType": "timestamp"
      |            }
      |        ],
      |  "Dataset_Name": "CallCenter",
      |  "Dataset_Description": "CallCenter",
      |  "Dataset_Source": {
      |    "Source": "/services/databases/org_01dxjp1rpa35bzcv1kvem9ffyk/CallCenter"
      |  },
      |  "Description": "Call Center analysis",
      |  "Filter": [
      |    {
      |      "Description": "None",
      |      "Name": "None",
      |      "Type": "None",
      |      "Value": "None"
      |    }
      |  ],
      |  "Groups": [
      |    {
      |      "Description": "None",
      |      "Name": "None",
      |      "Type": "None",
      |      "Value": "None"
      |    }
      |  ],
      |  "ID": "PAM_000001",
      |  "Mapping": {
      |    "Activity": "Operation",
      |    "Case_ID": "Service ID",
      |    "End_time": "End Date",
      |    "Other_attributes": "true",
      |    "Requester": "None",
      |    "Resource": "Agent",
      |    "Resource_group": "Agent Position",
      |    "Scheduled_end": "None",
      |    "Scheduled_start": "None",
      |    "Start_time": "Start Date"
      |  },
      |  "Name": "CallCenter",
      |  "Organization": "<your TIBCO Organization ID>",
      |  "Schedule": {
      |    "Schedule": "every5min",
      |    "isSchedule": "false"
      |  },
      |  "reference": "121423525253"
      |}""".stripMargin

}
