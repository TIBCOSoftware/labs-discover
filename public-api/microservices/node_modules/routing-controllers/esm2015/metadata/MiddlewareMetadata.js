import { getFromContainer } from '../container';
/**
 * Middleware metadata.
 */
export class MiddlewareMetadata {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(args) {
        this.global = args.global;
        this.target = args.target;
        this.priority = args.priority;
        this.type = args.type;
    }
    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------
    /**
     * Gets middleware instance from the container.
     */
    get instance() {
        return getFromContainer(this.target);
    }
}
//# sourceMappingURL=MiddlewareMetadata.js.map