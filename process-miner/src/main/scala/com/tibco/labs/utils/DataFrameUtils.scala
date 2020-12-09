/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import java.sql.{Connection, DriverManager, PreparedStatement}
import java.time.LocalDateTime
import java.util.Properties

import com.tibco.labs.utils.commons._
import com.tibco.labs.utils.tibcoCloudMessaging.sendTCMMessage
import org.apache.spark.sql.functions.col
import org.apache.spark.sql.types.StructType
import org.apache.spark.sql.{Column, DataFrame, SQLContext, SaveMode}
import org.apache.spark.storage.StorageLevel

import scala.util.{Failure, Success, Try}


object DataFrameUtils {


  def DataFrameUtils(): Unit = {

  }

  import scala.collection.mutable.ListBuffer

  /**
    * Check if string is Empty
    *
    * @param sOpt : Option[String]
    * @return Boolean
    */
  def isEmpty(sOpt: Option[String]): Boolean = {
    !sOpt.exists(_.trim.nonEmpty)
  }


  def convtoJson(o: Any): String = {
    var json = new ListBuffer[String]()
    o match {
      case m: Map[_, _] =>
        for ((k, v) <- m) {
          val key = escape(k.asInstanceOf[String])
          v match {
            case a: Map[_, _] => json += "\"" + key + "\":" + convtoJson(a)
            case a: List[_] => json += "\"" + key + "\":" + convtoJson(a)
            case a: Int => json += "\"" + key + "\":" + a
            case a: Boolean => json += "\"" + key + "\":" + a
            case a: String => json += "\"" + key + "\":\"" + escape(a) + "\""
            case _ => ;
          }
        }
      case m: List[_] =>
        var list = new ListBuffer[String]()
        for (el <- m) {
          el match {
            case a: Map[_, _] => list += convtoJson(a)
            case a: List[_] => list += convtoJson(a)
            case a: Int => list += a.toString
            case a: Boolean => list += a.toString
            case a: String => list += "\"" + escape(a) + "\""
            case _ => ;
          }
        }
        return "[" + list.mkString(",") + "]"
      case _ => ;
    }
    "{" + json.mkString(",") + "}"
  }

  private def escape(s: String): String = {
    s.replaceAll("\"", "\\\\\"")
  }

  /* TODO
   the next three methods needs to be rewritten
   */

  def updateAnalysisJDBC(dbName:String, df: DataFrame): Unit = {
    // Delete any previous analysisID in DB
    deleteAnalysisJDBC(databaseName, s"$dbName")
    //Write Events table
    if (backEndType.equals("aurora")) {
      writeAnalysisJDBC(df, databaseName, s"$dbName")
    }
  }


  def deleteAnalysisJDBC(dbName: String, tableName: String): Unit = {
    println(s"###########  Dropping previous $dbName.$tableName in CDB ##########")
    var time_del_db: Long = 0

    Class.forName(jdbcDriver)
    var prepSt: PreparedStatement = null
    val SQL = s"DELETE FROM $tableName WHERE analysis_id = ?"

    var affectedrows = 0
    var dbc: Connection = null
    Try {
      val props = new Properties()
      props.setProperty("user", jdbcUsername)
      props.setProperty("password", jdbcPassword)
      props.setProperty("loginTimeout", "60")
      props.setProperty("connectTimeout", "60")
      dbc = DriverManager.getConnection(jdbcUrl, props)
      prepSt = dbc.prepareStatement(SQL)
      prepSt.setString(1, analysisId)
      println(s"Dropping Previous Data for table " + dbName + "." + tableName)
      val _dropStart = System.nanoTime()
      affectedrows = prepSt.executeUpdate()
      val _dropend = System.nanoTime()
      time_del_db = (_dropend - _dropStart) / 1000000000
    } match {
      case Success(_) => println(s"Affected Rows : $affectedrows")
        println(s"###########  Dropping previous analysis $analysisId in $time_del_db seconds done ##########")
        dbc.close()
      case Failure(e) => println("ERROR : " + e.getMessage)
        sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}",0, databaseName, LocalDateTime.now().toString)
        throw new Exception(e.getMessage)
    }

  }

  def writeAnalysisJDBC(df: DataFrame, dbName: String, tableName: String): Unit = {
    println(s"###########  Writing DF $dbName.${tableName} into the DB ##########")
    var _cdbWriterStart: Long = 0
    val _numParts: Int = df.rdd.partitions.length
    println(s"number of partitions : ${_numParts}")
    _cdbWriterStart = System.nanoTime()
    var time_upsert: Long = 0
    if (tableName.equals("metrics")) {
      numParts = "1"
      dbSize = "1"
    }
    df.persist(StorageLevel.MEMORY_AND_DISK_2)
    Try {
/*      if (backEndType.equals("aurora")) {
        println(s"using Copy... with $numParts and $dbSize")
        import com.tibco.labs.utils.copyHelperPostgresl.copyIn
        if (_numParts < numParts.toInt) {
          copyIn(df.repartition(numParts.toInt), s"$tableName")
        } else {
          copyIn(df.coalesce(numParts.toInt), s"$tableName")
        }
      } else if (backEndType.equals("jdbc")) {*/
        println(s"using DF Writer... with $numParts and $dbSize")
        df.repartition(10).write.mode(SaveMode.Append).format("jdbc")
          .option("url", jdbcUrl)
          .option("dbtable", s"$tableName")
          .option("user", jdbcUsername)
          .option("password", jdbcPassword)
          .option("driver", jdbcDriver)
          .option("batchsize", dbSize)
          .option("numPartitions", numParts)
          .save()
     // }

      val _cdbWriterEnd = System.nanoTime()
      time_upsert = (_cdbWriterEnd - _cdbWriterStart) / 1000000000
    } match {
      case Success(_) => println(s"###########  $dbName.$tableName Stats  ##########")
        println(s"###########  insert time : $time_upsert seconds ##########")
        df.unpersist()
      case Failure(e) => println("Error : " + e.getMessage)
        sendTCMMessage(s"$analysisId", s"$caseRef", "error", s"${e.getMessage}",0, databaseName, LocalDateTime.now().toString)
        throw new Exception(e.getMessage)
    }


  }

  /*  def writeEventsTable(df: DataFrame, numPart: Option[Int]): Unit = {

      //broadcast JDBC properties to all workers

      import java.util.Properties
      import org.apache.spark.sql.execution.datasources.jdbc.JDBCOptions

      val connectionProps = new Properties()

      connectionProps.put("user", s"$username")
      connectionProps.put("password", s"$password")
      connectionProps.put("jdbcUrl", s"$url")
      connectionProps.put("jdbcDriver", s"$driver")
      connectionProps.put("dbname", s"$databaseName")


      // broadcast this too all workers, all parts
      val connectBC: Broadcast[Properties] = sc.broadcast(connectionProps)

      df.coalesce(numPart.getOrElse(10)).foreachPartition(partition => {

        //get the broadcasted values
        val connectionProperties = connectBC.value

        val jdbcUser = connectionProperties.getProperty("user")
        val jdbcPassword = connectionProperties.getProperty("password")
        val jdbcDriver = connectionProperties.getProperty("jdbcDriver")
        val jdbcUrl = connectionProperties.getProperty("jdbcUrl")

        // load driver per partition
        Class.forName(jdbcDriver)

        val dbc: Connection = DriverManager.getConnection(jdbcUrl, jdbcUser, jdbcPassword)
        val prepSt: PreparedStatement = null

        //for each rows of each partitions
        partition.grouped(dbSize).foreach(batch => {
          batch.foreach { row => {

          }
          }
        })

      }
      )


    }*/


  def parseTdv(tdvOptions: Map[String, String], spark: SQLContext): DataFrame = {
    println(s"###########  Start read Data Source  ##########")
    var tmpDataFrame = spark.emptyDataFrame

    try {
      tmpDataFrame = spark.read
        .format("jdbc")
        .options(tdvOptions)
        .load()

      println(s"###########  End read Data Source   ##########")

    } catch {
      case e: Throwable => throw new Exception("Something went wrong... in parseTdv method " + e.getMessage)
    }

    tmpDataFrame

  }


  def parseCsv(filePath: String, csvOptions: Map[String, String], headers: Boolean, schema: StructType): DataFrame = {

    println(csvOptions)
    println(s"File to be loaded : $filePath" )
    var tmpDataFrame = spark.emptyDataFrame
    Try {
      if (headers) {
        println("toto")
        tmpDataFrame = spark.read
          .options(csvOptions)
          .option("header", "true")
          .option("mode", "DROPMALFORMED")
          .format("csv")
          .load(filePath)
      } else {
        println("tata")
        tmpDataFrame = spark.read
          .options(csvOptions)
          .option("mode", "DROPMALFORMED")
          .format("csv")
          .schema(schema)
          .load(filePath)
      }
    } match {
      case Success(v) => println("File loaded...")
      case Failure(fail) => throw new Exception("oops.. in parseCsv method" + fail.printStackTrace())
    }
    tmpDataFrame

  }

  def parseJson(filePath: String, spark: SQLContext): DataFrame = {
    var tmpDataFrame = spark.emptyDataFrame
    try {

      tmpDataFrame = spark.read
        .format("json")
        .load(filePath)
    } catch {
      case e: Throwable => throw new Exception("Something went wrong... " + e.getMessage)
    }
    tmpDataFrame

  }


  import org.apache.spark.sql.DataFrame

  import scala.annotation.tailrec

  implicit class DataFrameOperations(df: DataFrame) {
    def dropDuplicateCols(rmvDF: DataFrame): DataFrame = {
      val cols = df.columns.groupBy(identity).mapValues(_.length).filter(_._2 > 1).keySet.toSeq

      @tailrec
      def deleteCol(df: DataFrame, cols: Seq[String]): DataFrame = {
        if (cols.isEmpty) df else deleteCol(df.drop(rmvDF(cols.head)), cols.tail)
      }

      deleteCol(df, cols)
    }
  }

  def isDataFrameEquals(a: DataFrame, b: DataFrame, isRelaxed: Boolean): Boolean = {

    try {

      a.rdd.cache
      b.rdd.cache

      // 1. Check the equality of two schemas
      if (!a.schema.toString().equalsIgnoreCase(b.schema.toString)) {
        return false
      }

      // 2. Check the number of rows in two dfs
      if (a.count() != b.count()) {
        return false
      }

      // 3. Check there is no unequal rows
      val aColumns: Array[String] = a.columns
      val bColumns: Array[String] = b.columns

      // To correctly handles cases where the DataFrames may have columns in different orders
      scala.util.Sorting.quickSort(aColumns)
      scala.util.Sorting.quickSort(bColumns)
      val aSeq: Seq[Column] = aColumns.map(col)
      val bSeq: Seq[Column] = bColumns.map(col)

      var a_prime: DataFrame = null
      var b_prime: DataFrame = null

      if (isRelaxed) {
        a_prime = a
        //            a_prime.show()
        b_prime = b
        //            a_prime.show()
      }
      else {
        // To correctly handles cases where the DataFrames may have duplicate rows and/or rows in different orders
        a_prime = a.sort(aSeq: _*).groupBy(aSeq: _*).count()
        //    a_prime.show()
        b_prime = b.sort(aSeq: _*).groupBy(bSeq: _*).count()
        //    a_prime.show()
      }

      val c1: Long = a_prime.except(b_prime).count()
      val c2: Long = b_prime.except(a_prime).count()

      if (c1 != c2 || c1 != 0 || c2 != 0) {
        return false
      }
    } finally {
      a.rdd.unpersist()
      b.rdd.unpersist()
    }

    true
  }


}
