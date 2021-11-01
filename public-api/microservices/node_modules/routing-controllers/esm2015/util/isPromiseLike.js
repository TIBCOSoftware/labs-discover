/**
 * Checks if given value is a Promise-like object.
 */
export function isPromiseLike(arg) {
    return arg != null && typeof arg === 'object' && typeof arg.then === 'function';
}
//# sourceMappingURL=isPromiseLike.js.map