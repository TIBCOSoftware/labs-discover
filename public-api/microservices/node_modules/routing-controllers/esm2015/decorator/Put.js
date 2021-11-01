import { getMetadataArgsStorage } from '../index';
/**
 * Registers an action to be executed when POST request comes on a given route.
 * Must be applied on a controller action.
 */
export function Put(route, options) {
    return function (object, methodName) {
        getMetadataArgsStorage().actions.push({
            type: 'put',
            target: object.constructor,
            method: methodName,
            route: route,
            options,
        });
    };
}
//# sourceMappingURL=Put.js.map