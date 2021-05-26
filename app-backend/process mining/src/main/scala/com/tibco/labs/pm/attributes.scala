/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.pm

import com.tibco.labs.utils.commons.spark
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._

import scala.util.{Failure, Success, Try}

object attributes {

  def transformAttributes(df_events: DataFrame): DataFrame = {

    var df_attr = spark.emptyDataFrame

    Try{
      println(s"###########  Processing df_events Attributes ##########")
      // define a schema of type key,val (oh well it's a map)
      val Schema = MapType(StringType, StringType)

      // explode cases_extra_attributes..
      df_attr = df_events.withColumn("d",from_json(col("cases_extra_attributes"),Schema)).selectExpr("analysis_id","row_id","explode(d)")

      // ordered columns

      val finalColumnsOrderedName: Array[String] = Array(
        "analysis_id",
        "row_id",
        "key",
        "value")

      df_attr = df_attr.select(finalColumnsOrderedName.head, finalColumnsOrderedName.tail: _*)

/*      // write back the table into the DB
      // Delete any previous analysisID in DB
      DataFrameUtils.deleteAnalysisJDBC(databaseName, "attributes")
      //Write Events table
      if (backEndType.equals("aurora")) {
        DataFrameUtils.writeAnalysisJDBC(df_attr, databaseName, "attributes")
      }*/

      println(s"########### Attributes Done ###########")
    } match {
      case Success(_) =>  return df_attr
      case Failure(e) => println("Error in attributes : " +e.getMessage)
        //sendTCMMessage(s"$analysisId",s"$caseRef","error",s"${e.getMessage}",0, databaseName, LocalDateTime.now().toString)
        throw new Exception(e.getMessage)
    }



  }
}
