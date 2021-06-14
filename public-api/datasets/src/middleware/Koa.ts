// import * as express from 'express';
import path from 'path';
// import * as bodyParser from 'body-parser';
// import * as cors from 'cors';
import health from 'koa-ping';
import koa from 'koa';

import { useKoaServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import { setupLogging } from './Logging';
import { setupSwagger } from './Swagger';
import { DatasetController } from '../controllers/DatasetController';
import { SwaggerController } from '../controllers/SwaggerController';
import config from 'config';

const cors = require('@koa/cors');

// import { setupAuth } from './Authentication';

export class KoaConfig {

  // app: express.Express;
  app: koa;

  constructor() {
    this.app = new koa();

    setupSwagger(this.app);
    setupLogging(this.app);
    // setupAuth(this.app);

    this.app.use(cors({
      // this is needed if client send request withCredentials
      credentials: true
    }));
    // this.app.use(bodyParser.json());
    // this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(health('/ping'));
    this.setupControllers();
  }

  setupControllers() {
    // const controllersPath = path.resolve('dist', 'controllers/*.js');
    useContainer(Container);
    useKoaServer(this.app, {
      controllers: [ DatasetController, SwaggerController ]
      // container: Container
    });
  }
  
}