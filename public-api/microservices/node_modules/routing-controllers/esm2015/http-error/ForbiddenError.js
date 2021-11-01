import { HttpError } from './HttpError';
/**
 * Exception for 403 HTTP error.
 */
export class ForbiddenError extends HttpError {
    constructor(message) {
        super(403);
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
        if (message)
            this.message = message;
    }
}
//# sourceMappingURL=ForbiddenError.js.map