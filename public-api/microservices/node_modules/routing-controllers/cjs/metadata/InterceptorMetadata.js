"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterceptorMetadata = void 0;
/**
 * "Use interceptor" metadata.
 */
class InterceptorMetadata {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(args) {
        this.target = args.target;
        this.method = args.method;
        this.interceptor = args.interceptor;
        this.priority = args.priority;
        this.global = args.global;
    }
}
exports.InterceptorMetadata = InterceptorMetadata;
//# sourceMappingURL=InterceptorMetadata.js.map