import localVarRequest from 'request';

export * from './actionPerformedAllManagedDatasets';
export * from './actionPerformedCopyUnManaged';
export * from './actionPerformedDataSchema';
export * from './actionPerformedDeleted';
export * from './actionPerformedDetailsAssets';
export * from './actionPerformedDetailsAssetsUnManaged';
export * from './actionPerformedFiles';
export * from './actionPerformedFilesPreview';
export * from './actionPerformedGetData';
export * from './actionPerformedLoginValidate';
export * from './actionPerformedPreview';
export * from './actionPerformedSchedules';
export * from './actionPerformedSparkSingle';
export * from './actionPerformedTDVCreate';
export * from './actionPerformedUnmanagedPublishedViews';
export * from './actionPerformedUpdate';
export * from './datasetSource';
export * from './datasetSourceTdv';
export * from './filter';
export * from './listBucket';
export * from './listFilter';
export * from './listListBucket';
export * from './listManagedDatasetsInfo';
export * from './listPublishedViews';
export * from './listRedisFileInfo';
export * from './listSchema';
export * from './listSchemaTdv';
export * from './listString';
export * from './loginCredentials';
export * from './managedDatasetsInfo';
export * from './mapping';
export * from './pmConfigLiveApps';
export * from './previewConfigFile';
export * from './publishedViews';
export * from './redisContent';
export * from './redisFileInfo';
export * from './s3Content';
export * from './schedule';
export * from './schema';
export * from './schemaTdv';
export * from './tDV';
export * from './tdvJob';
export * from './unManageDataSetCopy';
export * from './unManageDataSetInfoStored';

import * as fs from 'fs';

export interface RequestDetailedFile {
    value: Buffer;
    options?: {
        filename?: string;
        contentType?: string;
    }
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;


import { ActionPerformedAllManagedDatasets } from './actionPerformedAllManagedDatasets';
import { ActionPerformedCopyUnManaged } from './actionPerformedCopyUnManaged';
import { ActionPerformedDataSchema } from './actionPerformedDataSchema';
import { ActionPerformedDeleted } from './actionPerformedDeleted';
import { ActionPerformedDetailsAssets } from './actionPerformedDetailsAssets';
import { ActionPerformedDetailsAssetsUnManaged } from './actionPerformedDetailsAssetsUnManaged';
import { ActionPerformedFiles } from './actionPerformedFiles';
import { ActionPerformedFilesPreview } from './actionPerformedFilesPreview';
import { ActionPerformedGetData } from './actionPerformedGetData';
import { ActionPerformedLoginValidate } from './actionPerformedLoginValidate';
import { ActionPerformedPreview } from './actionPerformedPreview';
import { ActionPerformedSchedules } from './actionPerformedSchedules';
import { ActionPerformedSparkSingle } from './actionPerformedSparkSingle';
import { ActionPerformedTDVCreate } from './actionPerformedTDVCreate';
import { ActionPerformedUnmanagedPublishedViews } from './actionPerformedUnmanagedPublishedViews';
import { ActionPerformedUpdate } from './actionPerformedUpdate';
import { DatasetSource } from './datasetSource';
import { DatasetSourceTdv } from './datasetSourceTdv';
import { Filter } from './filter';
import { ListBucket } from './listBucket';
import { ListFilter } from './listFilter';
import { ListListBucket } from './listListBucket';
import { ListManagedDatasetsInfo } from './listManagedDatasetsInfo';
import { ListPublishedViews } from './listPublishedViews';
import { ListRedisFileInfo } from './listRedisFileInfo';
import { ListSchema } from './listSchema';
import { ListSchemaTdv } from './listSchemaTdv';
import { ListString } from './listString';
import { LoginCredentials } from './loginCredentials';
import { ManagedDatasetsInfo } from './managedDatasetsInfo';
import { Mapping } from './mapping';
import { PmConfigLiveApps } from './pmConfigLiveApps';
import { PreviewConfigFile } from './previewConfigFile';
import { PublishedViews } from './publishedViews';
import { RedisContent } from './redisContent';
import { RedisFileInfo } from './redisFileInfo';
import { S3Content } from './s3Content';
import { Schedule } from './schedule';
import { Schema } from './schema';
import { SchemaTdv } from './schemaTdv';
import { TDV } from './tDV';
import { TdvJob } from './tdvJob';
import { UnManageDataSetCopy } from './unManageDataSetCopy';
import { UnManageDataSetInfoStored } from './unManageDataSetInfoStored';

/* tslint:disable:no-unused-variable */
let primitives = [
                    "string",
                    "boolean",
                    "double",
                    "integer",
                    "long",
                    "float",
                    "number",
                    "any"
                 ];

let enumsMap: {[index: string]: any} = {
}

let typeMap: {[index: string]: any} = {
    "ActionPerformedAllManagedDatasets": ActionPerformedAllManagedDatasets,
    "ActionPerformedCopyUnManaged": ActionPerformedCopyUnManaged,
    "ActionPerformedDataSchema": ActionPerformedDataSchema,
    "ActionPerformedDeleted": ActionPerformedDeleted,
    "ActionPerformedDetailsAssets": ActionPerformedDetailsAssets,
    "ActionPerformedDetailsAssetsUnManaged": ActionPerformedDetailsAssetsUnManaged,
    "ActionPerformedFiles": ActionPerformedFiles,
    "ActionPerformedFilesPreview": ActionPerformedFilesPreview,
    "ActionPerformedGetData": ActionPerformedGetData,
    "ActionPerformedLoginValidate": ActionPerformedLoginValidate,
    "ActionPerformedPreview": ActionPerformedPreview,
    "ActionPerformedSchedules": ActionPerformedSchedules,
    "ActionPerformedSparkSingle": ActionPerformedSparkSingle,
    "ActionPerformedTDVCreate": ActionPerformedTDVCreate,
    "ActionPerformedUnmanagedPublishedViews": ActionPerformedUnmanagedPublishedViews,
    "ActionPerformedUpdate": ActionPerformedUpdate,
    "DatasetSource": DatasetSource,
    "DatasetSourceTdv": DatasetSourceTdv,
    "Filter": Filter,
    "ListBucket": ListBucket,
    "ListFilter": ListFilter,
    "ListListBucket": ListListBucket,
    "ListManagedDatasetsInfo": ListManagedDatasetsInfo,
    "ListPublishedViews": ListPublishedViews,
    "ListRedisFileInfo": ListRedisFileInfo,
    "ListSchema": ListSchema,
    "ListSchemaTdv": ListSchemaTdv,
    "ListString": ListString,
    "LoginCredentials": LoginCredentials,
    "ManagedDatasetsInfo": ManagedDatasetsInfo,
    "Mapping": Mapping,
    "PmConfigLiveApps": PmConfigLiveApps,
    "PreviewConfigFile": PreviewConfigFile,
    "PublishedViews": PublishedViews,
    "RedisContent": RedisContent,
    "RedisFileInfo": RedisFileInfo,
    "S3Content": S3Content,
    "Schedule": Schedule,
    "Schema": Schema,
    "SchemaTdv": SchemaTdv,
    "TDV": TDV,
    "TdvJob": TdvJob,
    "UnManageDataSetCopy": UnManageDataSetCopy,
    "UnManageDataSetInfoStored": UnManageDataSetInfoStored,
}

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
            if (enumsMap[expectedType]) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }

            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if(typeMap[discriminatorType]){
                        return discriminatorType; // use the type given in the discriminator
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

    public static serialize(data: any, type: string) {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.serialize(datum, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return data.toISOString();
        } else {
            if (enumsMap[type]) {
                return data;
            }
            if (!typeMap[type]) { // in case we dont know the type
                return data;
            }

            // Get the actual type of this object
            type = this.findCorrectType(data, type);

            // get the map for the correct type.
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance: {[index: string]: any} = {};
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
            }
            return instance;
        }
    }

    public static deserialize(data: any, type: string) {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.deserialize(datum, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return new Date(data);
        } else {
            if (enumsMap[type]) {// is Enum
                return data;
            }

            if (!typeMap[type]) { // dont know the type
                return data;
            }
            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.name] = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type);
            }
            return instance;
        }
    }
}

export interface Authentication {
    /**
    * Apply authentication settings to header and query params.
    */
    applyToRequest(requestOptions: localVarRequest.Options): Promise<void> | void;
}

export class HttpBasicAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        requestOptions.auth = {
            username: this.username, password: this.password
        }
    }
}

export class HttpBearerAuth implements Authentication {
    public accessToken: string | (() => string) = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            const accessToken = typeof this.accessToken === 'function'
                            ? this.accessToken()
                            : this.accessToken;
            requestOptions.headers["Authorization"] = "Bearer " + accessToken;
        }
    }
}

export class ApiKeyAuth implements Authentication {
    public apiKey: string = '';

    constructor(private location: string, private paramName: string) {
    }

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (this.location == "query") {
            (<any>requestOptions.qs)[this.paramName] = this.apiKey;
        } else if (this.location == "header" && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        } else if (this.location == 'cookie' && requestOptions && requestOptions.headers) {
            if (requestOptions.headers['Cookie']) {
                requestOptions.headers['Cookie'] += '; ' + this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
            else {
                requestOptions.headers['Cookie'] = this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
        }
    }
}

export class OAuth implements Authentication {
    public accessToken: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}

export class VoidAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(_: localVarRequest.Options): void {
        // Do nothing
    }
}

export type Interceptor = (requestOptions: localVarRequest.Options) => (Promise<void> | void);
