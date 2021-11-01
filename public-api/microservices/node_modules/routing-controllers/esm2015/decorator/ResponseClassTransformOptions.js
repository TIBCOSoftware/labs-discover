import { getMetadataArgsStorage } from '../index';
/**
 * Options to be set to class-transformer for the result of the response.
 */
export function ResponseClassTransformOptions(options) {
    return function (object, methodName) {
        getMetadataArgsStorage().responseHandlers.push({
            type: 'response-class-transform-options',
            value: options,
            target: object.constructor,
            method: methodName,
        });
    };
}
//# sourceMappingURL=ResponseClassTransformOptions.js.map