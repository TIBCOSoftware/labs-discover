"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserCheckerNotDefinedError = void 0;
const InternalServerError_1 = require("../http-error/InternalServerError");
/**
 * Thrown when currentUserChecker function is not defined in routing-controllers options.
 */
class CurrentUserCheckerNotDefinedError extends InternalServerError_1.InternalServerError {
    constructor() {
        super(`Cannot use @CurrentUser decorator. Please define currentUserChecker function in routing-controllers action before using it.`);
        this.name = 'CurrentUserCheckerNotDefinedError';
        Object.setPrototypeOf(this, CurrentUserCheckerNotDefinedError.prototype);
    }
}
exports.CurrentUserCheckerNotDefinedError = CurrentUserCheckerNotDefinedError;
//# sourceMappingURL=CurrentUserCheckerNotDefinedError.js.map