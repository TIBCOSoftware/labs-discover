import { getMetadataArgsStorage } from '../index';
/**
 * Sets response header.
 * Must be applied on a controller action.
 */
export function Header(name, value) {
    return function (object, methodName) {
        getMetadataArgsStorage().responseHandlers.push({
            type: 'header',
            target: object.constructor,
            method: methodName,
            value: name,
            secondaryValue: value,
        });
    };
}
//# sourceMappingURL=Header.js.map