import { getMetadataArgsStorage } from '../index';
/**
 * Injects a Session object property to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function SessionParam(propertyName, options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'session-param',
            object: object,
            method: methodName,
            index: index,
            name: propertyName,
            parse: false,
            required: options && options.required !== undefined ? options.required : false,
            classTransform: options && options.transform,
            validate: options && options.validate !== undefined ? options.validate : false,
        });
    };
}
//# sourceMappingURL=SessionParam.js.map