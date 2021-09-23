import { Deserializable } from "@tibco-tcstk/tc-core-lib";
import { PublishedViews } from "./backend";
export class DatasetListItem implements Deserializable {
    datasetid: string;
    name: string;
    fileName?: string;
    filePath?: string;
    description?: string;
    createdDate: number;
    status?: string;
    lastPreviewDate?: number;
    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
export class DatasetListItemArray implements Deserializable {
    listItems: DatasetListItem[];
    deserialize(input: any): this {
        this.listItems = [];
        Object.assign(this.listItems, input);
        return this;
    }
}
export class Dataset implements Deserializable {
    Dataset_Description: string;
    Dataset_Id: string;
    Dataset_Name: string;
    Dataset_Source?: DatasetDataSource;
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
    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
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
export class DatasetWizard {
    numberRowsForPreview?: number;
    dataSourceChanged?: boolean;
    attributesUnpredicted?: boolean;
    skipComments?: boolean;
    skipEmptyLines?: boolean;
    dataSourceType?: string;
}
export class DatasetDataSource implements Deserializable {
    DatasourceType: string;
    Encoding: string;
    FileEscapeChar: string;
    FileHeaders: string;
    FileName?: string;
    FilePath?: string;
    FileQuoteChar: string;
    FileSeparator: string;
    PublishedView?: string;
    deserialize(input: any): this {
        Object.assign(this, input);
        return this;
    }
}
export class DatasetSchema {
    featureType?: string;
    format?: string;
    importance?: string;
    key: string;
    type: string;
}

export class RedisFileInfo {
    'ContentType': string;
    'LastModified': string;
    'OriginalFilename': string;
    'OriginalEncoding': string;
    'FileSize': string;
    'newline': string;
    'EscapeChar': string;
    'QuoteChar': string;
    'Separator': string;
    'Encoding': string;
    'OriginalNewLine': string;
    'FileLocation': string;
}

export interface CsvFile {
    redisFileInfo: RedisFileInfo;
    beingUsed: boolean;
    fileSize: number;
}
