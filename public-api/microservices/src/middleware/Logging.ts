// import * as winston from 'winston';
import koapinologger from 'koa-pino-logger';
import { logger } from '../common/logging';

const level = (process.env.LOGLEVEL ? process.env.LOGLEVEL as string : 'info');

export function setupLogging(app: any) {
  // Development Logger
  // const env = config.util.getEnv('NODE_ENV');
  
  if(level === 'info') {
    // logger.add(winston.transports.Console, {
    //   type: 'verbose',
    //   colorize: true,
    //   prettyPrint: true,
    //   handleExceptions: true,
    //   humanReadableUnhandledException: true
    // });
  }

  setupKoa(app);
};

function setupKoa(app: any) {
  app.use(koapinologger({
    level: level
  }));
  // error logging
  if(level === 'debug') {
    // app.use(expressWinston.errorLogger({
    //   transports: [
    //     new winston.transports.Console({
    //       json: true,
    //       colorize: true
    //     })
    //   ]
    // }));
  }

  // request logging
  if(level === 'info') {
    // app.use(expressWinston.logger({
    //   transports: [
    //     new winston.transports.Console({
    //       json: true,
    //       colorize: true
    //     })
    //   ]
    // }));
  }
};