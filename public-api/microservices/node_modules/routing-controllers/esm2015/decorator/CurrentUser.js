import { getMetadataArgsStorage } from '../index';
/**
 * Injects currently authorized user.
 * Authorization logic must be defined in routing-controllers settings.
 */
export function CurrentUser(options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'current-user',
            object: object,
            method: methodName,
            index: index,
            parse: false,
            required: options ? options.required : undefined,
        });
    };
}
//# sourceMappingURL=CurrentUser.js.map