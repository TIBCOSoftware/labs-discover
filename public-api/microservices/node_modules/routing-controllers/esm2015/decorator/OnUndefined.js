import { getMetadataArgsStorage } from '../index';
/**
 * Used to set specific HTTP status code when result returned by a controller action is equal to undefined.
 * Must be applied on a controller action.
 */
export function OnUndefined(codeOrError) {
    return function (object, methodName) {
        getMetadataArgsStorage().responseHandlers.push({
            type: 'on-undefined',
            target: object.constructor,
            method: methodName,
            value: codeOrError,
        });
    };
}
//# sourceMappingURL=OnUndefined.js.map