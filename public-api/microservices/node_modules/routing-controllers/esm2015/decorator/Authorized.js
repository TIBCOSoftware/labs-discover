import { getMetadataArgsStorage } from '../index';
/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in routing-controllers settings.
 */
export function Authorized(roleOrRoles) {
    return function (clsOrObject, method) {
        getMetadataArgsStorage().responseHandlers.push({
            type: 'authorized',
            target: method ? clsOrObject.constructor : clsOrObject,
            method: method,
            value: roleOrRoles,
        });
    };
}
//# sourceMappingURL=Authorized.js.map