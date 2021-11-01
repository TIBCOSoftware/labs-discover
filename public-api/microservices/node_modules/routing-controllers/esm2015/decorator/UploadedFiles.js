import { getMetadataArgsStorage } from '../index';
/**
 * Injects all uploaded files to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function UploadedFiles(name, options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'files',
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
//# sourceMappingURL=UploadedFiles.js.map