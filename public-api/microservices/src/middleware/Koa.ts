// import * as express from 'express';
// import path from 'path';
// import * as bodyParser from 'body-parser';
// import * as cors from 'cors';
import health from 'koa-ping';
import koa from 'koa';
import fs from 'fs';

import { useKoaServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import { setupLogging } from './Logging';
import { setupSwagger } from './Swagger';
import { logger } from '../common/logging';
import cors from '@koa/cors';
// import { setupAuth } from './Authentication';

// Controllers
import { SwaggerController } from '../controllers/SwaggerController';
import { AnalysisController } from '../controllers/AnalysisController';
import { TemplatesController } from '../controllers/TemplatesController';
import { DatasetController } from '../controllers/DatasetController';
import { FilesOperationsApi, LoginApi, MetricsApi, SparkOneTimeJobApi, SparkPreviewJobApi, SparkScheduledJobApi, TibcoDataVirtualizationApi } from '../backend/api';
import { DiscoverCache } from '../cache/DiscoverCache';
import { ConfigurationController } from '../controllers/ConfigurationController';
import { InvestigationController } from '../controllers/InvestigationsController';
import { DocumentationController } from '../controllers/DocumentationController';

export class KoaConfig {

  app: koa;

  constructor() {
    this.app = new koa();

    setupSwagger(this.app);
    setupLogging(this.app);
    // setupAuth(this.app);

    this.app.use(cors({
      credentials: true
    }));
    // this.app.use(bodyParser.json());
    // this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(health('/ping'));
    this.setupControllers();
  }

  // Use Container.set to register service
  setServiceInstance() {
    const backend_domain = process.env.BACKEND_DOMAIN;
    logger.debug('Setting backend endpoint to ' + backend_domain);
    Container.set(LoginApi, new LoginApi(backend_domain));
    Container.set(FilesOperationsApi, new FilesOperationsApi(backend_domain));
    Container.set(SparkPreviewJobApi, new SparkPreviewJobApi(backend_domain));
    Container.set(SparkOneTimeJobApi, new SparkOneTimeJobApi(backend_domain));
    Container.set(SparkScheduledJobApi, new SparkScheduledJobApi(backend_domain));
    Container.set(TibcoDataVirtualizationApi, new TibcoDataVirtualizationApi(backend_domain));
    Container.set(MetricsApi, new MetricsApi(backend_domain));

    const redisHost = process.env.REDIS_HOST as string;
    const redisPort = Number(process.env.REDIS_PORT as string);
    const liveappsUrl = process.env.LIVEAPPS as string;
    const nimbusUrl = process.env.NIMBUS as string;

    logger.info('Set service instance in container ');
    logger.info('    Liveapps: ' + liveappsUrl);
    logger.info('    Nimbus: ' + nimbusUrl);
    logger.info('    Redis host: ' + redisHost);
    logger.info('    Redis port: ' + redisPort);

    Container.set(DiscoverCache, new DiscoverCache(redisHost, redisPort, liveappsUrl));
    Container.set('liveappsURL', liveappsUrl);
    Container.set('nimbusURL', nimbusUrl);
  }

  setupControllers() {
    // const controllersPath = path.resolve('dist', 'controllers/*.js');
    let controllers: any[] = [];

    try {
      if (fs.existsSync('/.dockerenv')) {
        logger.info("Running the micro service in docker container. Will load controllers per configuration.");
        if (process.env.CONTROLLER_ANALYSIS && process.env.CONTROLLER_ANALYSIS === 'ON'){
          controllers = [ ...controllers, AnalysisController ]
        }
        if (process.env.CONTROLLER_TEMPLATES && process.env.CONTROLLER_TEMPLATES === 'ON'){
          controllers = [ ...controllers, TemplatesController ]
        }
        if (process.env.CONTROLLER_CONFIGURATION && process.env.CONTROLLER_CONFIGURATION === 'ON'){
          controllers = [ ...controllers, ConfigurationController ]
        }
        if (process.env.CONTROLLER_DATASETS && process.env.CONTROLLER_DATASETS === 'ON'){
          controllers = [ ...controllers, DatasetController ]
        }
        if (process.env.CONTROLLER_INVESTIGATIONS && process.env.CONTROLLER_INVESTIGATIONS === 'ON'){
          controllers = [ ...controllers, InvestigationController ]
        }
        if (process.env.CONTROLLER_DOCUMENTATION && process.env.CONTROLLER_DOCUMENTATION === 'ON'){
          controllers = [ ...controllers, DocumentationController ]
        }
        if (process.env.CONTROLLER_SWAGGER && process.env.CONTROLLER_SWAGGER === 'ON'){
          controllers = [ SwaggerController, ...controllers ];
        }
      } else {
        // Running locally. Therefore, enable all controllers
        controllers = [ SwaggerController, AnalysisController, TemplatesController, DatasetController, ConfigurationController, InvestigationController, DocumentationController];
        // controllers = [ SwaggerController, DocumentationController];
      }
    } catch(err) {
      console.error(err)
    }
    if (controllers.length !== 0) {
      const controllersText = controllers.map(el => el.getName());
      logger.info('Controllers enabled: ' + controllersText);
    } else {
      logger.error('No controller has been enabled.');
    }
    this.setServiceInstance();

    useContainer(Container);
    useKoaServer(this.app, {
      // routePrefix: this.getRoutePrefix(),
      controllers: controllers
      // container: Container
    });
  }
}