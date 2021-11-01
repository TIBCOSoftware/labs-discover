"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationRequiredError = void 0;
const UnauthorizedError_1 = require("../http-error/UnauthorizedError");
/**
 * Thrown when authorization is required thought @CurrentUser decorator.
 */
class AuthorizationRequiredError extends UnauthorizedError_1.UnauthorizedError {
    constructor(action) {
        super();
        this.name = 'AuthorizationRequiredError';
        Object.setPrototypeOf(this, AuthorizationRequiredError.prototype);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const uri = `${action.request.method} ${action.request.url}`; // todo: check it it works in koa
        this.message = `Authorization is required for request on ${uri}`;
    }
}
exports.AuthorizationRequiredError = AuthorizationRequiredError;
//# sourceMappingURL=AuthorizationRequiredError.js.map