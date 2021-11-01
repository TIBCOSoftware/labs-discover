"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDriver = void 0;
const class_transformer_1 = require("class-transformer");
const HttpError_1 = require("../http-error/HttpError");
/**
 * Base driver functionality for all other drivers.
 * Abstract layer to organize controllers integration with different http server implementations.
 */
class BaseDriver {
    constructor() {
        // -------------------------------------------------------------------------
        // Public Properties
        // -------------------------------------------------------------------------
        /**
         * Global application prefix.
         */
        this.routePrefix = '';
    }
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    transformResult(result, action, options) {
        // check if we need to transform result
        const shouldTransform = this.useClassTransformer && // transform only if class-transformer is enabled
            action.options.transformResponse !== false && // don't transform if action response transform is disabled
            result instanceof Object && // don't transform primitive types (string/number/boolean)
            !((result instanceof Uint8Array || result.pipe instanceof Function) // don't transform binary data // don't transform streams
            );
        // transform result if needed
        if (shouldTransform) {
            const options = action.responseClassTransformOptions || this.classToPlainTransformOptions;
            result = class_transformer_1.classToPlain(result, options);
        }
        return result;
    }
    processJsonError(error) {
        if (!this.isDefaultErrorHandlingEnabled)
            return error;
        if (typeof error.toJSON === 'function')
            return error.toJSON();
        let processedError = {};
        if (error instanceof Error) {
            const name = error.name && error.name !== 'Error' ? error.name : error.constructor.name;
            processedError.name = name;
            if (error.message)
                processedError.message = error.message;
            if (error.stack && this.developmentMode)
                processedError.stack = error.stack;
            Object.keys(error)
                .filter(key => key !== 'stack' &&
                key !== 'name' &&
                key !== 'message' &&
                (!(error instanceof HttpError_1.HttpError) || key !== 'httpCode'))
                .forEach(key => (processedError[key] = error[key]));
            if (this.errorOverridingMap)
                Object.keys(this.errorOverridingMap)
                    .filter(key => name === key)
                    .forEach(key => (processedError = this.merge(processedError, this.errorOverridingMap[key])));
            return Object.keys(processedError).length > 0 ? processedError : undefined;
        }
        return error;
    }
    processTextError(error) {
        if (!this.isDefaultErrorHandlingEnabled)
            return error;
        if (error instanceof Error) {
            if (this.developmentMode && error.stack) {
                return error.stack;
            }
            else if (error.message) {
                return error.message;
            }
        }
        return error;
    }
    merge(obj1, obj2) {
        const result = {};
        for (const i in obj1) {
            if (i in obj2 && typeof obj1[i] === 'object' && i !== null) {
                result[i] = this.merge(obj1[i], obj2[i]);
            }
            else {
                result[i] = obj1[i];
            }
        }
        for (const i in obj2) {
            result[i] = obj2[i];
        }
        return result;
    }
}
exports.BaseDriver = BaseDriver;
//# sourceMappingURL=BaseDriver.js.map