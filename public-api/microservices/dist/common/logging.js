"use strict";
// import winston from 'winston';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// export const logger = new winston.Logger();
// process.on('unhandledRejection', function (reason, p) {
//   logger.warn('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
// });
const pino_1 = __importDefault(require("pino"));
exports.logger = pino_1.default({
    level: process.env.LOGLEVEL
});
process.on('unhandledRejection', function (reason, p) {
    exports.logger.warn('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});
//# sourceMappingURL=logging.js.map