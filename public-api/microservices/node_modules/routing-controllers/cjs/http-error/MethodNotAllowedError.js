"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodNotAllowedError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * Exception for todo HTTP error.
 */
class MethodNotAllowedError extends HttpError_1.HttpError {
    constructor(message) {
        super(405);
        this.name = 'MethodNotAllowedError';
        Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
        if (message)
            this.message = message;
    }
}
exports.MethodNotAllowedError = MethodNotAllowedError;
//# sourceMappingURL=MethodNotAllowedError.js.map