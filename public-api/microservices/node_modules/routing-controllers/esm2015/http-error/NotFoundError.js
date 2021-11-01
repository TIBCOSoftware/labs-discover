import { HttpError } from './HttpError';
/**
 * Exception for 404 HTTP error.
 */
export class NotFoundError extends HttpError {
    constructor(message) {
        super(404);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
        if (message)
            this.message = message;
    }
}
//# sourceMappingURL=NotFoundError.js.map