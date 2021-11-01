"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamRequiredError = void 0;
const BadRequestError_1 = require("../http-error/BadRequestError");
/**
 * Thrown when parameter is required, but was missing in a user request.
 */
class ParamRequiredError extends BadRequestError_1.BadRequestError {
    constructor(action, param) {
        super();
        this.name = 'ParamRequiredError';
        Object.setPrototypeOf(this, ParamRequiredError.prototype);
        let paramName;
        switch (param.type) {
            case 'param':
                paramName = `Parameter "${param.name}" is`;
                break;
            case 'body':
                paramName = 'Request body is';
                break;
            case 'body-param':
                paramName = `Body parameter "${param.name}" is`;
                break;
            case 'query':
                paramName = `Query parameter "${param.name}" is`;
                break;
            case 'header':
                paramName = `Header "${param.name}" is`;
                break;
            case 'file':
                paramName = `Uploaded file "${param.name}" is`;
                break;
            case 'files':
                paramName = `Uploaded files "${param.name}" are`;
                break;
            case 'session':
                paramName = 'Session is';
                break;
            case 'cookie':
                paramName = 'Cookie is';
                break;
            default:
                paramName = 'Parameter is';
        }
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const uri = `${action.request.method} ${action.request.url}`; // todo: check it it works in koa
        this.message = `${paramName} required for request on ${uri}`;
    }
}
exports.ParamRequiredError = ParamRequiredError;
//# sourceMappingURL=ParamRequiredError.js.map