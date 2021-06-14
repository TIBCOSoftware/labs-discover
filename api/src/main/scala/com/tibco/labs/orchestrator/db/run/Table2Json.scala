package com.tibco.labs.orchestrator.db.run


import com.tibco.labs.orchestrator.conf.DiscoverConfig
import org.json.{JSONArray, JSONObject}
import org.slf4j.{Logger, LoggerFactory}

import scala.util.{Failure, Success, Try}
import java.sql.{Connection, DriverManager, PreparedStatement, ResultSet, ResultSetMetaData, SQLException}
import java.util.Properties
import scala.collection.immutable
import scala.collection.mutable.ListBuffer


class Table2Json(orgId: String, tableName: String) {

  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)


  log.info(s"Retrieving Table ${tableName} as Json format")

  def get(): String = {

    var jsonFinal = ""
    val jdbcDriver = "cs.jdbc.driver.CompositeDriver"
    val tdvDatabase = s"org_${orgId.toLowerCase}"
    val urlDatasets = s"jdbc:compositesw:dbapi@${DiscoverConfig.config.backend.tdv.hostname}:${DiscoverConfig.config.backend.tdv.jdbcPort}?domain=${DiscoverConfig.config.backend.tdv.domain}&dataSource=${tdvDatabase}"
    val targetTable = s"""datasets."${tableName}""""

    log.info(s"###########  Fetching $targetTable ##########")
    log.info(s"###########  URI $urlDatasets ##########")


    var time_del_db: Long = 0

    Class.forName(jdbcDriver)
    var prepSt: PreparedStatement = null
    val SQL = s"""SELECT {OPTION MAX_ROWS_LIMIT=100} * FROM ${targetTable}"""

    log.info(s"###########  stmt $SQL ##########")
    var rs: ResultSet = null
    var dbc: Connection = null
    Try {
      val props = new Properties()
      props.setProperty("user", DiscoverConfig.config.backend.tdv.username)
      props.setProperty("password", DiscoverConfig.config.backend.tdv.password)
      props.setProperty("loginTimeout", "10")
      props.setProperty("connectTimeout", "12")
      //props.setProperty("currentSchema", organisation)
      dbc = DriverManager.getConnection(urlDatasets, props)
      prepSt = dbc.prepareStatement(SQL)
      val _dropStart = System.nanoTime()
      rs = prepSt.executeQuery()
      log.info(s"Converting result set")


      Try {

        val jsonIn: JSONArray = new JSONArray()
        val rsmd: ResultSetMetaData = rs.getMetaData
        val numColumns: Int = rsmd.getColumnCount()
        log.info(s"Num cols : ${numColumns}")

        while (rs.next()) {
          val obj: JSONObject = new JSONObject()
          for (i <- 1 to numColumns) {
            val column_name = rsmd.getColumnName(i)
            if (rsmd.getColumnType(i) equals (java.sql.Types.ARRAY)) obj.put(column_name, rs.getArray(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.BIGINT)) obj.put(column_name, rs.getLong(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.REAL)) obj.put(column_name, rs.getFloat(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.BOOLEAN)) obj.put(column_name, rs.getBoolean(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.BLOB)) obj.put(column_name, rs.getBlob(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.DOUBLE)) {
              var dd: Double = rs.getDouble(column_name)
              var ddString = ""
              if (rs.wasNull()) {
                ddString = ""
              } else if (dd.isNaN) {
                ddString = "NaN"
              } else {
                ddString = dd.toString
              }
              obj.put(column_name, ddString)
            }
            else if (rsmd.getColumnType(i).equals(java.sql.Types.FLOAT)) obj.put(column_name, rs.getDouble(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.INTEGER)) obj.put(column_name, rs.getInt(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.NVARCHAR)) obj.put(column_name, rs.getNString(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.VARCHAR)) obj.put(column_name, rs.getString(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.CHAR)) obj.put(column_name, rs.getString(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.NCHAR)) obj.put(column_name, rs.getNString(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.LONGNVARCHAR)) obj.put(column_name, rs.getNString(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.LONGVARCHAR)) obj.put(column_name, rs.getString(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.TINYINT)) obj.put(column_name, rs.getByte(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.SMALLINT)) obj.put(column_name, rs.getShort(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.DATE)) obj.put(column_name, rs.getDate(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.TIME)) obj.put(column_name, rs.getTime(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.TIMESTAMP)) obj.put(column_name, rs.getTimestamp(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.BINARY)) obj.put(column_name, rs.getBytes(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.VARBINARY)) obj.put(column_name, rs.getBytes(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.LONGVARBINARY)) obj.put(column_name, rs.getBinaryStream(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.BIT)) obj.put(column_name, rs.getBoolean(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.CLOB)) obj.put(column_name, rs.getClob(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.NUMERIC)) obj.put(column_name, rs.getBigDecimal(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.DECIMAL)) obj.put(column_name, rs.getBigDecimal(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.DATALINK)) obj.put(column_name, rs.getURL(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.REF)) obj.put(column_name, rs.getRef(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.STRUCT)) obj.put(column_name, rs.getObject(column_name)) // must be a custom mapping consists of a class that implements the interface SQLData and an entry in a java.util.Map object.
            else if (rsmd.getColumnType(i).equals(java.sql.Types.DISTINCT)) obj.put(column_name, rs.getObject(column_name))
            else if (rsmd.getColumnType(i).equals(java.sql.Types.JAVA_OBJECT)) obj.put(column_name, rs.getObject(column_name))
            else obj.put(column_name, rs.getString(i))
          }
          jsonIn.put(obj)
        }
        jsonIn.toString


      } match {
        case Failure(exception) => log.error(exception.getMessage)
        case Success(value) => {
          jsonFinal = value

        }
      }

      val _dropend = System.nanoTime()
      time_del_db = (_dropend - _dropStart) / 1000000000
    } match {
      case Success(_) => {
        prepSt.close()
        rs.close()
        dbc.close()
        log.info(s"###########  fetching data in $time_del_db seconds done ##########")
      }
      case Failure(e) => println("ERROR : " + e.getMessage)
        return "{}"
    }


    if (jsonFinal.isEmpty || jsonFinal.equals("")) {
      return "{}"
    } else {
      return jsonFinal
    }
  }


}
