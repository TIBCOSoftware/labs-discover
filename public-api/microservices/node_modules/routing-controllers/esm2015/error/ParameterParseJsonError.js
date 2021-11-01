import { BadRequestError } from '../http-error/BadRequestError';
/**
 * Caused when user parameter is invalid json string and cannot be parsed.
 */
export class ParameterParseJsonError extends BadRequestError {
    constructor(parameterName, value) {
        super(`Given parameter ${parameterName} is invalid. Value (${JSON.stringify(value)}) cannot be parsed into JSON.`);
        this.name = 'ParameterParseJsonError';
        Object.setPrototypeOf(this, ParameterParseJsonError.prototype);
    }
}
//# sourceMappingURL=ParameterParseJsonError.js.map