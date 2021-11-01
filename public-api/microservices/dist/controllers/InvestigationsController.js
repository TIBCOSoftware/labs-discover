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
exports.InvestigationController = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const api_1 = require("../liveapps/authorization/api");
const api_2 = require("../liveapps/casemanagement/api");
const api_3 = require("../liveapps/pageflow/api");
const api_4 = require("../liveapps/processmanagement/api");
const configuration_service_1 = require("../services/configuration.service");
let InvestigationController = class InvestigationController {
    constructor(cache) {
        this.cache = cache;
        this.users = [];
        this.preflightCheck = (token, response) => {
            if (!token) {
                response.status = 400;
                return response;
            }
            return true;
        };
        this.getUsername = (id, header) => __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return '';
            }
            let user = this.users.filter((el) => el.id === id)[0];
            if (!user) {
                user = (yield this.usersService.getUser(id, header)).body;
                this.users.push(user);
            }
            return user.firstName + ' ' + user.lastName;
        });
        this.metaFields = [
            {
                name: 'creationTimestamp',
                format: 'DATE'
            },
            {
                name: 'modificationTimestamp',
                format: 'DATE'
            },
            {
                name: 'modifiedBy',
                format: 'string'
            },
            {
                name: 'createdBy',
                format: 'string'
            }
        ];
        this.customFields = [
            {
                name: 'caseReference'
            }
        ];
        this.createFields = (attrs, jsonSchema) => {
            let allFieldsArray = [];
            // let allFieldsMap = {};
            for (let i = 0; i < attrs.length; i++) {
                const attr = attrs[i];
                if (attr.isStructuredType) {
                    // get definition
                    if (jsonSchema && jsonSchema.definitions && jsonSchema.definitions[attr.name]) {
                        const defs = jsonSchema.definitions[attr.name];
                        if (defs.properties) {
                            for (let prop in defs.properties) {
                                allFieldsArray.push(this.addToAllFields(attr.name + '.' + prop, defs.properties[prop].title));
                            }
                        }
                    }
                }
                else if (attr.isArray === true) {
                    allFieldsArray.push(this.addToAllFields(attr.name, attr.label, 'ARRAY'));
                }
                else {
                    allFieldsArray.push(this.addToAllFields(attr.name, attr.label));
                }
            }
            this.metaFields.forEach(mf => {
                allFieldsArray.push(this.addToAllFields('META:' + mf.name, this.generateLabelFromFieldname(mf.name), mf.format));
            });
            this.customFields.forEach(cf => {
                allFieldsArray.push(this.addToAllFields('CUSTOM:' + cf.name, this.generateLabelFromFieldname(cf.name)));
            });
            // this.allFieldsOptons = this.convertFieldsToSelectOptions(this.allFieldsArray);
            return allFieldsArray;
        };
        this.addToAllFields = (field, label, format) => {
            const ele = {
                field,
                label,
                format
            };
            return ele;
        };
        this.generateLabelFromFieldname = (field) => {
            const codeA = 'A'.charCodeAt(0);
            const codeZ = 'Z'.charCodeAt(0);
            const wordArr = [];
            let start = 0;
            for (let i = 1; i < field.length; i++) {
                if (field.charCodeAt(i) >= codeA && field.charCodeAt(i) <= codeZ) {
                    wordArr.push(field.substring(start, i));
                    start = i;
                }
            }
            wordArr[0] = wordArr[0].charAt(0).toUpperCase() + wordArr[0].substring(1);
            wordArr.push(field.substring(start));
            return wordArr.join(' ');
        };
        this.createTriggers = (creators, appName) => {
            return creators.map((creator) => {
                const jsonSchema = creator.jsonSchema;
                const properties = jsonSchema.definitions[appName].properties;
                const attrsJson = [];
                for (let prop in properties) {
                    // todo: if there is structural attribute
                    if (properties[prop].type == 'string' && prop !== 'state') {
                        attrsJson.push({ value: prop, label: properties[prop].title });
                    }
                }
                return { label: creator.name, value: creator.id, fields: attrsJson };
            });
        };
        this.claimsService = new api_1.ClaimsApi(process.env.LIVEAPPS + '/organisation/v1');
        this.casesService = new api_2.CasesApi(process.env.LIVEAPPS + '/case/v1');
        this.typesService = new api_2.TypesApi(process.env.LIVEAPPS + '/case/v1');
        this.usersService = new api_1.UsersApi(process.env.LIVEAPPS + '/organisation/v1');
        this.actionsService = new api_3.CaseActionsApi(process.env.LIVEAPPS + '/pageflow/v1');
        this.processService = new api_4.ProcessesApi(process.env.LIVEAPPS + '/process/v1');
        this.configurationService = new configuration_service_1.ConfigurationService(process.env.LIVEAPPS, process.env.REDIS_HOST, Number(process.env.REDIS_PORT));
    }
    getAllApplications(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const header = { headers: { 'Authorization': token } };
            const sandboxId = (yield this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
            const typesDetails = (yield this.typesService.getTypes(sandboxId, 'b', undefined, '0', '100', undefined, header)).body;
            return typesDetails.map((app) => { return { label: app.applicationName, id: app.applicationId }; });
        });
    }
    getApplicationDefinition(token, appId, investigationId, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const header = { headers: { 'Authorization': token } };
            const sandboxId = (yield this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
            const select = 'b,a,sa,s,js,c,ac';
            const filter = 'isCase eq TRUE and applicationId eq ' + appId;
            const type = (yield this.typesService.getTypes(sandboxId, select, filter, undefined, '1000', undefined, header)).body[0];
            const fields = this.createFields(type.attributes, type.jsonSchema);
            const creators = this.createTriggers(type.creators, type.applicationInternalName);
            const states = (_a = type.states) === null || _a === void 0 ? void 0 : _a.map((state) => { return { name: state.label, color: '', icon: '' }; });
            return { fields, creators, states };
        });
    }
    getInvestigationsDetails(token, investigationId, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const header = { headers: { 'Authorization': token } };
            const sandboxId = (yield this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
            const caseDetails = (yield this.casesService.getCases(sandboxId, 'applicationId eq ' + investigationId + ' and typeId eq 1 and purgeable eq FALSE', 'cr,uc,m,s', '0', '1000', undefined, undefined, undefined, header)).body;
            const output = Promise.all(caseDetails.map((el) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                let element = {
                    id: el.caseReference || '',
                    data: JSON.parse(el.untaggedCasedata),
                    metadata: [
                        {
                            name: 'createdBy',
                            value: yield this.getUsername((_a = el.metadata) === null || _a === void 0 ? void 0 : _a.createdBy, header)
                        },
                        {
                            name: 'creationTimestamp',
                            value: (_b = el.metadata) === null || _b === void 0 ? void 0 : _b.creationTimestamp
                        },
                        {
                            name: 'modifiedBy',
                            value: yield this.getUsername((_c = el.metadata) === null || _c === void 0 ? void 0 : _c.modifiedBy, header)
                        },
                        {
                            name: 'modificationTimestamp',
                            value: (_d = el.metadata) === null || _d === void 0 ? void 0 : _d.modificationTimestamp
                        }
                    ]
                };
                return element;
            })));
            return output;
        });
    }
    getActionsForInvestigation(token, appId, investigationId, state, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const header = { headers: { 'Authorization': token } };
            const claims = (yield this.claimsService.getClaims(header)).body;
            const sandboxId = (_a = claims.sandboxes) === null || _a === void 0 ? void 0 : _a.filter((sandbox) => sandbox.type === api_1.ClaimsSandbox.TypeEnum.Production)[0].id;
            const filter = 'applicationId eq ' + appId + ' and caseType eq 1 and caseState eq ' + state + ' and caseRef eq ' + investigationId;
            const actions = (yield this.actionsService.listCaseActions(sandboxId, filter, header)).body;
            const investigationActions = actions.
                filter((action) => !action.label.startsWith('$')).
                map((action) => {
                const formData = [
                    sandboxId,
                    investigationId,
                    action.id,
                    action.name,
                    action.label,
                    action.version,
                    action.applicationId,
                    action.applicationName,
                    action.activityName
                ];
                return { id: action.id, label: action.label, formData: formData.join(':') };
            });
            return investigationActions;
        });
    }
    postStartCaseForInvestigation(token, appId, creatorId, requestBody, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const header = { headers: { 'Authorization': token } };
            const sandboxId = (yield this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
            const select = 'b,c';
            const filter = 'isCase eq TRUE and applicationId eq ' + appId;
            const body = (yield this.typesService.getTypes(sandboxId, select, filter, undefined, '1000', undefined, header)).body[0];
            const creatorSchema = (_a = body.creators) === null || _a === void 0 ? void 0 : _a.filter((element) => element.id === creatorId)[0].jsonSchema;
            const properties = creatorSchema.definitions[body.applicationInternalName].properties;
            const creatorBody = {};
            if (properties) {
                const triggerMapping = JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS')).applications.filter((element) => element.applicationId === appId)[0].creatorData;
                // Add fixed fields
                triggerMapping.push({ label: "analysisId", field: "AnalysisId" });
                triggerMapping.push({ label: "analysisName", field: "AnalysisName" });
                triggerMapping.push({ label: "templateId", field: "TemplateId" });
                triggerMapping.push({ label: "templateName", field: "TemplateName" });
                creatorBody[body.applicationInternalName] = {};
                Object.keys(properties).forEach((element) => {
                    const triggerElement = triggerMapping.find((el) => el.field === element);
                    if (triggerElement) {
                        creatorBody[body.applicationInternalName][element] = requestBody[triggerElement.label];
                    }
                });
            }
            const details = {
                id: creatorId,
                applicationId: appId,
                sandboxId: sandboxId,
                data: JSON.stringify(creatorBody)
            };
            const createResponse = yield this.processService.processCreate(details, header);
            return { id: createResponse.body.caseIdentifier };
        });
    }
};
InvestigationController.getName = () => {
    return 'InvestigationController';
};
__decorate([
    routing_controllers_1.Get('/applications'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvestigationController.prototype, "getAllApplications", null);
__decorate([
    routing_controllers_1.Get('/:appId/definition'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('appId')), __param(2, routing_controllers_1.Param('appId')), __param(3, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], InvestigationController.prototype, "getApplicationDefinition", null);
__decorate([
    routing_controllers_1.Get('/:appId'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('appId')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InvestigationController.prototype, "getInvestigationsDetails", null);
__decorate([
    routing_controllers_1.Get('/:appId/:investigationId/:state/actions'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('appId')), __param(2, routing_controllers_1.Param('investigationId')), __param(3, routing_controllers_1.Param('state')), __param(4, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], InvestigationController.prototype, "getActionsForInvestigation", null);
__decorate([
    routing_controllers_1.Post('/:appId/:creatorId/start'),
    __param(0, routing_controllers_1.HeaderParam('authorization')), __param(1, routing_controllers_1.Param('appId')), __param(2, routing_controllers_1.Param('creatorId')), __param(3, routing_controllers_1.Body()), __param(4, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], InvestigationController.prototype, "postStartCaseForInvestigation", null);
InvestigationController = __decorate([
    typedi_1.Service(),
    routing_controllers_1.JsonController('/investigation'),
    __metadata("design:paramtypes", [DiscoverCache_1.DiscoverCache])
], InvestigationController);
exports.InvestigationController = InvestigationController;
//# sourceMappingURL=InvestigationsController.js.map