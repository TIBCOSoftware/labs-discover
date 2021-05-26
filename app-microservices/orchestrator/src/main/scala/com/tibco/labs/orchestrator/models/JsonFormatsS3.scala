package com.tibco.labs.orchestrator.models

import com.tibco.labs.orchestrator.api.FilesRegistry.ActionPerformedFiles
import com.tibco.labs.orchestrator.api.{ListBucket, S3Content}
import spray.json.RootJsonFormat

//#json-formats
import spray.json.DefaultJsonProtocol

object JsonFormatsS3 {
  // import the default encoders for primitive types (Int, String, Lists etc)

  import DefaultJsonProtocol._

  implicit val actionPerformedJsonFormat: RootJsonFormat[ActionPerformedFiles] = jsonFormat3(ActionPerformedFiles)
  implicit val listContentJsonFormat: RootJsonFormat[ListBucket] = jsonFormat6(ListBucket)
  implicit val s3ContentJsonFormat: RootJsonFormat[S3Content] = jsonFormat1(S3Content)

  case class redisFileInfo(
                            ContentType: String,
                            LastModified: String,
                            OriginalFilename: String,
                            OriginalEncoding: String,
                            FileSize: String,
                            newline: String,
                            EscapeChar: String,
                            QuoteChar: String,
                            Separator: String,
                            Encoding: String,
                            OriginalNewLine: String,
                            FileLocation: String
                          )
}
//#json-formats
