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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisController = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const logging_1 = require("../common/logging");
const api_1 = require("../backend/api");
const analysis_redis_service_1 = require("../services/analysis-redis.service");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const templates_service_1 = require("../services/templates.service");
let AnalysisController = class AnalysisController {
    constructor(analysisService, cache, sparkService, metricsService) {
        this.analysisService = analysisService;
        this.cache = cache;
        this.sparkService = sparkService;
        this.metricsService = metricsService;
        this.preflightCheck = (token, response) => {
            if (!token) {
                response.status = 401;
                return response;
            }
            return true;
        };
        this.sleep = (ms) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        });
        this.triggerSparkJob = (token, id, version, analysis) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('Starting triggerSparkJob for ID: ' + id);
            const datasetsDetails = yield this.analysisService.getDatasetsDetails(token.replace('Bearer ', ''), analysis.datasetId);
            logging_1.logger.debug(datasetsDetails);
            const tokenInformation = yield this.cache.getTokenInformation(token);
            const sparkJobPayload = {
                schema: datasetsDetails.schema.map((el) => {
                    return {
                        format: el.format,
                        columnName: el.key,
                        dataType: el.type
                    };
                }),
                datasetSource: {
                    source: '/services/databases/ORG_' + tokenInformation.globalSubscriptionId + '/datasets/' + analysis.datasetId
                },
                filters: analysis.filters,
                groups: analysis.groups,
                id: id,
                version: version,
                token: token.replace('Bearer ', ''),
                mappings: {
                    activity: analysis.mappings.activity,
                    caseId: analysis.mappings.caseId,
                    endTime: analysis.mappings.endTime,
                    otherAttributes: analysis.mappings.otherAttributes ? String(analysis.mappings.otherAttributes) : "false",
                    requester: analysis.mappings.requester,
                    resource: analysis.mappings.resource,
                    resourceGroup: analysis.mappings.resourceGroup,
                    scheduledEnd: analysis.mappings.scheduledEnd,
                    scheduledStart: analysis.mappings.scheduledStart,
                    startTime: analysis.mappings.startTime
                },
                organization: tokenInformation.globalSubscriptionId.toLowerCase(),
                schedule: {
                    schedule: "every5min",
                    isSchedule: "false"
                }
            };
            const sparkJobResponse = (yield this.sparkService.postJobRoute(sparkJobPayload)).body;
            yield this.analysisService.setAnalysisStatus(token, id, sparkJobResponse);
            return;
        });
        this.purgeJob = (jobName, token, id, waitComplete) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('Purging job: ' + jobName);
            let isCompleted = false;
            if (waitComplete) {
                while (!isCompleted) {
                    const jobStatus = yield this.sparkService.getJobRoute(jobName);
                    if (jobStatus.body.status === 'COMPLETED') {
                        isCompleted = true;
                    }
                    else {
                        yield this.sleep(5000);
                    }
                }
            }
            const output = yield this.sparkService.deleteJobRoute(jobName);
            yield this.analysisService.deleteAnalysisStatus(token, id);
        });
        this.templatesService = new templates_service_1.TemplatesService(process.env.LIVEAPPS, process.env.REDIS_HOST, Number(process.env.REDIS_PORT));
    }
    getAnalysis(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const analysisData = yield this.addTemplateLabel(token.replace('Bearer ', ''), (yield this.analysisService.getAnalysis(token.replace('Bearer ', ''))));
            return this.addMetricsInformation(token.replace('Bearer ', ''), analysisData);
        });
    }
    postAnalysis(token, analysis, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const output = yield this.analysisService.createAnalysis(token.replace('Bearer ', ''), analysis);
            const version = output.id.slice(output.id.lastIndexOf('-') + 1);
            const id = output.id.slice(0, output.id.lastIndexOf('-'));
            let analysisData = analysis;
            yield this.triggerSparkJob(token.replace('Bearer ', ''), id, version, analysisData);
            return output;
        });
    }
    getAnalysisDetails(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const analysisDetail = (yield this.addTemplateLabel(token.replace('Bearer ', ''), [yield this.analysisService.getAnalysisDetails(token.replace('Bearer ', ''), id.slice(0, id.lastIndexOf('-')), id.slice(id.lastIndexOf('-') + 1))]))[0];
            return (yield this.addMetricsInformation(token.replace('Bearer ', ''), [analysisDetail]))[0];
        });
    }
    putAnalysis(token, id, analysis, response) {
        const check = this.preflightCheck(token, response);
        if (check !== true) {
            return check;
        }
        const version = id.slice(id.lastIndexOf('-') + 1);
        id = id.slice(0, id.lastIndexOf('-'));
        return this.analysisService.updateAnalysis(token.replace('Bearer ', ''), id, version, analysis);
    }
    deleteAnalysis(token, id, response) {
        logging_1.logger.debug('1');
        const check = this.preflightCheck(token, response);
        if (check !== true) {
            return check;
        }
        const version = id.slice(id.lastIndexOf('-') + 1);
        id = id.slice(0, id.lastIndexOf('-'));
        return this.analysisService.deleteAnalysis(token.replace('Bearer ', ''), id, version);
    }
    setAnalysisTemplate(token, id, templateId, response) {
        const check = this.preflightCheck(token, response);
        if (check !== true) {
            return check;
        }
        const version = id.slice(id.lastIndexOf('-') + 1);
        id = id.slice(0, id.lastIndexOf('-'));
        return this.analysisService.setAnalysisTemplate(token.replace('Bearer ', ''), id, version, templateId);
    }
    runAnalysisAction(token, id, action, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            let version = id.slice(id.lastIndexOf('-') + 1);
            id = id.slice(0, id.lastIndexOf('-'));
            // Check if the action is available
            let actionResult = {};
            const storedAnalysis = yield this.analysisService.getAnalysisDetails(token.replace('Bearer ', ''), id, version);
            if (!storedAnalysis.actions.includes(action)) {
                response.status = 405;
                return response;
            }
            else {
                // Action is available
                switch (action) {
                    case 'Abort':
                        actionResult = yield this.analysisService.changeState(token.replace('Bearer ', ''), id, version, storedAnalysis.metadata.state, 'Not ready', true, 'User aborted');
                        const currentJob = yield this.analysisService.getAnalysisStatus(token.replace('Bearer ', ''), id);
                        this.purgeJob(currentJob.jobName, token.replace('Bearer ', ''), id, false);
                        break;
                    case 'Complete':
                        actionResult = yield this.analysisService.changeState(token.replace('Bearer ', ''), id, version, storedAnalysis.metadata.state, 'Ready', true);
                        break;
                    case 'Archive':
                        actionResult = yield this.analysisService.changeState(token.replace('Bearer ', ''), id, version, storedAnalysis.metadata.state, 'Archived', true);
                        break;
                    case 'Rerun':
                        actionResult = yield this.analysisService.changeState(token.replace('Bearer ', ''), id, version, storedAnalysis.metadata.state, 'Process mining', true);
                        version = String(actionResult.metadata.modifiedOn);
                        const updateProgress = yield this.reportAnalysisStatus(token, id + '-' + version, { progression: 0, level: 'INFO', message: 'Init for rerun' }, response);
                        yield this.triggerSparkJob(token.replace('Bearer ', ''), id, version, storedAnalysis.data);
                        return actionResult;
                    case 'Delete':
                        return this.deleteAnalysis(token, id + '-' + version, response);
                        break;
                    default:
                        break;
                }
            }
            return actionResult;
        });
    }
    getAnalysisStatus(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const version = id.slice(id.lastIndexOf('-') + 1);
            id = id.slice(0, id.lastIndexOf('-'));
            const analysisDetail = yield this.analysisService.getAnalysisStatus(token.replace('Bearer ', ''), id);
            if (!analysisDetail) {
                response.status = 404;
                return response;
            }
            return analysisDetail;
        });
    }
    reportAnalysisStatus(token, id, status, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const version = id.slice(id.lastIndexOf('-') + 1);
            id = id.slice(0, id.lastIndexOf('-'));
            logging_1.logger.debug('ID: ' + id + ' Version: ' + version + ' Progression: ' + status.progression);
            let analysis;
            analysis = yield this.analysisService.getAnalysisDetails(token.replace('Bearer ', ''), id, version);
            if (status.level === 'INFO') {
                yield this.analysisService.setAnalysisStatus(token.replace('Bearer ', ''), id, status);
                if (status.jobName && status.progression == 100) {
                    analysis = yield this.analysisService.changeState(token.replace('Bearer ', ''), id, version, 'Process mining', 'Ready', false);
                    this.purgeJob(status.jobName, token.replace('Bearer ', ''), id, true);
                }
            }
            else {
                analysis = yield this.analysisService.changeState(token.replace('Bearer ', ''), id, version, 'Process mining', 'Not ready', false, status.message);
                this.purgeJob(status.jobName, token, id, false);
            }
            return analysis;
        });
    }
    addTemplateLabel(token, analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            const templates = yield this.templatesService.getTemplates(token);
            return analysis.map((analysis) => {
                const templateName = templates.find((template) => template.id === analysis.data.templateId);
                analysis.data.templateLabel = templateName === null || templateName === void 0 ? void 0 : templateName.name;
                return analysis;
            });
        });
    }
    addMetricsInformation(token, analysis) {
        return __awaiter(this, void 0, void 0, function* () {
            const orgId = (yield this.cache.getTokenInformation(token)).globalSubscriptionId;
            const analysisForReportData = analysis.filter((analysis) => analysis.metadata.state === 'Ready').map((analysis) => analysis.id.substring(0, analysis.id.lastIndexOf('-')));
            const analysisPromises = analysisForReportData.map((el) => this.metricsService.getAnalysisMetricsRoute(orgId, el));
            const results = (yield Promise.all(analysisPromises.map(p => p.catch(e => e))));
            const validResults = results.filter(result => !(result instanceof Error));
            return analysis.map((analysis) => {
                const metrics = validResults.find((vr => analysis.id.includes(vr.response.body.data.analysisID)));
                if (metrics) {
                    analysis.metrics = metrics.response.body.data.Metrics;
                }
                ;
                return analysis;
            });
        });
    }
};
AnalysisController.getName = () => {
    return 'AnalysisController';
};
__decorate([
    routing_controllers_1.Get('/analysis'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "getAnalysis", null);
__decorate([
    routing_controllers_1.Post('/analysis'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "postAnalysis", null);
__decorate([
    routing_controllers_1.Get('/analysis/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "getAnalysisDetails", null);
__decorate([
    routing_controllers_1.Put('/analysis/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Body({ required: true })), __param(3, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], AnalysisController.prototype, "putAnalysis", null);
__decorate([
    routing_controllers_1.Delete('/analysis/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalysisController.prototype, "deleteAnalysis", null);
__decorate([
    routing_controllers_1.Post('/analysis/:id/template/:templateId'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Param('templateId')), __param(3, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AnalysisController.prototype, "setAnalysisTemplate", null);
__decorate([
    routing_controllers_1.Post('/analysis/:id/action/:action'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Param('action')), __param(3, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "runAnalysisAction", null);
__decorate([
    routing_controllers_1.Get('/analysis/:id/status'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "getAnalysisStatus", null);
__decorate([
    routing_controllers_1.Post('/analysis/:id/status'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Body({ required: true })), __param(3, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "reportAnalysisStatus", null);
AnalysisController = __decorate([
    typedi_1.Service(),
    routing_controllers_1.JsonController('/repository'),
    __metadata("design:paramtypes", [analysis_redis_service_1.AnalysisRedisService,
        DiscoverCache_1.DiscoverCache,
        api_1.SparkOneTimeJobApi,
        api_1.MetricsApi])
], AnalysisController);
exports.AnalysisController = AnalysisController;
//# sourceMappingURL=AnalysisController.js.map