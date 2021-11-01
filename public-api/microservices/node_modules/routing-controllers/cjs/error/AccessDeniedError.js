"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessDeniedError = void 0;
const ForbiddenError_1 = require("../http-error/ForbiddenError");
/**
 * Thrown when route is guarded by @Authorized decorator.
 */
class AccessDeniedError extends ForbiddenError_1.ForbiddenError {
    constructor(action) {
        super();
        this.name = 'AccessDeniedError';
        Object.setPrototypeOf(this, AccessDeniedError.prototype);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const uri = `${action.request.method} ${action.request.url}`; // todo: check it it works in koa
        this.message = `Access is denied for request on ${uri}`;
    }
}
exports.AccessDeniedError = AccessDeniedError;
//# sourceMappingURL=AccessDeniedError.js.map