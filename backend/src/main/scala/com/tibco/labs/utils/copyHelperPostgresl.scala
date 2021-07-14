/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import com.tibco.labs.utils.commons._
import org.apache.spark.broadcast.Broadcast
import org.apache.spark.sql.{DataFrame, Row}
import org.postgresql.copy.CopyManager
import org.postgresql.core.BaseConnection

import java.io.InputStream
import java.sql.DriverManager
import java.util.Properties
import scala.util.{Failure, Success, Try}


//https://gist.github.com/longcao/bb61f1798ccbbfa4a0d7b76e49982f84

// too look at https://github.com/EDS-APHP/spark-etl/tree/master/spark-postgres

object copyHelperPostgresl extends Serializable {

  def rowsToInputStream(rows: Iterator[Row], delimiter: String): InputStream = {
    val bytes: Iterator[Byte] = rows.map { row =>
      (row.toSeq
        .map { v =>
          if (v == null) {
            """null"""
          } else {
            "\"" + v.toString.replaceAll("\"", "\"\"") + "\""
          }
        }
        .mkString("\t") + "\n").getBytes
    }.flatten

    new InputStream {
      override def read(): Int = if (bytes.hasNext) {
        bytes.next & 0xff // bitwise AND - make the signed byte an unsigned int from 0-255
      } else {
        -1
      }
    }
  }

  def rowsToInputStream2(rows: Iterator[Row], delimiter: String): InputStream = {
    val bytes: Iterator[Byte] = rows.map { row =>
      (row.mkString(delimiter) + "\n").getBytes
    }.flatten

    new InputStream {
      override def read(): Int = if (bytes.hasNext) {
        bytes.next & 0xff // bitwise AND - make the signed byte an unsigned int from 0-255
      } else {
        -1
      }
    }
  }

  def copyIn(df: DataFrame, tableName: String, dbName: String): Unit = {
    //println("CopyManager started with " + df.rdd.getNumPartitions + " partitions")

    //val jdbcUrl = s"jdbc:postgresql://..." // db credentials elided

     // Connection pooling

    val props = new java.util.Properties()

    props.setProperty("driver", jdbcDriver)
    props.setProperty("user", jdbcUsername)
    props.setProperty("password", jdbcPassword)
    props.setProperty("loginTimeout", "60")
    props.setProperty("connectTimeout", "60")

    val propsUrl = new java.util.Properties()
    propsUrl.setProperty("jdbcUrl", jdbcUrl)
    // broadcast this too all workers, all parts
    val connectBC: Broadcast[Properties] = sc.broadcast(props)
    val connectUrlBC: Broadcast[Properties] = sc.broadcast(propsUrl)



    //val poolerBC  = sc.broadcast(Pooler)

    df.foreachPartition { rows: Iterator[Row] =>



      //Class.forName(jdbcDriver)
           // val props = new Properties()
           // props.setProperty("user", jdbcUsername)
           // props.setProperty("password", jdbcPassword)
           // props.setProperty("loginTimeout", "60")
           // props.setProperty("connectTimeout", "60")
           // var conn: Connection = null

      //get the broadcasted values
      val connectionProperties = connectBC.value
      val connectionProperties2 = connectUrlBC.value
      val _jdbcDriver = connectionProperties.getProperty("driver")
      val _jdbcUrl = connectionProperties2.getProperty("jdbcUrl")
      val _jdbcPassword = connectionProperties.getProperty("jdbcPassword")
      val _jdbcUsername = connectionProperties.getProperty("user")
      Class.forName(_jdbcDriver)
      val conn = DriverManager.getConnection(_jdbcUrl, connectionProperties)

      //val pooler = poolerBC.value


     // val ds = new Pooler().getDataSource(_jdbcDriver,_jdbcUrl,_jdbcUsername,_jdbcPassword)
     // val conn: Connection = ds.getConnection
      while (rows.hasNext) {


      Try {

        val cm = new CopyManager(conn.asInstanceOf[BaseConnection])
        /*        cm.copyIn(
                  s"COPY $table " + """FROM STDIN WITH (NULL '\N', FORMAT CSV, DELIMITER E'\t')""",
                  rowsToInputStream(rows))
                ()*/
        cm.copyIn(
          s"""COPY ${dbName}.${tableName} FROM STDIN WITH (NULL 'null', FORMAT CSV, DELIMITER E'\t')""", // adjust COPY settings as you desire, options from https://www.postgresql.org/docs/9.5/static/sql-copy.html
          rowsToInputStream(rows, "\t"))
      } match {
        case Success(_) =>
          println("Copy Done")
          println("Closing DB connection returning to pool")
        case Failure(e) =>
          println(s"Problem with Copy ${e.printStackTrace()}")
          println("Closing DB connection returning to pool")
          conn.close()
          throw new Exception(e.getMessage)
      }
      }
      conn.close()
    }
  }
}