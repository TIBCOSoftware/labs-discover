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
exports.AdministrationController = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const configuration_service_1 = require("../services/configuration.service");
const library_service_1 = require("../services/library.service");
const templates_service_1 = require("../services/templates.service");
let AdministrationController = class AdministrationController {
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
        this.configurationService = new configuration_service_1.ConfigurationService(process.env.LIVEAPPS, process.env.REDIS_HOST, Number(process.env.REDIS_PORT));
        // this.templatesService.initActions();
    }
    // @Get('/templates')
    // async getTemplates(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Template[] | Response > {
    //   const check = this.preflightCheck(token, response);
    //   if (check !== true) {
    //     return check as Response;
    //   }
    //   return this.templatesService.getTemplates(token.replace('Bearer ',''));
    // }
    postTemplate(token, request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return;
        });
    }
};
AdministrationController.getName = () => {
    return 'AdminController';
};
__decorate([
    routing_controllers_1.Post('/init'),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body({ required: true })), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdministrationController.prototype, "postTemplate", null);
AdministrationController = __decorate([
    typedi_1.Service(),
    routing_controllers_1.JsonController('/admin'),
    __metadata("design:paramtypes", [])
], AdministrationController);
exports.AdministrationController = AdministrationController;
//# sourceMappingURL=AdministrationController.js.map