import { getMetadataArgsStorage } from '../index';
/**
 * Injects a request's http header value to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function HeaderParam(name, options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'header',
            object: object,
            method: methodName,
            index: index,
            name: name,
            parse: options ? options.parse : false,
            required: options ? options.required : undefined,
            classTransform: options ? options.transform : undefined,
            explicitType: options ? options.type : undefined,
            validate: options ? options.validate : undefined,
        });
    };
}
//# sourceMappingURL=HeaderParam.js.map