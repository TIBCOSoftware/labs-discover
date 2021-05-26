import { KoaConfig } from './Koa';
import http from 'http';
import https from 'https';
// import { setupSockets } from './Socket';
import { logger } from '../common/logging';
import config from 'config';
import { Probe } from './Probe';

export class Application {

  server: any;
  koa: KoaConfig;
  probe: Probe;

  constructor()  {
    this.koa = new KoaConfig();
    this.probe = new Probe();

    const port = config.get('ports.http') as number;
    const debugPort = config.get('ports.debug');
    const healthCheckPort = config.get('ports.healthCheck');

    // const routePrefix = this.koa.getRoutePrefix();

    http.createServer(this.koa.app.callback()).listen(port, () => {
      logger.info(`
        ------------
        Server Started!
        Http: http://localhost:${port}
        Debugger: http://127.0.0.1:${port}/?ws=127.0.0.1:${port}&port=${debugPort}
        Health: http://localhost:${port}/ping
        API Docs: http://localhost:${port}/docs
        API Spec: http://localhost:${port}/swagger
        ------------
      `)
    });
    
    this.probe.app.listen(healthCheckPort, () => {
      logger.info(`
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