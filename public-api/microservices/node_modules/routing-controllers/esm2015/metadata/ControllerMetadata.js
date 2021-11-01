import { getFromContainer } from '../container';
/**
 * Controller metadata.
 */
export class ControllerMetadata {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(args) {
        this.target = args.target;
        this.route = args.route;
        this.type = args.type;
        this.options = args.options;
    }
    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------
    /**
     * Gets instance of the controller.
     * @param action Details around the request session
     */
    getInstance(action) {
        return getFromContainer(this.target, action);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Builds everything controller metadata needs.
     * Controller metadata should be used only after its build.
     */
    build(responseHandlers) {
        const authorizedHandler = responseHandlers.find(handler => handler.type === 'authorized' && !handler.method);
        this.isAuthorizedUsed = !!authorizedHandler;
        this.authorizedRoles = [].concat((authorizedHandler && authorizedHandler.value) || []);
    }
}
//# sourceMappingURL=ControllerMetadata.js.map