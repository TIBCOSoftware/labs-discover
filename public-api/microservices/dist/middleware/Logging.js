"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLogging = void 0;
// import * as winston from 'winston';
const koa_pino_logger_1 = __importDefault(require("koa-pino-logger"));
const level = process.env.LOGLEVEL;
function setupLogging(app) {
    // Development Logger
    // const env = config.util.getEnv('NODE_ENV');
    if (level === 'info') {
        // logger.add(winston.transports.Console, {
        //   type: 'verbose',
        //   colorize: true,
        //   prettyPrint: true,
        //   handleExceptions: true,
        //   humanReadableUnhandledException: true
        // });
    }
    setupKoa(app);
}
exports.setupLogging = setupLogging;
;
function setupKoa(app) {
    app.use(koa_pino_logger_1.default({
        level: level
    }));
    // error logging
    if (level === 'debug') {
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
    if (level === 'info') {
        // app.use(expressWinston.logger({
        //   transports: [
        //     new winston.transports.Console({
        //       json: true,
        //       colorize: true
        //     })
        //   ]
        // }));
    }
}
;
//# sourceMappingURL=Logging.js.map