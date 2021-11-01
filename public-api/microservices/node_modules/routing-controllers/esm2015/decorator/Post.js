import { getMetadataArgsStorage } from '../index';
/**
 * Registers an action to be executed when POST request comes on a given route.
 * Must be applied on a controller action.
 */
export function Post(route, options) {
    return function (object, methodName) {
        getMetadataArgsStorage().actions.push({
            type: 'post',
            target: object.constructor,
            method: methodName,
            options,
            route,
        });
    };
}
//# sourceMappingURL=Post.js.map