package com.tibco.labs.orchestrator.models

import io.circe.generic.extras._

case class DatasetSourceTdv(
                             DatasourceType: Option[String],
                             Encoding: Option[String],
                             EscapeChar: Option[String],
                             NewLine: Option[String],
                             FileName: String,
                             FilePath: String,
                             QuoteChar: Option[String],
                             CommentsChar: Option[String],
                             Separator: Option[String],
                             Headers: Option[String]
                           )

case class tdvJob(
                   DataSourcePath: Option[String],
                   DataSetViewPath: Option[String],
                   PublishedDataSourcePath: Option[String],
                   DatasetID: Option[String],
                   DatasetName: String, //This is a Label
                   DatasetDescription: Option[String],
                   DatasetSource: DatasetSourceTdv,
                   Organization: String,
                   CreationTime: Option[Long]
                 )

case class SchemaTdv(
                      COLUMN_NAME: String,
                      DATA_TYPE: String,
                      ORDINAL_POSITION: Double,
                      JDBC_DATA_TYPE: Double
                    )

case class TDV(
                schema: List[SchemaTdv]
              )

case class RawData(data: List[String])


object PublishedViews {
  implicit val configuration = Configuration.default.copy(useDefaults = true)
}

@ConfiguredJsonCodec
case class PublishedViews(
                           DatasetName: String,
                           Annotation: String = "None",
                           DatasetPath: String,
                           CreationTime: Long,
                           ModificationTime: Long
                         )
case class PublishedViewsModed(
                           DatasetName: String,
                           Annotation: String = "None",
                           DatasetPath: String
                         )

case class TDVPublished(
                         Datasets: List[PublishedViews]
                       )

case class DataViewProperties(
                               Key: Option[String],
                               JavaType: Option[String],
                               Value: Option[String]
                             )

case class detailViews(
                        NAME: Option[String],
                        TABLE_TYPE: Option[String],
                        GUID: Option[String],
                        ANNOTATION: Option[String],
                        OWNER_ID: Option[Double],
                        OWNER: Option[String],
                        PARENT_PATH: Option[String],
                        CREATOR_ID: Option[Double],
                        CREATION_TIMESTAMP: Option[Double],
                        MODIFIER_ID: Option[Double],
                        MODIFICATION_TIMESTAMP: Option[Double],
                        IMPACT_MESSAGE: Option[String],
                        properties: List[DataViewProperties]
                      )


case class Resource(
                     Path: String,
                     Type: String
                   )

case class Privilege(
                      Domain: String,
                      Name: String,
                      Type: String, // USER || GROUP
                      Privileges: String
                    )

case class PrivilegeEntry(
                           Resource: Resource,
                           Privileges: Array[Privilege]
                         )

case class ManagedDatasets(
                           Datasets : List[ManagedDatasetsInfo]
                          )

case class  ManagedDatasetsInfo(
                               DatasetId: String,
                               DatasetName: String,
                               DatasetDescription: String,
                               CreationTime: Long
                               )

// for the copy api
case class UnManageDataSetCopy(
                                DatasetName: String,
                                Annotation: Option[String],
                                DatasetPath: String,
                                Organization: String
                          )

// to be stored in redis after copy, or retrieved thru unmanaged all
case class UnManageDataSetInfoStored(
                            DatasetId: String,
                            DatasetName: String,
                            Annotation: String,
                            OriginalDatasetPath: String,
                            Organization: String,
                            CreationTme: Long
                          )