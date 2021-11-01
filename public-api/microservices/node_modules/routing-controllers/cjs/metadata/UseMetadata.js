"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseMetadata = void 0;
/**
 * "Use middleware" metadata.
 */
class UseMetadata {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(args) {
        this.target = args.target;
        this.method = args.method;
        this.middleware = args.middleware;
        this.afterAction = args.afterAction;
    }
}
exports.UseMetadata = UseMetadata;
//# sourceMappingURL=UseMetadata.js.map