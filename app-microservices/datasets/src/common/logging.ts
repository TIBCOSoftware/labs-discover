// import winston from 'winston';

// export const logger = new winston.Logger();

// process.on('unhandledRejection', function (reason, p) {
//   logger.warn('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
// });
import pino from 'pino';
import config from 'config';

export const logger = pino({
  level: config.get('loglevel')
});

process.on('unhandledRejection', function (reason, p) {
  logger.warn('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});