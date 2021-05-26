package com.tibco.labs.orchestrator.api

import com.google.gson.Gson
import com.tibco.labs.orchestrator.conf.DiscoverConfig
import com.tibco.labs.orchestrator.conf.DiscoverConfig.{la_claims_uri, la_groups_base_uri}
import com.tibco.labs.orchestrator.models.{GroupsDetails, LiveAppsClaims, Sandboxes}
import io.circe.optics.JsonPath.{root => Jsonroot}
import io.circe.{Json, parser}
import org.slf4j.{Logger, LoggerFactory}
import sttp.client3.circe._
import io.circe.generic.auto._
import sttp.client3.{Identity, SttpBackend}
import sttp.capabilities
import sttp.client3._
import sttp.client3.okhttp.OkHttpSyncBackend
import sttp.model.StatusCode
import sttp.model.headers.CookieWithMeta

import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path}
import scala.collection.mutable
import scala.io.BufferedSource
import scala.util.matching.Regex
import scala.util.{Failure, Success, Try}


class LiveApps() {

  //pmConfig: pmConfigLiveApps

  import scala.collection.JavaConverters._

  val className: String = this.getClass.getName
  val log: Logger = LoggerFactory.getLogger(className)
  log.info(s"Entering ${className}")
  //la_claims_uri
  //la_groups_base_uri


  val sttpBackend: SttpBackend[Identity, capabilities.WebSockets] = OkHttpSyncBackend()

  def validateLogin(token: String): (String, Int, String) = {
    log.info(s"Base claim uri : ${la_claims_uri}")
    log.info(s"Base uri for groups : ${la_groups_base_uri}")

    // call claims
    val requestClaims = basicRequest
      .auth.bearer(token)
      .get(uri"${la_claims_uri}")
      .response(asJson[LiveAppsClaims])

    val responseClaims = requestClaims.send(sttpBackend)
    var ret = ("", 0, "")
    var claimStatus = false
    var respBody: LiveAppsClaims = null


    responseClaims.body match {
      case Left(value) => {
        log.error(s"Claims in error : ${value.getMessage}")
        if (responseClaims.code == StatusCode.Unauthorized) {
          ret = ("Invalid Bearer", 401, "")
        } else {
          ret = (value.getMessage, responseClaims.code.code, "")
        }
      }
      case Right(value) => {
        log.info("claims ok")
        claimStatus = true
        respBody = value
      }
    }

    if (claimStatus) {
      //claim is good carry on

      val id = respBody.id
      val orgID = respBody.globalSubcriptionId
      val sandboxID = respBody.sandboxes.filter(p => p.`type` == "Production")(0).id
      val groupUrl = s"${la_groups_base_uri}${id}/groups?%24sandbox=${sandboxID}&%24top=1000"

      val requestGroups = basicRequest
        .auth.bearer(token)
        .get(uri"${groupUrl}")
        .response(asJson[List[GroupsDetails]])

      val respGroups = requestGroups.send(sttpBackend)

      respGroups.body match {
        case Left(err) => {
          log.error(s"Groups Details in error : ${err.getMessage}")
          ret = (err.getMessage, respGroups.code.code, "")
        }
        case Right(value) => {
          log.info("Filtering Groups")
          if (value.filter(p => p.name == "Discover Users").nonEmpty) {
            ret = ("Valid Credentials", 0, orgID)
          } else {
            ret = ("Discover Users Group not found, Invalid Credentials", 120, orgID)
          }
        }
      }

    }

    ret
  }

}
