/**
 * Storage all metadatas read from decorators.
 */
export class MetadataArgsStorage {
    constructor() {
        // -------------------------------------------------------------------------
        // Properties
        // -------------------------------------------------------------------------
        /**
         * Registered controller metadata args.
         */
        this.controllers = [];
        /**
         * Registered middleware metadata args.
         */
        this.middlewares = [];
        /**
         * Registered interceptor metadata args.
         */
        this.interceptors = [];
        /**
         * Registered "use middleware" metadata args.
         */
        this.uses = [];
        /**
         * Registered "use interceptor" metadata args.
         */
        this.useInterceptors = [];
        /**
         * Registered action metadata args.
         */
        this.actions = [];
        /**
         * Registered param metadata args.
         */
        this.params = [];
        /**
         * Registered response handler metadata args.
         */
        this.responseHandlers = [];
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Filters registered middlewares by a given classes.
     */
    filterMiddlewareMetadatasForClasses(classes) {
        return classes.map(cls => this.middlewares.find(mid => mid.target === cls)).filter(midd => midd !== undefined); // this might be not needed if all classes where decorated with `@Middleware`
    }
    /**
     * Filters registered interceptors by a given classes.
     */
    filterInterceptorMetadatasForClasses(classes) {
        return this.interceptors.filter(ctrl => {
            return classes.filter(cls => ctrl.target === cls).length > 0;
        });
    }
    /**
     * Filters registered controllers by a given classes.
     */
    filterControllerMetadatasForClasses(classes) {
        return this.controllers.filter(ctrl => {
            return classes.filter(cls => ctrl.target === cls).length > 0;
        });
    }
    /**
     * Filters registered actions by a given classes.
     */
    filterActionsWithTarget(target) {
        return this.actions.filter(action => action.target === target);
    }
    /**
     * Filters registered "use middlewares" by a given target class and method name.
     */
    filterUsesWithTargetAndMethod(target, methodName) {
        return this.uses.filter(use => {
            return use.target === target && use.method === methodName;
        });
    }
    /**
     * Filters registered "use interceptors" by a given target class and method name.
     */
    filterInterceptorUsesWithTargetAndMethod(target, methodName) {
        return this.useInterceptors.filter(use => {
            return use.target === target && use.method === methodName;
        });
    }
    /**
     * Filters parameters by a given classes.
     */
    filterParamsWithTargetAndMethod(target, methodName) {
        return this.params.filter(param => {
            return param.object.constructor === target && param.method === methodName;
        });
    }
    /**
     * Filters response handlers by a given class.
     */
    filterResponseHandlersWithTarget(target) {
        return this.responseHandlers.filter(property => {
            return property.target === target;
        });
    }
    /**
     * Filters response handlers by a given classes.
     */
    filterResponseHandlersWithTargetAndMethod(target, methodName) {
        return this.responseHandlers.filter(property => {
            return property.target === target && property.method === methodName;
        });
    }
    /**
     * Removes all saved metadata.
     */
    reset() {
        this.controllers = [];
        this.middlewares = [];
        this.interceptors = [];
        this.uses = [];
        this.useInterceptors = [];
        this.actions = [];
        this.params = [];
        this.responseHandlers = [];
    }
}
//# sourceMappingURL=MetadataArgsStorage.js.map