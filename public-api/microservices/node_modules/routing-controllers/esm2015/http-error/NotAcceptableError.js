import { HttpError } from './HttpError';
/**
 * Exception for 406 HTTP error.
 */
export class NotAcceptableError extends HttpError {
    constructor(message) {
        super(406);
        this.name = 'NotAcceptableError';
        Object.setPrototypeOf(this, NotAcceptableError.prototype);
        if (message)
            this.message = message;
    }
}
//# sourceMappingURL=NotAcceptableError.js.map