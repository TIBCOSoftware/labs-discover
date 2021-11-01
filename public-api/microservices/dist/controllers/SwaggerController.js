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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerController = void 0;
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let SwaggerController = class SwaggerController {
    constructor() { }
    get() {
        return this.generateSwagger();
    }
    generateSwagger() {
        // Get document, or throw exception on error
        let doc;
        try {
            doc = js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.join(__dirname, '../api.yaml'), 'utf8'));
        }
        catch (e) {
            doc = null;
            console.log(e);
        }
        return doc;
    }
};
SwaggerController.getName = () => {
    return 'SwaggerController';
};
__decorate([
    routing_controllers_1.Get('/api.yaml'),
    routing_controllers_1.ContentType("application/yaml"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SwaggerController.prototype, "get", null);
SwaggerController = __decorate([
    typedi_1.Service(),
    routing_controllers_1.JsonController('/docs'),
    __metadata("design:paramtypes", [])
], SwaggerController);
exports.SwaggerController = SwaggerController;
//# sourceMappingURL=SwaggerController.js.map