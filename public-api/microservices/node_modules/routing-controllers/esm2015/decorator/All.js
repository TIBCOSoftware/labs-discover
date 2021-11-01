import { getMetadataArgsStorage } from '../index';
/**
 * Registers an action to be executed when a request comes on a given route.
 * Must be applied on a controller action.
 */
export function All(route, options) {
    return function (object, methodName) {
        getMetadataArgsStorage().actions.push({
            type: 'all',
            target: object.constructor,
            method: methodName,
            route: route,
            options,
        });
    };
}
//# sourceMappingURL=All.js.map