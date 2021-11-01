import { getMetadataArgsStorage } from '../index';
/**
 * Registers an action to be executed when HEAD request comes on a given route.
 * Must be applied on a controller action.
 */
export function Head(route, options) {
    return function (object, methodName) {
        getMetadataArgsStorage().actions.push({
            type: 'head',
            target: object.constructor,
            method: methodName,
            options,
            route,
        });
    };
}
//# sourceMappingURL=Head.js.map