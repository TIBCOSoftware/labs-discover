import { HttpError } from './HttpError';
/**
 * Exception for 500 HTTP error.
 */
export class InternalServerError extends HttpError {
    constructor(message) {
        super(500);
        this.name = 'InternalServerError';
        Object.setPrototypeOf(this, InternalServerError.prototype);
        if (message)
            this.message = message;
    }
}
//# sourceMappingURL=InternalServerError.js.map