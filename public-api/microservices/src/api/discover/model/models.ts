import localVarRequest from 'request';

export * from './actionPerformedFiles';
export * from './analysis';
export * from './analysisData';
export * from './analysisMetadata';
export * from './analysisMetrics';
export * from './analysisRequest';
export * from './analysisStatus';
export * from './analytics';
export * from './application';
export * from './automapingField';
export * from './automapping';
export * from './checkExist';
export * from './checkExistResult';
export * from './csvFile';
export * from './dataset';
export * from './datasetListItem';
export * from './datasetSource';
export * from './datasetUpdated';
export * from './discoverConfiguration';
export * from './fieldFormats';
export * from './folderModel';
export * from './generalInformation';
export * from './investigationActions';
export * from './investigationApplication';
export * from './investigationApplicationDefinition';
export * from './investigationCreateRequest';
export * from './investigationCreateResponse';
export * from './investigationDetails';
export * from './investigationField';
export * from './investigationMetadata';
export * from './investigationState';
export * from './investigationTrigger';
export * from './investigationTriggerAttributes';
export * from './investigations';
export * from './landingPage';
export * from './landingPageButtons';
export * from './landingPageHightlight';
export * from './landingPageUploadResponse';
export * from './mapFolderCollection';
export * from './mapFolderCollectionBreadcrumbs';
export * from './mapFolderModel';
export * from './mapFolderModelAccessRights';
export * from './mapFolderModelAccessRightsSpecific';
export * from './mapFolderModelMaps';
export * from './mapFolderModelSubFolders';
export * from './mapping';
export * from './message';
export * from './newVisualisationInformation';
export * from './preview';
export * from './previewColumn';
export * from './previewStatus';
export * from './publishedViews';
export * from './redisFileInfo';
export * from './schema';
export * from './schemaTdv';
export * from './template';
export * from './templateFilterConfig';
export * from './templateMarkingConfig';
export * from './templateMenuConfig';
export * from './templateRequest';
export * from './tenantInformation';
export * from './typeValue';
export * from './unManageDataSetCopy';
export * from './visualisation';
export * from './whoAmI';

import * as fs from 'fs';

export interface RequestDetailedFile {
    value: Buffer;
    options?: {
        filename?: string;
        contentType?: string;
    }
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;


import { ActionPerformedFiles } from './actionPerformedFiles';
import { Analysis } from './analysis';
import { AnalysisData } from './analysisData';
import { AnalysisMetadata } from './analysisMetadata';
import { AnalysisMetrics } from './analysisMetrics';
import { AnalysisRequest } from './analysisRequest';
import { AnalysisStatus } from './analysisStatus';
import { Analytics } from './analytics';
import { Application } from './application';
import { AutomapingField } from './automapingField';
import { Automapping } from './automapping';
import { CheckExist } from './checkExist';
import { CheckExistResult } from './checkExistResult';
import { CsvFile } from './csvFile';
import { Dataset } from './dataset';
import { DatasetListItem } from './datasetListItem';
import { DatasetSource } from './datasetSource';
import { DatasetUpdated } from './datasetUpdated';
import { DiscoverConfiguration } from './discoverConfiguration';
import { FieldFormats } from './fieldFormats';
import { FolderModel } from './folderModel';
import { GeneralInformation } from './generalInformation';
import { InvestigationActions } from './investigationActions';
import { InvestigationApplication } from './investigationApplication';
import { InvestigationApplicationDefinition } from './investigationApplicationDefinition';
import { InvestigationCreateRequest } from './investigationCreateRequest';
import { InvestigationCreateResponse } from './investigationCreateResponse';
import { InvestigationDetails } from './investigationDetails';
import { InvestigationField } from './investigationField';
import { InvestigationMetadata } from './investigationMetadata';
import { InvestigationState } from './investigationState';
import { InvestigationTrigger } from './investigationTrigger';
import { InvestigationTriggerAttributes } from './investigationTriggerAttributes';
import { Investigations } from './investigations';
import { LandingPage } from './landingPage';
import { LandingPageButtons } from './landingPageButtons';
import { LandingPageHightlight } from './landingPageHightlight';
import { LandingPageUploadResponse } from './landingPageUploadResponse';
import { MapFolderCollection } from './mapFolderCollection';
import { MapFolderCollectionBreadcrumbs } from './mapFolderCollectionBreadcrumbs';
import { MapFolderModel } from './mapFolderModel';
import { MapFolderModelAccessRights } from './mapFolderModelAccessRights';
import { MapFolderModelAccessRightsSpecific } from './mapFolderModelAccessRightsSpecific';
import { MapFolderModelMaps } from './mapFolderModelMaps';
import { MapFolderModelSubFolders } from './mapFolderModelSubFolders';
import { Mapping } from './mapping';
import { Message } from './message';
import { NewVisualisationInformation } from './newVisualisationInformation';
import { Preview } from './preview';
import { PreviewColumn } from './previewColumn';
import { PreviewStatus } from './previewStatus';
import { PublishedViews } from './publishedViews';
import { RedisFileInfo } from './redisFileInfo';
import { Schema } from './schema';
import { SchemaTdv } from './schemaTdv';
import { Template } from './template';
import { TemplateFilterConfig } from './templateFilterConfig';
import { TemplateMarkingConfig } from './templateMarkingConfig';
import { TemplateMenuConfig } from './templateMenuConfig';
import { TemplateRequest } from './templateRequest';
import { TenantInformation } from './tenantInformation';
import { TypeValue } from './typeValue';
import { UnManageDataSetCopy } from './unManageDataSetCopy';
import { Visualisation } from './visualisation';
import { WhoAmI } from './whoAmI';

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
        "AnalysisStatus.LevelEnum": AnalysisStatus.LevelEnum,
        "MapFolderModelAccessRights.DefaultEnum": MapFolderModelAccessRights.DefaultEnum,
        "MapFolderModelAccessRightsSpecific.TypeEnum": MapFolderModelAccessRightsSpecific.TypeEnum,
        "MapFolderModelAccessRightsSpecific.AccessEnum": MapFolderModelAccessRightsSpecific.AccessEnum,
        "Template.TypeEnum": Template.TypeEnum,
}

let typeMap: {[index: string]: any} = {
    "ActionPerformedFiles": ActionPerformedFiles,
    "Analysis": Analysis,
    "AnalysisData": AnalysisData,
    "AnalysisMetadata": AnalysisMetadata,
    "AnalysisMetrics": AnalysisMetrics,
    "AnalysisRequest": AnalysisRequest,
    "AnalysisStatus": AnalysisStatus,
    "Analytics": Analytics,
    "Application": Application,
    "AutomapingField": AutomapingField,
    "Automapping": Automapping,
    "CheckExist": CheckExist,
    "CheckExistResult": CheckExistResult,
    "CsvFile": CsvFile,
    "Dataset": Dataset,
    "DatasetListItem": DatasetListItem,
    "DatasetSource": DatasetSource,
    "DatasetUpdated": DatasetUpdated,
    "DiscoverConfiguration": DiscoverConfiguration,
    "FieldFormats": FieldFormats,
    "FolderModel": FolderModel,
    "GeneralInformation": GeneralInformation,
    "InvestigationActions": InvestigationActions,
    "InvestigationApplication": InvestigationApplication,
    "InvestigationApplicationDefinition": InvestigationApplicationDefinition,
    "InvestigationCreateRequest": InvestigationCreateRequest,
    "InvestigationCreateResponse": InvestigationCreateResponse,
    "InvestigationDetails": InvestigationDetails,
    "InvestigationField": InvestigationField,
    "InvestigationMetadata": InvestigationMetadata,
    "InvestigationState": InvestigationState,
    "InvestigationTrigger": InvestigationTrigger,
    "InvestigationTriggerAttributes": InvestigationTriggerAttributes,
    "Investigations": Investigations,
    "LandingPage": LandingPage,
    "LandingPageButtons": LandingPageButtons,
    "LandingPageHightlight": LandingPageHightlight,
    "LandingPageUploadResponse": LandingPageUploadResponse,
    "MapFolderCollection": MapFolderCollection,
    "MapFolderCollectionBreadcrumbs": MapFolderCollectionBreadcrumbs,
    "MapFolderModel": MapFolderModel,
    "MapFolderModelAccessRights": MapFolderModelAccessRights,
    "MapFolderModelAccessRightsSpecific": MapFolderModelAccessRightsSpecific,
    "MapFolderModelMaps": MapFolderModelMaps,
    "MapFolderModelSubFolders": MapFolderModelSubFolders,
    "Mapping": Mapping,
    "Message": Message,
    "NewVisualisationInformation": NewVisualisationInformation,
    "Preview": Preview,
    "PreviewColumn": PreviewColumn,
    "PreviewStatus": PreviewStatus,
    "PublishedViews": PublishedViews,
    "RedisFileInfo": RedisFileInfo,
    "Schema": Schema,
    "SchemaTdv": SchemaTdv,
    "Template": Template,
    "TemplateFilterConfig": TemplateFilterConfig,
    "TemplateMarkingConfig": TemplateMarkingConfig,
    "TemplateMenuConfig": TemplateMenuConfig,
    "TemplateRequest": TemplateRequest,
    "TenantInformation": TenantInformation,
    "TypeValue": TypeValue,
    "UnManageDataSetCopy": UnManageDataSetCopy,
    "Visualisation": Visualisation,
    "WhoAmI": WhoAmI,
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
