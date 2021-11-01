"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidParamError = void 0;
const BadRequestError_1 = require("../http-error/BadRequestError");
/**
 * Caused when user query parameter is invalid (cannot be parsed into selected type).
 */
class InvalidParamError extends BadRequestError_1.BadRequestError {
    constructor(value, parameterName, parameterType) {
        super(`Given parameter ${parameterName} is invalid. Value (${JSON.stringify(value)}) cannot be parsed into ${parameterType}.`);
        this.name = 'ParamNormalizationError';
        Object.setPrototypeOf(this, InvalidParamError.prototype);
    }
}
exports.InvalidParamError = InvalidParamError;
//# sourceMappingURL=ParamNormalizationError.js.map