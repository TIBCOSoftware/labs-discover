/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import com.tibco.labs.config.{DiscoverAnalysisConfig, Filter, Schema}
import com.tibco.labs.utils.Status.sendBottleToTheSea
import com.tibco.labs.utils.commons._
import org.apache.log4j.Logger

import scala.collection.mutable
//import com.tibco.labs.utils.tibcoCloudMessaging.sendTCMMessage
import io.circe._
import io.circe.generic.auto._

import java.time.LocalDateTime
import scala.collection.mutable.ListBuffer
import scala.io.{BufferedSource, Source}

object jsonConfig {
  

  def RetrieveCaseConfig(configFileLocation: String): DiscoverAnalysisConfig = {
    val tempFile: BufferedSource = Source.fromFile(configFileLocation)
    val tempString: String = tempFile.mkString
    val parsed: Either[Error, DiscoverAnalysisConfig] =  parser.decode[DiscoverAnalysisConfig](tempString)
    parsed match {
      case Right(value) => {
        tempFile.close()
        value
      }
      case Left(value) => {
        //sendBottleToTheSea(analysisID: String, analysisStatus: String, message: String, progress: Long, orgId: String):
        val errMsg = s"Error: parsing JsonConfig file : ${value.getMessage}"
        logger.error(s"Error: parsing JsonConfig file : ${value.getMessage}")
        sendBottleToTheSea(s"$analysisId","error",errMsg,0, "none")
        null
      }
    }
  }

  def InitialiseVars(config: DiscoverAnalysisConfig): Unit = {

    //analysisDesc = config.Description
    tokenCic = config.token
    //caseRef = config.reference
    organisation = config.organization
    databaseName = s"org_${organisation}"
    //inputFileType = config.InputType
    analysisVersion = config.version

    //logger.info(s"Analysis INFOS - Desc :  " + analysisDesc)
    //logger.info(s"Analysis INFOS - LA Case Reference :  " + caseRef)
    logger.info(s"Analysis INFOS - Org :  " + organisation)
    //logger.info(s"Analysis INFOS  - Datasource Type :  " + inputFileType)


  /*  filename = config.Datasource.File.FileName
    fileUri = config.Datasource.File.FilePath
    hasHeaders = config.Datasource.File.UseFirstLineAsHeader
    separator = config.Datasource.File.Separator
    quoteChar = config.Datasource.File.QuoteChar
    escapeChar = config.Datasource.File.EscapeChar
    datetimeFormat = config.Datasource.File.DateTimeFormat
    encodingFormat = config.Datasource.File.Encoding
*/
/*    logger.info(s"CSV INFOS - File To Read :  " + fileUri)
    logger.info(s"CSV INFOS - File Type : " + inputFileType)
    logger.info(s"CSV INFOS - Headers : " + hasHeaders)
    logger.info(s"CSV INFOS - separator : " + separator)
    logger.info(s"CSV INFOS - quoteChar : " + quoteChar)
    logger.info(s"CSV INFOS - escapeChar : " + escapeChar)
    logger.info(s"CSV INFOS - datetimeFormat : " + datetimeFormat)
    logger.info(s"CSV INFOS - Encoding : " + encodingFormat)*/

    tdvDatabase = s"org_${config.organization}"
    tdvTable = config.datasetSource.source.split("/").last
    //tdvDomain = config.Datasource.TDV.Domain
    //tdvDateTimeFormat = config.Datasource.TDV.DateTimeFormat
    //tdvSiteEndpoint = config.Datasource.TDV.Endpoint
    //tdvNumPart = config.Datasource.TDV.Partitions.toString
    //tdvSiteName = config.Datasource.TDV.Site

    logger.info(s"TDV INFOS - Database :  " + tdvDatabase)
    logger.info(s"TDV INFOS - Data Table  : " + tdvTable)
    logger.info(s"TDV INFOS - Domain : " + tdvDomain)
    logger.info(s"TDV INFOS - username : " + tdvUsername)
    logger.info(s"TDV INFOS - password : " + "************")
    logger.info(s"TDV INFOS - hostname:port : " + tdvSiteEndpoint)
    //logger.info(s"TDV INFOS - datetimeFormat : " + tdvDateTimeFormat)
    //logger.info(s"TDV INFOS - partitions : " + tdvNumPart)

    columnCaseId = normalizerString(config.mappings.caseId.getOrElse(""))
    columnCaseStart = normalizerString(config.mappings.startTime.getOrElse(""))
    columnCaseEnd = normalizerString(config.mappings.endTime.getOrElse(""))
    columnActivityId = normalizerString(config.mappings.activity.getOrElse(""))
    columnResourceId = normalizerString(config.mappings.resource.getOrElse(""))
    _colsExtraToKeep = normalizerString(config.mappings.otherAttributes.getOrElse(""))
    columnRequester = normalizerString(config.mappings.requester.getOrElse(""))
    columnResourceGroup = normalizerString(config.mappings.resourceGroup.getOrElse(""))
    columnScheduleStart = normalizerString(config.mappings.scheduledStart.getOrElse(""))
    columnScheduleEnd = normalizerString(config.mappings.scheduledEnd.getOrElse(""))

    val listCols: Seq[Schema] = config.schema
    var tempListCols: ListBuffer[String]= new ListBuffer[String]()
    listCols.foreach(l => {
      tempListCols += normalizerString(l.columnName)
    })
    val speciaCols = Seq(columnCaseId, columnCaseStart, columnCaseEnd, columnActivityId, columnResourceId, columnRequester, columnResourceGroup,columnScheduleStart,  columnScheduleEnd)
    speciaCols.foreach( col =>  {
      if(col != "" || col != "None") {
        tempListCols -= col
      }
    }

    )
    columnNamesToKeep = tempListCols.toSeq

 //All elements with a timestamp datatype, we keep a map (colName -> format)
    val filteredTimestampList = listCols.filter(l => l.dataType == "timestamp")
    filteredTimestampList.foreach(u => {
      timeStampMap += (normalizerString(u.columnName) -> u.format)
    })

    //startIds = config.Groups.Starts.activities.split(",").toSeq
    //endIds = config.Endpoints.Ends.activities.split(",").toSeq

    val preStartFilters = config.filters.getOrElse(List(Filter(None, None, None, None, None))).filter(l => l.name.get.equals("Starting Activities"))
    if (preStartFilters.nonEmpty) {
      startFilters = preStartFilters(0).values.getOrElse(List())
    } else {
      logger.info("No Start filters")
    }

    var stopFilters: List[String] = List()
    val preStopFilters = config.filters.getOrElse(List(Filter(None, None, None, None, None))).filter(l => l.name.get.equals("Stopping Activities"))
    if (preStopFilters.nonEmpty) {
      stopFilters = preStopFilters(0).values.getOrElse(List())
    } else {
      logger.info("No Stop filters")
    }


    val eventsRangeFilter: List[Filter] = config.filters.getOrElse(List(Filter(None, None, None, None, None))).filter(l =>
      l.name.get.startsWith("Event:")
        &&
        l.category.get.equals("range")
        &&
        l.values.getOrElse(List[String]()).nonEmpty
    )
    if (!eventsRangeFilter.isEmpty) {
      eventsRangeFilter.foreach { ev =>
        val colLookUp: String = ev.name.get.split(":")(1)
        if (config.schema.exists( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)))) {
          val dtype = config.schema.find( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)) ).getOrElse(Schema("", "", "")).dataType
          val dformat = config.schema.find( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)) ).getOrElse(Schema("", "", "")).format
          eventsRange:+= (( normalizerString(colLookUp), dtype, dformat,ev.values.getOrElse(List()).lift(0).getOrElse(""), ev.values.getOrElse(List()).lift(1).getOrElse("") ))
        }
      }
    }else {
      logger.info("No Event:ColsName:Range filters")
    }

    val casesRangeFilter: List[Filter] = config.filters.getOrElse(List(Filter(None, None, None, None, None))).filter(l =>
      l.name.get.startsWith("Case:")
        &&
        l.category.get.equals("range")
      &&
        l.values.getOrElse(List[String]()).nonEmpty
    )
    if (!casesRangeFilter.isEmpty) {
      casesRangeFilter.foreach { ev =>
        val colLookUp: String = ev.name.get.split(":")(1)
        if (config.schema.exists(l =>  normalizerString(l.columnName).equals(colLookUp))) {
          val dtype = config.schema.find( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)) ).getOrElse(Schema("", "", "")).dataType
          val dformat = config.schema.find( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)) ).getOrElse(Schema("", "", "")).format
          casesRange:+= ((normalizerString(colLookUp), dtype, dformat,ev.values.getOrElse(List()).lift(0).getOrElse(""), ev.values.getOrElse(List()).lift(1).getOrElse("")))
        }
      }
    }else {
      logger.info("No Case:ColsName:Range filters")
    }

    val casesValuesFilter: List[Filter] = config.filters.getOrElse(List(Filter(None, None, None, None, None))).filter(l =>
      l.name.get.startsWith("Case:")
        &&
        l.category.get.equals("values")
        &&
        l.values.getOrElse(List[String]()).nonEmpty
    )
    if (!casesValuesFilter.isEmpty) {
      casesValuesFilter.foreach { ev =>
        val colLookUp: String = ev.name.get.split(":")(1)
        if (config.schema.exists(l =>  normalizerString(l.columnName).equals(colLookUp))) {
          val dtype = config.schema.find( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)) ).getOrElse(Schema("", "", "")).dataType
          val dformat = config.schema.find( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)) ).getOrElse(Schema("", "", "")).format
          casesValues:+= ((normalizerString(colLookUp), dtype,dformat, ev.values.getOrElse(List())))
        }

      }
    }else {
      logger.info("No Case:ColsName:Values filters")
    }

    val eventsValuesFilter: List[Filter] = config.filters.getOrElse(List(Filter(None, None, None, None, None))).filter(l =>
      l.name.get.startsWith("Event:")
        &&
        l.category.get.equals("values")
        &&
        l.values.getOrElse(List[String]()).nonEmpty
    )
    if (!eventsValuesFilter.isEmpty) {
      eventsValuesFilter.foreach { ev =>
        val colLookUp: String = ev.name.get.split(":")(1)

        if (config.schema.exists(l =>  normalizerString(l.columnName).equals(colLookUp))) {
          val dtype = config.schema.find( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)) ).getOrElse(Schema("", "", "")).dataType
          val dformat = config.schema.find( l => normalizerString(l.columnName).equals(normalizerString(colLookUp)) ).getOrElse(Schema("", "", "")).format
          eventsValues:+= ((normalizerString(colLookUp), dtype,dformat, ev.values.getOrElse(List())))
        }

      }
    }else {
      logger.info("No Event:ColsName:Values filters")
    }

  }






}
