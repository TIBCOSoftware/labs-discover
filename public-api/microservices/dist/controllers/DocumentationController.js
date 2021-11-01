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
exports.DocumentationController = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const logging_1 = require("../common/logging");
const documentation_service_1 = require("../services/documentation.service");
const DiscoverCache_1 = require("../cache/DiscoverCache");
let DocumentationController = class DocumentationController {
    constructor(documentationService, cache) {
        this.documentationService = documentationService;
        this.cache = cache;
        this.preflightCheck = (token, response) => {
            if (!token) {
                response.status = 401;
                return response;
            }
            return true;
        };
    }
    // *** REST Operation - get all Documentation Service Folders
    getrootfolders(token, response) {
        return __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.info("Documentation Service - " + "Get Folders");
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return this.documentationService.getFolders(token, undefined);
        });
    }
    getfolders(token, response, folderId) {
        return __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.info("Documentation Service - " + "Get Folders");
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return this.documentationService.getFolders(token, folderId);
        });
    }
    // *** REST Operation - create one Documentation Service Folder
    folders(token, foldermodel, response) {
        return __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.info("Documentation Service - " + "create folder called");
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            return this.documentationService.createFolder(token, foldermodel.parentFolderId, foldermodel.name);
        });
    }
    // *** REST Operation - create one Graph in Documentation Service Folder with specific Graph Name
    exportGraph(token, graph, graphname, folderId, response) {
        return __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.info("Documentation Service - " + "Export called");
            const check = this.preflightCheck(token, response);
            if (check !== true) {
                return check;
            }
            logging_1.logger.info(" - Folder ID  : " + folderId);
            logging_1.logger.info(" - Graph Name : " + graphname);
            // logger.info(" - Graph      : " + graph.controlPanel.title);
            // logger.info(" - Graph JSON : " + JSON.stringify(graph));
            return this.documentationService.exportGraph(token, folderId, graphname, graph);
        });
    }
};
DocumentationController.getName = () => {
    return "DocumentationController";
};
__decorate([
    routing_controllers_1.Get("/folders"),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "getrootfolders", null);
__decorate([
    routing_controllers_1.Get("/folders/:folderId"),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Res()), __param(2, routing_controllers_1.Param("folderId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "getfolders", null);
__decorate([
    routing_controllers_1.Post("/folder"),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "folders", null);
__decorate([
    routing_controllers_1.Post("/exportGraph/:folderId/:graphname"),
    __param(0, routing_controllers_1.HeaderParam("authorization")), __param(1, routing_controllers_1.Body()), __param(2, routing_controllers_1.Param("graphname")), __param(3, routing_controllers_1.Param("folderId")), __param(4, routing_controllers_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Number, Object]),
    __metadata("design:returntype", Promise)
], DocumentationController.prototype, "exportGraph", null);
DocumentationController = __decorate([
    typedi_1.Service(),
    routing_controllers_1.JsonController("/documentation"),
    __metadata("design:paramtypes", [documentation_service_1.DocumentationService,
        DiscoverCache_1.DiscoverCache])
], DocumentationController);
exports.DocumentationController = DocumentationController;
//# sourceMappingURL=DocumentationController.js.map