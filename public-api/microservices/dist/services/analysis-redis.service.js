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
exports.AnalysisRedisService = void 0;
const typedi_1 = require("typedi");
const logging_1 = require("../common/logging");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const lodash_1 = require("lodash");
let AnalysisRedisService = class AnalysisRedisService {
    constructor(cache) {
        this.cache = cache;
        this.DATABASE = 'analysis';
        this.getAnalysis = (token) => __awaiter(this, void 0, void 0, function* () {
            let analysis = yield this.searchAnalysis(token, '*');
            const resultAnalisys = yield this.formatAnalysis(analysis);
            return resultAnalisys;
        });
        this.createAnalysis = (token, request) => __awaiter(this, void 0, void 0, function* () {
            // Get subscription from cache
            const userInfo = yield this.cache.getTokenInformation(token);
            // Get new analysisID
            const id = this.cache.obtainUUID();
            // Create analysis
            const data = {
                name: request.name,
                description: request.description,
                datasetId: request.datasetId,
                templateId: '',
                mappings: request.mappings,
                filters: request.filters,
                groups: request.groups,
                progress: 0
            };
            // Add metadata
            const metadata = {
                state: 'Process mining',
                createdBy: userInfo.firstName + ' ' + userInfo.lastName,
                createdOn: new Date().valueOf(),
                modifiedBy: userInfo.firstName + ' ' + userInfo.lastName,
                modifiedOn: new Date().valueOf(),
                lockedBy: '',
                lockedOn: 0
            };
            // Insert analysis
            const analysis = { id: id, data, metadata };
            yield this.cache.set(token, this.DATABASE, String(id), JSON.stringify(analysis));
            // Return
            return { id: id + '-' + analysis.metadata.modifiedOn };
        });
        this.getAnalysisDetails = (token, id, version) => __awaiter(this, void 0, void 0, function* () {
            const cases = yield this.searchAnalysis(token, id);
            if (cases.length == 0) {
                return {};
            }
            const resultAnalisys = yield this.formatAnalysis(cases);
            return resultAnalisys[0];
        });
        this.updateAnalysis = (token, id, version, analysisRequest) => __awaiter(this, void 0, void 0, function* () {
            // Get subscription from cache
            const userInfo = yield this.cache.getTokenInformation(token);
            // Get current value
            let payload = JSON.parse(yield this.cache.get(token, this.DATABASE, id));
            // Add the data
            payload.data = Object.assign(Object.assign({}, payload.data), analysisRequest);
            // Update metadata
            payload.metadata.modifiedBy = userInfo.firstName + ' ' + userInfo.lastName;
            payload.metadata.modifiedOn = new Date().valueOf();
            const result = yield this.cache.set(token, this.DATABASE, id, JSON.stringify(payload), undefined, true, 'metadata.modifiedOn', version);
            return this.getAnalysisDetails(token, id, version);
        });
        this.deleteAnalysis = (token, id, version) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('deleteAnalysis: token: ' + token + ' ID: ' + id + ' version: ' + version);
            // Get current value
            let payload = JSON.parse(yield this.cache.get(token, this.DATABASE, id));
            // Check if it is the same version
            if (payload.metadata.modifiedOn == Number(version)) {
                return yield this.cache.delete(token, this.DATABASE, id);
            }
            else {
                logging_1.logger.error('Not same version');
                return 'KO';
            }
        });
        this.setAnalysisTemplate = (token, id, version, templateId) => __awaiter(this, void 0, void 0, function* () {
            // Get subscription from cache
            const userInfo = yield this.cache.getTokenInformation(token);
            const analysis = yield this.searchAnalysis(token, id);
            const data = {
                id: analysis[0].id,
                data: Object.assign(Object.assign({}, analysis[0].data), { templateId: templateId }),
                metadata: Object.assign(Object.assign({}, analysis[0].metadata), { modifiedBy: userInfo.firstName + ' ' + userInfo.lastName, modifiedOn: new Date().valueOf() })
            };
            const result = yield this.cache.set(token, this.DATABASE, id, JSON.stringify(data), undefined, true, 'metadata.modifiedOn', version);
            return { result: result };
        });
        this.getAnalysisStatus = (token, id) => __awaiter(this, void 0, void 0, function* () {
            // const statusDescription = JSON.parse(await this.cache.get('analysis', 'config', 'progress'));
            const analysisStatus = JSON.parse(yield this.cache.get(token, this.DATABASE, id + '-spark-status'));
            if (!analysisStatus) {
                return;
            }
            // const status = {
            //   progression: analysis.data.progress,
            //   message: statusDescription.filter((el: any) => el.id == analysis.data.progress)[0].description
            // } as AnalysisStatus;
            return analysisStatus;
        });
        this.setAnalysisStatus = (token, id, sparkJobResponse) => __awaiter(this, void 0, void 0, function* () {
            return yield this.cache.set(token, this.DATABASE, String(id) + '-spark-status', JSON.stringify(sparkJobResponse));
        });
        this.deleteAnalysisStatus = (token, id) => __awaiter(this, void 0, void 0, function* () {
            return yield this.cache.delete(token, this.DATABASE, id + '-spark-status');
        });
        this.changeState = (token, id, version, oldState, newState, setModification, message) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('analysis-redis-changeState-start: Token: ' + token + ' ID: ' + id + ' New state: ' + newState);
            let current = yield this.getAnalysisDetails(token, id, version);
            if (current.metadata.state === oldState) {
                const userInfo = yield this.cache.getTokenInformation(token);
                // It is in same state. Move to newState
                current.id = id;
                current.metadata.state = newState;
                if (setModification) {
                    current.metadata.modifiedBy = userInfo.firstName + ' ' + userInfo.lastName;
                    current.metadata.modifiedOn = new Date().valueOf();
                }
                if (message) {
                    current.metadata.message = message;
                }
                else {
                    delete current.metadata.message;
                }
                const output = lodash_1.cloneDeep(current);
                delete current['actions'];
                const result = yield this.cache.set(token, this.DATABASE, id, JSON.stringify(current));
                return output;
            }
            else {
                logging_1.logger.debug('analysis-redis-changeState-start: Token: ' + token + ' ID: ' + id + ' New state: ' + newState + ' Old and new state are different');
                // It is in a different state. Don't move
                return {};
            }
        });
        this.searchAnalysis = (token, search) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('analysis-redis-searchAnalysis-start: Token: ' + token + ' search: ' + search);
            const analysis = yield this.cache.search(token, this.DATABASE, search);
            const parsedAnalysis = analysis.filter(item => !item.includes('jobName')).map(item => JSON.parse(item));
            logging_1.logger.debug('analysis-redis-searchAnalysis: Returned ' + parsedAnalysis.length + ' analysis');
            return parsedAnalysis;
        });
        this.formatAnalysis = (analysis) => __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(analysis.map((el) => __awaiter(this, void 0, void 0, function* () {
                const actions = yield this.getActions(el.metadata.state);
                let resultCase = {
                    id: el.id + '-' + el.metadata.modifiedOn,
                    data: el.data,
                    metadata: el.metadata,
                    actions: actions
                };
                return resultCase;
            })));
        });
        this.getActions = (state) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('Get actions for state: ' + state);
            let actions = yield this.cache.get('analysis-status', 'config', state);
            logging_1.logger.debug('Actions: ' + actions);
            if (actions) {
                return JSON.parse(actions);
            }
            else {
                return [];
            }
        });
        this.initActions = () => __awaiter(this, void 0, void 0, function* () {
            const state = yield this.cache.get('analysis-status', 'config', 'Added');
            if (state) {
                logging_1.logger.debug('Actions are initialized');
                return;
            }
            logging_1.logger.debug('Actions are not initilized. Initializing ...');
            const added = ['Abort', 'Edit'];
            const processMining = ['Abort'];
            const ready = ['Archive', 'Edit', 'Rerun'];
            const notReady = ['Edit', 'Delete', 'Rerun'];
            const archived = ['Delete'];
            const purged = ['Force delete'];
            const completed = [];
            yield this.cache.set('analysis-status', 'config', 'Added', JSON.stringify(added));
            yield this.cache.set('analysis-status', 'config', 'Process mining', JSON.stringify(processMining));
            yield this.cache.set('analysis-status', 'config', 'Ready', JSON.stringify(ready));
            yield this.cache.set('analysis-status', 'config', 'Not ready', JSON.stringify(notReady));
            yield this.cache.set('analysis-status', 'config', 'Archived', JSON.stringify(archived));
            yield this.cache.set('analysis-status', 'config', 'Purged', JSON.stringify(purged));
            yield this.cache.set('analysis-status', 'config', 'Completed', JSON.stringify(completed));
            logging_1.logger.debug('Actions are initilized.');
            return;
        });
        this.initProgressDescription = () => __awaiter(this, void 0, void 0, function* () {
            const state = yield this.cache.get('analysis', 'config', 'progress');
            if (state) {
                logging_1.logger.debug('Progress is already initialized');
                return;
            }
            logging_1.logger.debug('Progress is not initilized. Initializing ...');
            const progress = [
                { id: 0, description: 'Starting ...' },
                { id: 10, description: 'Load Analysis Config' },
                { id: 15, description: 'Load Datasource' },
                { id: 18, description: '' },
                { id: 20, description: 'Generate Events table first pass' },
                { id: 24, description: 'Generate Attributes Table' },
                { id: 30, description: 'Generate Activities table' },
                { id: 36, description: 'Polish Events table' },
                { id: 42, description: 'Generate Variants table' },
                { id: 48, description: 'Generate Compliance table' },
                { id: 54, description: 'Generate Cases table' },
                { id: 58, description: 'Polish Events table Second pass' },
                { id: 60, description: 'Event Table Saved' },
                { id: 70, description: 'Activities Table Saved' },
                { id: 80, description: 'Variant Table Saved' },
                { id: 85, description: 'Cases Table Saved' },
                { id: 90, description: 'Variant Status Table Saved' },
                { id: 100, description: 'Thanks for your patience' },
            ];
            yield this.cache.set('analysis', 'config', 'progress', JSON.stringify(progress));
            logging_1.logger.debug('Progress is initilized.');
            return;
        });
        this.getDatasetsDetails = (token, id) => __awaiter(this, void 0, void 0, function* () {
            // const claims = await this.aes.getClaims(token) as any;
            logging_1.logger.debug('GetDatasetsDetails: Token: ' + token + ' ID: ' + id);
            const datasetsDetails = yield this.cache.get((yield this.cache.getTokenInformation(token)).globalSubscriptionId, 'datasets', id);
            return JSON.parse(datasetsDetails);
        });
        this.initActions();
        this.initProgressDescription();
    }
};
AnalysisRedisService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [DiscoverCache_1.DiscoverCache])
], AnalysisRedisService);
exports.AnalysisRedisService = AnalysisRedisService;
//# sourceMappingURL=analysis-redis.service.js.map