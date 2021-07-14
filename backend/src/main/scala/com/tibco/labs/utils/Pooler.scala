package com.tibco.labs.utils

import com.tibco.labs.utils.commons.{jdbcDriver, jdbcPassword, jdbcUrl, jdbcUsername}
import com.zaxxer.hikari.{HikariConfig, HikariDataSource}
import java.sql.Connection
import org.apache.spark.internal.Logging
class Pooler extends Logging {

  logInfo("Pooler started")
/*
  def withConnection[U](body: Connection => U): U = {
    val conn: Connection = dataSource.getConnection
    try {
      body(conn)
    } finally {
      // Return the connection to the pool
      conn.close
    }
  }
*/

  def getDataSource(jdbcDriver: String, jdbcUrl:String, jdbcUsername:String ,jdbcPassword: String ): HikariDataSource = {
    logInfo("Pooler:getDataSource")
    //Class.forName(jdbcDriver)
    val dbName = jdbcUrl.split("/").last
    val hostname = jdbcUrl.split("/")(2).split(":")(0)
    val port = jdbcUrl.split("/")(2).split(":")(1)

    val dataSource: HikariDataSource = {
      val connectionPool: HikariConfig = new HikariConfig()
      //connectionPool.setJdbcUrl(jdbcUrl)
      connectionPool.setUsername(jdbcUsername)
      connectionPool.setPassword(jdbcPassword)
      connectionPool.setDataSourceClassName("org.postgresql.ds.PGSimpleDataSource")
      connectionPool.addDataSourceProperty("serverName", hostname)
      connectionPool.addDataSourceProperty("databaseName", dbName)
      connectionPool.addDataSourceProperty("portNumber", port)
      //connectionPool.setDriverClassName(jdbcDriver)

      new HikariDataSource(connectionPool)
    }
    dataSource
  }

//  def getConnection(dataSource: HikariDataSource ): Connection = {
//    logInfo("Pooler:ds:connect")
//    val conn = dataSource.getConnection
//    conn
//  }
//
//  def stop(dataSource: HikariDataSource ): Unit = {
//    logInfo("Pooler:ds:close")
//    dataSource.close()
//  }



}
