package com.tibco.labs.orchestrator.api.registry

import java.time.format.DateTimeFormatter
import scala.util.Try

class timeTester {

  val dateFormats = List(
    "dd/MM/yyyy",
    "dd.MM.yyyy",
    "dd-MM-yyyy",
    "MM/dd/yyyy",
    "MM.dd.yyyy",
    "MM-dd-yyyy",
    "yyyy/dd/MM",
    "yyyy.dd.MM",
    "yyyy-dd-MM",
    "yyyy/MM/dd",
    "yyyy.MM.dd",
    "yyyy-MM-dd",
    "dd/MM/yy",
    "dd.MM.yy",
    "dd-MM-yy",
    "MM/dd/yy",
    "MM.dd.yy",
    "MM-dd-yy",
    "yy/dd/MM",
    "yy.dd.MM",
    "yy-dd-MM",
    "yy/MM/dd",
    "yy.MM.dd",
    "yy-MM-dd",
    "dd/MM/yyyy H:mm:ss",
    "dd.MM.yyyy H:mm:ss",
    "dd-MM-yyyy H:mm:ss",
    "MM/dd/yyyy H:mm:ss",
    "MM.dd.yyyy H:mm:ss",
    "MM-dd-yyyy H:mm:ss",
    "yyyy/dd/MM H:mm:ss",
    "yyyy.dd.MM H:mm:ss",
    "yyyy-dd-MM H:mm:ss",
    "yyyy/MM/dd H:mm:ss",
    "yyyy.MM.dd H:mm:ss",
    "yyyy-MM-dd H:mm:ss",
    "dd/MM/yy H:mm:ss",
    "dd.MM.yy H:mm:ss",
    "dd-MM-yy H:mm:ss",
    "MM/dd/yy H:mm:ss",
    "MM.dd.yy H:mm:ss",
    "MM-dd-yy H:mm:ss",
    "yy/dd/MM H:mm:ss",
    "yy.dd.MM H:mm:ss",
    "yy-dd-MM H:mm:ss",
    "yy/MM/dd H:mm:ss",
    "yy.MM.dd H:mm:ss",
    "yy-MM-dd H:mm:ss",
    "dd/MM/yyyy H:mm",
    "dd.MM.yyyy H:mm",
    "dd-MM-yyyy H:mm",
    "MM/dd/yyyy H:mm",
    "MM.dd.yyyy H:mm",
    "MM-dd-yyyy H:mm",
    "yyyy/dd/MM H:mm",
    "yyyy.dd.MM H:mm",
    "yyyy-dd-MM H:mm",
    "yyyy/MM/dd H:mm",
    "yyyy.MM.dd H:mm",
    "yyyy-MM-dd H:mm",
    "dd/MM/yy H:mm",
    "dd.MM.yy H:mm",
    "dd-MM-yy H:mm",
    "MM/dd/yy H:mm",
    "MM.dd.yy H:mm",
    "MM-dd-yy H:mm",
    "yy/dd/MM H:mm",
    "yy.dd.MM H:mm",
    "yy-dd-MM H:mm",
    "yy/MM/dd H:mm",
    "yy.MM.dd H:mm",
    "yy-MM-dd H:mm",
    "d/M/yyyy H:mm",
    "d.M.yyyy H:mm",
    "d-M-yyyy H:mm",
    "M/d/yyyy H:mm",
    "M.d.yyyy H:mm",
    "M-d-yyyy H:mm",
    "yyyy/d/M H:mm",
    "yyyy.d.M H:mm",
    "yyyy-d-M H:mm",
    "yyyy/M/d H:mm",
    "yyyy.M.d H:mm",
    "yyyy-M-d H:mm",
    "d/M/yy H:mm",
    "d.M.yy H:mm",
    "d-M-yy H:mm",
    "M/d/yy H:mm",
    "M.d.yy H:mm",
    "M-d-yy H:mm",
    "yy/d/M H:mm",
    "yy.d.M H:mm",
    "yy-d-M H:mm",
    "yy/M/d H:mm",
    "yy.M.d H:mm",
    "yy-M-d H:mm",
    "dd/MM/yyyy H:mm:ss.SSS",
    "dd.MM.yyyy H:mm:ss.SSS",
    "dd-MM-yyyy H:mm:ss.SSS",
    "MM/dd/yyyy H:mm:ss.SSS",
    "MM.dd.yyyy H:mm:ss.SSS",
    "MM-dd-yyyy H:mm:ss.SSS",
    "yyyy/dd/MM H:mm:ss.SSS",
    "yyyy.dd.MM H:mm:ss.SSS",
    "yyyy-dd-MM H:mm:ss.SSS",
    "yyyy/MM/dd H:mm:ss.SSS",
    "yyyy.MM.dd H:mm:ss.SSS",
    "yyyy-MM-dd H:mm:ss.SSS",
    "dd/MM/yy H:mm:ss.SSS",
    "dd.MM.yy H:mm:ss.SSS",
    "dd-MM-yy H:mm:ss.SSS",
    "MM/dd/yy H:mm:ss.SSS",
    "MM.dd.yy H:mm:ss.SSS",
    "MM-dd-yy H:mm:ss.SSS",
    "yy/dd/MM H:mm:ss.SSS",
    "yy.dd.MM H:mm:ss.SSS",
    "yy-dd-MM H:mm:ss.SSS",
    "yy/MM/dd H:mm:ss.SSS",
    "yy.MM.dd H:mm:ss.SSS",
    "yy-MM-dd H:mm:ss.SSS"
  ).map(p => (p, DateTimeFormatter.ofPattern(p)))

  val iso8601DateFormatter: DateTimeFormatter = DateTimeFormatter.ISO_DATE_TIME

  def addOrUpdate[String, Int](m: collection.mutable.Map[String, Int], k: String, kv: (String, Int), f: Int => Int): collection.mutable.Map[String, Int] = {
    m.get(k) match {
      case Some(e) => m.update(k, f(e))
      case None    => m += kv
    }
    m
  }


  def normalizeDate(dateList: List[String]): collection.mutable.Map[String, Int] = {
    val scoreMap = collection.mutable.Map[String, Int]()
    dateList.foreach{ dateStr =>
    val trimmedDate = dateStr.trim
    if(trimmedDate.isEmpty) None
    else {
      for((pattern, fmt) <- dateFormats) {
        val dateTry = Try(fmt.parse(trimmedDate))
        if(dateTry.isSuccess){
          addOrUpdate(scoreMap, pattern, pattern -> 1, (v: Int) => v + 1)
        }
      }
      collection.mutable.Map("" -> 0)
    }
  }
    scoreMap
  }
}
