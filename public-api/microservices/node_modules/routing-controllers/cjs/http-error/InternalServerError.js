"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * Exception for 500 HTTP error.
 */
class InternalServerError extends HttpError_1.HttpError {
    constructor(message) {
        super(500);
        this.name = 'InternalServerError';
        Object.setPrototypeOf(this, InternalServerError.prototype);
        if (message)
            this.message = message;
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=InternalServerError.js.map