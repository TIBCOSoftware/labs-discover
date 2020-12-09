package com.tibco.labs.utils

import java.io.BufferedReader
import java.io.PrintWriter
import java.io.Reader
import java.sql.{Connection, ResultSet, ResultSetMetaData, SQLException, SQLWarning, Statement}
import java.util.regex.Matcher
import java.util.regex.Pattern

/**
 * Copyright 2009-2020 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * This is an internal testing utility.<br>
 * You are welcome to use this class for your own purposes,<br>
 * but if there is some feature/enhancement you need for your own usage,<br>
 * please make and modify your own copy instead of sending us an enhancement request.<br>
 *
 * @author Clinton Begin
 */
object ScriptRunner {
  private val LINE_SEPARATOR = System.lineSeparator
  private val DEFAULT_DELIMITER = ";"
  private val DELIMITER_PATTERN: Pattern = {
    Pattern.compile("^\\s*((--)|(//))?\\s*(//)?\\s*@DELIMITER\\s+([^\\s]+)", Pattern.CASE_INSENSITIVE)
  }
}

class ScriptRunner(val connection: Connection) {
  private var stopOnError = false
  private var throwWarning = false
  private var autoCommit = false
  private var sendFullScript = false
  private var removeCRs = false
  private var escapeProcessing = true
  private var logWriter = new PrintWriter(System.out)
  private var errorLogWriter = new PrintWriter(System.err)
  private var delimiter = ScriptRunner.DEFAULT_DELIMITER
  private var fullLineDelimiter = false

  def setStopOnError(stopOnError: Boolean): Unit = {
    this.stopOnError = stopOnError
  }

  def setThrowWarning(throwWarning: Boolean): Unit = {
    this.throwWarning = throwWarning
  }

  def setAutoCommit(autoCommit: Boolean): Unit = {
    this.autoCommit = autoCommit
  }

  def setSendFullScript(sendFullScript: Boolean): Unit = {
    this.sendFullScript = sendFullScript
  }

  def setRemoveCRs(removeCRs: Boolean): Unit = {
    this.removeCRs = removeCRs
  }

  /**
   * Sets the escape processing.
   *
   * @param escapeProcessing
   * the new escape processing
   * @since 3.1.1
   */
  def setEscapeProcessing(escapeProcessing: Boolean): Unit = {
    this.escapeProcessing = escapeProcessing
  }

  def setLogWriter(logWriter: PrintWriter): Unit = {
    this.logWriter = logWriter
  }

  def setErrorLogWriter(errorLogWriter: PrintWriter): Unit = {
    this.errorLogWriter = errorLogWriter
  }

  def setDelimiter(delimiter: String): Unit = {
    this.delimiter = delimiter
  }

  def setFullLineDelimiter(fullLineDelimiter: Boolean): Unit = {
    this.fullLineDelimiter = fullLineDelimiter
  }

  def runScript(reader: Reader): Unit = {
    setAutoCommit()
    try if (sendFullScript) executeFullScript(reader)
    else executeLineByLine(reader)
    finally rollbackConnection()
  }

  private def executeFullScript(reader: Reader): Unit = {
    val script = new StringBuilder
    try {
      val lineReader = new BufferedReader(reader)
      var line:String  = null
/*      while ( {
        line = lineReader.readLine; line !=(null)
      }) {
        script.append(line)
        script.append(ScriptRunner.LINE_SEPARATOR)
      }*/
      val iterator = Iterator.continually(lineReader.readLine()).takeWhile(_ != null)
      iterator.foreach {
      line =>
        script.append(line)
        script.append(ScriptRunner.LINE_SEPARATOR)
      }

      val command = script.toString
      println(command)
      executeStatement(command)
      commitConnection()
    } catch {
      case e: Exception =>
        val message = "Error executing: " + script + ".  Cause: " + e
        printlnError(message)
        throw new Exception(message, e)
    }
  }

  private def executeLineByLine(reader: Reader): Unit = {
    val command: StringBuilder= new StringBuilder
    try {
      val lineReader = new BufferedReader(reader)
      var line: String  = null
/*      while ( {
        line = lineReader.readLine; line !=(null)
      }) handleLine(command, line)*/
      val iterator = Iterator.continually(lineReader.readLine()).takeWhile(_ != null)
      iterator.foreach {
        line => handleLine(command, line)
      }
      commitConnection()
      checkForMissingLineTerminator(command)
    } catch {
      case e: Exception =>
        val message = "Error executing: " + command + ".  Cause: " + e
        printlnError(message)
        throw new Exception(message, e)
    }
  }

  /**
   * @deprecated Since 3.5.4, this method is deprecated. Please close the {@link Connection} outside of this class.
   */
  @deprecated def closeConnection(): Unit = {
    try connection.close()
    catch {
      case e: Exception =>

      // ignore
    }
  }

  private def setAutoCommit(): Unit = {
    try if (autoCommit != connection.getAutoCommit) connection.setAutoCommit(autoCommit)
    catch {
      case t: Throwable =>
        throw new Exception("Could not set AutoCommit to " + autoCommit + ". Cause: " + t, t)
    }
  }

  private def commitConnection(): Unit = {
    try if (!connection.getAutoCommit) connection.commit()
    catch {
      case t: Throwable =>
        throw new Exception("Could not commit transaction. Cause: " + t, t)
    }
  }

  private def rollbackConnection(): Unit = {
    try if (!connection.getAutoCommit) connection.rollback()
    catch {
      case t: Throwable =>

    }
  }

  private def checkForMissingLineTerminator(command: StringBuilder): Unit = {
    if (command != null && command.toString.trim.length > 0) throw new Exception("Line missing end-of-line terminator (" + delimiter + ") => " + command)
  }

  @throws[SQLException]
  private def handleLine(command: StringBuilder, line: String): Unit = {
    val trimmedLine = line.trim
    if (lineIsComment(trimmedLine)) {
      val matcher = ScriptRunner.DELIMITER_PATTERN.matcher {
        trimmedLine
      }
      if (matcher.find) delimiter = matcher.group(5)
      println(trimmedLine)
    }
    else if (commandReadyToExecute(trimmedLine)) {
      command.append(line, 0, line.lastIndexOf(delimiter))
      command.append(ScriptRunner.LINE_SEPARATOR)
      println(command)
      executeStatement(command.toString)
      command.setLength(0)
    }
    else if (trimmedLine.length > 0) {
      command.append(line)
      command.append(ScriptRunner.LINE_SEPARATOR)
    }
  }

  private def lineIsComment(trimmedLine: String) = trimmedLine.startsWith("//") || trimmedLine.startsWith("--")

  private def commandReadyToExecute(trimmedLine: String) = { // issue #561 remove anything after the delimiter
    !fullLineDelimiter && trimmedLine.contains(delimiter) || fullLineDelimiter && trimmedLine == delimiter
  }

  @throws[SQLException]
  private def executeStatement(command: String): Unit = {
    val statement = connection.createStatement
    try {
      statement.setEscapeProcessing(escapeProcessing)
      var sql = command
      if (removeCRs) sql = sql.replace("\r\n", "\n")
      try {
        var hasResults = statement.execute(sql)
        while ( {
          !(!(hasResults) && statement.getUpdateCount == -(1))
        }) {
          checkWarnings(statement)
          printResults(statement, hasResults)
          hasResults = statement.getMoreResults
        }
      } catch {
        case e: SQLWarning =>
          throw e
        case e: SQLException =>
          if (stopOnError) throw e
          else {
            val message = "Error executing: " + command + ".  Cause: " + e
            printlnError(message)
          }
      }
    } finally try statement.close()
    catch {
      case ignored: Exception =>

      // Ignore to workaround a bug in some connection pools
      // (Does anyone know the details of the bug?)
    }
  }

  @throws[SQLException]
  private def checkWarnings(statement: Statement): Unit = {
    if (!throwWarning) return
    // In Oracle, CREATE PROCEDURE, FUNCTION, etc. returns warning
    // instead of throwing exception if there is compilation error.
    val warning = statement.getWarnings
    if (warning != null) throw warning
  }

  private def printResults(statement: Statement, hasResults: Boolean): Unit = {
    if (!hasResults) return

      val rs = statement.getResultSet
    try {
        val md = rs.getMetaData
        val cols = md.getColumnCount
        for (i <- 0 until cols) {
          val name = md.getColumnLabel(i + 1)
          print(name + "\t")
        }
        println("")
        while ( {
          rs.next
        }) {
          for (i <- 0 until cols) {
            val value = rs.getString(i + 1)
            print(value + "\t")
          }
          println("")
        }
      } catch {
        case e: SQLException =>
          printlnError("Error printing results: " + e.getMessage)
      } finally if (rs != null) rs.close()

  }

  private def print(o: Any): Unit = {
    if (logWriter != null) {
      logWriter.print(o)
      logWriter.flush()
    }
  }

  private def println(o: Any): Unit = {
    if (logWriter != null) {
      logWriter.println(o)
      logWriter.flush()
    }
  }

  private def printlnError(o: Any): Unit = {
    if (errorLogWriter != null) {
      errorLogWriter.println(o)
      errorLogWriter.flush()
    }
  }
}

