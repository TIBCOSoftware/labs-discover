"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * Exception for 400 HTTP error.
 */
class BadRequestError extends HttpError_1.HttpError {
    constructor(message) {
        super(400);
        this.name = 'BadRequestError';
        Object.setPrototypeOf(this, BadRequestError.prototype);
        if (message)
            this.message = message;
    }
}
exports.BadRequestError = BadRequestError;
//# sourceMappingURL=BadRequestError.js.map