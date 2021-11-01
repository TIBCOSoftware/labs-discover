import { getMetadataArgsStorage } from '../index';
/**
 * Defines a class as a controller.
 * Each decorated controller method is served as a controller action.
 * Controller actions are executed when request come.
 *
 * @param baseRoute Extra path you can apply as a base route to all controller actions
 * @param options Extra options that apply to all controller actions
 */
export function Controller(baseRoute, options) {
    return function (object) {
        getMetadataArgsStorage().controllers.push({
            type: 'default',
            target: object,
            route: baseRoute,
            options,
        });
    };
}
//# sourceMappingURL=Controller.js.map