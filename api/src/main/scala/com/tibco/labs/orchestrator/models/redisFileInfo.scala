package com.tibco.labs.orchestrator.models

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

case class ListBucket(
                       bucketName: String,
                       key: String,
                       eTag: String,
                       size: Long,
                       lastModified: String,
                       storageClass: String
                     )


case class S3Content(list: List[ListBucket])

case class RedisContent(message: String, code: Int , list: List[redisFileInfo])

