"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotAcceptableError = void 0;
const HttpError_1 = require("./HttpError");
/**
 * Exception for 406 HTTP error.
 */
class NotAcceptableError extends HttpError_1.HttpError {
    constructor(message) {
        super(406);
        this.name = 'NotAcceptableError';
        Object.setPrototypeOf(this, NotAcceptableError.prototype);
        if (message)
            this.message = message;
    }
}
exports.NotAcceptableError = NotAcceptableError;
//# sourceMappingURL=NotAcceptableError.js.map