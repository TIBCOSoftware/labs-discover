"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * Exception for 404 HTTP error.
 */
class NotFoundError extends HttpError_1.HttpError {
    constructor(message) {
        super(404);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
        if (message)
            this.message = message;
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=NotFoundError.js.map