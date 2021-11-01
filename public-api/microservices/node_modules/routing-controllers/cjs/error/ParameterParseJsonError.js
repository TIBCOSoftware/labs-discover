"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterParseJsonError = void 0;
const BadRequestError_1 = require("../http-error/BadRequestError");
/**
 * Caused when user parameter is invalid json string and cannot be parsed.
 */
class ParameterParseJsonError extends BadRequestError_1.BadRequestError {
    constructor(parameterName, value) {
        super(`Given parameter ${parameterName} is invalid. Value (${JSON.stringify(value)}) cannot be parsed into JSON.`);
        this.name = 'ParameterParseJsonError';
        Object.setPrototypeOf(this, ParameterParseJsonError.prototype);
    }
}
exports.ParameterParseJsonError = ParameterParseJsonError;
//# sourceMappingURL=ParameterParseJsonError.js.map