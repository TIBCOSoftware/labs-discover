package com.tibco.labs.pm

import com.tibco.labs.utils.commons.{logger, spark}
import org.apache.spark.sql.{Column, DataFrame}
import org.apache.spark.sql.functions.{col, lit, when}

class casesClassifier {


  def classify(casesDf: DataFrame, startsL: List[String], stopsL: List[String], activitiesDf: DataFrame): DataFrame = {

    logger.info("Enter CaseClassifier")
    import spark.implicits._
    var outputDF = spark.emptyDataFrame
    // 1 transform startsL and StopsL that contains list of activity name with the relevant id from activities df
    // df: activity_name, activity_id
    val newActivityDf: DataFrame = activitiesDf.select("id", "activity_name").withColumnRenamed("id", "activity_id")

    // df : activity_name, activity_id
    val startsSeq: Seq[String] = newActivityDf.filter($"activity_name".isin(startsL.toSeq: _*)).select("activity_id").map(r => r.getLong(0).toString).collect.toList
    val endsSeq: Seq[String] = newActivityDf.filter($"activity_name".isin(stopsL.toSeq: _*)).select("activity_id").map(r => r.getLong(0).toString).collect.toList


    logger.info("start activities id : " + startsSeq)
    logger.info("stop activities id : " + endsSeq)
    //var globalSeq = collection.mutable.Seq[(String, String)]()

    //startsSeq.foreach(u => globalSeq ++= Seq((u, "started")))
    //endsSeq.foreach(u => globalSeq ++= Seq((u, "ended")))

    val caseCycleColStart: Column = startsSeq.foldLeft(col("variant_id")) {
      case (acc, id) =>
          when(col("variant_id").startsWith(id), "true").otherwise(acc)
    }

    val caseCycleColContainsStart: Column = startsSeq.foldLeft(col("variant_id")) {
      case (acc, id) =>
        when(col("variant_id").contains(id), "true").otherwise(acc)
    }

    val caseCycleColEnd: Column = endsSeq.foldLeft(col("variant_id")) {
      case (acc, id) =>
        when(col("variant_id").endsWith(id), "true").otherwise(acc)
    }

    val caseCycleColContainsEnd: Column = endsSeq.foldLeft(col("variant_id")) {
      case (acc, id) =>
        when(col("variant_id").contains(id), "true").otherwise(acc)
    }


    outputDF = casesDf.withColumn("startFlag", caseCycleColStart)
    outputDF = outputDF.withColumn("endFlag", caseCycleColEnd)
    outputDF = outputDF.withColumn("containsEndFlag", caseCycleColContainsEnd)
    outputDF = outputDF.withColumn("containsStartFlag", caseCycleColContainsStart)

    outputDF = outputDF.withColumn("caseStatus",
      when(col("startFlag") === "true" && col("endFlag") === "true", "Complete")
        .when(col("containsStartFlag") === "true" && col("containsEndFlag") === "true" && col("startFlag") =!= "true" && col("endFlag") =!= "true", "Complete Not Ordered")
        .when(col("endFlag") === "true" && col("startFlag") =!= "true", "Stopped")
        .when(col("containsEndFlag") === "true" && col("startFlag") =!= "true" && col("endFlag") =!= "true", "Stopped Not Ordered")
        .when(col("startFlag") === "true" && col("endFlag") =!= "true", "Started")
        .when(col("containsStartFlag") === "true" && col("startFlag") =!= "true", "Started Not Ordered")
        .otherwise("Undefined")
    )

    outputDF = outputDF.withColumn("caseStatusCategory",
      when(col("caseStatus") === "Complete", "Finished")
        .when(col("caseStatus") === "Complete Not Ordered","Finished" )
        .when(col("caseStatus") === "Stopped","Finished")
        .when(col("caseStatus") === "Stopped Not Ordered","Finished")
        .when(col("caseStatus") === "Started","Active")
        .when(col("caseStatus") === "Started Not Ordered","Active")
        .otherwise("Active")

    )
    outputDF = outputDF.drop("startFlag", "containsStartFlag", "endFlag","containsEndFlag" )
    outputDF
  }

}
