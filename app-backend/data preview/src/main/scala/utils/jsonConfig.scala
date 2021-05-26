package com.tibco.labs
package utils

import io.circe.{Error, parser}

import scala.io.{BufferedSource, Source}
import io.circe._
import io.circe.generic.auto._

object jsonConfig {

  def RetrieveCaseConfig(configFileLocation: String): previewConfigFile = {
    val tempFile: BufferedSource = Source.fromFile(configFileLocation)
    val tempString: String = tempFile.mkString
    val parsed: Either[Error, previewConfigFile] =  parser.decode[previewConfigFile](tempString)
    parsed match {
      case Right(value) => {
        tempFile.close()
        value
      }
      case Left(value) => {
        //sendBottleToTheSea(analysisID: String, analysisStatus: String, message: String, progress: Long, orgId: String):
        val errMsg = s"Error: parsing JsonConfig file : ${value.getMessage}"
        sys.exit(120)
        throw new Exception(errMsg)
      }
    }
  }
}
