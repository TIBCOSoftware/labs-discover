"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoaConfig = void 0;
// import * as express from 'express';
// import path from 'path';
// import * as bodyParser from 'body-parser';
// import * as cors from 'cors';
const koa_ping_1 = __importDefault(require("koa-ping"));
const koa_1 = __importDefault(require("koa"));
const fs_1 = __importDefault(require("fs"));
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const Logging_1 = require("./Logging");
const Swagger_1 = require("./Swagger");
const logging_1 = require("../common/logging");
const cors_1 = __importDefault(require("@koa/cors"));
// import { setupAuth } from './Authentication';
// Controllers
const SwaggerController_1 = require("../controllers/SwaggerController");
const AnalysisController_1 = require("../controllers/AnalysisController");
const TemplatesController_1 = require("../controllers/TemplatesController");
const DatasetController_1 = require("../controllers/DatasetController");
const api_1 = require("../backend/api");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const ConfigurationController_1 = require("../controllers/ConfigurationController");
const InvestigationsController_1 = require("../controllers/InvestigationsController");
const DocumentationController_1 = require("../controllers/DocumentationController");
class KoaConfig {
    constructor() {
        this.app = new koa_1.default();
        Swagger_1.setupSwagger(this.app);
        Logging_1.setupLogging(this.app);
        // setupAuth(this.app);
        this.app.use(cors_1.default({
            credentials: true
        }));
        // this.app.use(bodyParser.json());
        // this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(koa_ping_1.default('/ping'));
        this.setupControllers();
    }
    // Use Container.set to register service
    setServiceInstance() {
        const backend_domain = process.env.BACKEND_DOMAIN;
        logging_1.logger.debug('Setting backend endpoint to ' + backend_domain);
        typedi_1.Container.set(api_1.LoginApi, new api_1.LoginApi(backend_domain));
        typedi_1.Container.set(api_1.FilesOperationsApi, new api_1.FilesOperationsApi(backend_domain));
        typedi_1.Container.set(api_1.SparkPreviewJobApi, new api_1.SparkPreviewJobApi(backend_domain));
        typedi_1.Container.set(api_1.SparkOneTimeJobApi, new api_1.SparkOneTimeJobApi(backend_domain));
        typedi_1.Container.set(api_1.SparkScheduledJobApi, new api_1.SparkScheduledJobApi(backend_domain));
        typedi_1.Container.set(api_1.TibcoDataVirtualizationApi, new api_1.TibcoDataVirtualizationApi(backend_domain));
        typedi_1.Container.set(api_1.MetricsApi, new api_1.MetricsApi(backend_domain));
        const redisHost = process.env.REDIS_HOST;
        const redisPort = Number(process.env.REDIS_PORT);
        const liveappsUrl = process.env.LIVEAPPS;
        const nimbusUrl = process.env.NIMBUS;
        logging_1.logger.info('Set service instance in container ');
        logging_1.logger.info('    Liveapps: ' + liveappsUrl);
        logging_1.logger.info('    Nimbus: ' + nimbusUrl);
        logging_1.logger.info('    Redis host: ' + redisHost);
        logging_1.logger.info('    Redis port: ' + redisPort);
        typedi_1.Container.set(DiscoverCache_1.DiscoverCache, new DiscoverCache_1.DiscoverCache(redisHost, redisPort, liveappsUrl));
        typedi_1.Container.set('liveappsURL', liveappsUrl);
        typedi_1.Container.set('nimbusURL', nimbusUrl);
    }
    setupControllers() {
        // const controllersPath = path.resolve('dist', 'controllers/*.js');
        let controllers = [];
        try {
            if (fs_1.default.existsSync('/.dockerenv')) {
                logging_1.logger.info("Running the micro service in docker container. Will load controllers per configuration.");
                if (process.env.CONTROLLER_ANALYSIS && process.env.CONTROLLER_ANALYSIS === 'ON') {
                    controllers = [...controllers, AnalysisController_1.AnalysisController];
                }
                if (process.env.CONTROLLER_TEMPLATES && process.env.CONTROLLER_TEMPLATES === 'ON') {
                    controllers = [...controllers, TemplatesController_1.TemplatesController];
                }
                if (process.env.CONTROLLER_CONFIGURATION && process.env.CONTROLLER_CONFIGURATION === 'ON') {
                    controllers = [...controllers, ConfigurationController_1.ConfigurationController];
                }
                if (process.env.CONTROLLER_DATASETS && process.env.CONTROLLER_DATASETS === 'ON') {
                    controllers = [...controllers, DatasetController_1.DatasetController];
                }
                if (process.env.CONTROLLER_INVESTIGATIONS && process.env.CONTROLLER_INVESTIGATIONS === 'ON') {
                    controllers = [...controllers, InvestigationsController_1.InvestigationController];
                }
                if (process.env.CONTROLLER_DOCUMENTATION && process.env.CONTROLLER_DOCUMENTATION === 'ON') {
                    controllers = [...controllers, DocumentationController_1.DocumentationController];
                }
                if (process.env.CONTROLLER_SWAGGER && process.env.CONTROLLER_SWAGGER === 'ON') {
                    controllers = [SwaggerController_1.SwaggerController, ...controllers];
                }
            }
            else {
                // Running locally. Therefore, enable all controllers
                controllers = [SwaggerController_1.SwaggerController, AnalysisController_1.AnalysisController, TemplatesController_1.TemplatesController, DatasetController_1.DatasetController, ConfigurationController_1.ConfigurationController, InvestigationsController_1.InvestigationController, DocumentationController_1.DocumentationController];
                // controllers = [ SwaggerController, DocumentationController];
            }
        }
        catch (err) {
            console.error(err);
        }
        if (controllers.length !== 0) {
            const controllersText = controllers.map(el => el.getName());
            logging_1.logger.info('Controllers enabled: ' + controllersText);
        }
        else {
            logging_1.logger.error('No controller has been enabled.');
        }
        this.setServiceInstance();
        routing_controllers_1.useContainer(typedi_1.Container);
        routing_controllers_1.useKoaServer(this.app, {
            // routePrefix: this.getRoutePrefix(),
            controllers: controllers
            // container: Container
        });
    }
}
exports.KoaConfig = KoaConfig;
//# sourceMappingURL=Koa.js.map