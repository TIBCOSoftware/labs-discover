[![Actions Status](https://github.com/tibco/labs-processmining-backend/workflows/Security%20scanners/badge.svg)](https://github.com/tibco/labs-processmining-backend/actions)
# Private repo for process-mining tenant on CIC

## Analysis Config json specs 

```json
{
    "type": "object",
    "properties": {
        "Name": {
            "type": "string",
            "default": "some name"
        },
        "Description": {
            "type": "string",
            "default": "some desc"
        },
        "ID": {
            "type": "string",
            "default": "1"
        },
        "caseRef": {
            "type": "string",
            "default": "000001"
        },
        "InputType": {
            "type": "string",
            "default": "csv"
        },
        "DataSource": {
            "type": "object",
            "properties": {
                "TDV": {
                    "type": "object",
                    "properties": {
                        "Query": {
                            "type": "string",
                            "default": "select * from"
                        },
                        "Username": {
                            "type": "string",
                            "default": "blablacar"
                        },
                        "Password": {
                            "type": "string",
                            "default": ""
                        },
                        "Table": {
                            "type": "string",
                            "default": "mytable"
                        },
                        "Database": {
                            "type": "string",
                            "default": "mydb"
                        },
                        "Domain": {
                            "type": "string",
                            "default": "composite"
                        },
                        "Site": {
                            "type": "string",
                            "default": "localshit_9400"
                        },
                        "Endpoint": {
                            "type": "string",
                            "default": "0.1.2.3:9402"
                        },
                        "PrimaryKey": {
                            "type": "string",
                            "default": "key"
                        },
                        "Partitions": {
                            "type": "number",
                            "default": "100"
                        },
                        "DateTimeFormat": {
                            "type": "string",
                            "default": "MM/dd/yyyy"
                        }
                    }
                },
                "File": {
                    "type": "object",
                    "properties": {
                        "FilePath": {
                            "type": "string",
                            "default": "/Users/fcenedes/Documents/github/labs-discover/target/test-classes/Purchase_requests.csv"
                        },
                        "FileName": {
                            "type": "string",
                            "default": "Purchase_requests.csv"
                        },
                        "UseFirstLineAsHeader": {
                            "type": "string",
                            "default": "true"
                        },
                        "Separator": {
                            "type": "string",
                            "default": ";"
                        },
                        "QuoteChar": {
                            "type": "string",
                            "default": "\""
                        },
                        "EscapeChar": {
                            "type": "string",
                            "default": "\\"
                        },
                        "Encoding": {
                            "type": "string",
                            "default": "utf-8"
                        },
                        "DateTimeFormat": {
                            "type": "string",
                            "default": "MM/dd/yyyy"
                        }
                    }
                }
            }
        },
        "Schema": {
            "type": "array",
            "items": {
                "type": "string",
                "default": "Order"
            }
        },
        "EventMap": {
            "type": "object",
            "properties": {
                "case_id": {
                    "type": "string",
                    "default": "Case_id"
                },
                "activity_id": {
                    "type": "string",
                    "default": "Activity"
                },
                "resource_id": {
                    "type": "string",
                    "default": "Resource"
                },
                "activity_start_time": {
                    "type": "string",
                    "default": "Time_stamp"
                },
                "activity_end_time": {
                    "type": "string",
                    "default": ""
                },
                "otherAttributes": {
                    "type": "string",
                    "default": "Supplier,Company,Order"
                }
            }
        }
    }
}
```

## Job inputs :

| parameter name |  type  |                  usage                 | default value | Exception if null |
|:--------------:|:------:|:--------------------------------------:|:-------------:|:-----------------:|
|   AnalysisID   | BigInt | Unique identifier for a given analysis |      none     |        true       |
|  databaseName  | BigInt | Unique identifier for a given case     |      none     |        true       |


Region can be : eu, us

## analysis folder content :

PathLocation --> /data/{uuid}
inputFile --> /data/{uuid}/{FileName}
if backend is set to SBDF :
    outputFiles : 
                /data/{uuid}/events.sdbf
                /data/{uuid}/variants.sdbf
                /data/{uuid}/cases.sdbf
                /data/{uuid}/metrics.sdbf


## Spotfire endpoint

Europe : https://eu.spotfire-next.cloud.tibco.com/
US : https://spotfire-next.cloud.tibco.com/

## Backend Supports 
- Postgresql (ie aurora, serverless or not)
- cosmoDB (Azure)
