/**
 * The models_ui generated from https://api.labs.tibcocloud.com/api-docs/swagger.json
 */

 export interface DatasetSourceTdv {
  DatasourceType: string;
  Encoding: string;
  EscapeChar?: string;
  FileName: string;
  FilePath: string;
  QuoteChar?: string;
  CommentsChar?: string;
  Separator?: string;
  Headers?: string;
}

export interface TdvJob {
  DatasetID?: string;
  DatasetName: string;
  DatasetDescription: string;
  DatasetSource: DatasetSourceTdv;
  Organization: string;
}

export interface UploadFileResponse {
  code: string;
  file: string;
  message: string;
}

export interface ActionPerformed {
  message: string;
  code: number;
  resource: string;
}

export interface ActionPerformedTDVCreate {
  message: string;
  code: number;
  datasource: string;
  dataview: string;
  publishedview: string;
  dataSourceName: string;
  dataSetId: string;
}

export interface ActionPerformedUpdate {
  message: string;
  code: number;
  resource: string;
  dataSetId: string;
}

export interface ActionPerformed4 {
  code: number;
  Data: string;
}

export interface ActionPerformedLoginValidate {
  status: string;
  code: number;
  orgId: string;
}

export interface PreviewConfigFile {
  Token: string;
  Organization: string;
  DatasetId: string;
}

export interface ActionPerformedPreview {
  message: string;
  code: number;
  status: string;
  jobId: string;
}

export interface PublishedTdvDataset {
  Datasets_Name: string;
  Annotation: string;
}

export interface PublishedViews{
  DatasetName: string;
  Annotation:	string;
  DatasetPath:	string;
  CreationTime:	number;
  ModificationTime:	number;
}

export interface Schema {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  ORDINAL_POSITION: number;
  JDBC_DATA_TYPE: number;
}

export interface UnManageDataSetInfoStored{
  DatasetId: string;
  DatasetName: string;
  Annotation:	string;
  OriginalDatasetPath: string;
  Organization:	string;
  CreationTme: number;
}

