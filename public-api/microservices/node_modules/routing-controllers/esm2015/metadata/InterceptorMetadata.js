/**
 * "Use interceptor" metadata.
 */
export class InterceptorMetadata {
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
//# sourceMappingURL=InterceptorMetadata.js.map