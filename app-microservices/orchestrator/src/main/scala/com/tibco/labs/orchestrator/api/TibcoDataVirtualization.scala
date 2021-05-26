package com.tibco.labs.orchestrator.api

import com.lucidchart.open.xtract._
import com.tibco.labs.orchestrator.conf.DiscoverConfig
import com.tibco.labs.orchestrator.db.run.Table2Json
import com.tibco.labs.orchestrator.models._
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import org.slf4j.{Logger, LoggerFactory}
import redis.clients.jedis.{Jedis, ScanParams, ScanResult}
import sttp.capabilities
import sttp.client3.SttpClientException.{ConnectException, ReadException}
import sttp.client3._
import sttp.client3.okhttp.OkHttpSyncBackend
import sttp.model.StatusCode
import sttp.model.headers.CookieWithMeta

import java.time.Instant
import java.util
import scala.collection.immutable
import scala.collection.mutable.ListBuffer
import scala.util.{Failure, Success, Try}
import scala.util.control.Breaks.breakable
import scala.util.matching.Regex
import scala.xml.{Elem, XML}


/**
 * Class that holds methods to generate various stuff at the TDV level
 * Let's hope it works
 * Fuck SOAP
 */
class TibcoDataVirtualization() {



  import com.tibco.labs.orchestrator.models.TdvFormatMsgPayload

  val payload: TdvFormatMsgPayload = new TdvFormatMsgPayload()
  val sessionPort: String = "services/system/util/session/sessionPort.ws"
  val resourcePort: String = "services/system/admin/resource/resourcePort.ws"
  val userPort: String = "services/system/admin/user/userPort.ws"
  val tdvssl: String = DiscoverConfig.config.backend.tdv.ssl
  var schemeTdv = ""
  if (tdvssl.equalsIgnoreCase("false")) {
    schemeTdv = "http"
  } else {
    schemeTdv = "https"
  }
  
  val tdvHostName: String = DiscoverConfig.config.backend.tdv.hostname
  val tdvPort: String = DiscoverConfig.config.backend.tdv.soapPort
  val tdvUsername: String = DiscoverConfig.config.backend.tdv.username
  val tdvPassword: String = DiscoverConfig.config.backend.tdv.password
  val uriSession = s"${schemeTdv}://${tdvHostName}:${tdvPort}/${sessionPort}"
  val uriResource = s"${schemeTdv}://${tdvHostName}:${tdvPort}/${resourcePort}"
  val uriUser = s"${schemeTdv}://${tdvHostName}:${tdvPort}/${userPort}"
  val uriRestDataview = s"${schemeTdv}://${tdvHostName}:${tdvPort}/rest/dataview/v1"
  val uriRestLink = s"${schemeTdv}://${tdvHostName}:${tdvPort}/rest/link/v1"
  val uriRestPublish = s"${schemeTdv}://${tdvHostName}:${tdvPort}/rest/execute/v1/actions/dsl/invoke"
  val uriExecuteQuery = s"${schemeTdv}://${tdvHostName}:${tdvPort}/rest/execute/v1/actions/query/invoke"
  val uriFolders = s"${schemeTdv}://${tdvHostName}:${tdvPort}/rest/folder/v1"
  val uriVirtualSchemas = s"${schemeTdv}://${tdvHostName}:${tdvPort}/rest/schema/v1/virtual"
  val className: String = this.getClass.getName
  val log: Logger = LoggerFactory.getLogger(className)
  var tdvAuthCookie: immutable.Seq[CookieWithMeta] = immutable.Seq.empty[CookieWithMeta]
  log.info(s"Entering ${className}")


  def createCsvDataSource(tdvConf: tdvJob): (String, Int, String, String, String, String, String) = {

    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    log.info(tdvConf.toString)

    def uuid = java.util.UUID.randomUUID.toString

    var dataSourceName = ""
    val prevDsId = tdvConf.DatasetID.getOrElse("")
    val datasourcePath: String = tdvConf.DatasetSource.FilePath.split("/").last
    if (prevDsId.equals("")) {
      log.info("Generating new UUID")
      dataSourceName = normalizerString(s"${tdvConf.DatasetName}-${uuid}")
    } else {
      log.info(s"Reusing UUID $prevDsId")
      dataSourceName = prevDsId
    }

    val orgId: String = tdvConf.Organization.toLowerCase()
    //Create
    /*val _init: Boolean = init()
    if (_init) {

      val requestCreateRss = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.CreateRessource(tdvConf).soapAction)
        .body(payload.CreateRessource(tdvConf).soapMessage)
        .post(uri"${uriResource}")

      val responseCreateRss = requestCreateRss.send(sttpBackend)

      if (responseCreateRss.code != StatusCode.Ok) throw new Exception("Big Bisous")
      log.info("Delete Done")
    }
    val _close: Boolean = close()*/

    // introspect
    val intros = introspectCsvDataSource(datasourcePath, dataSourceName, orgId, tdvConf, "ADD_OR_UPDATE")

    val rss = s"/shared/org_${orgId}/CSV/${datasourcePath}"
    val dataview = s"/shared/org_${orgId}/dataviews/datasets/${dataSourceName}"
    val publishedView = s"/services/databases/org_${orgId}/datasets/${dataSourceName}"
    if (intros) {

      log.info("Final steps...")
      //create a view

      log.info("create view")
      log.info(payload.createViewPayload(orgId, datasourcePath, dataSourceName))
      val requestCreateView = basicRequest
        .auth.basic(tdvUsername, tdvPassword)
        .contentType("application/json")
        .body(payload.createViewPayload(orgId, datasourcePath, dataSourceName))
        .post(uri"$uriRestDataview")

      val responseCreateView = requestCreateView.send(sttpBackend)
      responseCreateView.body match {
        case Right(value) => log.info("view created")
        case Left(err) => {
          log.error(s"${err} with code ${responseCreateView.code}")
          return ("Datasource creation in error", 120, rss, dataview, publishedView, tdvConf.DatasetName, dataSourceName)
        }
      }


      // now publish it

      log.info("publising")
      log.info(payload.publishViewPayload(orgId, dataSourceName))
      val requestPublishView = basicRequest
        .auth.basic(tdvUsername, tdvPassword)
        .contentType("application/json")
        .body(payload.publishViewPayload(orgId, dataSourceName))
        .post(uri"$uriRestPublish")

      val responsePublishView = requestPublishView.send(sttpBackend)

      responsePublishView.body match {
        case Right(value) => log.info("view published")
        case Left(err) => {
          log.error(s"${err} with code ${responsePublishView.code}")
          return ("Datasource creation in error", 120, rss, dataview, publishedView, tdvConf.DatasetName, dataSourceName)
        }
      }

      //if (_close) {
      //  log.info("Transaction Closed")
        sttpBackend.close()
      //}

      import java.time.Instant
      val time = Instant.now().getEpochSecond
      val redisConfig = new tdvJob(
        Some(rss),
        Some(dataview),
        Some(publishedView),
        Some(dataSourceName),
        tdvConf.DatasetName,
        tdvConf.DatasetDescription,
        tdvConf.DatasetSource,
        tdvConf.Organization,
        Some(time)
      )
      log.info("Creating REDIS entry")
      val key = s"$orgId-$dataSourceName"
      val value = redisConfig.asJson.spaces2
      withRedis { jedis =>
        jedis.select(6)
        jedis.set(key, value)
      }

      log.info(s"Exiting ${className}")

      ("Datasource Has been created", 0, rss, dataview, publishedView, tdvConf.DatasetName, dataSourceName)
    } else {
      ("Datasource creation in error", 120, rss, dataview, publishedView, tdvConf.DatasetName, dataSourceName)
    }
  }

  def updateCsvDataSource(tdvConf: tdvJob): (String, Int, String, String) = {


    val datasourcePath: String = tdvConf.DatasetSource.FilePath.split("/").last
    val dataSourceName: String = tdvConf.DatasetID.getOrElse("")

    val orgId: String = tdvConf.Organization.toLowerCase()
    val rss = s"/shared/org_${orgId}/CSV/${datasourcePath}"

    if (dataSourceName.equals("")) return ("Datasource update in error - DatasetID is missing", 120, rss, "")
    // delete first

    val delDs = deleteCsvDataSource(orgId, dataSourceName)

    if (delDs._2 != 0) {
      return ("Datasource update in error", 120, rss, dataSourceName)
    }

    val createDS = createCsvDataSource(tdvConf)
    // create after
    // introspect
    //val intros = introspectCsvDataSource(datasourcePath, dataSourceName, orgId, tdvConf, "ADD_OR_UPDATE")

    if (createDS._2 == 0) {
      log.info(s"Exiting ${className}")
      log.info("Creating REDIS entry")
      val key = s"$orgId-${createDS._7}"

      import java.time.Instant
      val time = Instant.now().getEpochSecond
      val redisConfig = new tdvJob(
        Some(rss),
        Some(tdvConf.DataSetViewPath.getOrElse("")),
        Some(tdvConf.PublishedDataSourcePath.getOrElse("")),
        Some(dataSourceName),
        tdvConf.DatasetName,
        tdvConf.DatasetDescription,
        tdvConf.DatasetSource,
        tdvConf.Organization,
        Some(time)
      )
      //val value = tdvConf.asJson.noSpaces

      withRedis { jedis =>
        jedis.select(6)
        jedis.del(key)
        jedis.set(key, redisConfig.asJson.spaces2)
      }
      ("Datasource Has been updated, find the new id", 0, rss, s"${createDS._7}")
    } else {
      ("Datasource update in error", 120, rss, "")
    }
  }

  def deleteCsvDataSource(orgId: String, dataSourceName: String): (String, Int, String) = {

    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    log.info(s"$orgId - $dataSourceName")

    log.info("Get dataview details")


    val publishedViewLocation = s"/services/databases/org_${orgId.toLowerCase}/datasets/${dataSourceName}"
    val dataviewLocation = s"/shared/org_${orgId.toLowerCase}/dataviews/datasets/${dataSourceName}"


    val requestDsDetails = basicRequest
      .auth.basic(tdvUsername, tdvPassword)
      .get(uri"${uriRestDataview}?path=${dataviewLocation}")

    val responseDsDetail = requestDsDetails.send(sttpBackend)

    implicit val decoder: Decoder[DataViewProperties] = { (hCursor: HCursor) =>
      for {
        f <- hCursor.as[(Option[String], Option[String], Option[String])]
      } yield DataViewProperties(f._1, f._2, f._3)
    }

    var parsedResponseDSDetails: detailViews = null
    if (responseDsDetail.code == StatusCode.NotFound) return (s"Resource ${dataSourceName} is not deleted ", 404, "Resource not found")
    if (responseDsDetail.code != StatusCode.Ok) return (s"Resource ${dataSourceName} is not deleted ", 100, "Failed to retrieved Dataview information")
    responseDsDetail.body match {
      case Left(err) => {
        log.error(s"Failed to retrieved Dataview information ${err}")
      }
      case Right(value) => {
        decode[detailViews](value) match {
          case Right(_json) => parsedResponseDSDetails = _json
          case Left(err) => println(err)
        }
      }
    }
    log.info(s"$parsedResponseDSDetails")
    val extractor: Regex = "\\\"(\\w+_csv)\\\"".r
    val sqlVal: String = parsedResponseDSDetails.properties.filter(f => f.Key == Some("SQL"))(0).Value.getOrElse("")
    var dataFileName: String = ""
    extractor.findFirstMatchIn(sqlVal) match {
      case Some(file) => dataFileName = file.group(1) //0is full match
      case None => log.error("bouh")
    }

    // delete published view

    val requestDeletePub = basicRequest
      .auth.basic(tdvUsername, tdvPassword)
      .contentType("application/json")
      .body(payload.DeletePublishedView(orgId, dataSourceName).soapMessage)
      .delete(uri"$uriRestLink")

    val responseDeletePub = requestDeletePub.send(sttpBackend)

    if (responseDeletePub.code != StatusCode.Ok) {
      return (s"Published View ${dataSourceName} is not deleted ", responseDeletePub.code.code, "")
    } else {
      log.info(s"Published View deleted : ${publishedViewLocation}")
    }

    // delete view

    val requestDeleteDS = basicRequest
      .auth.basic(tdvUsername, tdvPassword)
      .contentType("application/json")
      .body(payload.DeleteDataView(orgId, dataSourceName).soapMessage)
      .delete(uri"$uriRestDataview?ifExists=true")

    val responseDeleteDS = requestDeleteDS.send(sttpBackend)

    if (responseDeleteDS.code.code != 200) {
      return (s"Dataset View ${dataSourceName} is not deleted ", responseDeleteDS.code.code, responseDeleteDS.body.getOrElse(""))
    } else {
      log.info(s"Dataset View deleted : ${dataviewLocation}")
    }


    // introspect and delete
    val intros = introspectCsvDataSourceRemoved(dataFileName, dataSourceName, orgId)
    val rss = s"/shared/org_${orgId}/CSV/${dataFileName}"
    if (intros) {
      sttpBackend.close()

      log.info(s"Exiting ${className}")
      log.info("Delete REDIS entry")
      val key = s"$orgId-$dataSourceName"
      withRedis { jedis =>
        jedis.select(6)
        jedis.del(key)
      }
      (s"Resource ${dataSourceName} is deleted ", 0, rss)
    } else {
      (s"Resource ${dataSourceName} is not deleted ", 100, rss)
    }
  }

  def getDataSourceSchema(orgId: String, dataSourceName: String): (String, Int, TDV) = {
    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()

    import io.circe.{Decoder, HCursor}
    log.info("retrieving schema information")

    val nulTdv = TDV(List(SchemaTdv("","",0,0)))
    val requestSchema = basicRequest
      .auth.basic(tdvUsername, tdvPassword)
      .contentType("application/json")
      .body(payload.queryColsPayload(orgId, dataSourceName))
      .post(uri"$uriExecuteQuery")

    var requestSchemaResponse: Identity[Response[Either[String, String]]] = null

    Try {
      requestSchemaResponse = requestSchema.send(sttpBackend)
    } match {
      case Failure(exception) => exception match {
        case re: ReadException => {
          log.error(s"ReadException : ${re.toString}")
          return (s"ReadException : ${re.toString}", 500, nulTdv)
        }
        case ce: ConnectException => {
          log.error(s"ConnectException : ${ce.toString}")
          return (s"ConnectException : ${ce.toString}", 500, nulTdv)
        }
        case _ => {
          log.error(s"Unknown exception")
          return (s"Unknown exception...good luck", 500, nulTdv)
        }
      }
      case Success(value) => log.info("Request success")
    }
    requestSchemaResponse.body match {
      case Right(value) => {
        log.info("Cols retrieved")
        implicit val decoder: Decoder[SchemaTdv] = { (hCursor: HCursor) =>
          for {
            f <- hCursor.as[(String, String, Double, Double)]
          } yield SchemaTdv(f._1, f._2, f._3, f._4)
        }

        var tt: TDV = null
        io.circe.parser.decode[List[SchemaTdv]](value) match {
          case Right(schemas) => {
            tt = TDV(schemas)
            sttpBackend.close()
            ("Retrieving Schema OK", 0, tt)
          }
          case Left(ex) => {
            log.error(s"Oops something is wrong with decoding value ${ex}")
            sttpBackend.close()
            ("Error Decoding Schema", 120, nulTdv)
          }
        }

      }
      case Left(err) => {
        log.error(s"${err} with code ${requestSchemaResponse.code}")
        sttpBackend.close()
        ("Error Retrieving Schema", 120, nulTdv)
      }
    }

  }

  def getDataSourcePreview(orgId: String, dataSourceName: String): (String, Int) = {
    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    log.info("get schema first")
    val schemaDS: (String, Int, TDV) = getDataSourceSchema(orgId, dataSourceName)

    log.info("retrieving data for preview")
    val requestData = basicRequest
      .auth.basic(tdvUsername, tdvPassword)
      .contentType("application/json")
      .body(payload.queryViewPayload(orgId, dataSourceName))
      .post(uri"$uriExecuteQuery")

    log.info("Body : " + payload.queryViewPayload(orgId, dataSourceName))
    val requestDataResponse = requestData.send(sttpBackend)

    implicit val anyDecoder: Decoder[Any] = Decoder.instance(c => {
      c.focus match {
        case Some(x) => Right(x)
        case None => Left(DecodingFailure("Could not parse", List()))
      }
    })

    implicit val decoderRaw: Decoder[RawData] = (hCursor: HCursor) => for {
      data <- hCursor.as[List[Any]]
    } yield RawData(data.map(_.toString().replaceAll("\"", "")))


    var dataList: List[RawData] = null


    //var dataFull: List[(String, String)] = null

    //var dataFull: ListBuffer[ListBuffer[Map[String, String]]] = new ListBuffer[ListBuffer[Map[String, String]]]()
    var dataFull: ListBuffer[ListBuffer[immutable.ListMap[String, String]]] = new ListBuffer[ListBuffer[immutable.ListMap[String, String]]]()
    requestDataResponse.body match {
      case Left(err) => {
        sttpBackend.close()
        log.error(s"Ooooops i did it again BritneySpears© $err - ${requestDataResponse.code.code}")
        (err, 120)
      }
      case Right(value) => {
        io.circe.parser.decode[List[RawData]](value) match {
          case Right(form) => dataList = form
          case Left(ex) => println(s"Ooops something happened ${ex}")
        }
        ///

        var dataFullInner: ListBuffer[immutable.ListMap[String, String]] = new ListBuffer[immutable.ListMap[String, String]]()
        dataList.foreach(f => {
          //var dataFullInner: ListBuffer[Map[String, String]]= new ListBuffer[Map[String, String]]()
          //var dataFullInner: ListBuffer[immutable.ListMap[String, String]] = new ListBuffer[immutable.ListMap[String, String]]()
          var row = immutable.ListMap[String, String]()
          for ((key, index) <- f.data.zipWithIndex) {
            //println(s"$key, $index")
            // Array have the same size
            // zip start with 0
            row += (schemaDS._3.schema(index).COLUMN_NAME -> key)
            //dataFullInner += row
          }
          dataFullInner += row
          //dataFull += dataFullInner
        }
        )
        ///
        log.info("OK baby")
        //(value,0)
        sttpBackend.close()
        (dataFullInner.asJson.noSpaces, 0)
      }
    }

  }

  def getDataSourcePreviewV2(orgId: String, dataSourceName: String): (String, Int) = {
    log.info("getDataSourcePreviewV2")
    val datasetsData: String = new Table2Json(orgId, dataSourceName).get()

    log.info(datasetsData)
    var dataList: Json = Json.Null
    io.circe.parser.parse(datasetsData) match {
      case Right(form) => dataList = form
      case Left(ex) => {
        log.error(s"Ooops something happened ${ex}")
        return ("", 120)
      }
    }

    if (dataList.asJson.isNull || dataList.asJson.noSpaces.equals("{}")) return (dataList.asJson.noSpaces, 404) else {
      (dataList.asJson.noSpaces, 0)
    }

  }

  def getManagedDataSetsDetails(orgId: String, dataSourceName: String): (String, Int, tdvJob) = {

    log.info("Retrieving key from REDIS")
    val emptyTdv = new tdvJob(
      Some(""),
      Some(""),
      Some(""),
      Some(""),
      "",
      Some(""),
      new DatasetSourceTdv(Some(""), Some(""), Some(""), Some(""), "", "", Some(""), Some(""), Some(""), Some("")),
      "",
      Some(0L)
    )

    val key = s"$orgId-$dataSourceName"
    var fetchRes: String = ""
    withRedis { jedis =>
      jedis.select(6)
      if (jedis.exists(key)) {
        fetchRes = jedis.get(key)
      }
    }

    log.info(fetchRes)
    if (!fetchRes.isEmpty) {
      log.info(":::key Found:::")
      io.circe.parser.decode[tdvJob](fetchRes) match {
        case Left(value) => {
          log.error("Error in parsing")
          return ("Key found but parsing in error", 130, emptyTdv)
        }
        case Right(value) => {
          log.info("Yipicai")
          return ("Key found", 0, value)
        }
      }

    } else {
      return ("Key not found", 120, emptyTdv)
    }

  }

  def getUnManagedDataSetsDetails(orgId: String, dataSourceName: String): (String, Int, UnManageDataSetInfoStored) = {

    log.info("Retrieving key from REDIS")

    val time = Instant.now().getEpochSecond
    val emptyTdv = new UnManageDataSetInfoStored(
      s"",
      s"",
      s"",
      s"",
      s"",
      time
    )


    val key = s"umo-$orgId-$dataSourceName"
    var fetchRes: String = ""
    withRedis { jedis =>
      jedis.select(6)
      if (jedis.exists(key)) {
        fetchRes = jedis.get(key)
      }
    }

    log.info(fetchRes)
    if (!fetchRes.isEmpty) {
      log.info(":::key Found:::")
      io.circe.parser.decode[UnManageDataSetInfoStored](fetchRes) match {
        case Left(value) => {
          log.error("Error in parsing")
          ("Key found but parsing in error", 130, emptyTdv)
        }
        case Right(value) => {
          log.info("Yipicai")
          ("Key found", 0, value)
        }
      }

    } else {
      ("Key not found", 120, emptyTdv)
    }

  }

  def copyUnManaged(config: UnManageDataSetCopy): (String, Int, String) = {

    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    log.info(config.toString)

    def uuid = java.util.UUID.randomUUID.toString
    val datasetId = normalizerString(s"${config.DatasetName}-${uuid}")

    val orgID = config.Organization.toLowerCase
    val originalDsName = config.DatasetName
    val originalPath = config.DatasetPath
    val orginalAnnotation = config.Annotation.getOrElse("Empty")

    val fromDsName = originalPath.split("/").last

   val copyRequest = basicRequest
     .auth.basic(tdvUsername, tdvPassword)
     .header("SOAPAction", payload.copyLink(orgID, fromDsName, datasetId).soapAction)
     .body(payload.copyLink(orgID, fromDsName, datasetId).soapMessage)
     .post(uri"${uriResource}")

    val copyResponse = copyRequest.send(sttpBackend)

    if(copyResponse.code.code != 200)  return ("Error", 120, "")
    import java.time.Instant
    val time = Instant.now().getEpochSecond
    val data = new UnManageDataSetInfoStored(
      s"${datasetId}",
      s"${originalDsName}",
      s"${orginalAnnotation}",
      s"${originalPath}",
      s"${orgID}",
      time
    )
    withRedis{ jedis =>
      jedis.select(6)
      jedis.set(s"umo-${orgID}-${datasetId}",data.asJson.spaces2)
      jedis.close()
    }
    return ("View added", 0, datasetId)

  }

  def getAllManagedDatasets(orgId: String): (String, Int, List[ManagedDatasetsInfo]) = {

    var keysList: ListBuffer[String] = new ListBuffer[String]()
    var dsInfo : ListBuffer[ManagedDatasetsInfo] = new ListBuffer[ManagedDatasetsInfo]()

    withRedis{ jedis =>
      jedis.select(6)
      val scanParams: ScanParams = new ScanParams().count(10).`match`(s"${orgId.toLowerCase}-*")
      var cursor = ScanParams.SCAN_POINTER_START
      breakable{
        do {
          // scan
          val resultSets: ScanResult[String] = jedis.scan(cursor, scanParams)
          // get next cursor
          cursor = resultSets.getCursor
          // get keys
          val resultList: util.List[String] = resultSets.getResult
          // append the list
          resultList.toArray.foreach(keyVal => keysList += keyVal.toString)
        } while (!cursor.equals(ScanParams.SCAN_POINTER_START))
      }
      log.info("keys :")
      keysList.foreach(f => log.info(f))
      for (ds <- keysList ) {
           val details = jedis.get(ds)
           //parse json
        io.circe.parser.decode[tdvJob](details) match {
          case Left(value) => {
            log.error(s"Failed parsing value of key $ds")
            return ("Error", 120, List(ManagedDatasetsInfo("", "", "", 0L)))
          }
          case Right(value) => {
            val dsId =  value.DatasetID.getOrElse("")
            val dsDesc = value.DatasetDescription.getOrElse("")
            val dsName = value.DatasetName
            val dsTime = value.CreationTime.getOrElse(0L)
            log.info(s" value for $ds -- $dsId,$dsDesc,$dsName")
            dsInfo += ManagedDatasetsInfo(dsId, dsName, dsDesc, dsTime)
          }
        }
      }
    jedis.close()
    }
    return ("OK", 0,dsInfo.toList)
  }

  //TODO
  def getAllUnManagedDatasets(orgId: String): (String, Int, List[ManagedDatasetsInfo]) = {

    var keysList: ListBuffer[String] = new ListBuffer[String]()
    var dsInfo : ListBuffer[ManagedDatasetsInfo] = new ListBuffer[ManagedDatasetsInfo]()

    withRedis{ jedis =>
      jedis.select(6)
      val scanParams: ScanParams = new ScanParams().count(10).`match`(s"umo-${orgId.toLowerCase}-*")
      var cursor = ScanParams.SCAN_POINTER_START
      breakable{
        do {
          // scan
          val resultSets: ScanResult[String] = jedis.scan(cursor, scanParams)
          // get next cursor
          cursor = resultSets.getCursor
          // get keys
          val resultList: util.List[String] = resultSets.getResult
          // append the list
          resultList.toArray.foreach(keyVal => keysList += keyVal.toString)
        } while (!cursor.equals(ScanParams.SCAN_POINTER_START))
      }
      for (ds <- keysList ) {
        val details = jedis.get(ds)
        //parse json
        io.circe.parser.decode[UnManageDataSetInfoStored](details) match {
          case Left(value) => {
            log.error(s"Failed parsing value of key $ds")
            return ("Error", 120, List(ManagedDatasetsInfo("", "", "", 0L)))
          }
          case Right(value) => {
            val dsId =  value.DatasetId
            val dsDesc = value.Annotation
            val dsName = value.DatasetName
            val dsTime = value.CreationTme
            dsInfo += ManagedDatasetsInfo(dsId, dsName, dsDesc, dsTime)
          }
        }
      }
      jedis.close()
    }
    return ("OK", 0, dsInfo.toList)
  }

  def getPublishedViewsOrg(orgId: String): (String, Int, List[PublishedViews]) = {
    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    import io.circe.{Decoder, HCursor}
    log.info("retrieving list of views")

    val requestDSView = basicRequest
      .auth.basic(tdvUsername, tdvPassword)
      .contentType("application/json")
      .body(payload.getUnmanagedPublishedView(orgId))
      .post(uri"$uriExecuteQuery")

    val requestDSViewResponse = requestDSView.send(sttpBackend)

    requestDSViewResponse.body match {
      case Right(value) => {
        log.info("Datasets Retrieved")
        implicit val decoder: Decoder[PublishedViews] = { (hCursor: HCursor) =>
          for {
            f <- hCursor.as[(String, Option[String], String, Long, Long)]
          } yield PublishedViews(f._1, f._2.getOrElse("Empty Annotation"), f._3, f._4, f._5)
        }

        var tt: List[PublishedViews] = null
        io.circe.parser.decode[List[PublishedViews]](value) match {
          case Right(schemas) => {
            tt = schemas
            sttpBackend.close()
            ("Retrieving Unmanaged Datasets OK", 0, tt)
          }
          case Left(ex) => {
            sttpBackend.close()
            log.error(s"Oops something is wrong with decoding value ${ex}")
            ("Error Decoding Unmanaged Datasets", 120, null)
          }
        }

      }
      case Left(err) => {
        sttpBackend.close()
        log.error(s"${err} with code ${requestDSViewResponse.code}")
        ("Error Retrieving Unmanaged Datasets", 120, null)
      }
    }

  }

  /**
   * @param dataSourcePath S3 path to the file (CSV)
   * @param dataSourceName A Given Name (like the Dataset Name)
   * @param orgId          (Subscription Locator or ID)
   */
  def introspectCsvDataSource(dataSourcePath: String, dataSourceName: String, orgId: String, config: tdvJob, action: String): Boolean = {
    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    val _init: Boolean = init()
    if (_init) {
      val requestClearCache: Request[Either[String, String], Any] = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.ClearIntrospectionCachePayload(orgId).soapAction)
        .body(payload.ClearIntrospectionCachePayload(orgId).soapMessage)
        .post(uri"${uriResource}")

      val responseClearCache: Identity[Response[Either[String, String]]] = requestClearCache.send(sttpBackend)

      if (responseClearCache.code != StatusCode.Ok) throw new Exception("Big Bisous")

      //log.info("payload : " + payload.GetIntrospectableTaskPayload(dataSourceName, orgId).soapMessage)
      val requestgetIntrospectableResourceIdsTask = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.GetIntrospectableTaskPayload(orgId).soapAction)
        .body(payload.GetIntrospectableTaskPayload(orgId).soapMessage)
        .post(uri"${uriResource}")

      val responseGetIntrospectableRssIdsTask = requestgetIntrospectableResourceIdsTask.send(sttpBackend)

      if (responseGetIntrospectableRssIdsTask.code != StatusCode.Ok) throw new Exception("Big Bisous 2")

      val taskId1Raw: Elem = XML.loadString(responseGetIntrospectableRssIdsTask.body.getOrElse(""))
      val taskId1: ParseResult[getIntrospectableResourceIdsTaskResponseFmt] = XmlReader.of[getIntrospectableResourceIdsTaskResponseFmt].read(taskId1Raw)
      var _taskId1 = ""
      taskId1 match {
        case ParseSuccess(get) => {
          log.info("Task ID : " + get.taskId.getOrElse(""))
          _taskId1 = get.taskId.getOrElse("")
        }
        case ParseFailure(errors) => log.error(errors.toString())
        case PartialParseSuccess(get, errors) => log.error(errors.toString())
      }

      if (_taskId1 == "") {
        sttpBackend.close()
        throw new Exception("Task id GetIntrospectableTaskPayload for is null")
      }
      //check response if completed
      var statusInstropectable = false
      while (!statusInstropectable) {
        val requestgetIntrospectableResourceIdsResults = basicRequest
          .cookies(tdvAuthCookie)
          .header("SOAPAction", payload.getIntrospectableResult(_taskId1).soapAction)
          .body(payload.getIntrospectableResult(_taskId1).soapMessage)
          .post(uri"${uriResource}")

        val responsegetIntrospectableResourceIdsResults = requestgetIntrospectableResourceIdsResults.send(sttpBackend)
        if (responsegetIntrospectableResourceIdsResults.code != StatusCode.Ok) {
          sttpBackend.close()
          throw new Exception("Big Bisous 4")
        }
        val statusRaw = XML.loadString(responsegetIntrospectableResourceIdsResults.body.getOrElse(""))
        val status1: ParseResult[getIntrospectableResourceIdsResultResponseFmt] = XmlReader.of[getIntrospectableResourceIdsResultResponseFmt].read(statusRaw)
        var _status1 = ""
        status1 match {
          case ParseSuccess(get) => {
            log.info("Task ID : " + get.completed.getOrElse(""))
            _status1 = get.completed.getOrElse("")
          }
          case ParseFailure(errors) => log.error(errors.toString())
          case PartialParseSuccess(get, errors) => log.error(errors.toString())
        }

        if (_status1 == "") {
          sttpBackend.close()
          throw new Exception("_status1 is null")
        }
        if (_status1 == "false") Thread.sleep(1000)
        if (_status1 == "true") statusInstropectable = true
      }
      //keep calm and carry on

      //log.info("payload : " + payload.IntrospectRssTask(dataSourceName, orgId, dataSourcePath).soapMessage)
      val requestGetintrospectResourcesTask = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.IntrospectRssTask(orgId, dataSourcePath, config, action).soapAction)
        .body(payload.IntrospectRssTask(orgId, dataSourcePath, config, action).soapMessage)
        .post(uri"${uriResource}")
      val responseGetintrospectResourcesTask = requestGetintrospectResourcesTask.send(sttpBackend)

      if (responseGetintrospectResourcesTask.code != StatusCode.Ok) {
        sttpBackend.close()
        throw new Exception("Big Bisous 3")
      }

      val taskId2Raw: Elem = XML.loadString(responseGetintrospectResourcesTask.body.getOrElse(""))
      val taskId2: ParseResult[introspectResourcesTaskResponseFmt] = XmlReader.of[introspectResourcesTaskResponseFmt].read(taskId2Raw)
      var _taskId2 = ""
      taskId2 match {
        case ParseSuccess(get) => {
          log.info("Task ID : " + get.taskId.getOrElse(""))
          _taskId2 = get.taskId.getOrElse("")
        }
        case ParseFailure(errors) => log.error(errors.toString())
        case PartialParseSuccess(get, errors) => log.error(errors.toString())
      }

      if (_taskId2 == "") {
        sttpBackend.close()
        throw new Exception("Task id is null")
      }
      // still good ? cool
      var statusInstropected = false
      while (!statusInstropected) {
        val requestIntrospectedResourceResults = basicRequest
          .cookies(tdvAuthCookie)
          .header("SOAPAction", payload.getInstrospectionResult(_taskId2).soapAction)
          .body(payload.getInstrospectionResult(_taskId2).soapMessage)
          .post(uri"${uriResource}")

        val responseIntrospectedResourceResults = requestIntrospectedResourceResults.send(sttpBackend)
        if (responseIntrospectedResourceResults.code != StatusCode.Ok) {
          sttpBackend.close()
          throw new Exception("Big Bisous 4")
        }
        val statusRaw = XML.loadString(responseIntrospectedResourceResults.body.getOrElse(""))
        val status2: ParseResult[introspectResourcesResultResponseFmt] = XmlReader.of[introspectResourcesResultResponseFmt].read(statusRaw)
        var _status2 = ""
        status2 match {
          case ParseSuccess(get) => {
            log.info("Task ID : " + get.completed.getOrElse(""))
            _status2 = get.completed.getOrElse("")
          }
          case ParseFailure(errors) => log.error(errors.toString())
          case PartialParseSuccess(get, errors) => log.error(errors.toString())
        }

        if (_status2 == "") throw new Exception("_status2 is null")
        if (_status2 == "false") Thread.sleep(1000)
        if (_status2 == "true") statusInstropected = true
      }

    } else {
      return false
    }

    val _close: Boolean = close()
    if (_close) {
      sttpBackend.close()
      log.info("Introspection Done")
      true
    } else {
      sttpBackend.close()
      false
    }
  }


  def introspectCsvDataSourceRemoved(dataSourcePath: String, dataSourceName: String, orgId: String): Boolean = {
    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    val _init: Boolean = init()
    if (_init) {
      val requestClearCache: Request[Either[String, String], Any] = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.ClearIntrospectionCachePayload(orgId).soapAction)
        .body(payload.ClearIntrospectionCachePayload(orgId).soapMessage)
        .post(uri"${uriResource}")

      val responseClearCache: Identity[Response[Either[String, String]]] = requestClearCache.send(sttpBackend)

      if (responseClearCache.code != StatusCode.Ok) {
        sttpBackend.close()
        throw new Exception("Big Bisous")
      }

      //log.info("payload : " + payload.GetIntrospectableTaskPayload(dataSourceName, orgId).soapMessage)
      val requestgetIntrospectableResourceIdsTask = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.GetIntrospectableTaskPayload(orgId).soapAction)
        .body(payload.GetIntrospectableTaskPayload(orgId).soapMessage)
        .post(uri"${uriResource}")

      val responseGetIntrospectableRssIdsTask = requestgetIntrospectableResourceIdsTask.send(sttpBackend)

      if (responseGetIntrospectableRssIdsTask.code != StatusCode.Ok) {
        sttpBackend.close()
        throw new Exception("Big Bisous 2")
      }

      val taskId1Raw: Elem = XML.loadString(responseGetIntrospectableRssIdsTask.body.getOrElse(""))
      val taskId1: ParseResult[getIntrospectableResourceIdsTaskResponseFmt] = XmlReader.of[getIntrospectableResourceIdsTaskResponseFmt].read(taskId1Raw)
      var _taskId1 = ""
      taskId1 match {
        case ParseSuccess(get) => {
          log.info("Task ID : " + get.taskId.getOrElse(""))
          _taskId1 = get.taskId.getOrElse("")
        }
        case ParseFailure(errors) => log.error(errors.toString())
        case PartialParseSuccess(get, errors) => log.error(errors.toString())
      }

      if (_taskId1 == "") {
        sttpBackend.close()
        throw new Exception("Task id GetIntrospectableTaskPayload for is null")
      }
      //check response if completed
      var statusInstropectable = false
      while (!statusInstropectable) {
        val requestgetIntrospectableResourceIdsResults = basicRequest
          .cookies(tdvAuthCookie)
          .header("SOAPAction", payload.getIntrospectableResult(_taskId1).soapAction)
          .body(payload.getIntrospectableResult(_taskId1).soapMessage)
          .post(uri"${uriResource}")

        val responsegetIntrospectableResourceIdsResults = requestgetIntrospectableResourceIdsResults.send(sttpBackend)
        if (responsegetIntrospectableResourceIdsResults.code != StatusCode.Ok) {
          sttpBackend.close()
          throw new Exception("Big Bisous 4")
        }
        val statusRaw = XML.loadString(responsegetIntrospectableResourceIdsResults.body.getOrElse(""))
        val status1: ParseResult[getIntrospectableResourceIdsResultResponseFmt] = XmlReader.of[getIntrospectableResourceIdsResultResponseFmt].read(statusRaw)
        var _status1 = ""
        status1 match {
          case ParseSuccess(get) => {
            log.info("Task ID : " + get.completed.getOrElse(""))
            _status1 = get.completed.getOrElse("")
          }
          case ParseFailure(errors) => log.error(errors.toString())
          case PartialParseSuccess(get, errors) => log.error(errors.toString())
        }

        if (_status1 == "") throw new Exception("_status1 is null")
        if (_status1 == "false") Thread.sleep(1000)
        if (_status1 == "true") statusInstropectable = true
      }
      //keep calm and carry on

      //log.info("payload : " + payload.IntrospectRssTask(dataSourceName, orgId, dataSourcePath).soapMessage)
      val requestGetintrospectResourcesTask = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.IntrospectRssTaskRemove(orgId, dataSourcePath).soapAction)
        .body(payload.IntrospectRssTaskRemove(orgId, dataSourcePath).soapMessage)
        .post(uri"${uriResource}")
      val responseGetintrospectResourcesTask = requestGetintrospectResourcesTask.send(sttpBackend)

      if (responseGetintrospectResourcesTask.code != StatusCode.Ok) {
        sttpBackend.close()
        throw new Exception("Big Bisous 3")
      }

      val taskId2Raw: Elem = XML.loadString(responseGetintrospectResourcesTask.body.getOrElse(""))
      val taskId2: ParseResult[introspectResourcesTaskResponseFmt] = XmlReader.of[introspectResourcesTaskResponseFmt].read(taskId2Raw)
      var _taskId2 = ""
      taskId2 match {
        case ParseSuccess(get) => {
          log.info("Task ID : " + get.taskId.getOrElse(""))
          _taskId2 = get.taskId.getOrElse("")
        }
        case ParseFailure(errors) => log.error(errors.toString())
        case PartialParseSuccess(get, errors) => log.error(errors.toString())
      }

      if (_taskId2 == "") {
        sttpBackend.close()
        throw new Exception("Task id is null")
      }
      // still good ? cool
      var statusInstropected = false
      while (!statusInstropected) {
        val requestIntrospectedResourceResults = basicRequest
          .cookies(tdvAuthCookie)
          .header("SOAPAction", payload.getInstrospectionResult(_taskId2).soapAction)
          .body(payload.getInstrospectionResult(_taskId2).soapMessage)
          .post(uri"${uriResource}")

        val responseIntrospectedResourceResults = requestIntrospectedResourceResults.send(sttpBackend)
        if (responseIntrospectedResourceResults.code != StatusCode.Ok) {
          sttpBackend.close()
          throw new Exception("Big Bisous 4")
        }
        val statusRaw = XML.loadString(responseIntrospectedResourceResults.body.getOrElse(""))
        val status2: ParseResult[introspectResourcesResultResponseFmt] = XmlReader.of[introspectResourcesResultResponseFmt].read(statusRaw)
        var _status2 = ""
        status2 match {
          case ParseSuccess(get) => {
            log.info("Task ID : " + get.completed.getOrElse(""))
            _status2 = get.completed.getOrElse("")
          }
          case ParseFailure(errors) => log.error(errors.toString())
          case PartialParseSuccess(get, errors) => log.error(errors.toString())
        }

        if (_status2 == "") throw new Exception("_status2 is null")
        if (_status2 == "false") Thread.sleep(1000)
        if (_status2 == "true") statusInstropected = true
      }

    } else {
      return false
    }

    val _close: Boolean = close()
    if (_close) {
      sttpBackend.close()
      log.info("Introspection Done")
      true
    } else {
      sttpBackend.close()
      false
    }
  }

  /**
   * @return true or false if auth is ok
   */
  def init(): Boolean = {
    // call begin Session and Begin transaction
    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    log.info("Init Session")
    var sessionOK: Boolean = false
    var transactionOK: Boolean = false
    val requestSession: Request[Either[String, String], Any] = basicRequest
      .auth.basic(tdvUsername, tdvPassword)
      .header("SOAPAction", payload.BeginSessionPayload().soapAction)
      .body(payload.BeginSessionPayload().soapMessage)
      .post(uri"${uriSession}")

    val responseSession: Identity[Response[Either[String, String]]] = requestSession.send(sttpBackend)

    responseSession.body match {
      case Right(value) => {
        log.debug(s"$value")
        tdvAuthCookie = responseSession.unsafeCookies
        sessionOK = true
      }
      case Left(fail) => throw new Exception(s"Tdv Session Failed with ${responseSession.body.toString}")
    }

    if (sessionOK) {
      log.info("Init transaction")
      val requestTransaction = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.BeginTransactionPayload().soapAction)
        .body(payload.BeginTransactionPayload().soapMessage)
        .post(uri"${uriSession}")

      val responseTransaction: Identity[Response[Either[String, String]]] = requestTransaction.send(sttpBackend)

      responseTransaction.body match {
        case Right(value) => {
          transactionOK = true
          sttpBackend.close()
        }
        case Left(fail) => throw new Exception(s"Tdv Session Failed with ${responseTransaction.body.toString}")
      }
    }

    // stupid and useless©
    if (transactionOK && sessionOK) {
      true
    } else {
      false
    }


  }

  def close(): Boolean = {
    val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()
    // call End Session and End transaction

    // call begin Session and Begin transaction

    var sessionOK: Boolean = false
    var transactionOK: Boolean = false
    val requestTransaction: Request[Either[String, String], Any] = basicRequest
      .cookies(tdvAuthCookie)
      .header("SOAPAction", payload.CloseTransaction().soapAction)
      .body(payload.CloseTransaction().soapMessage)
      .post(uri"${uriSession}")

    val responseTransaction: Identity[Response[Either[String, String]]] = requestTransaction.send(sttpBackend)

    responseTransaction.body match {
      case Right(value) => {
        log.info("Closing Transaction")
        transactionOK = true
      }
      case Left(fail) => throw new Exception(s"Tdv Session Failed with ${responseTransaction.body.toString}")
    }

    if (transactionOK) {
      log.info("Closing Session")
      val requestSession = basicRequest
        .cookies(tdvAuthCookie)
        .header("SOAPAction", payload.CloseSession().soapAction)
        .body(payload.CloseSession().soapMessage)
        .post(uri"${uriSession}")

      val responseSession: Identity[Response[Either[String, String]]] = requestSession.send(sttpBackend)

      responseSession.body match {
        case Right(value) => {
          sttpBackend.close()
          sessionOK = true
        }
        case Left(fail) => throw new Exception(s"Tdv Session Failed with ${fail}")
      }
    }

    // stupid and useless©
    if (transactionOK && sessionOK) {
      //clear cookie
      tdvAuthCookie = immutable.Seq.empty[CookieWithMeta]
      true
    } else {
      false
    }


  }

  def withRedis[T](f: Jedis => T): T = {
    val jedis = new Jedis("redis-service", 6379)
    try {
      f(jedis)
    } finally {
      jedis.close()
    }
  }

  def normalizerString(aString: String): String = {
    org.apache.commons.lang3.StringUtils.stripAccents(aString.replaceAll("[ ,;{}()\n\t=._+]+", "_")).toLowerCase
  }

}
