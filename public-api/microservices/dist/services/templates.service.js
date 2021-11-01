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
exports.TemplatesService = void 0;
const typedi_1 = require("typedi");
const DiscoverCache_1 = require("../cache/DiscoverCache");
let TemplatesService = class TemplatesService {
    constructor(liveappsURL, redisHost, redisPort) {
        this.DATABASE = 'templates';
        this.getTemplates = (token) => __awaiter(this, void 0, void 0, function* () {
            let allTemplates = yield Promise.all([this.cache.search(token, this.DATABASE, '*'), this.cache.search('DEFAULT', this.DATABASE, '*')]);
            const subscriptionId = (yield this.cache.getClient(token)).globalSubscriptionId;
            const templates = [
                ...allTemplates[0].map(el => JSON.parse(el)),
                ...allTemplates[1].map(el => {
                    const template = JSON.parse(el);
                    template.spotfireLocation = template.spotfireLocation.replace('/<ORGID>/', '/' + subscriptionId + '/');
                    return template;
                })
            ];
            return templates;
        });
        this.createTemplate = (token, template) => __awaiter(this, void 0, void 0, function* () {
            const id = yield this.cache.obtainUUID();
            template.id = id;
            yield this.cache.set(token, this.DATABASE, String(id), JSON.stringify(template));
            return template;
        });
        this.getTemplate = (token, id) => __awaiter(this, void 0, void 0, function* () {
            let template = JSON.parse(yield this.cache.get(token, this.DATABASE, id));
            // if template doesn't exist it is a default template
            if (!template) {
                template = JSON.parse(yield this.cache.get('DEFAULT', this.DATABASE, id));
                const subscriptionId = (yield this.cache.getClient(token)).globalSubscriptionId;
                template.spotfireLocation = template.spotfireLocation.replace('/<ORGID>/', '/' + subscriptionId + '/');
            }
            return template;
        });
        this.updateTemplate = (token, id, template) => __awaiter(this, void 0, void 0, function* () {
            yield this.cache.set(token, this.DATABASE, id, JSON.stringify(template));
            return template;
        });
        this.deleteTemplate = (token, id) => __awaiter(this, void 0, void 0, function* () {
            return this.cache.delete(token, this.DATABASE, id);
        });
        this.cache = new DiscoverCache_1.DiscoverCache(redisHost, redisPort, liveappsURL);
    }
};
TemplatesService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [String, String, Number])
], TemplatesService);
exports.TemplatesService = TemplatesService;
//# sourceMappingURL=templates.service.js.map