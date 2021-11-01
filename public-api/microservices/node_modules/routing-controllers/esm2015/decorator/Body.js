import { getMetadataArgsStorage } from '../index';
/**
 * Allows to inject a request body value to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Body(options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'body',
            object: object,
            method: methodName,
            index: index,
            parse: false,
            required: options ? options.required : undefined,
            classTransform: options ? options.transform : undefined,
            validate: options ? options.validate : undefined,
            explicitType: options ? options.type : undefined,
            extraOptions: options ? options.options : undefined,
        });
    };
}
//# sourceMappingURL=Body.js.map