"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Probe = void 0;
// import * as express from 'express';
const koa_1 = __importDefault(require("koa"));
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const HealthCheckController_1 = require("../controllers/HealthCheckController");
class Probe {
    constructor() {
        this.app = new koa_1.default();
        this.setupControllers();
    }
    setupControllers() {
        // const controllersPath = path.resolve('dist', 'controllers/*.js');
        routing_controllers_1.useContainer(typedi_1.Container);
        routing_controllers_1.useKoaServer(this.app, {
            controllers: [HealthCheckController_1.HealthCheckController]
        });
    }
}
exports.Probe = Probe;
//# sourceMappingURL=Probe.js.map