import { BadRequestError } from '../http-error/BadRequestError';
/**
 * Caused when user query parameter is invalid (cannot be parsed into selected type).
 */
export class InvalidParamError extends BadRequestError {
    constructor(value, parameterName, parameterType) {
        super(`Given parameter ${parameterName} is invalid. Value (${JSON.stringify(value)}) cannot be parsed into ${parameterType}.`);
        this.name = 'ParamNormalizationError';
        Object.setPrototypeOf(this, InvalidParamError.prototype);
    }
}
//# sourceMappingURL=ParamNormalizationError.js.map