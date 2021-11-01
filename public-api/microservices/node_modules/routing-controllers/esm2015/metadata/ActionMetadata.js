/**
 * Action metadata.
 */
export class ActionMetadata {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(controllerMetadata, args, globalOptions) {
        this.globalOptions = globalOptions;
        this.controllerMetadata = controllerMetadata;
        this.route = args.route;
        this.target = args.target;
        this.method = args.method;
        this.options = args.options;
        this.type = args.type;
        this.appendParams = args.appendParams;
        this.methodOverride = args.methodOverride;
    }
    // -------------------------------------------------------------------------
    // Static Methods
    // -------------------------------------------------------------------------
    /**
     * Appends base route to a given regexp route.
     */
    static appendBaseRoute(baseRoute, route) {
        const prefix = `${baseRoute.length > 0 && baseRoute.indexOf('/') < 0 ? '/' : ''}${baseRoute}`;
        if (typeof route === 'string')
            return `${prefix}${route}`;
        if (!baseRoute || baseRoute === '')
            return route;
        const fullPath = `^${prefix}${route.toString().substr(1)}?$`;
        return new RegExp(fullPath, route.flags);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Builds everything action metadata needs.
     * Action metadata can be used only after its build.
     */
    build(responseHandlers) {
        const classTransformerResponseHandler = responseHandlers.find(handler => handler.type === 'response-class-transform-options');
        const undefinedResultHandler = responseHandlers.find(handler => handler.type === 'on-undefined');
        const nullResultHandler = responseHandlers.find(handler => handler.type === 'on-null');
        const successCodeHandler = responseHandlers.find(handler => handler.type === 'success-code');
        const redirectHandler = responseHandlers.find(handler => handler.type === 'redirect');
        const renderedTemplateHandler = responseHandlers.find(handler => handler.type === 'rendered-template');
        const authorizedHandler = responseHandlers.find(handler => handler.type === 'authorized');
        const contentTypeHandler = responseHandlers.find(handler => handler.type === 'content-type');
        const bodyParam = this.params.find(param => param.type === 'body');
        if (classTransformerResponseHandler)
            this.responseClassTransformOptions = classTransformerResponseHandler.value;
        this.undefinedResultCode = undefinedResultHandler
            ? undefinedResultHandler.value
            : this.globalOptions.defaults && this.globalOptions.defaults.undefinedResultCode;
        this.nullResultCode = nullResultHandler
            ? nullResultHandler.value
            : this.globalOptions.defaults && this.globalOptions.defaults.nullResultCode;
        if (successCodeHandler)
            this.successHttpCode = successCodeHandler.value;
        if (redirectHandler)
            this.redirect = redirectHandler.value;
        if (renderedTemplateHandler)
            this.renderedTemplate = renderedTemplateHandler.value;
        this.bodyExtraOptions = bodyParam ? bodyParam.extraOptions : undefined;
        this.isBodyUsed = !!this.params.find(param => param.type === 'body' || param.type === 'body-param');
        this.isFilesUsed = !!this.params.find(param => param.type === 'files');
        this.isFileUsed = !!this.params.find(param => param.type === 'file');
        this.isJsonTyped =
            contentTypeHandler !== undefined
                ? /json/.test(contentTypeHandler.value)
                : this.controllerMetadata.type === 'json';
        this.fullRoute = this.buildFullRoute();
        this.headers = this.buildHeaders(responseHandlers);
        this.isAuthorizedUsed = this.controllerMetadata.isAuthorizedUsed || !!authorizedHandler;
        this.authorizedRoles = (this.controllerMetadata.authorizedRoles || []).concat((authorizedHandler && authorizedHandler.value) || []);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Calls action method.
     * Action method is an action defined in a user controller.
     */
    callMethod(params, action) {
        const controllerInstance = this.controllerMetadata.getInstance(action);
        // eslint-disable-next-line prefer-spread
        return controllerInstance[this.method].apply(controllerInstance, params);
    }
    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------
    /**
     * Builds full action route.
     */
    buildFullRoute() {
        if (this.route instanceof RegExp) {
            if (this.controllerMetadata.route) {
                return ActionMetadata.appendBaseRoute(this.controllerMetadata.route, this.route);
            }
            return this.route;
        }
        let path = '';
        if (this.controllerMetadata.route)
            path += this.controllerMetadata.route;
        if (this.route && typeof this.route === 'string')
            path += this.route;
        return path;
    }
    /**
     * Builds action response headers.
     */
    buildHeaders(responseHandlers) {
        const contentTypeHandler = responseHandlers.find(handler => handler.type === 'content-type');
        const locationHandler = responseHandlers.find(handler => handler.type === 'location');
        const headers = {};
        if (locationHandler)
            headers['Location'] = locationHandler.value;
        if (contentTypeHandler)
            headers['Content-type'] = contentTypeHandler.value;
        const headerHandlers = responseHandlers.filter(handler => handler.type === 'header');
        if (headerHandlers)
            headerHandlers.map(handler => (headers[handler.value] = handler.secondaryValue));
        return headers;
    }
}
//# sourceMappingURL=ActionMetadata.js.map