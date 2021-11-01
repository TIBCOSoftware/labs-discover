import { UnauthorizedError } from '../http-error/UnauthorizedError';
/**
 * Thrown when authorization is required thought @CurrentUser decorator.
 */
export class AuthorizationRequiredError extends UnauthorizedError {
    constructor(action) {
        super();
        this.name = 'AuthorizationRequiredError';
        Object.setPrototypeOf(this, AuthorizationRequiredError.prototype);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const uri = `${action.request.method} ${action.request.url}`; // todo: check it it works in koa
        this.message = `Authorization is required for request on ${uri}`;
    }
}
//# sourceMappingURL=AuthorizationRequiredError.js.map