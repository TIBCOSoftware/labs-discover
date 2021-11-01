import localVarRequest from 'request';

export * from './actionPerformedActivities';
export * from './actionPerformedAllManagedDatasets';
export * from './actionPerformedCheck';
export * from './actionPerformedCopyUnManaged';
export * from './actionPerformedDataSchema';
export * from './actionPerformedDeleteAnalysis';
export * from './actionPerformedDeleteMetrics';
export * from './actionPerformedDeleted';
export * from './actionPerformedDetailsAssets';
export * from './actionPerformedDetailsAssetsUnManaged';
export * from './actionPerformedFiles';
export * from './actionPerformedFilesPreview';
export * from './actionPerformedFilesUrl';
export * from './actionPerformedGetAllAnalysis';
export * from './actionPerformedGetData';
export * from './actionPerformedGetReference';
export * from './actionPerformedLoginValidate';
export * from './actionPerformedPreview';
export * from './actionPerformedRenderedMetrics';
export * from './actionPerformedRenderedMetricsAS';
export * from './actionPerformedSchedules';
export * from './actionPerformedSparkSingle';
export * from './actionPerformedStoreMetrics';
export * from './actionPerformedTDVCreate';
export * from './actionPerformedUIAssets';
export * from './actionPerformedUIAssetsUrl';
export * from './actionPerformedUnmanagedPublishedViews';
export * from './actionPerformedUpdate';
export * from './activitiesTable';
export * from './analysisList';
export * from './analysisMetrics';
export * from './datasetSource';
export * from './datasetSourceTdv';
export * from './filter';
export * from './listActivitiesTable';
export * from './listAnalysisList';
export * from './listBucket';
export * from './listFilter';
export * from './listListBucket';
export * from './listManagedDatasetsInfo';
export * from './listProfiles';
export * from './listPublishedViews';
export * from './listRedisFileInfo';
export * from './listSchema';
export * from './listSchemaPreview';
export * from './listSchemaTdv';
export * from './listString';
export * from './listVariantsTable';
export * from './loginCredentials';
export * from './managedDatasetsInfo';
export * from './mapping';
export * from './metricsAnalysis';
export * from './metricsDS';
export * from './pmConfigLiveApps';
export * from './previewConfigFile';
export * from './profiles';
export * from './publishedViews';
export * from './redisContent';
export * from './redisFileInfo';
export * from './s3Content';
export * from './schedule';
export * from './schema';
export * from './schemaPreview';
export * from './schemaTdv';
export * from './tDV';
export * from './tdvJob';
export * from './unManageDataSetCopy';
export * from './unManageDataSetInfoStored';
export * from './variantsTable';

import * as fs from 'fs';

export interface RequestDetailedFile {
    value: Buffer;
    options?: {
        filename?: string;
        contentType?: string;
    }
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;


import { ActionPerformedActivities } from './actionPerformedActivities';
import { ActionPerformedAllManagedDatasets } from './actionPerformedAllManagedDatasets';
import { ActionPerformedCheck } from './actionPerformedCheck';
import { ActionPerformedCopyUnManaged } from './actionPerformedCopyUnManaged';
import { ActionPerformedDataSchema } from './actionPerformedDataSchema';
import { ActionPerformedDeleteAnalysis } from './actionPerformedDeleteAnalysis';
import { ActionPerformedDeleteMetrics } from './actionPerformedDeleteMetrics';
import { ActionPerformedDeleted } from './actionPerformedDeleted';
import { ActionPerformedDetailsAssets } from './actionPerformedDetailsAssets';
import { ActionPerformedDetailsAssetsUnManaged } from './actionPerformedDetailsAssetsUnManaged';
import { ActionPerformedFiles } from './actionPerformedFiles';
import { ActionPerformedFilesPreview } from './actionPerformedFilesPreview';
import { ActionPerformedFilesUrl } from './actionPerformedFilesUrl';
import { ActionPerformedGetAllAnalysis } from './actionPerformedGetAllAnalysis';
import { ActionPerformedGetData } from './actionPerformedGetData';
import { ActionPerformedGetReference } from './actionPerformedGetReference';
import { ActionPerformedLoginValidate } from './actionPerformedLoginValidate';
import { ActionPerformedPreview } from './actionPerformedPreview';
import { ActionPerformedRenderedMetrics } from './actionPerformedRenderedMetrics';
import { ActionPerformedRenderedMetricsAS } from './actionPerformedRenderedMetricsAS';
import { ActionPerformedSchedules } from './actionPerformedSchedules';
import { ActionPerformedSparkSingle } from './actionPerformedSparkSingle';
import { ActionPerformedStoreMetrics } from './actionPerformedStoreMetrics';
import { ActionPerformedTDVCreate } from './actionPerformedTDVCreate';
import { ActionPerformedUIAssets } from './actionPerformedUIAssets';
import { ActionPerformedUIAssetsUrl } from './actionPerformedUIAssetsUrl';
import { ActionPerformedUnmanagedPublishedViews } from './actionPerformedUnmanagedPublishedViews';
import { ActionPerformedUpdate } from './actionPerformedUpdate';
import { ActivitiesTable } from './activitiesTable';
import { AnalysisList } from './analysisList';
import { AnalysisMetrics } from './analysisMetrics';
import { DatasetSource } from './datasetSource';
import { DatasetSourceTdv } from './datasetSourceTdv';
import { Filter } from './filter';
import { ListActivitiesTable } from './listActivitiesTable';
import { ListAnalysisList } from './listAnalysisList';
import { ListBucket } from './listBucket';
import { ListFilter } from './listFilter';
import { ListListBucket } from './listListBucket';
import { ListManagedDatasetsInfo } from './listManagedDatasetsInfo';
import { ListProfiles } from './listProfiles';
import { ListPublishedViews } from './listPublishedViews';
import { ListRedisFileInfo } from './listRedisFileInfo';
import { ListSchema } from './listSchema';
import { ListSchemaPreview } from './listSchemaPreview';
import { ListSchemaTdv } from './listSchemaTdv';
import { ListString } from './listString';
import { ListVariantsTable } from './listVariantsTable';
import { LoginCredentials } from './loginCredentials';
import { ManagedDatasetsInfo } from './managedDatasetsInfo';
import { Mapping } from './mapping';
import { MetricsAnalysis } from './metricsAnalysis';
import { MetricsDS } from './metricsDS';
import { PmConfigLiveApps } from './pmConfigLiveApps';
import { PreviewConfigFile } from './previewConfigFile';
import { Profiles } from './profiles';
import { PublishedViews } from './publishedViews';
import { RedisContent } from './redisContent';
import { RedisFileInfo } from './redisFileInfo';
import { S3Content } from './s3Content';
import { Schedule } from './schedule';
import { Schema } from './schema';
import { SchemaPreview } from './schemaPreview';
import { SchemaTdv } from './schemaTdv';
import { TDV } from './tDV';
import { TdvJob } from './tdvJob';
import { UnManageDataSetCopy } from './unManageDataSetCopy';
import { UnManageDataSetInfoStored } from './unManageDataSetInfoStored';
import { VariantsTable } from './variantsTable';

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
    "ActionPerformedActivities": ActionPerformedActivities,
    "ActionPerformedAllManagedDatasets": ActionPerformedAllManagedDatasets,
    "ActionPerformedCheck": ActionPerformedCheck,
    "ActionPerformedCopyUnManaged": ActionPerformedCopyUnManaged,
    "ActionPerformedDataSchema": ActionPerformedDataSchema,
    "ActionPerformedDeleteAnalysis": ActionPerformedDeleteAnalysis,
    "ActionPerformedDeleteMetrics": ActionPerformedDeleteMetrics,
    "ActionPerformedDeleted": ActionPerformedDeleted,
    "ActionPerformedDetailsAssets": ActionPerformedDetailsAssets,
    "ActionPerformedDetailsAssetsUnManaged": ActionPerformedDetailsAssetsUnManaged,
    "ActionPerformedFiles": ActionPerformedFiles,
    "ActionPerformedFilesPreview": ActionPerformedFilesPreview,
    "ActionPerformedFilesUrl": ActionPerformedFilesUrl,
    "ActionPerformedGetAllAnalysis": ActionPerformedGetAllAnalysis,
    "ActionPerformedGetData": ActionPerformedGetData,
    "ActionPerformedGetReference": ActionPerformedGetReference,
    "ActionPerformedLoginValidate": ActionPerformedLoginValidate,
    "ActionPerformedPreview": ActionPerformedPreview,
    "ActionPerformedRenderedMetrics": ActionPerformedRenderedMetrics,
    "ActionPerformedRenderedMetricsAS": ActionPerformedRenderedMetricsAS,
    "ActionPerformedSchedules": ActionPerformedSchedules,
    "ActionPerformedSparkSingle": ActionPerformedSparkSingle,
    "ActionPerformedStoreMetrics": ActionPerformedStoreMetrics,
    "ActionPerformedTDVCreate": ActionPerformedTDVCreate,
    "ActionPerformedUIAssets": ActionPerformedUIAssets,
    "ActionPerformedUIAssetsUrl": ActionPerformedUIAssetsUrl,
    "ActionPerformedUnmanagedPublishedViews": ActionPerformedUnmanagedPublishedViews,
    "ActionPerformedUpdate": ActionPerformedUpdate,
    "ActivitiesTable": ActivitiesTable,
    "AnalysisList": AnalysisList,
    "AnalysisMetrics": AnalysisMetrics,
    "DatasetSource": DatasetSource,
    "DatasetSourceTdv": DatasetSourceTdv,
    "Filter": Filter,
    "ListActivitiesTable": ListActivitiesTable,
    "ListAnalysisList": ListAnalysisList,
    "ListBucket": ListBucket,
    "ListFilter": ListFilter,
    "ListListBucket": ListListBucket,
    "ListManagedDatasetsInfo": ListManagedDatasetsInfo,
    "ListProfiles": ListProfiles,
    "ListPublishedViews": ListPublishedViews,
    "ListRedisFileInfo": ListRedisFileInfo,
    "ListSchema": ListSchema,
    "ListSchemaPreview": ListSchemaPreview,
    "ListSchemaTdv": ListSchemaTdv,
    "ListString": ListString,
    "ListVariantsTable": ListVariantsTable,
    "LoginCredentials": LoginCredentials,
    "ManagedDatasetsInfo": ManagedDatasetsInfo,
    "Mapping": Mapping,
    "MetricsAnalysis": MetricsAnalysis,
    "MetricsDS": MetricsDS,
    "PmConfigLiveApps": PmConfigLiveApps,
    "PreviewConfigFile": PreviewConfigFile,
    "Profiles": Profiles,
    "PublishedViews": PublishedViews,
    "RedisContent": RedisContent,
    "RedisFileInfo": RedisFileInfo,
    "S3Content": S3Content,
    "Schedule": Schedule,
    "Schema": Schema,
    "SchemaPreview": SchemaPreview,
    "SchemaTdv": SchemaTdv,
    "TDV": TDV,
    "TdvJob": TdvJob,
    "UnManageDataSetCopy": UnManageDataSetCopy,
    "UnManageDataSetInfoStored": UnManageDataSetInfoStored,
    "VariantsTable": VariantsTable,
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
