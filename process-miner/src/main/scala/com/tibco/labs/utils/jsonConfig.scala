/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import java.io.File
import java.time.LocalDateTime

import sttp.client.okhttp.WebSocketHandler
import com.tibco.labs.config.DiscoverAnalysisConfig
import io.circe
import io.circe._
import io.circe.generic.auto._
import sttp.client._
import sttp.client.circe._
import sttp.client.okhttp.OkHttpSyncBackend
import com.tibco.labs.utils.commons._
import com.tibco.labs.utils.tibcoCloudMessaging.sendTCMMessage

object jsonConfig {

  def RetrieveCaseConfig(getCaseEndpoint: String): DiscoverAnalysisConfig = {
    implicit val backendCase: SttpBackend[Identity, Nothing, WebSocketHandler] = OkHttpSyncBackend()

    val jsonConfigRequest: RequestT[Identity, Either[ResponseError[Error], DiscoverAnalysisConfig], Nothing] = basicRequest
      .auth.bearer(cic_oauth)
      .contentType("application/json")
      .header("Accept", "application/json")
      .get(uri"$getCaseEndpoint").response(asJson[DiscoverAnalysisConfig])
    var ret: DiscoverAnalysisConfig = null

    //var jsonConfigResponse: Identity[Response[Either[ResponseError[circe.Error], AnalysisConfig]]] = null
    try {
      val jsonConfigResponse: Identity[Response[Either[ResponseError[circe.Error], DiscoverAnalysisConfig]]] = jsonConfigRequest.send()

      //jsonConfigResponse = jsonConfigRequest.send()
      if (jsonConfigResponse.code.code.equals(200)) {
        jsonConfigResponse.body match {
          case Right(body) => println(s" Parsing of Analysis Config ok " + body.toString)
            ret =  body
          case Left(error) =>
            println(s"Error: jsonConfigResponse.body " + error)
            sendTCMMessage(s"$analysisId",s"$caseRef","error","Error: jsonConfigResponse.body " + error,0, databaseName, LocalDateTime.now().toString)
            throw new Exception("Error: jsonConfigResponse.body " + error)
        }
      } else if (jsonConfigResponse.code.code.equals(400)) {
        println(s"Error: tci bad request, check if the analysis id exist ")
        sendTCMMessage(s"$analysisId",s"$caseRef","error","Error: tci bad request, check if the analysis id exist", 0, databaseName, LocalDateTime.now().toString)
        throw new Exception("Error: jsonConfigResponse.code 400 ")
      } else if (jsonConfigResponse.code.code.equals(500)) {
        println(s"BOOOOMMM, oh yeah something went wrong, check if the analysis id exist :-), double check the url")
        sendTCMMessage(s"$analysisId",s"$caseRef","error","BOOOOMMM, oh yeah something went wrong, check if the analysis id exist :-), double check the url",0, databaseName, LocalDateTime.now().toString)
        throw new Exception("Error: jsonConfigResponse.code 500 ")
      }
    } catch {

        case e: Throwable =>
          sendTCMMessage(s"$analysisId",s"$caseRef","error",e.getMessage,0, databaseName, LocalDateTime.now().toString)
          throw new Exception("Error: jsonConfigRequest : " + e.getMessage)
    }
    backendCase.close()
    return ret
  }

  def InitialiseVars(config: DiscoverAnalysisConfig) = {

    analysisDesc = config.Description
    caseRef = config.caseRef
    organisation = config.Organisation
    inputFileType = config.InputType

    println(s"Analysis INFOS - Desc :  " + analysisDesc)
    println(s"Analysis INFOS - LA Case Reference :  " + caseRef)
    println(s"Analysis INFOS - Org :  " + organisation)
    println(s"Analysis INFOS  - Datasource Type :  " + inputFileType)


    filename = config.Datasource.File.FileName
    fileUri = config.Datasource.File.FilePath
    hasHeaders = config.Datasource.File.UseFirstLineAsHeader
    separator = config.Datasource.File.Separator
    quoteChar = config.Datasource.File.QuoteChar
    escapeChar = config.Datasource.File.EscapeChar
    datetimeFormat = config.Datasource.File.DateTimeFormat
    encodingFormat = config.Datasource.File.Encoding

    println(s"CSV INFOS - File To Read :  " + fileUri)
    println(s"CSV INFOS - File Type : " + inputFileType)
    println(s"CSV INFOS - Headers : " + hasHeaders)
    println(s"CSV INFOS - separator : " + separator)
    println(s"CSV INFOS - quoteChar : " + quoteChar)
    println(s"CSV INFOS - escapeChar : " + escapeChar)
    println(s"CSV INFOS - datetimeFormat : " + datetimeFormat)
    println(s"CSV INFOS - Encoding : " + encodingFormat)

    tdvDatabase = config.Datasource.TDV.Database
    tdvTable = config.Datasource.TDV.Table
    tdvDomain = config.Datasource.TDV.Domain
    tdvDateTimeFormat = config.Datasource.TDV.DateTimeFormat
    tdvSiteEndpoint = config.Datasource.TDV.Endpoint
    tdvNumPart = config.Datasource.TDV.Partitions.toString
    tdvSiteName = config.Datasource.TDV.Site

    println(s"TDV INFOS - Database :  " + tdvDatabase)
    println(s"TDV INFOS - Data Table  : " + tdvTable)
    println(s"TDV INFOS - Domain : " + tdvDomain)
    println(s"TDV INFOS - username : " + tdvUsername)
    println(s"TDV INFOS - password : " + "************")
    println(s"TDV INFOS - hostname:port : " + tdvSiteEndpoint)
    println(s"TDV INFOS - datetimeFormat : " + tdvDateTimeFormat)
    println(s"TDV INFOS - partitions : " + tdvNumPart)

    columnCaseId = NormalizationRegexColName.r.replaceAllIn(config.EventMap.case_id, "_")
    columnCaseStart = NormalizationRegexColName.r.replaceAllIn(config.EventMap.activity_start_time, "_")
    columnCaseEnd = NormalizationRegexColName.r.replaceAllIn(config.EventMap.activity_end_time, "_")
    columnActivityId = NormalizationRegexColName.r.replaceAllIn(config.EventMap.activity_id, "_")
    columnResourceId = NormalizationRegexColName.r.replaceAllIn(config.EventMap.resource_id, "_")
    _colsExtraToKeep = NormalizationRegexColName.r.replaceAllIn(config.EventMap.otherAttributes, "_")

    startIds = config.Endpoints.Starts.activities.split(",").toSeq
    endIds = config.Endpoints.Ends.activities.split(",").toSeq
  }


  def DownloadLARessources(getSharedFileSystem: String, id: String) = {
    implicit val backendFile: SttpBackend[Identity, Nothing, WebSocketHandler] = OkHttpSyncBackend()

    println(s"###########  Retrieve Data source file ##########")
    val sourceDataFile = new File(s"$getSharedFileSystem/$id/$filename")
    val getSourceDataFileRequest = basicRequest.auth.bearer(cic_oauth).response(asFile(sourceDataFile)).get(uri"$fileUri")
    val getSourceDataFileResp = getSourceDataFileRequest.send()

    getSourceDataFileResp.body match {
      case Right(x) =>
        println(s"File successfuly downloaded : " + x.getAbsolutePath)
      case Left(y) => sendTCMMessage(s"$analysisId",s"$caseRef","error","Error Dl  input file : " + y,0, databaseName, LocalDateTime.now().toString)
        throw new Exception("Error : " + y)

    }

    sourceDataFilePath = sourceDataFile.getAbsolutePath

    backendFile.close()

  }

}
