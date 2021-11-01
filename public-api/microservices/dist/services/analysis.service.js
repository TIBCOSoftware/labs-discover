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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const typedi_1 = require("typedi");
const logging_1 = require("../common/logging");
const axios_1 = __importDefault(require("axios"));
const DiscoverCache_1 = require("../cache/DiscoverCache");
const liveapps_lib_1 = require("@tibco-discover/liveapps-lib");
let AnalysisService = class AnalysisService {
    constructor(liveappsURL, cache) {
        // logger.info('AnalysisService constructor called with values: ');
        // logger.info('    Liveapps: ' + liveappsURL);
        // logger.info('    Redis host: ' + redisHost);
        // logger.info('    Redis port: ' + redisPort);
        this.liveappsURL = liveappsURL;
        this.cache = cache;
        this.getAnalysis = (token, removeCompleted) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.aes.getClaims(token);
            let cases = yield this.searchAnalysis('$' + claims.subscriptionId + '$');
            if (removeCompleted) {
                cases = cases.filter(el => {
                    const summary = JSON.parse(el.summary);
                    return summary.state != 'Completed';
                });
            }
            const resultAnalisys = yield this.formatAnalysis(cases);
            return resultAnalisys;
        });
        this.createAnalysis = (token, request) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.aes.getClaims(token);
            let data = {
                ProcessAnalysisManagement: Object.assign(Object.assign({}, request), { Organization: '$' + claims.subscriptionId + '$' })
            };
            // Create internal structure
            data.ProcessAnalysisManagement.Internal = {
                Progress: 0,
                Createdby: claims.firstName + ' ' + claims.lastName,
                Modifiedby: claims.firstName + ' ' + claims.lastName
            };
            const result = yield this.runProcess('', '19094', JSON.stringify(data));
            data.ProcessAnalysisManagement.Internal.Casereference = result.caseReference;
            let update;
            while (!update) {
                yield this.sleep(100);
                update = yield this.runProcess(result.caseReference, '20019', JSON.stringify(data));
                logging_1.logger.debug('UPDATE FIELD: ' + JSON.stringify(update));
            }
            return { ID: result.caseIdentifier };
        });
        this.sleep = (ms) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        });
        this.getAnalysisDetails = (token, name) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.aes.getClaims(token);
            const cases = yield this.searchAnalysis('$' + claims.subscriptionId + '$ ' + name);
            if (cases.length == 0) {
                return null;
            }
            const resultAnalisys = yield this.formatAnalysis(cases);
            return resultAnalisys[0];
        });
        this.updateAnalysis = (token, name, analysisRequest) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.aes.getClaims(token);
            const commonToken = yield this.cache.get('liveapps-common', 'config', 'cictoken');
            const commonSandbox = yield this.cache.get('liveapps-common', 'config', 'sandbox');
            const applicationId = '3853';
            const analysis = yield this.searchCases(commonToken, commonSandbox, '$' + claims.subscriptionId + '$ ' + name);
            let payloadData = {
                ProcessAnalysisManagement: Object.assign(Object.assign({}, JSON.parse(analysis[0].untaggedCasedata)), analysisRequest)
            };
            payloadData.ProcessAnalysisManagement.Internal.Modifiedby = claims.firstName + ' ' + claims.lastName;
            const payload = {
                id: '19107',
                applicationId: applicationId,
                sandboxId: commonSandbox,
                caseReference: analysis[0].caseReference,
                caseIdentifier: name,
                data: JSON.stringify(payloadData)
            };
            const result = yield this.pms.processCreate(commonToken, payload);
            return { ID: result.caseIdentifier };
        });
        this.deleteAnalysis = (token, name) => __awaiter(this, void 0, void 0, function* () {
            // return this.cache.delete(token, 'templates', name);
            return;
        });
        this.setAnalysisTemplate = (token, analysis, template) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.aes.getClaims(token);
            const commonToken = yield this.cache.get('liveapps-common', 'config', 'cictoken');
            const commonSandbox = yield this.cache.get('liveapps-common', 'config', 'sandbox');
            const cases = yield this.searchCases(commonToken, commonSandbox, analysis);
            const data = {
                ProcessAnalysisManagement: {
                    Template: template,
                    Internal: Object.assign(Object.assign({}, JSON.parse(cases[0].untaggedCasedata).Internal), { Modifiedby: claims.firstName + ' ' + claims.lastName })
                }
            };
            const update = yield this.runProcess(cases[0].caseReference, '19208', JSON.stringify(data));
            return { result: 'OK' };
        });
        this.executeAction = (token, name, actionId, bodyRequest) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.aes.getClaims(token);
            const commonToken = yield this.cache.get('liveapps-common', 'config', 'cictoken');
            const commonSandbox = yield this.cache.get('liveapps-common', 'config', 'sandbox');
            const applicationId = '3853';
            const analysis = yield this.searchCases(commonToken, commonSandbox, '$' + claims.subscriptionId + '$ ' + name);
            if (actionId === '19106')
                logging_1.logger.debug('analysis for actionId: ' + actionId + ': ' + JSON.stringify(analysis));
            let payload = {
                id: actionId,
                applicationId: applicationId,
                sandboxId: commonSandbox,
                caseReference: analysis[0].caseReference,
                caseIdentifier: name
            };
            if (bodyRequest) {
                payload.data = bodyRequest;
            }
            const result = yield this.pms.processCreate(commonToken, payload);
            if (result.caseIdentifier) {
                return { ID: result.caseIdentifier };
            }
            else {
            }
        });
        this.getAnalysisStatus = (token, name) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.aes.getClaims(token);
            const cases = yield this.searchAnalysis('$' + claims.subscriptionId + '$ ' + name);
            if (cases.length == 0) {
                return;
            }
            const data = JSON.parse(cases[0].untaggedCasedata);
            const status = {
                Progression: data.Internal.Progress,
                Message: 'TBD'
            };
            return status;
        });
        this.searchAnalysis = (search) => __awaiter(this, void 0, void 0, function* () {
            const commonToken = yield this.cache.get('liveapps-common', 'config', 'cictoken');
            const commonSandbox = yield this.cache.get('liveapps-common', 'config', 'sandbox');
            const cases = yield this.searchCases(commonToken, commonSandbox, search);
            return cases;
        });
        this.formatAnalysis = (cases) => __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(cases.map((el) => __awaiter(this, void 0, void 0, function* () {
                const caseData = JSON.parse(el.untaggedCasedata);
                const actions = yield this.getActions(caseData.state);
                let resultCase = {
                    data: {
                        ID: caseData.ID,
                        Name: caseData.Name,
                        Description: caseData.Description,
                        Dataset: caseData.Dataset,
                        Template: caseData.Template,
                        State: caseData.state,
                        Mapping: caseData.Mapping,
                        Filters: [],
                        Groups: []
                    },
                    metadata: {
                        createdBy: caseData.Internal.Createdby,
                        createdOn: el.metadata.creationTimestamp,
                        modifiedBy: caseData.Internal.Modifiedby,
                        modifiedOn: el.metadata.modificationTimestamp
                    },
                    actions: actions
                };
                return resultCase;
            })));
        });
        this.searchCases = (token, sandboxId, search) => __awaiter(this, void 0, void 0, function* () {
            let url = this.liveappsURL + '/case/v1/cases';
            url += '?$search=' + search + '&$sandbox=' + sandboxId + '&$filter=applicationId eq ' + '3853' + ' and typeId eq 1' + '&$select=cr, c, uc, s, m&$top=100';
            return yield axios_1.default.get(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }).then(response => {
                return response.data;
            }).catch(_error => {
                return [];
            });
        });
        this.runProcess = (caseReference, id, data) => __awaiter(this, void 0, void 0, function* () {
            let url = this.liveappsURL + '/process/v1/processes';
            const commonToken = yield this.cache.get('liveapps-common', 'config', 'cictoken');
            const commonSandbox = yield this.cache.get('liveapps-common', 'config', 'sandbox');
            const applicationId = '3853';
            let request = {
                id: id,
                applicationId: applicationId,
                sandboxId: commonSandbox,
            };
            if (caseReference !== '')
                request.caseReference = caseReference;
            if (data !== '')
                request.data = data;
            return axios_1.default.post(url, request, {
                headers: {
                    'Authorization': 'Bearer ' + commonToken
                }
            }).then(response => {
                return response.data;
            }).catch(_error => {
                logging_1.logger.error(_error);
                return;
            });
        });
        this.getActions = (state) => __awaiter(this, void 0, void 0, function* () {
            const actions = yield this.cache.get('analysis-status', 'config', state);
            return JSON.parse(actions);
        });
        this.initActions = () => __awaiter(this, void 0, void 0, function* () {
            const state = yield this.cache.get('analysis-status', 'config', 'Added');
            if (state) {
                logging_1.logger.debug('Actions are initialized');
                return;
            }
            logging_1.logger.debug('Actions are not initilized. Initializing ...');
            const commonToken = yield this.cache.get('liveapps-common', 'config', 'cictoken');
            const commonSandbox = yield this.cache.get('liveapps-common', 'config', 'sandbox');
            const applicationId = '3853';
            const types = yield this.cms.getTypes(commonToken, commonSandbox, 'ac', 'isCase eq TRUE and applicationId eq ' + applicationId);
            const added = [
                { label: 'Abort', id: this.getActionId('Abort', types[0].actions) },
                { label: 'Edit', id: this.getActionId('Edit', types[0].actions) }
            ];
            const processMining = [
                { label: 'Abort', id: this.getActionId('Abort', types[0].actions) }
            ];
            const ready = [
                { label: 'Archive', id: this.getActionId('Archive', types[0].actions) },
                { label: 'Edit', id: this.getActionId('Edit', types[0].actions) },
                { label: 'Rerun', id: this.getActionId('Rerun', types[0].actions) }
            ];
            const notReady = [
                { label: 'Edit', id: this.getActionId('Edit', types[0].actions) },
                { label: 'Delete', id: this.getActionId('Purge', types[0].actions) },
                { label: 'Rerun', id: this.getActionId('Rerun', types[0].actions) }
            ];
            const archived = [
                { label: 'Delete', id: this.getActionId('Purge', types[0].actions) }
            ];
            const purged = [
                { label: 'Force delete', id: this.getActionId('Force delete', types[0].actions) }
            ];
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
        this.getActionId = (actionName, actions) => {
            return actions.filter(el => el.name === actionName)[0].id;
        };
        this.getDatasetsDetails = (token, id) => __awaiter(this, void 0, void 0, function* () {
            const claims = yield this.aes.getClaims(token);
            logging_1.logger.debug('222222 ******** ' + JSON.stringify(claims));
            const datasetsDetails = yield this.cache.get(claims.globalSubscriptionId, 'datasets', id);
            return JSON.parse(datasetsDetails);
        });
        // this.liveappsURL = liveappsURL;
        // this.cache = new DiscoverCache(redisHost, redisPort, this.liveappsURL);
        this.aes = new liveapps_lib_1.AuthorizatinEngineService();
        this.pms = new liveapps_lib_1.ProcessManagementService();
        this.cms = new liveapps_lib_1.CaseManagerService();
    }
};
AnalysisService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [String, DiscoverCache_1.DiscoverCache])
], AnalysisService);
exports.AnalysisService = AnalysisService;
//# sourceMappingURL=analysis.service.js.map