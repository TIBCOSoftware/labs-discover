import { ForbiddenError } from '../http-error/ForbiddenError';
/**
 * Thrown when route is guarded by @Authorized decorator.
 */
export class AccessDeniedError extends ForbiddenError {
    constructor(action) {
        super();
        this.name = 'AccessDeniedError';
        Object.setPrototypeOf(this, AccessDeniedError.prototype);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const uri = `${action.request.method} ${action.request.url}`; // todo: check it it works in koa
        this.message = `Access is denied for request on ${uri}`;
    }
}
//# sourceMappingURL=AccessDeniedError.js.map