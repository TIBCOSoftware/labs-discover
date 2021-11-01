"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetController = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const api_1 = require("../backend/api");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const analysis_service_1 = require("../services/analysis.service");
const dataset_service_1 = require("../services/dataset.service");
const axios_1 = __importDefault(require("axios"));
let DatasetController = class DatasetController {
    constructor(datasetService, analysisService, loginApi, tdvApi, fileApi, cache) {
        this.datasetService = datasetService;
        this.analysisService = analysisService;
        this.loginApi = loginApi;
        this.tdvApi = tdvApi;
        this.fileApi = fileApi;
        this.cache = cache;
    }
    preflightCheck(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token) {
                response.status = 400;
                return response;
            }
            // todo: the schema for /validate/login is wrong
            try {
                yield this.loginApi.postValidCredsRoute({
                    credentials: this.getToken(token)
                });
            }
            catch (resp) {
                response.status = resp.statusCode;
                return response;
            }
            return true;
        });
    }
    getToken(token) {
        if (token.indexOf('Bearer ') == 0) {
            return token.split(' ')[1];
        }
        return token;
    }
    getAllDatasets(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return this.datasetService.getDatasets(this.getToken(token));
        });
    }
    getDataset(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const datasetDetail = yield this.datasetService.getDataset(this.getToken(token), id);
            if (!datasetDetail) {
                response.status = 404;
                return response;
            }
            // don't return preview status in detail
            // datasetDetail.previewStatus = undefined;
            // delete datasetDetail.previewStatus;
            return datasetDetail;
        });
    }
    datasetExist(token, response, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = body['Dataset_Name'];
            if (!name) {
                response.status = 400;
                return response;
            }
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return {
                exist: yield this.datasetService.isDatasetExist(this.getToken(token), body)
            };
        });
    }
    createDataset(token, response, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            if (!body.Dataset_Name) {
                response.status = 400;
                return response;
            }
            if (yield this.datasetService.isDatasetExist(token, { "Dataset_Name": body.Dataset_Name })) {
                response.status = 409;
                return response;
            }
            return yield this.datasetService.createDataset(this.getToken(token), body);
        });
    }
    saveDatasetAndPreview(token, response, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            if (!body || !body.Dataset_Source) {
                response.status = 400;
                return response;
            }
            const resp = this.datasetService.saveDatasetAndPreviewData(this.getToken(token), body);
            // response.status = 204;
            return resp;
        });
    }
    refreshPreview(token, response, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const dataset = yield this.datasetService.getDataset(this.getToken(token), id);
            if (!dataset) {
                response.status = 404;
                return response;
            }
            this.datasetService.runPreview(this.getToken(token), dataset);
            response.status = 204;
            return response;
        });
    }
    updateDataset(token, id, response, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            if (!body.Dataset_Name) {
                response.status = 400;
                return response;
            }
            // the id in the path is not the same as the id in the payload
            if (id != body.Dataset_Id) {
                response.status = 400;
                return response;
            }
            const dataset = yield this.datasetService.getDataset(this.getToken(token), id);
            if (!dataset) {
                response.status = 404;
                return response;
            }
            body = Object.assign(dataset, body);
            if (yield this.datasetService.isDatasetExist(token, { "Dataset_Name": body.Dataset_Name, "Dataset_Id": body.Dataset_Id })) {
                response.status = 409;
                return response;
            }
            return yield this.datasetService.updateDataset(this.getToken(token), body.Dataset_Id, body);
            ;
        });
    }
    deleteDataset(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            // step 1, get the dataset
            const dataset = yield this.datasetService.getDataset(oauthToken, id);
            if (!dataset) {
                response.status = 404;
                return response;
            }
            // step 2: check analysis state to see whether it can be deleted
            const foundPersistDataset = yield this.datasetService.checkAnalysisOfDataset(oauthToken, id);
            if (foundPersistDataset) {
                // the dataset can not be deleted due to the associated analysis state 
                response.status = 409;
                return response;
            }
            // step 3, mark the dataset to be deleted and update it 
            dataset.deleted = true;
            yield this.datasetService.updateDataset(this.getToken(token), id, dataset);
            // step 4. launch to delete tdv and s3 file connected with it and delete the entry in dataset table    
            // don't wait it finished
            this.datasetService.cleanDataset(oauthToken, dataset);
            response.status = 204;
            return response;
        });
    }
    getPreview(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            const preview$ = this.tdvApi.getDataJobTdvRoute(orgId, id);
            const metadata$ = this.tdvApi.getSchemaJobTdvRoute(orgId, id);
            const [preview, metadata] = yield Promise.all([preview$, metadata$]);
            const columnResponse = metadata.body.tdv.schema.map((column) => {
                return {
                    position: column.ORDINAL_POSITION,
                    columnName: column.COLUMN_NAME,
                    type: column.DATA_TYPE
                };
            });
            const previewResponse = JSON.parse(preview.body.Data);
            return { columns: columnResponse, data: previewResponse };
        });
    }
    saveStatus(token, response, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            if (!body.DatasetID || body.Progression == null) {
                response.status = 400;
                return response;
            }
            const dataset = yield this.datasetService.getDataset(this.getToken(token), body.DatasetID);
            if (!dataset) {
                response.status = 404;
                return response;
            }
            dataset.previewStatus = body;
            return yield this.datasetService.updateDataset(this.getToken(token), body.DatasetID, dataset);
        });
    }
    getStatus(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const datasetDetail = yield this.datasetService.getDataset(this.getToken(token), id);
            if (!datasetDetail) {
                response.status = 404;
                return response;
            }
            return datasetDetail.previewStatus || {};
        });
    }
    getCsvFiles(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            const resp = yield this.fileApi.getRouteFileV2(orgId);
            const datasets = yield this.datasetService.getDatasets(oauthToken);
            const files = {};
            for (const dataset of datasets) {
                if (dataset.filePath) {
                    files[dataset.filePath] = 1;
                }
            }
            const existFiles = resp.body.list;
            const csvFiles = existFiles.map(file => {
                return {
                    redisFileInfo: file,
                    beingUsed: files[file.FileLocation] === 1
                };
            });
            return csvFiles;
        });
    }
    deleteCsvFile(token, filename, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            const datasets = yield this.datasetService.getDatasets(oauthToken);
            const files = {};
            let beingUsed = false;
            for (const dataset of datasets) {
                if (dataset.fileName && dataset.fileName == filename) {
                    beingUsed = true;
                    break;
                }
            }
            if (beingUsed) {
                response.status = 409;
                return response;
            }
            try {
                yield this.fileApi.deleteRouteSegment(orgId, filename);
            }
            catch (error) {
                response.status = 406;
                return response;
            }
            response.status = 204;
            return response;
        });
    }
    getCsvFilePreview(token, filename, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            try {
                const resp = yield this.fileApi.getPreviewRoute(orgId, filename);
                return resp.body.data;
            }
            catch (error) {
                response.status = error.statusCode;
                return response;
            }
        });
    }
    uploadCsvFile(token, body, file, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            const csvFile = {
                value: file.buffer,
                options: {
                    filename: file.originalname,
                    contentType: undefined
                }
            };
            try {
                const resp = yield this.fileApi.postRouteFile(orgId, body.newline, body.separator, body.quoteChar, body.encoding, body.escapeChar, csvFile);
                return resp.body;
            }
            catch (error) {
                response.status = error.statusCode;
                return response;
            }
        });
    }
    downloadCsvFile(token, filename, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            try {
                const resp = yield this.fileApi.getRouteFileContent(filename, orgId);
                if (resp.body.code === 0 && resp.body.url) {
                    // download
                    return axios_1.default.get(resp.body.url).then(resp => {
                        return resp.data;
                    }).catch(error => {
                        console.log(error);
                        response.status = 500;
                        return response;
                    });
                }
                else {
                    response.status = resp.body.code;
                    response.body = resp.body.message || '';
                    return response;
                }
            }
            catch (error) {
                response.status = error.statusCode;
                return response;
            }
        });
    }
    getTdvData(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            try {
                const resp = yield this.tdvApi.getDataJobTdvRoute(orgId, id);
                // parse the data to string
                if (resp.body.code === 0) {
                    try {
                        return JSON.parse(resp.body.Data);
                    }
                    catch (error) {
                        response.status = 500;
                        return response;
                    }
                }
                else {
                    response.status = 500;
                    return response;
                }
            }
            catch (error) {
                response.status = error.statusCode;
                return response;
            }
        });
    }
    getTdvMetaData(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            try {
                const resp = yield this.tdvApi.getSchemaJobTdvRoute(orgId, id);
                if (resp.body.code === 0) {
                    return resp.body.tdv.schema;
                }
                else {
                    response.status = 500;
                    response.body = resp.body.message;
                    return response;
                }
            }
            catch (error) {
                response.status = error.statusCode;
                return response;
            }
        });
    }
    getUnmanagedTdv(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            try {
                const resp = yield this.tdvApi.getDatasetsPublishedRoute(orgId);
                if (resp.body.code === 0) {
                    return resp.body.Datasets;
                }
                else {
                    response.status = 500;
                    response.body = resp.body.message;
                    return response;
                }
            }
            catch (error) {
                response.status = error.statusCode;
                return response;
            }
        });
    }
    copyUnmanagedTdv(token, body, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const oauthToken = this.getToken(token);
            const orgId = yield this.cache.getOrgId(oauthToken);
            try {
                body.Organization = orgId;
                const resp = yield this.tdvApi.postUnManagedJobTdvRoute(body);
                if (resp.body.code === 0) {
                    return resp.body.DatasetId;
                }
                else {
                    response.status = 500;
                    response.body = resp.body.message;
                    return response;
                }
            }
            catch (error) {
                response.status = error.statusCode;
                return response;
            }
        });
    }
};
DatasetController.getName = () => {
    return 'DatasetController';
};
__decorate([
    routing_controllers_1.Get('/datasets'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getAllDatasets", null);
__decorate([
    routing_controllers_1.Get("/dataset/:id"),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param("id")), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getDataset", null);
__decorate([
    routing_controllers_1.Post('/dataset/exist'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()), __param(2, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "datasetExist", null);
__decorate([
    routing_controllers_1.Post("/dataset"),
    __param(0, routing_controllers_1.HeaderParam("Authorization")), __param(1, routing_controllers_1.Res()), __param(2, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "createDataset", null);
__decorate([
    routing_controllers_1.Post("/dataset/preview"),
    __param(0, routing_controllers_1.HeaderParam("Authorization")), __param(1, routing_controllers_1.Res()), __param(2, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "saveDatasetAndPreview", null);
__decorate([
    routing_controllers_1.Post("/preview/:id"),
    __param(0, routing_controllers_1.HeaderParam("Authorization")), __param(1, routing_controllers_1.Res()), __param(2, routing_controllers_1.Param("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "refreshPreview", null);
__decorate([
    routing_controllers_1.Put("/dataset/:id"),
    __param(0, routing_controllers_1.HeaderParam("Authorization")), __param(1, routing_controllers_1.Param("id")), __param(2, routing_controllers_1.Res()), __param(3, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "updateDataset", null);
__decorate([
    routing_controllers_1.Delete('/dataset/:id'),
    __param(0, routing_controllers_1.HeaderParam("Authorization")), __param(1, routing_controllers_1.Param("id")), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "deleteDataset", null);
__decorate([
    routing_controllers_1.Get('/dataset/:id/preview'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param("id")), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getPreview", null);
__decorate([
    routing_controllers_1.Post('/status'),
    __param(0, routing_controllers_1.HeaderParam("Authorization")), __param(1, routing_controllers_1.Res()), __param(2, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "saveStatus", null);
__decorate([
    routing_controllers_1.Get('/status/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param("id")), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getStatus", null);
__decorate([
    routing_controllers_1.Get('/files'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getCsvFiles", null);
__decorate([
    routing_controllers_1.Delete('/files/:filename'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param("filename")), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "deleteCsvFile", null);
__decorate([
    routing_controllers_1.Get('/files/preview/:filename'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param("filename")), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getCsvFilePreview", null);
__decorate([
    routing_controllers_1.Post('/files'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.UploadedFile("csv")), __param(3, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "uploadCsvFile", null);
__decorate([
    routing_controllers_1.Get('/files/download/:filename'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('filename')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "downloadCsvFile", null);
__decorate([
    routing_controllers_1.Get('/tdv/data/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param("id")), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getTdvData", null);
__decorate([
    routing_controllers_1.Get('/tdv/metadata/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param("id")), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getTdvMetaData", null);
__decorate([
    routing_controllers_1.Get('/tdv/unmanaged/view'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "getUnmanagedTdv", null);
__decorate([
    routing_controllers_1.Post('/tdv/unmanaged/copy'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, api_1.UnManageDataSetCopy, Object]),
    __metadata("design:returntype", Promise)
], DatasetController.prototype, "copyUnmanagedTdv", null);
DatasetController = __decorate([
    typedi_1.Service(),
    routing_controllers_1.JsonController('/catalog'),
    __metadata("design:paramtypes", [dataset_service_1.DatasetService,
        analysis_service_1.AnalysisService,
        api_1.LoginApi,
        api_1.TibcoDataVirtualizationApi,
        api_1.FilesOperationsApi,
        DiscoverCache_1.DiscoverCache])
], DatasetController);
exports.DatasetController = DatasetController;
//# sourceMappingURL=DatasetController.js.map