import { HttpError } from './HttpError';
/**
 * Exception for todo HTTP error.
 */
export class MethodNotAllowedError extends HttpError {
    constructor(message) {
        super(405);
        this.name = 'MethodNotAllowedError';
        Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
        if (message)
            this.message = message;
    }
}
//# sourceMappingURL=MethodNotAllowedError.js.map