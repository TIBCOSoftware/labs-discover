"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
/**
 * Used to throw HTTP errors.
 * Just do throw new HttpError(code, message) in your controller action and
 * default error handler will catch it and give in your response given code and message .
 */
class HttpError extends Error {
    constructor(httpCode, message) {
        super();
        Object.setPrototypeOf(this, HttpError.prototype);
        if (httpCode)
            this.httpCode = httpCode;
        if (message)
            this.message = message;
        this.stack = new Error().stack;
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=HttpError.js.map