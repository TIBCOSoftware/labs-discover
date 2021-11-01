import { getMetadataArgsStorage } from '../index';
/**
 * Injects an uploaded file object to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function UploadedFile(name, options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'file',
            object: object,
            method: methodName,
            index: index,
            name: name,
            parse: false,
            required: options ? options.required : undefined,
            extraOptions: options ? options.options : undefined,
        });
    };
}
//# sourceMappingURL=UploadedFile.js.map