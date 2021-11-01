import { getMetadataArgsStorage } from '../index';
/**
 * Injects a Session object to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Session(options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'session',
            object: object,
            method: methodName,
            index: index,
            parse: false,
            required: options && options.required !== undefined ? options.required : true,
            classTransform: options && options.transform,
            validate: options && options.validate !== undefined ? options.validate : false,
        });
    };
}
//# sourceMappingURL=Session.js.map