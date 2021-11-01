import { getMetadataArgsStorage } from '../index';
/**
 * Registers an action to be executed when request with specified method comes on a given route.
 * Must be applied on a controller action.
 */
export function Method(method, route, options) {
    return function (object, methodName) {
        getMetadataArgsStorage().actions.push({
            type: method,
            target: object.constructor,
            method: methodName,
            options,
            route,
        });
    };
}
//# sourceMappingURL=Method.js.map