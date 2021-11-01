import { HttpError } from './HttpError';
/**
 * Exception for 401 HTTP error.
 */
export class UnauthorizedError extends HttpError {
    constructor(message) {
        super(401);
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
        if (message)
            this.message = message;
    }
}
//# sourceMappingURL=UnauthorizedError.js.map