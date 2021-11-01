import { getMetadataArgsStorage } from '../index';
/**
 * Takes partial data of the request body.
 * Must be applied on a controller action parameter.
 */
export function BodyParam(name, options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'body-param',
            object: object,
            method: methodName,
            index: index,
            name: name,
            parse: options ? options.parse : false,
            required: options ? options.required : undefined,
            explicitType: options ? options.type : undefined,
            classTransform: options ? options.transform : undefined,
            validate: options ? options.validate : undefined,
        });
    };
}
//# sourceMappingURL=BodyParam.js.map