"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * Exception for 403 HTTP error.
 */
class ForbiddenError extends HttpError_1.HttpError {
    constructor(message) {
        super(403);
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
        if (message)
            this.message = message;
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=ForbiddenError.js.map