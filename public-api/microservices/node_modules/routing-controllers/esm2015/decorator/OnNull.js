import { getMetadataArgsStorage } from '../index';
/**
 * Used to set specific HTTP status code when result returned by a controller action is equal to null.
 * Must be applied on a controller action.
 */
export function OnNull(codeOrError) {
    return function (object, methodName) {
        getMetadataArgsStorage().responseHandlers.push({
            type: 'on-null',
            target: object.constructor,
            method: methodName,
            value: codeOrError,
        });
    };
}
//# sourceMappingURL=OnNull.js.map