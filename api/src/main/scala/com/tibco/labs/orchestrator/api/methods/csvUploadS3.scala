package com.tibco.labs.orchestrator.api.methods

import akka.http.scaladsl.server.directives.FileInfo
import akka.stream.alpakka.csv.scaladsl.CsvParsing
import akka.stream.alpakka.s3.scaladsl.S3
import akka.stream.alpakka.s3.{ListBucketResultContents, MultipartUploadResult, ObjectMetadata}
import akka.stream.scaladsl.{Sink, Source}
import akka.util.ByteString
import akka.{Done, NotUsed}
import com.amazonaws.services.s3.model._
import com.tibco.labs.orchestrator.Server.system.executionContext
import com.tibco.labs.orchestrator.conf.DiscoverConfig
import com.tibco.labs.orchestrator.models.{ListBucket, S3Content, redisFileInfo}
import org.slf4j.{Logger, LoggerFactory}
import redis.clients.jedis.ScanParams

import java.io.{BufferedReader, InputStreamReader}
import java.{util => jutil}
import scala.collection.mutable.ListBuffer
import scala.collection.{immutable, mutable}
import scala.concurrent.duration.{Duration, DurationInt}
import scala.concurrent.{Await, Future}
import scala.util.control.Breaks.breakable
import scala.util.{Failure, Success, Try}

class csvUploadS3() {

  import com.tibco.labs.orchestrator.Server.materializer
  import com.tibco.labs.orchestrator.utils.Redis._

  val bucketName: String = DiscoverConfig.config.backend.storage.filesystem.s3_bucket
  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)

  def list(id: String): S3Content = {

    log.info(s"bucket to scan " + bucketName + "/" + id)
    val keySource: Source[ListBucketResultContents, NotUsed] = S3.listBucket(bucketName, Some(id))
    var result: S3Content = S3Content(List(ListBucket("", "", "", 0, "", "")))
    val futurRes: Future[immutable.IndexedSeq[ListBucketResultContents]] = keySource.runWith(Sink.collection)

    val f2: Future[immutable.IndexedSeq[ListBucketResultContents]] = futurRes andThen {
      case Failure(exception) => {
        log.error(s"Failure to complete S3 list bucket ${exception.getMessage}")
        result = S3Content(List(ListBucket("", "", "", 0, "", "")))
      }
      case Success(value) => {
        //log.info("Success" + value.toList)
        result = S3Content(seqOfListBucketResultContentsToSeqListBucket(value))
        log.info(result.toString)
      }
    }

    Await.ready(futurRes, Duration.Inf)
    Await.ready(f2, Duration.Inf)

    log.info(s"before return ${result.list}")
    log.info(s"before return ${result.toString}")
    result
  }

  def listInRedis(id: String): (String, Int, List[redisFileInfo]) = {
    log.info("listInRedis")
    var keysList: ListBuffer[String] = new ListBuffer[String]()
    var dsInfo: ListBuffer[redisFileInfo] = new ListBuffer[redisFileInfo]()

    withRedis { jedis =>
      jedis.select(7)
      val scanParams: ScanParams = new ScanParams().count(10).`match`(s"${id.toLowerCase}:*")
      var cursor = ScanParams.SCAN_POINTER_START
      breakable {
        do {
          // scan
          val resultSets = jedis.scan(cursor, scanParams)
          // get next cursor
          cursor = resultSets.getCursor
          // get keys

          val resultList: jutil.List[String] = resultSets.getResult
          // append the list
          resultList.toArray.foreach(keyVal => keysList += keyVal.toString)
        } while (!cursor.equals(ScanParams.SCAN_POINTER_START))
      }
      log.info("keys :")
      keysList.foreach(f => log.info(f))
      import collection.JavaConverters._
      for (ds <- keysList) {
        val details: mutable.Map[String, String] = jedis.hgetAll(ds).asScala
        //return ("Error", 120, List(redisFileInfo("", "", "", "","", "", "", "","","","")))
        Try {
          dsInfo += redisFileInfo(
            details("ContentType"),
            details("LastModified"),
            details("OriginalFilename"),
            details("OriginalEncoding"),
            details("FileSize"),
            details("newline"),
            details("EscapeChar"),
            details("QuoteChar"),
            details("Separator"),
            details("Encoding"),
            details("OriginalNewLine"),
            details("FileLocation")
          )
        } match {
          case Failure(exception) => (s"Error : ${exception}", 120, List(redisFileInfo("", "", "", "","", "", "", "","","","", "")))
          case Success(value) => dsInfo = value
        }

      }
      jedis.close
    }
    ("ok", 0, dsInfo.toList)
  }

  def delete(id: String, file: String): (String, String, Int) = {

    log.info(s"inner delete method ${id}/$file")
    val regexCsv = "\\.csv".r
    val nFileName = regexCsv.replaceAllIn(file.toLowerCase, "")
    val filekey = id.toLowerCase + "/" + normalizerString(nFileName) + ".csv"
    val redKey = id.toLowerCase + ":" + normalizerString(nFileName) + ".csv"

    val delFile: Source[Done, NotUsed] = S3.deleteObject(bucketName, filekey)
    val result: Future[Done] = delFile.runWith(Sink.head)
    Await.ready(result, Duration.Inf)
    var out: (String, Int) = ("", 0)
    result.onComplete {
      case Success(value) => {
        val msg = filekey + "  is deleted"
        withRedis{ jedis =>
          jedis.select(7)
          jedis.del(redKey)
          jedis.close()
        }
        out = (msg, 0)
      }
      case Failure(exception) => {
        val msg = filekey + " is not deleted with " + exception.getMessage
        out = (msg, 100)
      }
    }
    (out._1, file, out._2)

  }

  def uploadS3(id: String, fileInfo: FileInfo, body: Source[ByteString, Any], forms: Map[String, String]): (String, String, Int) = {
    import akka.stream.alpakka.csv.scaladsl.{CsvFormatting, CsvQuotingStyle}

    import java.nio.charset.{Charset, StandardCharsets}

    val BOM: Array[Byte] = Array(0xEF.toByte, 0xBB.toByte, 0xBF.toByte)
    val ByteOrderMark = ByteString.apply(0xEF.toByte, 0xBB.toByte, 0xBF.toByte)
    val maximumLineLength: Int = 10 * 1024
    //kubectl logs  spark-pm-997291-driver --namespace spark-operator
    // kubectl describe sparkapplications spark-pm-997291 --namespace spark-operator
    log.info(s"orgid : $id, file : ${normalizerString(fileInfo.fileName)}.csv ")
    log.info(s"extra : ${forms.toString()}")
    var out: (String, Int) = ("", 10)
    val regexCsv = "\\.csv".r
    val nFileName = regexCsv.replaceAllIn(fileInfo.fileName.toLowerCase, "")
    val filekey = id + "/" + normalizerString(nFileName) + ".csv"
    //var ret: MultipartUploadResult = null
    val s3Sink: Sink[ByteString, Future[MultipartUploadResult]] = S3.multipartUpload(bucketName, filekey)
    Try(Charset.forName(forms("encoding"))) match {
      case Failure(exception) => log.error("Fail to load charset")
      case Success(value) => log.info("Charset found successfull")
    }
    var firstLine = true
    val result: Future[MultipartUploadResult] =
      body
        /*
        .via(Framing.delimiter(ByteString(forms("newline").getBytes()(0)), 1024, allowTruncation = true))
        .map { bs =>
          val bs2 = if (firstLine && bs.startsWith(ByteOrderMark) && forms("encoding").equalsIgnoreCase("utf8")) bs.drop(3) else bs
          if (firstLine) firstLine = false
          bs2
        }
        .via(TextFlow.transcoding(Charset.forName(forms("encoding")), StandardCharsets.UTF_8))
        */
        .via(CsvParsing.lineScanner(
          forms("separator").getBytes()(0),
          forms("quoteChar").getBytes()(0),
          forms("escapeChar").getBytes()(0),
          maximumLineLength
        ))
        .map(_.map(_.utf8String))
        .via(CsvFormatting.format(
          forms("separator").charAt(0),
          forms("quoteChar").charAt(0),
          forms("escapeChar").charAt(0),
          "\r\n",
          CsvQuotingStyle.Always,
          StandardCharsets.UTF_8,
          None
        ))
        .runWith(s3Sink)(materializer)
    var mdata: Option[ObjectMetadata] = None
    var loc = ""
    Try(Await.ready(result, Duration.Inf)) match {
      case Success(f) => {
        f.value.get match {
          case Failure(exception) => {
            val err = exception.getMessage
            out = (err, 100)
            (s"Error on file ${fileInfo.fileName} during upload : ${out._1}", "", out._2)
          }
          case Success(value) => {
            loc = "s3a://" + value.bucket + "/" + value.key
            out = (loc, 0)
            log.info(s"A: ${out._1}")
            val metadata: Source[Option[ObjectMetadata], NotUsed] = S3.getObjectMetadata(value.bucket, value.key)
            val fmeta: Future[Option[ObjectMetadata]] = metadata.runWith(Sink.head)

            Try(Await.ready(fmeta, 2.seconds)) match {
              case Failure(exception) => log.error(s"Failed to retrieve metadata after upload ${exception.getMessage}")
              case Success(m) => {
                m.value.get match {
                  case Failure(exception) => log.error(s"Failed to retrieve metadata after upload ${exception.getMessage}")
                  case Success(value) => {
                    log.info("Metadata get success")
                    mdata = value
                    log.info(mdata.get.contentLength.toString)
                  }
                }

              }
            }
            // store in redis
            import collection.JavaConverters._
            withRedis { jedis =>
              jedis.select(7)
              jedis.hmset(s"${id.toLowerCase}:${normalizerString(nFileName)}.csv", Map(
                "Separator" -> forms("separator"),
                "QuoteChar" -> forms("quoteChar"),
                "EscapeChar" -> forms("escapeChar"),
                "Encoding" -> "UTF-8",
                "newline" -> "\\r\\n",
                "OriginalFilename" -> fileInfo.fileName,
                "OriginalEncoding" -> forms("encoding"),
                "OriginalNewLine" -> forms("newline"),
                "FileSize" -> mdata.get.contentLength.toString,
                "ContentType" -> mdata.get.contentType.getOrElse(""),
                "LastModified" -> mdata.get.lastModified.toString(),
                "FileLocation" -> loc
              ).asJava)
              jedis.close()
            }
            ("file has been uploaded", out._1, out._2)
          }
        }
      }
      case Failure(exception) => {
        (s"Error on file ${fileInfo.fileName} during upload : ${exception.getMessage}", "", 100)
      }
    }

  }

  def getFileContent(orgID: String, filename: String): (String, Int, String) = {
    import com.amazonaws.auth.{WebIdentityTokenCredentialsProvider => webInd}
    import com.amazonaws.services.s3.{AmazonS3, AmazonS3ClientBuilder}
    import com.amazonaws.AmazonServiceException
    import com.amazonaws.HttpMethod
    import com.amazonaws.SdkClientException
    import com.amazonaws.auth.profile.ProfileCredentialsProvider
    import com.amazonaws.regions.Regions
    import com.amazonaws.services.s3.AmazonS3
    import com.amazonaws.services.s3.AmazonS3ClientBuilder
    import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest
    import java.io.IOException
    import java.net.URL
    import java.time.Instant
    import jutil.Date

    Try {
      // create a S3 client
      val credentialProvider: webInd = new webInd()
      val s3Client: AmazonS3 = AmazonS3ClientBuilder.standard()
        .withCredentials(credentialProvider)
        .withRegion(DiscoverConfig.config.clouds.aws.region)
        .build()

      //get the org from the token
     // val checkOrg: (String, Int, String) = new LiveApps().validateLogin(token)

      //var orgId = ""
      //if (checkOrg._3.nonEmpty) orgId = s"${checkOrg._3.toLowerCase}" else return ("Error getting OrgId, check your credentials", 401, "")

      // Set the presigned URL to expire after one hour.
      val expiration = new Date
      var expTimeMillis = Instant.now.toEpochMilli
      expTimeMillis += 1000 * 60 * 60
      expiration.setTime(expTimeMillis)

      import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest
      val generatePresignedUrlRequest = new GeneratePresignedUrlRequest(bucketName, s"$orgID/$filename").withMethod(HttpMethod.GET).withExpiration(expiration)

    s3Client.generatePresignedUrl(generatePresignedUrlRequest)
    } match {
      case Failure(exception) => {
        logger.error(s"Error generating pre-signed url with ${exception.getMessage}")
        ("Error generating pre-signed url", 500, exception.getMessage)
      }
      case Success(value) => {
        logger.info("Yeah S3 generated URL for one hour")
        ("Signed url for 1 hour only", 0, value.toString)
      }
    }
  }

  def previewS3Files(orgId: String, fileName: String): (String, Int, List[String]) = {

    // use SDK v1.X because of  not being ported to v2 yet...see sbt file
    import com.amazonaws.auth.{WebIdentityTokenCredentialsProvider => webInd}
    import com.amazonaws.services.s3.{AmazonS3, AmazonS3ClientBuilder}
    import com.amazonaws.services.s3.model.{SelectObjectContentEvent, SelectObjectContentEventVisitor, SelectObjectContentResult}

    // create a S3 client
    val credentialProvider: webInd = new webInd()
    val s3Client: AmazonS3 = AmazonS3ClientBuilder.standard()
      .withCredentials(credentialProvider)
      .withRegion(DiscoverConfig.config.clouds.aws.region)
      .build()


    val QUERY = "select * from S3Object s LIMIT 100"
    val regexCsv = "\\.csv".r
    val nFileName = regexCsv.replaceAllIn(fileName.toLowerCase, "")
    val filekey = orgId.toLowerCase + "/" + normalizerString(nFileName) + ".csv"
    val redKey = orgId.toLowerCase + ":" + normalizerString(nFileName) + ".csv"

    import com.amazonaws.services.s3.model.SelectObjectContentRequest

    import java.util.concurrent.atomic.AtomicBoolean
    val request: (Boolean, SelectObjectContentRequest) = generateBaseCSVRequest(bucketName, filekey, QUERY, redKey)
    val isResultComplete: AtomicBoolean = new AtomicBoolean(false)

    val emptyList: List[String]  =  List[String]()
    if (!request._1) return  ("error - key not found", 404, emptyList)
    val result: SelectObjectContentResult = s3Client.selectObjectContent(request._2)


       val resStream: SelectRecordsInputStream =  result.getPayload.getRecordsInputStream(

        new SelectObjectContentEventVisitor() {

          override def visit(event: SelectObjectContentEvent.StatsEvent): Unit = {
            log.info(s"Received Stats, Bytes Scanned: ${event.getDetails().getBytesScanned()}")
            log.info(s"Bytes Processed: ${event.getDetails().getBytesProcessed()}")
          }

          override def visit(event: SelectObjectContentEvent.EndEvent): Unit = {
            isResultComplete.set(true)
            log.info("Received End Event. Result is complete.")
          }
        }
      )



    /*
     * The End Event indicates all matching records have been transmitted.
     * If the End Event is not received, the results may be incomplete.
     */
    if (!isResultComplete.get) log.error("S3 Select request was incomplete as End Event was not received.")

    val br:BufferedReader = new BufferedReader(new InputStreamReader(resStream, "UTF-8"))
    val strs: List[String] = Stream.continually(br.readLine()).takeWhile(_ != null).toList

    br.close()
    //scala.io.Source.fromInputStream(resStream).getLines()

    ("schema retrieved", 0 , strs)

  }

  import com.amazonaws.services.s3.model.SelectObjectContentRequest

  private def generateBaseCSVRequest(bucket: String, key: String, query: String, redKeyInfo: String): (Boolean, SelectObjectContentRequest) = {
    import collection.JavaConverters._
    var detail: mutable.Map[String, String] = mutable.Map[String, String]()
    val request = new SelectObjectContentRequest
    withRedis{ jedis =>
      jedis.select(7)
      if(jedis.exists(redKeyInfo)) {
        detail = jedis.hgetAll(redKeyInfo).asScala
      } else {
        jedis.close()
        return (false, request)
      }
      jedis.close()
    }


    request.setBucketName(bucket)
    request.setKey(key)
    request.setExpression(query)
    request.setExpressionType(ExpressionType.SQL)

    val inputSerialization = new InputSerialization()
    inputSerialization.setCsv(new CSVInput()
      .withFileHeaderInfo(FileHeaderInfo.USE)
      .withFieldDelimiter(detail("Separator"))
      .withQuoteCharacter(detail("QuoteChar"))
      .withQuoteEscapeCharacter(detail("EscapeChar"))
      .withAllowQuotedRecordDelimiter(true)
    )
    inputSerialization.setCompressionType(CompressionType.NONE)
    request.setInputSerialization(inputSerialization)

    val outputSerialization = new OutputSerialization()
    outputSerialization.setJson(new JSONOutput)
    request.setOutputSerialization(outputSerialization)
    (true, request)
  }
/*  def withRedis[T](f: Jedis => T): T = {
    val jedis = new Jedis("redis-service", 6379)
    try {
      f(jedis)
    } finally {
      jedis.close()
    }
  }*/

  def seqOfListBucketResultContentsToSeqListBucket(param: IndexedSeq[ListBucketResultContents]): List[ListBucket]
  = param.collect {
    case (a: ListBucketResultContents) => ListBucket(a.bucketName, a.key, a.eTag, a.size, a.lastModified.toString, a.storageClass)
  }.toList

  def normalizerString(aString: String): String = {
    org.apache.commons.lang3.StringUtils.stripAccents(aString.replaceAll("[ ,;{}()\n\t=._+]+", "_"))
  }

}
