import { getMetadataArgsStorage } from '../index';
/**
 * Registers an action to be executed when GET request comes on a given route.
 * Must be applied on a controller action.
 */
export function Get(route, options) {
    return function (object, methodName) {
        getMetadataArgsStorage().actions.push({
            type: 'get',
            target: object.constructor,
            method: methodName,
            options,
            route,
        });
    };
}
//# sourceMappingURL=Get.js.map