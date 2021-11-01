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
exports.ConfigurationController = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const logging_1 = require("../common/logging");
const api_1 = require("../liveapps/authorization/api");
const configuration_service_1 = require("../services/configuration.service");
let ConfigurationController = class ConfigurationController {
    constructor(cache) {
        this.cache = cache;
        this.preflightCheck = (token, response) => {
            if (!token) {
                response.status = 400;
                return response;
            }
            return true;
        };
        this.configurationService = new configuration_service_1.ConfigurationService(process.env.LIVEAPPS, process.env.REDIS_HOST, Number(process.env.REDIS_PORT));
        this.groupsService = new api_1.GroupsApi(process.env.LIVEAPPS + '/organisation/v1');
        this.claimsService = new api_1.ClaimsApi(process.env.LIVEAPPS + '/organisation/v1');
    }
    getConfiguration(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('Global configuration');
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const partialConfiguration = yield Promise.all([
                this.getGeneralConfiguration(token, response),
                this.getLandingPagesConfiguration(token, response),
                this.getMessagesConfiguration(token, response),
                this.getFormatsConfiguration(token, 'ALL', response),
                this.getAutomap(token, response),
                this.getInvestigations(token.replace('Bearer ', ''), response),
                this.getAnalytics(token.replace('Bearer ', ''), response)
            ]);
            const output = {
                general: partialConfiguration[0],
                landingPage: partialConfiguration[1],
                messages: partialConfiguration[2],
                formats: partialConfiguration[3],
                automap: partialConfiguration[4],
                investigations: partialConfiguration[5],
                analytics: partialConfiguration[6]
            };
            return output;
        });
    }
    getGeneralConfiguration(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'GENERAL'));
        });
    }
    postGeneralConfiguration(token, generalInformation, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const output = yield this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'GENERAL', JSON.stringify(generalInformation));
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'GENERAL'));
        });
    }
    getLandingPagesConfiguration(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'LANDINGPAGES'));
        });
    }
    postLandingPagesConfiguration(token, landingPage, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const output = yield this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'LANDINGPAGES', JSON.stringify(landingPage));
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'LANDINGPAGES'));
        });
    }
    getMessagesConfiguration(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            let generalMessages = JSON.parse(yield this.configurationService.getConfiguration('GLOBAL', 'MESSAGES'));
            generalMessages = generalMessages.map(el => { return { id: el.id, scope: 'GLOBAL', message: el.message, persistClose: el.persistClose }; });
            let subscriptionMessages = JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'MESSAGES'));
            subscriptionMessages = subscriptionMessages.map(el => { return { id: el.id, scope: 'LOCAL', message: el.message, persistClose: el.persistClose }; });
            return [...generalMessages, ...subscriptionMessages];
        });
    }
    postMessagesConfiguration(token, messages, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const output = yield this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'MESSAGES', JSON.stringify(messages));
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'MESSAGES'));
        });
    }
    getFormatsConfiguration(token, field, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            let formats = JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'FORMATS'));
            if (field && field.toUpperCase() != 'ALL') {
                formats = formats.filter((el) => el.fieldName.toUpperCase() === field.toUpperCase());
            }
            return formats;
        });
    }
    postFormatsConfiguration(token, format, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const output = yield this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'FORMATS', JSON.stringify(format));
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'FORMATS'));
        });
    }
    getAutomap(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'AUTOMAP'));
        });
    }
    postAutomap(token, automap, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const output = yield this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'AUTOMAP', JSON.stringify(automap));
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'AUTOMAP'));
        });
    }
    getInvestigations(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS'));
        });
    }
    postInvestigations(token, investigations, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const currentInvestigations = JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS'));
            currentInvestigations.applications = investigations;
            const output = yield this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS', JSON.stringify(currentInvestigations));
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS')).applications;
        });
    }
    postInvestigationsInit(token, investigations, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            yield this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS', JSON.stringify(investigations));
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS'));
        });
    }
    getAnalytics(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'ANALYTICS'));
        });
    }
    postAnalytics(token, analytics, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const output = yield this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'ANALYTICS', JSON.stringify(analytics));
            return JSON.parse(yield this.configurationService.getConfiguration(token.replace('Bearer ', ''), 'ANALYTICS'));
        });
    }
    getWhoAmI(token, response) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const header = { headers: { 'Authorization': token } };
            const claims = (yield this.claimsService.getClaims(header)).body;
            const userMembership = ((_b = (_a = claims.sandboxes) === null || _a === void 0 ? void 0 : _a.find((el) => el.type === api_1.ClaimsSandbox.TypeEnum.Production)) === null || _b === void 0 ? void 0 : _b.groups.map((el) => el.id)) || [];
            const discoverGroups = (yield this.groupsService.getGroups(0, 100, "contains(name,'Discover')", header)).body;
            const groups = discoverGroups.filter((discoverGroup) => userMembership.includes(discoverGroup.id)).map((group) => group.name);
            const output = {
                id: claims.id,
                firstName: claims.firstName,
                lastName: claims.lastName,
                email: claims.email,
                subscriptionId: claims.globalSubcriptionId,
                isUser: groups.includes('Discover Users'),
                isAdmin: groups.includes('Discover Administrators'),
                isAnalyst: groups.includes('Discover Analysts'),
                isResolver: groups.includes('Discover Case Resolvers')
            };
            return output;
        });
    }
};
ConfigurationController.getName = () => {
    return 'ConfigurationController';
};
__decorate([
    routing_controllers_1.Get('/'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getConfiguration", null);
__decorate([
    routing_controllers_1.Get('/general'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getGeneralConfiguration", null);
__decorate([
    routing_controllers_1.Post('/general'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "postGeneralConfiguration", null);
__decorate([
    routing_controllers_1.Get('/landingpages'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getLandingPagesConfiguration", null);
__decorate([
    routing_controllers_1.Post('/landingpages'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "postLandingPagesConfiguration", null);
__decorate([
    routing_controllers_1.Get('/messages'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getMessagesConfiguration", null);
__decorate([
    routing_controllers_1.Post('/messages'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "postMessagesConfiguration", null);
__decorate([
    routing_controllers_1.Get('/formats'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.QueryParam('field')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getFormatsConfiguration", null);
__decorate([
    routing_controllers_1.Post('/formats'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "postFormatsConfiguration", null);
__decorate([
    routing_controllers_1.Get('/automap'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getAutomap", null);
__decorate([
    routing_controllers_1.Post('/automap'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "postAutomap", null);
__decorate([
    routing_controllers_1.Get('/investigations'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getInvestigations", null);
__decorate([
    routing_controllers_1.Post('/investigations'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "postInvestigations", null);
__decorate([
    routing_controllers_1.Post('/investigations/init'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "postInvestigationsInit", null);
__decorate([
    routing_controllers_1.Get('/analytics'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getAnalytics", null);
__decorate([
    routing_controllers_1.Post('/analytics'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "postAnalytics", null);
__decorate([
    routing_controllers_1.Get('/whoami'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigurationController.prototype, "getWhoAmI", null);
ConfigurationController = __decorate([
    typedi_1.Service(),
    routing_controllers_1.JsonController('/configuration'),
    __metadata("design:paramtypes", [DiscoverCache_1.DiscoverCache])
], ConfigurationController);
exports.ConfigurationController = ConfigurationController;
//# sourceMappingURL=ConfigurationController.js.map