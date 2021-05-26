import { ListBucket, PublishedViews, RedisFileInfo } from "../backend/api";

export interface Dataset {
  datasetid: string;
  name: string;
  fileName?: string;
  description?: string;
  createdDate: number;
  status?: string;
  lastPreviewDate?: number;
  type: string;

}

export interface DatasetSchema {
  featureType: string;
  format: string;
  importance: string;
  key: string;
  type: string;
}

export interface DatasetDetail {
  Dataset_Description: string;
  Dataset_Id: string;
  Dataset_Name: string;
  Dataset_Source?: DatasetSource;
  schema?: DatasetSchema[];
  createdDate?: number;
  updatedDate?: number;
  // the preview job status
  status?: string;
  lastPreviewDate?: number;
  PublishedView?: string;
  previewStatus?: PreviewStatus;
  TdvView?: PublishedViews;
  CsvFile?: RedisFileInfo;
  type: string;
  csvMethod: string;
  // true if deleted, once all the cleaning job is done, the dataset entry will be deleted in the end
  deleted?: boolean;
}

export interface DatasetSource {
  DatasourceType?: string;
  Encoding: string;
  FileEscapeChar: string;
  FileHeaders: string;
  FileName: string;
  FilePath?: string;
  FileQuoteChar: string;
  FileSeparator: string;
}

export interface PreviewStatus {
  Organisation: string,
  JobName: string,
  DatasetID : string,
  Message?: string,
  Level: string,
  Progression: number,
  TimeStamp: number
}