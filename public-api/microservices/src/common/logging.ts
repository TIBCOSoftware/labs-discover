// import winston from 'winston';

// export const logger = new winston.Logger();

// process.on('unhandledRejection', function (reason, p) {
//   logger.warn('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
// });
import pino from 'pino';

export const logger = pino({
  level: process.env.LOGLEVEL
});

process.on('unhandledRejection', function (reason, p) {
  logger.warn('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});