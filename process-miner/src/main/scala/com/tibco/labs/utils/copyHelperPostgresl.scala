package com.tibco.labs.utils

import java.io.InputStream
import java.sql.{Connection, DriverManager}
import java.util.Properties

import org.apache.spark.sql.{DataFrame, Row}
import org.postgresql.copy.CopyManager
import org.postgresql.core.BaseConnection
import com.tibco.labs.utils.commons._

import scala.util.{Try, Success, Failure}


//https://gist.github.com/longcao/bb61f1798ccbbfa4a0d7b76e49982f84

// too look at https://github.com/EDS-APHP/spark-etl/tree/master/spark-postgres

object copyHelperPostgresl extends Serializable {

  def rowsToInputStream(rows: Iterator[Row]): InputStream = {
    val bytes: Iterator[Byte] = rows.map { row =>
      (row.toSeq
        .map { v =>
          if (v == null) {
            """\N"""
          } else {
            "\"" + v.toString.replaceAll("\"", "\"\"") + "\""
          }
        }
        .mkString("\t") + "\n").getBytes
    }.toList.flatten.toIterator

    () => if (bytes.hasNext) {
      bytes.next & 0xff // bitwise AND - make the signed byte an unsigned int from 0-255
    } else {
      -1
    }
  }

  def copyIn(df: DataFrame, table: String): Unit = {
    println("CopyManager started with " + df.rdd.getNumPartitions + " partitions")
    df.foreachPartition { rows: Iterator[Row] =>
      Class.forName(jdbcDriver)
      val props = new Properties()
      props.setProperty("user", jdbcUsername)
      props.setProperty("password", jdbcPassword)
      props.setProperty("loginTimeout", "60")
      props.setProperty("connectTimeout", "60")
      var conn: Connection = null
      Try {
        conn = DriverManager.getConnection(jdbcUrl, props)
        val cm = new CopyManager(conn.asInstanceOf[BaseConnection])
        cm.copyIn(
          s"COPY $table " + """FROM STDIN WITH (NULL '\N', FORMAT CSV, DELIMITER E'\t')""",
          rowsToInputStream(rows))
        ()
      } match {
        case Success(_) =>
          println("Copy Done")

          println("Closing DB connection")
          conn.close()
        case Failure(e) =>
          println(s"Problem with Copy ${e.printStackTrace()}")

          println("Closing DB connection")
          conn.close()
          throw new Exception(e.getMessage)
      }
    }
  }
}