import { getMetadataArgsStorage } from '../index';
/**
 * Specifies a template to be rendered by a controller action.
 * Must be applied on a controller action.
 */
export function Render(template) {
    return function (object, methodName) {
        getMetadataArgsStorage().responseHandlers.push({
            type: 'rendered-template',
            target: object.constructor,
            method: methodName,
            value: template,
        });
    };
}
//# sourceMappingURL=Render.js.map