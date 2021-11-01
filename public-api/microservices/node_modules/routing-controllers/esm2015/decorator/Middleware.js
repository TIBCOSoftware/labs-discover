import { getMetadataArgsStorage } from '../index';
/**
 * Marks given class as a middleware.
 * Allows to create global middlewares and control order of middleware execution.
 */
export function Middleware(options) {
    return function (target) {
        getMetadataArgsStorage().middlewares.push({
            target: target,
            type: options && options.type ? options.type : 'before',
            global: true,
            priority: options && options.priority !== undefined ? options.priority : 0,
        });
    };
}
//# sourceMappingURL=Middleware.js.map