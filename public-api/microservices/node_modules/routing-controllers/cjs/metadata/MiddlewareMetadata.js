"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareMetadata = void 0;
const container_1 = require("../container");
/**
 * Middleware metadata.
 */
class MiddlewareMetadata {
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
        return container_1.getFromContainer(this.target);
    }
}
exports.MiddlewareMetadata = MiddlewareMetadata;
//# sourceMappingURL=MiddlewareMetadata.js.map