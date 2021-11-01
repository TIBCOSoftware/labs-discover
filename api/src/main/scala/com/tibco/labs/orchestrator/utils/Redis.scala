package com.tibco.labs.orchestrator.utils


import better.files.{File => ScalaFile}
import com.tibco.labs.orchestrator.conf.DiscoverConfig
import com.tibco.labs.orchestrator.conf.DiscoverConfig.{redis_host, redis_port}
import redis.clients.jedis.exceptions.JedisConnectionException
import redis.clients.jedis.{Jedis, JedisPool, JedisPoolConfig, Protocol}
import org.slf4j.{Logger, LoggerFactory}

import scala.util.Try

object Redis {
  val logger: Logger = LoggerFactory.getLogger("spark-orchestrator:Redis")

  def connect(): Jedis = {
    logger.info(s"Entering singleton Redis for $redis_host, ${redis_port.toInt}")
    logger.info("Creating Redis Pool")
    val poolConfig: JedisPoolConfig = new JedisPoolConfig()
    poolConfig.setMaxTotal(250)
    poolConfig.setMaxIdle(32)
    poolConfig.setMaxWaitMillis(10000)
    poolConfig.setTestOnBorrow(false)
    poolConfig.setTestOnReturn(false)
    poolConfig.setTestWhileIdle(false)
    poolConfig.setMinEvictableIdleTimeMillis(60000)
    poolConfig.setTimeBetweenEvictionRunsMillis(30000)
    poolConfig.setNumTestsPerEvictionRun(-1)
    val jedisPools: JedisPool = new JedisPool(poolConfig, redis_host, redis_port.toInt,10000)
    logger.info("Connecting to Redis")
    var sleepTime: Int = 4
    var conn: Jedis = null
    while (conn == null) {
      try {
        conn = jedisPools.getResource
      }
      catch {
        case e: JedisConnectionException if e.getCause.toString.
          contains("ERR max number of clients reached") => {
          if (sleepTime < 500) sleepTime *= 2
          Thread.sleep(sleepTime)
        }
        case e: Exception => throw e
      }
    }
    logger.info("Redis connected")
    conn
  }

  val jedis: Jedis = connect()

  def withRedis[T](f: Jedis => T): Try[T] = {

    Try {
      //var jedis: Jedis = null
      try {
        //logger.info("connect")
        //jedis = jedisPools.getResource
        logger.info("Redis command")
        f(jedis)
      } catch {
        case e: JedisConnectionException if e.getCause.toString.contains("ERR max number of clients reached") => {
          logger.error("ERR max number of clients reached")
          //jedisPools.returnBrokenResource(jedis)
          throw e
        }
        case e: Exception => {
          logger.error(s"${e.getMessage}")
          //jedisPools.returnBrokenResource(jedis)
          throw e
        }
      }
      finally {
        if (jedis != null) {
          logger.info("Redis close")
          jedis.close()
        }
        //jedis.close()
      }
    }
  }




}
