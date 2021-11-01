import { getMetadataArgsStorage } from '../index';
/**
 * Registers a controller method to be executed when DELETE request comes on a given route.
 * Must be applied on a controller action.
 */
export function Delete(route, options) {
    return function (object, methodName) {
        getMetadataArgsStorage().actions.push({
            type: 'delete',
            target: object.constructor,
            method: methodName,
            route: route,
            options,
        });
    };
}
//# sourceMappingURL=Delete.js.map