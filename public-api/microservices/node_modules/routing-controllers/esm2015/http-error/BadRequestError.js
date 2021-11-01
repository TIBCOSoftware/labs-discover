import { HttpError } from './HttpError';
/**
 * Exception for 400 HTTP error.
 */
export class BadRequestError extends HttpError {
    constructor(message) {
        super(400);
        this.name = 'BadRequestError';
        Object.setPrototypeOf(this, BadRequestError.prototype);
        if (message)
            this.message = message;
    }
}
//# sourceMappingURL=BadRequestError.js.map