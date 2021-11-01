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
exports.TemplatesController = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const logging_1 = require("../common/logging");
const library_service_1 = require("../services/library.service");
const templates_service_1 = require("../services/templates.service");
let TemplatesController = class TemplatesController {
    constructor() {
        this.preflightCheck = (token, response) => {
            if (!token) {
                response.status = 400;
                return response;
            }
            return true;
        };
        this.templatesService = new templates_service_1.TemplatesService(process.env.LIVEAPPS, process.env.REDIS_HOST, Number(process.env.REDIS_PORT));
        this.libraryService = new library_service_1.LibraryService(process.env.LIVEAPPS, process.env.REDIS_HOST, Number(process.env.REDIS_PORT));
        // this.templatesService.initActions();
    }
    getTemplates(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return this.templatesService.getTemplates(token.replace('Bearer ', ''));
        });
    }
    postTemplate(token, request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            // The template will use a new spotfire DXP.
            if (request.visualisation) {
                const item = yield this.libraryService.copyItem(token.replace('Bearer ', ''), request.visualisation.sourceId, request.template.spotfireLocation.slice(request.template.spotfireLocation.lastIndexOf('/') + 1), request.visualisation.destinationFolderId);
            }
            return this.templatesService.createTemplate(token.replace('Bearer ', ''), request.template);
        });
    }
    getTemplate(token, id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            const templateDetail = yield this.templatesService.getTemplate(token.replace('Bearer ', ''), id);
            logging_1.logger.debug("Template name: " + templateDetail.name);
            return templateDetail;
        });
    }
    putTemplate(token, id, template, response) {
        const check = this.preflightCheck(token, response);
        if (check !== true) {
            return check;
        }
        return this.templatesService.updateTemplate(token.replace('Bearer ', ''), id, template);
    }
    deleteTemplate(token, id, response) {
        const check = this.preflightCheck(token, response);
        if (check !== true) {
            return check;
        }
        return this.templatesService.deleteTemplate(token.replace('Bearer ', ''), id);
    }
    getLibrary(token, type, response) {
        const check = this.preflightCheck(token, response);
        if (check !== true) {
            return check;
        }
        if (!type) {
            type = 'dxp';
        }
        type = 'spotfire.' + type;
        return this.libraryService.getItems(token.replace('Bearer ', ''), type);
    }
};
TemplatesController.getName = () => {
    return 'TemplatesController';
};
__decorate([
    routing_controllers_1.Get('/templates'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTemplates", null);
__decorate([
    routing_controllers_1.Post('/templates'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body({ required: true })), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "postTemplate", null);
__decorate([
    routing_controllers_1.Get('/templates/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTemplate", null);
__decorate([
    routing_controllers_1.Put('/templates/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Body({ required: true })), __param(3, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "putTemplate", null);
__decorate([
    routing_controllers_1.Delete('/templates/:id'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Param('id')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "deleteTemplate", null);
__decorate([
    routing_controllers_1.Get('/items'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.QueryParam('type')), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "getLibrary", null);
TemplatesController = __decorate([
    typedi_1.Service(),
    routing_controllers_1.JsonController('/visualisation'),
    __metadata("design:paramtypes", [])
], TemplatesController);
exports.TemplatesController = TemplatesController;
//# sourceMappingURL=TemplatesController.js.map