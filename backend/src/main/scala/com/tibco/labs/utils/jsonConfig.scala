/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import com.tibco.labs.config.{DiscoverAnalysisConfig, Schema}
import com.tibco.labs.utils.Status.sendBottleToTheSea
import com.tibco.labs.utils.commons._
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
        println(s"Error: parsing JsonConfig file : ${value.getMessage}")
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

    //println(s"Analysis INFOS - Desc :  " + analysisDesc)
    //println(s"Analysis INFOS - LA Case Reference :  " + caseRef)
    println(s"Analysis INFOS - Org :  " + organisation)
    //println(s"Analysis INFOS  - Datasource Type :  " + inputFileType)


  /*  filename = config.Datasource.File.FileName
    fileUri = config.Datasource.File.FilePath
    hasHeaders = config.Datasource.File.UseFirstLineAsHeader
    separator = config.Datasource.File.Separator
    quoteChar = config.Datasource.File.QuoteChar
    escapeChar = config.Datasource.File.EscapeChar
    datetimeFormat = config.Datasource.File.DateTimeFormat
    encodingFormat = config.Datasource.File.Encoding
*/
/*    println(s"CSV INFOS - File To Read :  " + fileUri)
    println(s"CSV INFOS - File Type : " + inputFileType)
    println(s"CSV INFOS - Headers : " + hasHeaders)
    println(s"CSV INFOS - separator : " + separator)
    println(s"CSV INFOS - quoteChar : " + quoteChar)
    println(s"CSV INFOS - escapeChar : " + escapeChar)
    println(s"CSV INFOS - datetimeFormat : " + datetimeFormat)
    println(s"CSV INFOS - Encoding : " + encodingFormat)*/

    tdvDatabase = s"org_${config.organization}"
    tdvTable = config.datasetSource.source.split("/").last
    //tdvDomain = config.Datasource.TDV.Domain
    //tdvDateTimeFormat = config.Datasource.TDV.DateTimeFormat
    //tdvSiteEndpoint = config.Datasource.TDV.Endpoint
    //tdvNumPart = config.Datasource.TDV.Partitions.toString
    //tdvSiteName = config.Datasource.TDV.Site

    println(s"TDV INFOS - Database :  " + tdvDatabase)
    println(s"TDV INFOS - Data Table  : " + tdvTable)
    println(s"TDV INFOS - Domain : " + tdvDomain)
    println(s"TDV INFOS - username : " + tdvUsername)
    println(s"TDV INFOS - password : " + "************")
    println(s"TDV INFOS - hostname:port : " + tdvSiteEndpoint)
    //println(s"TDV INFOS - datetimeFormat : " + tdvDateTimeFormat)
    //println(s"TDV INFOS - partitions : " + tdvNumPart)

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
  }



}
