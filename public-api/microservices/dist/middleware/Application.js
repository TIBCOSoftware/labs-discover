"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const Koa_1 = require("./Koa");
const http_1 = __importDefault(require("http"));
// import { setupSockets } from './Socket';
const logging_1 = require("../common/logging");
const config_1 = __importDefault(require("config"));
const Probe_1 = require("./Probe");
class Application {
    constructor() {
        this.koa = new Koa_1.KoaConfig();
        this.probe = new Probe_1.Probe();
        const port = config_1.default.get('ports.http');
        const debugPort = config_1.default.get('ports.debug');
        const healthCheckPort = config_1.default.get('ports.healthCheck');
        // const routePrefix = this.koa.getRoutePrefix();
        http_1.default.createServer(this.koa.app.callback()).listen(port, () => {
            logging_1.logger.info(`
        ------------
        Server Started!
        Http: http://localhost:${port}
        Debugger: http://127.0.0.1:${port}/?ws=127.0.0.1:${port}&port=${debugPort}
        Health: http://localhost:${port}/ping
        API Docs: http://localhost:${port}/docs
        API Spec: http://localhost:${port}/swagger
        ------------
      `);
        });
        this.probe.app.listen(healthCheckPort, () => {
            logging_1.logger.info(`
        ------------
        Health check Server Started!
        Liveness check: http://localhost:${healthCheckPort}/alive
        Readiness check : http://localhost:${healthCheckPort}/ready
        ------------
      `);
        });
        // Start Websockets
        // setupSockets(this.server);
    }
}
exports.Application = Application;
//# sourceMappingURL=Application.js.map