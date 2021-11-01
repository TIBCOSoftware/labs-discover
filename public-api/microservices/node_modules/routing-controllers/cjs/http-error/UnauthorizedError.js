"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * Exception for 401 HTTP error.
 */
class UnauthorizedError extends HttpError_1.HttpError {
    constructor(message) {
        super(401);
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
        if (message)
            this.message = message;
    }
}
exports.UnauthorizedError = UnauthorizedError;
//# sourceMappingURL=UnauthorizedError.js.map