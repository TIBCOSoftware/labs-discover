/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs
package utils

import com.tibco.labs.utils.common.logger
import org.apache.spark.sql.functions.col
import org.apache.spark.sql.types.StructType
import org.apache.spark.sql.{Column, DataFrame, SQLContext, SaveMode}
import org.apache.spark.storage.StorageLevel

import java.sql.{Connection, DriverManager, PreparedStatement}
import java.time.LocalDateTime
import java.util.Properties
import scala.util.{Failure, Success, Try}



object DataFrameUtils {


  def DataFrameUtils(): Unit = {

  }

  import scala.collection.mutable.ListBuffer


  def parseTdv(tdvOptions: Map[String, String], spark: SQLContext): DataFrame = {
    logger.info(s"###########  Start read Data Source  ##########")
    var tmpDataFrame = spark.emptyDataFrame

    try {
      tmpDataFrame = spark.read
        .format("jdbc")
        .options(tdvOptions)
        .load()

      logger.info(s"###########  End read Data Source   ##########")

    } catch {
      case e: Throwable => throw new Exception("Something went wrong... in parseTdv method " + e.getMessage)
    }

    tmpDataFrame
  }





}
