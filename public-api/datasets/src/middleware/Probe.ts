// import * as express from 'express';
import koa from 'koa';
import { useContainer, useKoaServer } from 'routing-controllers';
import { Container } from 'typedi';
import { HealthCheckController } from '../controllers/HealthCheckController';

export class Probe {

  app: koa;

  constructor() {
    this.app = new koa();

    this.setupControllers();
  }

  setupControllers() {
    // const controllersPath = path.resolve('dist', 'controllers/*.js');
    useContainer(Container);
    useKoaServer(this.app, {
      controllers: [ HealthCheckController ]
    });
  }
  
}