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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetService = void 0;
const typedi_1 = require("typedi");
const api_1 = require("../backend/api");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const logging_1 = require("../common/logging");
const analysis_service_1 = require("./analysis.service");
let DatasetService = class DatasetService {
    constructor(analysisService, cache, tdvService, fileService, previewApi) {
        this.analysisService = analysisService;
        this.cache = cache;
        this.tdvService = tdvService;
        this.fileService = fileService;
        this.previewApi = previewApi;
        this.DB_NAME = 'datasets';
        this.createDataset = (token, dataset) => __awaiter(this, void 0, void 0, function* () {
            const now = new Date().getTime();
            dataset.createdDate = now;
            dataset.updatedDate = now;
            const result = yield this.cache.set(token, this.DB_NAME, dataset.Dataset_Id, JSON.stringify(dataset));
            return {
                status: result,
                datasetId: dataset.Dataset_Id
            };
        });
        this.getDataset = (token, id) => __awaiter(this, void 0, void 0, function* () {
            const dataset = yield this.cache.get(token, this.DB_NAME, id);
            return JSON.parse(dataset);
        });
        this.getDatasets = (token) => __awaiter(this, void 0, void 0, function* () {
            let datasets = yield this.cache.search(token, this.DB_NAME, '*');
            return datasets.map(el => {
                return JSON.parse(el);
            })
                .sort((a, b) => a.createdDate && b.createdDate ? a.createdDate - b.createdDate : -1)
                .filter(dataset => !dataset.deleted)
                .map(datasetDetail => {
                var _a, _b, _c;
                return {
                    datasetid: datasetDetail.Dataset_Id,
                    name: datasetDetail.Dataset_Name,
                    fileName: (_a = datasetDetail.Dataset_Source) === null || _a === void 0 ? void 0 : _a.FileName,
                    filePath: (_b = datasetDetail.Dataset_Source) === null || _b === void 0 ? void 0 : _b.FilePath,
                    description: datasetDetail.Dataset_Description,
                    createdDate: datasetDetail.createdDate,
                    status: datasetDetail.status || undefined,
                    lastPreviewDate: datasetDetail.lastPreviewDate || undefined,
                    type: datasetDetail.type,
                    message: ((_c = datasetDetail.previewStatus) === null || _c === void 0 ? void 0 : _c.Message) || undefined
                };
            });
        });
        this.deleteDataset = (token, id) => __awaiter(this, void 0, void 0, function* () {
            return this.cache.delete(token, this.DB_NAME, id);
        });
        this.updateDataset = (token, id, dataset) => __awaiter(this, void 0, void 0, function* () {
            const now = new Date().getTime();
            dataset.updatedDate = now;
            const result = yield this.cache.set(token, this.DB_NAME, id, JSON.stringify(dataset));
            return {
                status: result,
                datasetId: id
            };
        });
        this.isDatasetExist = (token, body) => __awaiter(this, void 0, void 0, function* () {
            const datasetId = body['Dataset_Id'];
            const name = body['Dataset_Name'];
            const datasets = yield this.getDatasets(token);
            const filteredDatasets = datasets.filter(d => d.datasetid != datasetId && d.name == name);
            return filteredDatasets.length > 0;
        });
        this.checkAnalysisOfDataset = (token, id) => __awaiter(this, void 0, void 0, function* () {
            const cannotDeleteState = ['Archived'];
            const analysisList = yield this.analysisService.getAnalysis(token);
            const cannotDeleteAnalysis = analysisList.filter(el => el.data.Dataset === id && cannotDeleteState.indexOf(el.data.State) != -1);
            return cannotDeleteAnalysis.length > 0;
        });
        this.cleanDataset = (token, dataset) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const orgId = yield this.cache.getOrgId(token);
            if (orgId) {
                this._alwaysResolvePromise(this.tdvService.deleteJobTdvRoute(orgId, dataset.Dataset_Id));
                if ((_a = dataset.Dataset_Source) === null || _a === void 0 ? void 0 : _a.FileName) {
                    // Now just leave the file there
                    // this._alwaysResolvePromise(this.fileService.deleteRouteSegment(orgId, dataset.Dataset_Source?.FileName));
                }
                this._alwaysResolvePromise(this.deleteDataset(token, dataset.Dataset_Id));
            }
        });
        this.saveStatus = (token, datasetId, status) => __awaiter(this, void 0, void 0, function* () {
            if (datasetId) {
                const dataset = yield this.getDataset(token, datasetId);
                if (dataset) {
                    dataset.previewStatus = Object.assign(dataset.previewStatus || {}, status);
                    this._alwaysResolvePromise(this.updateDataset(token, datasetId, dataset));
                }
                else {
                    logging_1.logger.debug(`[DatasetService] The dataset [${datasetId}] is not exist when saving the status`);
                }
            }
        });
        this.syncSaveStatus = (token, datasetId, status) => __awaiter(this, void 0, void 0, function* () {
            if (datasetId) {
                const dataset = yield this.getDataset(token, datasetId);
                if (dataset) {
                    dataset.previewStatus = Object.assign(dataset.previewStatus || {}, status);
                    yield this.updateDataset(token, datasetId, dataset);
                }
            }
        });
        /**
         * A utility method to resolve the promise no matter if the promose is resolved or rejected.
         */
        this._alwaysResolvePromise = (promise) => __awaiter(this, void 0, void 0, function* () {
            promise.then(data => ({ ok: true, data }), error => Promise.resolve({ ok: false, error }));
        });
        this.saveDatasetAndPreviewData = (token, dataset) => __awaiter(this, void 0, void 0, function* () {
            // if (!dataset || !dataset.Dataset_Source) {
            //   return null;
            // }
            const orgId = yield this.cache.getOrgId(token);
            // now file is uploaded if the type
            let publishedView;
            let datasetId = dataset.Dataset_Id;
            if (dataset.type != 'tdv') {
                const tdvDataSource = {
                    DatasourceType: dataset.Dataset_Source.DatasourceType,
                    Encoding: dataset.Dataset_Source.Encoding,
                    EscapeChar: dataset.Dataset_Source.FileEscapeChar,
                    FileName: dataset.Dataset_Source.FileName,
                    FilePath: dataset.Dataset_Source.FilePath,
                    QuoteChar: dataset.Dataset_Source.FileQuoteChar,
                    Separator: dataset.Dataset_Source.FileSeparator,
                    CommentsChar: "#",
                    Headers: dataset.Dataset_Source.FileHeaders
                };
                const tdvJob = {
                    DatasetName: dataset.Dataset_Name,
                    DatasetDescription: dataset.Dataset_Description,
                    DatasetSource: tdvDataSource,
                    Organization: orgId
                };
                logging_1.logger.debug(`[DatasetService] Update or create a TDV. TdvJob: ${JSON.stringify(tdvJob)}`);
                if (dataset.Dataset_Id) {
                    tdvJob.DatasetID = dataset.Dataset_Id;
                    const updateTdvResp = yield this.tdvService.putJobTdvRoute(tdvJob);
                    // publishedView = updateTdvResp.body.resource;
                }
                else {
                    const createTdvResp = yield this.tdvService.postJobTdvRoute(tdvJob);
                    // no dataset yet, so no way to update status
                    publishedView = createTdvResp.body.publishedview;
                    datasetId = createTdvResp.body.dataSetId;
                    dataset.Dataset_Id = datasetId;
                }
            }
            if (publishedView) {
                dataset.PublishedView = publishedView;
            }
            let datasetUpdated;
            if (dataset.createdDate) {
                datasetUpdated = yield this.updateDataset(token, dataset.Dataset_Id, dataset);
            }
            else {
                datasetUpdated = yield this.createDataset(token, dataset);
            }
            logging_1.logger.debug(`[DatasetService] Create/Update dataset [${dataset.Dataset_Id}]`);
            yield this.saveStatus(token, dataset.Dataset_Id, {
                DatasetID: dataset.Dataset_Id,
                Organisation: orgId,
                Progression: 40,
                Message: 'Update dataset...'
            });
            logging_1.logger.debug(`[DatasetService] Saved the first initial dummy preview status`);
            // sleep 2 sec to show the progress change
            yield this.sleep(2000);
            this.runPreview(token, dataset, orgId);
            return datasetUpdated;
        });
        this.runPreview = (token, dataset, orgId = '') => __awaiter(this, void 0, void 0, function* () {
            var _b;
            logging_1.logger.debug(`[DatasetService] Start to run preview and check status. DatasetId = ${dataset.Dataset_Id}`);
            if (!orgId) {
                orgId = (yield this.cache.getTokenInformation(token)).globalSubscriptionId;
            }
            const schema = (_b = dataset.schema) === null || _b === void 0 ? void 0 : _b.map(ele => {
                return {
                    format: ele.format,
                    columnName: ele.key,
                    dataType: ele.type
                };
            });
            const previewResp = yield this.previewApi.postJobPrevRoute({
                DatasetId: dataset.Dataset_Id,
                Organization: orgId,
                Token: token,
                schema: schema
            });
            const previewJobId = previewResp.body.jobId;
            logging_1.logger.debug(`[DatasetService] Save the status of 45%`);
            yield this.syncSaveStatus(token, dataset.Dataset_Id, {
                DatasetID: dataset.Dataset_Id,
                Organisation: orgId,
                Progression: 45,
                Message: 'Checking preview status...'
            });
            const finalStatuses = ['COMPLETED', 'FAILED', 'SUBMISSION_FAILED'];
            const queryPreviewStatus = () => __awaiter(this, void 0, void 0, function* () {
                return yield new Promise((resolve, reject) => {
                    const intervalId = setInterval(() => {
                        this.getDataset(token, dataset.Dataset_Id).then(resp => {
                            var _a, _b;
                            if (((_a = resp.previewStatus) === null || _a === void 0 ? void 0 : _a.Progression) == 0 || ((_b = resp.previewStatus) === null || _b === void 0 ? void 0 : _b.Progression) == 100) {
                                resolve(resp.previewStatus);
                                clearInterval(intervalId);
                            }
                        }, error => {
                            reject(error);
                            clearInterval(intervalId);
                        });
                    }, 3000);
                });
            });
            const queryJobStatus = () => __awaiter(this, void 0, void 0, function* () {
                return yield new Promise(resolve => {
                    const intervalId = setInterval(() => {
                        this.previewApi.getJobPrevRoute(previewJobId).then(resp => {
                            logging_1.logger.debug(`[DatasetService] The preview job status is ${resp.body.status}`);
                            if (finalStatuses.indexOf(resp.body.status) != -1) {
                                resolve(resp.body.status);
                                clearInterval(intervalId);
                            }
                        });
                    }, 3000);
                });
            });
            let currentDataset;
            try {
                const previewStatus = yield queryPreviewStatus();
                logging_1.logger.debug('[DatasetService] The previewStatus: ' + JSON.stringify(previewStatus));
                if (previewStatus.Progression == 0) {
                    let log = `[DatasetService] The preview job ${previewResp} failed`;
                    if (previewStatus.Level == 'debug') {
                        log += `The error detail: ${previewStatus.Message}`;
                    }
                    logging_1.logger.info(log);
                }
                const status = yield queryJobStatus();
                logging_1.logger.debug('[DatasetService] After complete The queryJobStatus: ' + JSON.stringify(status));
                currentDataset = yield this.getDataset(token, dataset.Dataset_Id);
                currentDataset.status = status;
                // currentDataset.previewStatus = previewStatus;
                currentDataset.lastPreviewDate = new Date().getTime();
            }
            catch (error) {
                logging_1.logger.debug('[DatasetService] Failed to query preview status, the error is' + JSON.stringify(error));
                currentDataset = yield this.getDataset(token, dataset.Dataset_Id);
                currentDataset.status = 'FAILED';
                currentDataset.lastPreviewDate = new Date().getTime();
            }
            yield this.updateDataset(token, currentDataset.Dataset_Id, currentDataset);
            yield this.previewApi.deleteJobPrevRoute(previewJobId);
        });
        /**
         *
         * @param token
         * @param orgId
         * @param dataset
         * @deprecated
         */
        this.saveDatasetAndPreview = (token, orgId, dataset) => __awaiter(this, void 0, void 0, function* () {
            if (dataset.createdDate) {
                yield this.updateDataset(token, dataset.Dataset_Id, dataset);
            }
            else {
                yield this.createDataset(token, dataset);
            }
            yield this.saveStatus(token, dataset.Dataset_Id, {
                DatasetID: dataset.Dataset_Id,
                Organisation: orgId,
                Progression: 40,
                Message: 'Update dataset...'
            });
            yield this.runPreview(token, dataset, orgId);
        });
        this.sleep = (ms) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        });
    }
};
DatasetService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [analysis_service_1.AnalysisService,
        DiscoverCache_1.DiscoverCache,
        api_1.TibcoDataVirtualizationApi,
        api_1.FilesOperationsApi,
        api_1.SparkPreviewJobApi])
], DatasetService);
exports.DatasetService = DatasetService;
//# sourceMappingURL=dataset.service.js.map