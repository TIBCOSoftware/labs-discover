"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoidAuth = exports.OAuth = exports.ApiKeyAuth = exports.HttpBearerAuth = exports.HttpBasicAuth = exports.ObjectSerializer = void 0;
__exportStar(require("./actionPerformedActivities"), exports);
__exportStar(require("./actionPerformedAllManagedDatasets"), exports);
__exportStar(require("./actionPerformedCheck"), exports);
__exportStar(require("./actionPerformedCopyUnManaged"), exports);
__exportStar(require("./actionPerformedDataSchema"), exports);
__exportStar(require("./actionPerformedDeleteAnalysis"), exports);
__exportStar(require("./actionPerformedDeleteMetrics"), exports);
__exportStar(require("./actionPerformedDeleted"), exports);
__exportStar(require("./actionPerformedDetailsAssets"), exports);
__exportStar(require("./actionPerformedDetailsAssetsUnManaged"), exports);
__exportStar(require("./actionPerformedFiles"), exports);
__exportStar(require("./actionPerformedFilesPreview"), exports);
__exportStar(require("./actionPerformedFilesUrl"), exports);
__exportStar(require("./actionPerformedGetAllAnalysis"), exports);
__exportStar(require("./actionPerformedGetData"), exports);
__exportStar(require("./actionPerformedGetReference"), exports);
__exportStar(require("./actionPerformedLoginValidate"), exports);
__exportStar(require("./actionPerformedPreview"), exports);
__exportStar(require("./actionPerformedRenderedMetrics"), exports);
__exportStar(require("./actionPerformedRenderedMetricsAS"), exports);
__exportStar(require("./actionPerformedSchedules"), exports);
__exportStar(require("./actionPerformedSparkSingle"), exports);
__exportStar(require("./actionPerformedStoreMetrics"), exports);
__exportStar(require("./actionPerformedTDVCreate"), exports);
__exportStar(require("./actionPerformedUIAssets"), exports);
__exportStar(require("./actionPerformedUIAssetsUrl"), exports);
__exportStar(require("./actionPerformedUnmanagedPublishedViews"), exports);
__exportStar(require("./actionPerformedUpdate"), exports);
__exportStar(require("./activitiesTable"), exports);
__exportStar(require("./analysisList"), exports);
__exportStar(require("./analysisMetrics"), exports);
__exportStar(require("./datasetSource"), exports);
__exportStar(require("./datasetSourceTdv"), exports);
__exportStar(require("./filter"), exports);
__exportStar(require("./listActivitiesTable"), exports);
__exportStar(require("./listAnalysisList"), exports);
__exportStar(require("./listBucket"), exports);
__exportStar(require("./listFilter"), exports);
__exportStar(require("./listListBucket"), exports);
__exportStar(require("./listManagedDatasetsInfo"), exports);
__exportStar(require("./listProfiles"), exports);
__exportStar(require("./listPublishedViews"), exports);
__exportStar(require("./listRedisFileInfo"), exports);
__exportStar(require("./listSchema"), exports);
__exportStar(require("./listSchemaPreview"), exports);
__exportStar(require("./listSchemaTdv"), exports);
__exportStar(require("./listString"), exports);
__exportStar(require("./listVariantsTable"), exports);
__exportStar(require("./loginCredentials"), exports);
__exportStar(require("./managedDatasetsInfo"), exports);
__exportStar(require("./mapping"), exports);
__exportStar(require("./metricsAnalysis"), exports);
__exportStar(require("./metricsDS"), exports);
__exportStar(require("./pmConfigLiveApps"), exports);
__exportStar(require("./previewConfigFile"), exports);
__exportStar(require("./profiles"), exports);
__exportStar(require("./publishedViews"), exports);
__exportStar(require("./redisContent"), exports);
__exportStar(require("./redisFileInfo"), exports);
__exportStar(require("./s3Content"), exports);
__exportStar(require("./schedule"), exports);
__exportStar(require("./schema"), exports);
__exportStar(require("./schemaPreview"), exports);
__exportStar(require("./schemaTdv"), exports);
__exportStar(require("./tDV"), exports);
__exportStar(require("./tdvJob"), exports);
__exportStar(require("./unManageDataSetCopy"), exports);
__exportStar(require("./unManageDataSetInfoStored"), exports);
__exportStar(require("./variantsTable"), exports);
const actionPerformedActivities_1 = require("./actionPerformedActivities");
const actionPerformedAllManagedDatasets_1 = require("./actionPerformedAllManagedDatasets");
const actionPerformedCheck_1 = require("./actionPerformedCheck");
const actionPerformedCopyUnManaged_1 = require("./actionPerformedCopyUnManaged");
const actionPerformedDataSchema_1 = require("./actionPerformedDataSchema");
const actionPerformedDeleteAnalysis_1 = require("./actionPerformedDeleteAnalysis");
const actionPerformedDeleteMetrics_1 = require("./actionPerformedDeleteMetrics");
const actionPerformedDeleted_1 = require("./actionPerformedDeleted");
const actionPerformedDetailsAssets_1 = require("./actionPerformedDetailsAssets");
const actionPerformedDetailsAssetsUnManaged_1 = require("./actionPerformedDetailsAssetsUnManaged");
const actionPerformedFiles_1 = require("./actionPerformedFiles");
const actionPerformedFilesPreview_1 = require("./actionPerformedFilesPreview");
const actionPerformedFilesUrl_1 = require("./actionPerformedFilesUrl");
const actionPerformedGetAllAnalysis_1 = require("./actionPerformedGetAllAnalysis");
const actionPerformedGetData_1 = require("./actionPerformedGetData");
const actionPerformedGetReference_1 = require("./actionPerformedGetReference");
const actionPerformedLoginValidate_1 = require("./actionPerformedLoginValidate");
const actionPerformedPreview_1 = require("./actionPerformedPreview");
const actionPerformedRenderedMetrics_1 = require("./actionPerformedRenderedMetrics");
const actionPerformedRenderedMetricsAS_1 = require("./actionPerformedRenderedMetricsAS");
const actionPerformedSchedules_1 = require("./actionPerformedSchedules");
const actionPerformedSparkSingle_1 = require("./actionPerformedSparkSingle");
const actionPerformedStoreMetrics_1 = require("./actionPerformedStoreMetrics");
const actionPerformedTDVCreate_1 = require("./actionPerformedTDVCreate");
const actionPerformedUIAssets_1 = require("./actionPerformedUIAssets");
const actionPerformedUIAssetsUrl_1 = require("./actionPerformedUIAssetsUrl");
const actionPerformedUnmanagedPublishedViews_1 = require("./actionPerformedUnmanagedPublishedViews");
const actionPerformedUpdate_1 = require("./actionPerformedUpdate");
const activitiesTable_1 = require("./activitiesTable");
const analysisList_1 = require("./analysisList");
const analysisMetrics_1 = require("./analysisMetrics");
const datasetSource_1 = require("./datasetSource");
const datasetSourceTdv_1 = require("./datasetSourceTdv");
const filter_1 = require("./filter");
const listActivitiesTable_1 = require("./listActivitiesTable");
const listAnalysisList_1 = require("./listAnalysisList");
const listBucket_1 = require("./listBucket");
const listFilter_1 = require("./listFilter");
const listListBucket_1 = require("./listListBucket");
const listManagedDatasetsInfo_1 = require("./listManagedDatasetsInfo");
const listProfiles_1 = require("./listProfiles");
const listPublishedViews_1 = require("./listPublishedViews");
const listRedisFileInfo_1 = require("./listRedisFileInfo");
const listSchema_1 = require("./listSchema");
const listSchemaPreview_1 = require("./listSchemaPreview");
const listSchemaTdv_1 = require("./listSchemaTdv");
const listString_1 = require("./listString");
const listVariantsTable_1 = require("./listVariantsTable");
const loginCredentials_1 = require("./loginCredentials");
const managedDatasetsInfo_1 = require("./managedDatasetsInfo");
const mapping_1 = require("./mapping");
const metricsAnalysis_1 = require("./metricsAnalysis");
const metricsDS_1 = require("./metricsDS");
const pmConfigLiveApps_1 = require("./pmConfigLiveApps");
const previewConfigFile_1 = require("./previewConfigFile");
const profiles_1 = require("./profiles");
const publishedViews_1 = require("./publishedViews");
const redisContent_1 = require("./redisContent");
const redisFileInfo_1 = require("./redisFileInfo");
const s3Content_1 = require("./s3Content");
const schedule_1 = require("./schedule");
const schema_1 = require("./schema");
const schemaPreview_1 = require("./schemaPreview");
const schemaTdv_1 = require("./schemaTdv");
const tDV_1 = require("./tDV");
const tdvJob_1 = require("./tdvJob");
const unManageDataSetCopy_1 = require("./unManageDataSetCopy");
const unManageDataSetInfoStored_1 = require("./unManageDataSetInfoStored");
const variantsTable_1 = require("./variantsTable");
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
let enumsMap = {};
let typeMap = {
    "ActionPerformedActivities": actionPerformedActivities_1.ActionPerformedActivities,
    "ActionPerformedAllManagedDatasets": actionPerformedAllManagedDatasets_1.ActionPerformedAllManagedDatasets,
    "ActionPerformedCheck": actionPerformedCheck_1.ActionPerformedCheck,
    "ActionPerformedCopyUnManaged": actionPerformedCopyUnManaged_1.ActionPerformedCopyUnManaged,
    "ActionPerformedDataSchema": actionPerformedDataSchema_1.ActionPerformedDataSchema,
    "ActionPerformedDeleteAnalysis": actionPerformedDeleteAnalysis_1.ActionPerformedDeleteAnalysis,
    "ActionPerformedDeleteMetrics": actionPerformedDeleteMetrics_1.ActionPerformedDeleteMetrics,
    "ActionPerformedDeleted": actionPerformedDeleted_1.ActionPerformedDeleted,
    "ActionPerformedDetailsAssets": actionPerformedDetailsAssets_1.ActionPerformedDetailsAssets,
    "ActionPerformedDetailsAssetsUnManaged": actionPerformedDetailsAssetsUnManaged_1.ActionPerformedDetailsAssetsUnManaged,
    "ActionPerformedFiles": actionPerformedFiles_1.ActionPerformedFiles,
    "ActionPerformedFilesPreview": actionPerformedFilesPreview_1.ActionPerformedFilesPreview,
    "ActionPerformedFilesUrl": actionPerformedFilesUrl_1.ActionPerformedFilesUrl,
    "ActionPerformedGetAllAnalysis": actionPerformedGetAllAnalysis_1.ActionPerformedGetAllAnalysis,
    "ActionPerformedGetData": actionPerformedGetData_1.ActionPerformedGetData,
    "ActionPerformedGetReference": actionPerformedGetReference_1.ActionPerformedGetReference,
    "ActionPerformedLoginValidate": actionPerformedLoginValidate_1.ActionPerformedLoginValidate,
    "ActionPerformedPreview": actionPerformedPreview_1.ActionPerformedPreview,
    "ActionPerformedRenderedMetrics": actionPerformedRenderedMetrics_1.ActionPerformedRenderedMetrics,
    "ActionPerformedRenderedMetricsAS": actionPerformedRenderedMetricsAS_1.ActionPerformedRenderedMetricsAS,
    "ActionPerformedSchedules": actionPerformedSchedules_1.ActionPerformedSchedules,
    "ActionPerformedSparkSingle": actionPerformedSparkSingle_1.ActionPerformedSparkSingle,
    "ActionPerformedStoreMetrics": actionPerformedStoreMetrics_1.ActionPerformedStoreMetrics,
    "ActionPerformedTDVCreate": actionPerformedTDVCreate_1.ActionPerformedTDVCreate,
    "ActionPerformedUIAssets": actionPerformedUIAssets_1.ActionPerformedUIAssets,
    "ActionPerformedUIAssetsUrl": actionPerformedUIAssetsUrl_1.ActionPerformedUIAssetsUrl,
    "ActionPerformedUnmanagedPublishedViews": actionPerformedUnmanagedPublishedViews_1.ActionPerformedUnmanagedPublishedViews,
    "ActionPerformedUpdate": actionPerformedUpdate_1.ActionPerformedUpdate,
    "ActivitiesTable": activitiesTable_1.ActivitiesTable,
    "AnalysisList": analysisList_1.AnalysisList,
    "AnalysisMetrics": analysisMetrics_1.AnalysisMetrics,
    "DatasetSource": datasetSource_1.DatasetSource,
    "DatasetSourceTdv": datasetSourceTdv_1.DatasetSourceTdv,
    "Filter": filter_1.Filter,
    "ListActivitiesTable": listActivitiesTable_1.ListActivitiesTable,
    "ListAnalysisList": listAnalysisList_1.ListAnalysisList,
    "ListBucket": listBucket_1.ListBucket,
    "ListFilter": listFilter_1.ListFilter,
    "ListListBucket": listListBucket_1.ListListBucket,
    "ListManagedDatasetsInfo": listManagedDatasetsInfo_1.ListManagedDatasetsInfo,
    "ListProfiles": listProfiles_1.ListProfiles,
    "ListPublishedViews": listPublishedViews_1.ListPublishedViews,
    "ListRedisFileInfo": listRedisFileInfo_1.ListRedisFileInfo,
    "ListSchema": listSchema_1.ListSchema,
    "ListSchemaPreview": listSchemaPreview_1.ListSchemaPreview,
    "ListSchemaTdv": listSchemaTdv_1.ListSchemaTdv,
    "ListString": listString_1.ListString,
    "ListVariantsTable": listVariantsTable_1.ListVariantsTable,
    "LoginCredentials": loginCredentials_1.LoginCredentials,
    "ManagedDatasetsInfo": managedDatasetsInfo_1.ManagedDatasetsInfo,
    "Mapping": mapping_1.Mapping,
    "MetricsAnalysis": metricsAnalysis_1.MetricsAnalysis,
    "MetricsDS": metricsDS_1.MetricsDS,
    "PmConfigLiveApps": pmConfigLiveApps_1.PmConfigLiveApps,
    "PreviewConfigFile": previewConfigFile_1.PreviewConfigFile,
    "Profiles": profiles_1.Profiles,
    "PublishedViews": publishedViews_1.PublishedViews,
    "RedisContent": redisContent_1.RedisContent,
    "RedisFileInfo": redisFileInfo_1.RedisFileInfo,
    "S3Content": s3Content_1.S3Content,
    "Schedule": schedule_1.Schedule,
    "Schema": schema_1.Schema,
    "SchemaPreview": schemaPreview_1.SchemaPreview,
    "SchemaTdv": schemaTdv_1.SchemaTdv,
    "TDV": tDV_1.TDV,
    "TdvJob": tdvJob_1.TdvJob,
    "UnManageDataSetCopy": unManageDataSetCopy_1.UnManageDataSetCopy,
    "UnManageDataSetInfoStored": unManageDataSetInfoStored_1.UnManageDataSetInfoStored,
    "VariantsTable": variantsTable_1.VariantsTable,
};
class ObjectSerializer {
    static findCorrectType(data, expectedType) {
        if (data == undefined) {
            return expectedType;
        }
        else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        }
        else if (expectedType === "Date") {
            return expectedType;
        }
        else {
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
            }
            else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if (typeMap[discriminatorType]) {
                        return discriminatorType; // use the type given in the discriminator
                    }
                    else {
                        return expectedType; // discriminator did not map to a type
                    }
                }
                else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }
    static serialize(data, type) {
        if (data == undefined) {
            return data;
        }
        else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        }
        else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.serialize(datum, subType));
            }
            return transformedData;
        }
        else if (type === "Date") {
            return data.toISOString();
        }
        else {
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
            let instance = {};
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
            }
            return instance;
        }
    }
    static deserialize(data, type) {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        }
        else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        }
        else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.deserialize(datum, subType));
            }
            return transformedData;
        }
        else if (type === "Date") {
            return new Date(data);
        }
        else {
            if (enumsMap[type]) { // is Enum
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
exports.ObjectSerializer = ObjectSerializer;
class HttpBasicAuth {
    constructor() {
        this.username = '';
        this.password = '';
    }
    applyToRequest(requestOptions) {
        requestOptions.auth = {
            username: this.username, password: this.password
        };
    }
}
exports.HttpBasicAuth = HttpBasicAuth;
class HttpBearerAuth {
    constructor() {
        this.accessToken = '';
    }
    applyToRequest(requestOptions) {
        if (requestOptions && requestOptions.headers) {
            const accessToken = typeof this.accessToken === 'function'
                ? this.accessToken()
                : this.accessToken;
            requestOptions.headers["Authorization"] = "Bearer " + accessToken;
        }
    }
}
exports.HttpBearerAuth = HttpBearerAuth;
class ApiKeyAuth {
    constructor(location, paramName) {
        this.location = location;
        this.paramName = paramName;
        this.apiKey = '';
    }
    applyToRequest(requestOptions) {
        if (this.location == "query") {
            requestOptions.qs[this.paramName] = this.apiKey;
        }
        else if (this.location == "header" && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        }
        else if (this.location == 'cookie' && requestOptions && requestOptions.headers) {
            if (requestOptions.headers['Cookie']) {
                requestOptions.headers['Cookie'] += '; ' + this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
            else {
                requestOptions.headers['Cookie'] = this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
        }
    }
}
exports.ApiKeyAuth = ApiKeyAuth;
class OAuth {
    constructor() {
        this.accessToken = '';
    }
    applyToRequest(requestOptions) {
        if (requestOptions && requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}
exports.OAuth = OAuth;
class VoidAuth {
    constructor() {
        this.username = '';
        this.password = '';
    }
    applyToRequest(_) {
        // Do nothing
    }
}
exports.VoidAuth = VoidAuth;
//# sourceMappingURL=models.js.map