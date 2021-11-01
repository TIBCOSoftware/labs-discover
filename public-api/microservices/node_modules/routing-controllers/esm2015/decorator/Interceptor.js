import { getMetadataArgsStorage } from '../index';
/**
 * Registers a global interceptor.
 */
export function Interceptor(options) {
    return function (target) {
        getMetadataArgsStorage().interceptors.push({
            target: target,
            global: true,
            priority: options && options.priority ? options.priority : 0,
        });
    };
}
//# sourceMappingURL=Interceptor.js.map