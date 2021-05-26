/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/
package com.tibco.labs.utils

import org.apache.spark.sql.types._

class Schema2CaseClass {
  type TypeConverter = DataType => String

  def schemaToCaseClass(schema: StructType, className: String)(implicit tc: TypeConverter): String = {
    def genField(s: StructField): String = {
      val f = tc(s.dataType)
      s match {
        case x if x.nullable => s"  ${s.name}:Option[$f]"
        case _ => s"  ${s.name}:$f"
      }
    }

    val fieldsStr = schema.map(genField).mkString(",\n  ")
    s"""
       |case class $className (
       |  $fieldsStr
       |)
""".stripMargin
  }

  object implicits {
    implicit val defaultTypeConverter: TypeConverter = {
      case _: ByteType => "Byte"
      case _: ShortType => "Short"
      case _: IntegerType => "Int"
      case _: LongType => "Long"
      case _: FloatType => "Float"
      case _: DoubleType => "Double"
      case _: DecimalType => "java.math.BigDecimal"
      case _: StringType => "String"
      case _: BinaryType => "Array[Byte]"
      case _: BooleanType => "Boolean"
      case _: TimestampType => "java.sql.Timestamp"
      case _: DateType => "java.sql.Date"
      case t@(_: ArrayType) =>
        val e = t match {
          case ArrayType(elementType, _) => elementType
        }
        s"Seq[${defaultTypeConverter(e)}]"
      case _: MapType => "scala.collection.Map"
      case _: StructType => "org.apache.spark.sql.Row"
      case _ => "String"
    }
  }

}

