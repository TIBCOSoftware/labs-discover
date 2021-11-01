"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationCheckerNotDefinedError = void 0;
const InternalServerError_1 = require("../http-error/InternalServerError");
/**
 * Thrown when authorizationChecker function is not defined in routing-controllers options.
 */
class AuthorizationCheckerNotDefinedError extends InternalServerError_1.InternalServerError {
    constructor() {
        super(`Cannot use @Authorized decorator. Please define authorizationChecker function in routing-controllers action before using it.`);
        this.name = 'AuthorizationCheckerNotDefinedError';
        Object.setPrototypeOf(this, AuthorizationCheckerNotDefinedError.prototype);
    }
}
exports.AuthorizationCheckerNotDefinedError = AuthorizationCheckerNotDefinedError;
//# sourceMappingURL=AuthorizationCheckerNotDefinedError.js.map