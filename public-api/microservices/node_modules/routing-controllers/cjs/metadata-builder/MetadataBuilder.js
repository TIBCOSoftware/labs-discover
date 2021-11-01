"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataBuilder = void 0;
const ActionMetadata_1 = require("../metadata/ActionMetadata");
const ControllerMetadata_1 = require("../metadata/ControllerMetadata");
const InterceptorMetadata_1 = require("../metadata/InterceptorMetadata");
const MiddlewareMetadata_1 = require("../metadata/MiddlewareMetadata");
const ParamMetadata_1 = require("../metadata/ParamMetadata");
const ResponseHandleMetadata_1 = require("../metadata/ResponseHandleMetadata");
const UseMetadata_1 = require("../metadata/UseMetadata");
const index_1 = require("../index");
/**
 * Builds metadata from the given metadata arguments.
 */
class MetadataBuilder {
    constructor(options) {
        this.options = options;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Builds controller metadata from a registered controller metadata args.
     */
    buildControllerMetadata(classes) {
        return this.createControllers(classes);
    }
    /**
     * Builds middleware metadata from a registered middleware metadata args.
     */
    buildMiddlewareMetadata(classes) {
        return this.createMiddlewares(classes);
    }
    /**
     * Builds interceptor metadata from a registered interceptor metadata args.
     */
    buildInterceptorMetadata(classes) {
        return this.createInterceptors(classes);
    }
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates middleware metadatas.
     */
    createMiddlewares(classes) {
        const middlewares = !classes
            ? index_1.getMetadataArgsStorage().middlewares
            : index_1.getMetadataArgsStorage().filterMiddlewareMetadatasForClasses(classes);
        return middlewares.map(middlewareArgs => new MiddlewareMetadata_1.MiddlewareMetadata(middlewareArgs));
    }
    /**
     * Creates interceptor metadatas.
     */
    createInterceptors(classes) {
        const interceptors = !classes
            ? index_1.getMetadataArgsStorage().interceptors
            : index_1.getMetadataArgsStorage().filterInterceptorMetadatasForClasses(classes);
        return interceptors.map(interceptorArgs => new InterceptorMetadata_1.InterceptorMetadata({
            ...interceptorArgs,
            interceptor: interceptorArgs.target,
        }));
    }
    /**
     * Creates controller metadatas.
     */
    createControllers(classes) {
        const controllers = !classes
            ? index_1.getMetadataArgsStorage().controllers
            : index_1.getMetadataArgsStorage().filterControllerMetadatasForClasses(classes);
        return controllers.map(controllerArgs => {
            const controller = new ControllerMetadata_1.ControllerMetadata(controllerArgs);
            controller.build(this.createControllerResponseHandlers(controller));
            controller.options = controllerArgs.options;
            controller.actions = this.createActions(controller);
            controller.uses = this.createControllerUses(controller);
            controller.interceptors = this.createControllerInterceptorUses(controller);
            return controller;
        });
    }
    /**
     * Creates action metadatas.
     */
    createActions(controller) {
        let target = controller.target;
        const actionsWithTarget = [];
        while (target) {
            actionsWithTarget.push(...index_1.getMetadataArgsStorage()
                .filterActionsWithTarget(target)
                .filter(action => {
                return actionsWithTarget.map(a => a.method).indexOf(action.method) === -1;
            }));
            target = Object.getPrototypeOf(target);
        }
        return actionsWithTarget.map(actionArgs => {
            const action = new ActionMetadata_1.ActionMetadata(controller, actionArgs, this.options);
            action.options = { ...controller.options, ...actionArgs.options };
            action.params = this.createParams(action);
            action.uses = this.createActionUses(action);
            action.interceptors = this.createActionInterceptorUses(action);
            action.build(this.createActionResponseHandlers(action));
            return action;
        });
    }
    /**
     * Creates param metadatas.
     */
    createParams(action) {
        return index_1.getMetadataArgsStorage()
            .filterParamsWithTargetAndMethod(action.target, action.method)
            .map(paramArgs => new ParamMetadata_1.ParamMetadata(action, this.decorateDefaultParamOptions(paramArgs)));
    }
    /**
     * Creates response handler metadatas for action.
     */
    createActionResponseHandlers(action) {
        return index_1.getMetadataArgsStorage()
            .filterResponseHandlersWithTargetAndMethod(action.target, action.method)
            .map(handlerArgs => new ResponseHandleMetadata_1.ResponseHandlerMetadata(handlerArgs));
    }
    /**
     * Creates response handler metadatas for controller.
     */
    createControllerResponseHandlers(controller) {
        return index_1.getMetadataArgsStorage()
            .filterResponseHandlersWithTarget(controller.target)
            .map(handlerArgs => new ResponseHandleMetadata_1.ResponseHandlerMetadata(handlerArgs));
    }
    /**
     * Creates use metadatas for actions.
     */
    createActionUses(action) {
        return index_1.getMetadataArgsStorage()
            .filterUsesWithTargetAndMethod(action.target, action.method)
            .map(useArgs => new UseMetadata_1.UseMetadata(useArgs));
    }
    /**
     * Creates use interceptors for actions.
     */
    createActionInterceptorUses(action) {
        return index_1.getMetadataArgsStorage()
            .filterInterceptorUsesWithTargetAndMethod(action.target, action.method)
            .map(useArgs => new InterceptorMetadata_1.InterceptorMetadata(useArgs));
    }
    /**
     * Creates use metadatas for controllers.
     */
    createControllerUses(controller) {
        return index_1.getMetadataArgsStorage()
            .filterUsesWithTargetAndMethod(controller.target, undefined)
            .map(useArgs => new UseMetadata_1.UseMetadata(useArgs));
    }
    /**
     * Creates use interceptors for controllers.
     */
    createControllerInterceptorUses(controller) {
        return index_1.getMetadataArgsStorage()
            .filterInterceptorUsesWithTargetAndMethod(controller.target, undefined)
            .map(useArgs => new InterceptorMetadata_1.InterceptorMetadata(useArgs));
    }
    /**
     * Decorate paramArgs with default settings
     */
    decorateDefaultParamOptions(paramArgs) {
        const options = this.options.defaults && this.options.defaults.paramOptions;
        if (!options)
            return paramArgs;
        if (paramArgs.required === undefined)
            paramArgs.required = options.required || false;
        return paramArgs;
    }
}
exports.MetadataBuilder = MetadataBuilder;
//# sourceMappingURL=MetadataBuilder.js.map