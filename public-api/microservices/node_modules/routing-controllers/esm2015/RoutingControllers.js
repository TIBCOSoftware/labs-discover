import { ActionParameterHandler } from './ActionParameterHandler';
import { getFromContainer } from './container';
import { MetadataBuilder } from './metadata-builder/MetadataBuilder';
import { isPromiseLike } from './util/isPromiseLike';
import { runInSequence } from './util/runInSequence';
/**
 * Registers controllers and middlewares in the given server framework.
 */
export class RoutingControllers {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(driver, options) {
        this.driver = driver;
        this.options = options;
        /**
         * Global interceptors run on each controller action.
         */
        this.interceptors = [];
        this.parameterHandler = new ActionParameterHandler(driver);
        this.metadataBuilder = new MetadataBuilder(options);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Initializes the things driver needs before routes and middleware registration.
     */
    initialize() {
        this.driver.initialize();
        return this;
    }
    /**
     * Registers all given interceptors.
     */
    registerInterceptors(classes) {
        const interceptors = this.metadataBuilder
            .buildInterceptorMetadata(classes)
            .sort((middleware1, middleware2) => middleware1.priority - middleware2.priority)
            .reverse();
        this.interceptors.push(...interceptors);
        return this;
    }
    /**
     * Registers all given controllers and actions from those controllers.
     */
    registerControllers(classes) {
        const controllers = this.metadataBuilder.buildControllerMetadata(classes);
        controllers.forEach(controller => {
            controller.actions.forEach(actionMetadata => {
                const interceptorFns = this.prepareInterceptors([
                    ...this.interceptors,
                    ...actionMetadata.controllerMetadata.interceptors,
                    ...actionMetadata.interceptors,
                ]);
                this.driver.registerAction(actionMetadata, (action) => {
                    return this.executeAction(actionMetadata, action, interceptorFns);
                });
            });
        });
        this.driver.registerRoutes();
        return this;
    }
    /**
     * Registers post-execution middlewares in the driver.
     */
    registerMiddlewares(type, classes) {
        this.metadataBuilder
            .buildMiddlewareMetadata(classes)
            .filter(middleware => middleware.global && middleware.type === type)
            .sort((middleware1, middleware2) => middleware2.priority - middleware1.priority)
            .forEach(middleware => this.driver.registerMiddleware(middleware));
        return this;
    }
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Executes given controller action.
     */
    executeAction(actionMetadata, action, interceptorFns) {
        // compute all parameters
        const paramsPromises = actionMetadata.params
            .sort((param1, param2) => param1.index - param2.index)
            .map(param => this.parameterHandler.handle(action, param));
        // after all parameters are computed
        return Promise.all(paramsPromises)
            .then(params => {
            // execute action and handle result
            const allParams = actionMetadata.appendParams ? actionMetadata.appendParams(action).concat(params) : params;
            const result = actionMetadata.methodOverride
                ? actionMetadata.methodOverride(actionMetadata, action, allParams)
                : actionMetadata.callMethod(allParams, action);
            return this.handleCallMethodResult(result, actionMetadata, action, interceptorFns);
        })
            .catch(error => {
            // otherwise simply handle error without action execution
            return this.driver.handleError(error, actionMetadata, action);
        });
    }
    /**
     * Handles result of the action method execution.
     */
    handleCallMethodResult(result, action, options, interceptorFns) {
        if (isPromiseLike(result)) {
            return result
                .then((data) => {
                return this.handleCallMethodResult(data, action, options, interceptorFns);
            })
                .catch((error) => {
                return this.driver.handleError(error, action, options);
            });
        }
        else {
            if (interceptorFns) {
                const awaitPromise = runInSequence(interceptorFns, interceptorFn => {
                    const interceptedResult = interceptorFn(options, result);
                    if (isPromiseLike(interceptedResult)) {
                        return interceptedResult.then((resultFromPromise) => {
                            result = resultFromPromise;
                        });
                    }
                    else {
                        result = interceptedResult;
                        return Promise.resolve();
                    }
                });
                return awaitPromise
                    .then(() => this.driver.handleSuccess(result, action, options))
                    .catch(error => this.driver.handleError(error, action, options));
            }
            else {
                return this.driver.handleSuccess(result, action, options);
            }
        }
    }
    /**
     * Creates interceptors from the given "use interceptors".
     */
    prepareInterceptors(uses) {
        return uses.map(use => {
            if (use.interceptor.prototype && use.interceptor.prototype.intercept) {
                // if this is function instance of InterceptorInterface
                return function (action, result) {
                    return getFromContainer(use.interceptor, action).intercept(action, result);
                };
            }
            return use.interceptor;
        });
    }
}
//# sourceMappingURL=RoutingControllers.js.map