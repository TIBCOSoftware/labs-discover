import { getMetadataArgsStorage } from '../index';
/**
 * Registers an action to be executed when PATCH request comes on a given route.
 * Must be applied on a controller action.
 */
export function Patch(route, options) {
    return function (object, methodName) {
        getMetadataArgsStorage().actions.push({
            type: 'patch',
            target: object.constructor,
            method: methodName,
            route: route,
            options,
        });
    };
}
//# sourceMappingURL=Patch.js.map