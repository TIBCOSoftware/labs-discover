"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionParameterHandler = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const BadRequestError_1 = require("./http-error/BadRequestError");
const ParameterParseJsonError_1 = require("./error/ParameterParseJsonError");
const ParamRequiredError_1 = require("./error/ParamRequiredError");
const AuthorizationRequiredError_1 = require("./error/AuthorizationRequiredError");
const CurrentUserCheckerNotDefinedError_1 = require("./error/CurrentUserCheckerNotDefinedError");
const isPromiseLike_1 = require("./util/isPromiseLike");
const ParamNormalizationError_1 = require("./error/ParamNormalizationError");
/**
 * Handles action parameter.
 */
class ActionParameterHandler {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(driver) {
        this.driver = driver;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Handles action parameter.
     */
    handle(action, param) {
        if (param.type === 'request')
            return action.request;
        if (param.type === 'response')
            return action.response;
        if (param.type === 'context')
            return action.context;
        // get parameter value from request and normalize it
        const value = this.normalizeParamValue(this.driver.getParamFromRequest(action, param), param);
        if (isPromiseLike_1.isPromiseLike(value))
            return value.then(value => this.handleValue(value, action, param));
        return this.handleValue(value, action, param);
    }
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Handles non-promise value.
     */
    handleValue(value, action, param) {
        // if transform function is given for this param then apply it
        if (param.transform)
            value = param.transform(action, value);
        // if its current-user decorator then get its value
        if (param.type === 'current-user') {
            if (!this.driver.currentUserChecker)
                throw new CurrentUserCheckerNotDefinedError_1.CurrentUserCheckerNotDefinedError();
            value = this.driver.currentUserChecker(action);
        }
        // check cases when parameter is required but its empty and throw errors in this case
        if (param.required) {
            const isValueEmpty = value === null || value === undefined || value === '';
            const isValueEmptyObject = typeof value === 'object' && Object.keys(value).length === 0;
            if (param.type === 'body' && !param.name && (isValueEmpty || isValueEmptyObject)) {
                // body has a special check and error message
                return Promise.reject(new ParamRequiredError_1.ParamRequiredError(action, param));
            }
            else if (param.type === 'current-user') {
                // current user has a special check as well
                if (isPromiseLike_1.isPromiseLike(value)) {
                    return value.then(currentUser => {
                        if (!currentUser)
                            return Promise.reject(new AuthorizationRequiredError_1.AuthorizationRequiredError(action));
                        return currentUser;
                    });
                }
                else {
                    if (!value)
                        return Promise.reject(new AuthorizationRequiredError_1.AuthorizationRequiredError(action));
                }
            }
            else if (param.name && isValueEmpty) {
                // regular check for all other parameters // todo: figure out something with param.name usage and multiple things params (query params, upload files etc.)
                return Promise.reject(new ParamRequiredError_1.ParamRequiredError(action, param));
            }
        }
        return value;
    }
    /**
     * Normalizes parameter value.
     */
    async normalizeParamValue(value, param) {
        if (value === null || value === undefined)
            return value;
        // if param value is an object and param type match, normalize its string properties
        if (typeof value === 'object' &&
            ['queries', 'headers', 'params', 'cookies'].some(paramType => paramType === param.type)) {
            await Promise.all(Object.keys(value).map(async (key) => {
                const keyValue = value[key];
                if (typeof keyValue === 'string') {
                    const ParamType = Reflect.getMetadata('design:type', param.targetType.prototype, key);
                    if (ParamType) {
                        const typeString = ParamType.name.toLowerCase();
                        value[key] = await this.normalizeParamValue(keyValue, {
                            ...param,
                            name: key,
                            targetType: ParamType,
                            targetName: typeString,
                        });
                    }
                }
            }));
        }
        // if value is a string, normalize it to demanded type
        else if (typeof value === 'string') {
            switch (param.targetName) {
                case 'number':
                case 'string':
                case 'boolean':
                case 'date':
                    return this.normalizeStringValue(value, param.name, param.targetName);
            }
        }
        // if target type is not primitive, transform and validate it
        if (['number', 'string', 'boolean'].indexOf(param.targetName) === -1 && (param.parse || param.isTargetObject)) {
            value = this.parseValue(value, param);
            value = this.transformValue(value, param);
            value = await this.validateValue(value, param);
        }
        return value;
    }
    /**
     * Normalizes string value to number or boolean.
     */
    normalizeStringValue(value, parameterName, parameterType) {
        switch (parameterType) {
            case 'number':
                if (value === '') {
                    throw new ParamNormalizationError_1.InvalidParamError(value, parameterName, parameterType);
                }
                const valueNumber = +value;
                if (valueNumber === NaN) {
                    throw new ParamNormalizationError_1.InvalidParamError(value, parameterName, parameterType);
                }
                return valueNumber;
            case 'boolean':
                if (value === 'true' || value === '1' || value === '') {
                    return true;
                }
                else if (value === 'false' || value === '0') {
                    return false;
                }
                else {
                    throw new ParamNormalizationError_1.InvalidParamError(value, parameterName, parameterType);
                }
            case 'date':
                const parsedDate = new Date(value);
                if (Number.isNaN(parsedDate.getTime())) {
                    throw new ParamNormalizationError_1.InvalidParamError(value, parameterName, parameterType);
                }
                return parsedDate;
            case 'string':
            default:
                return value;
        }
    }
    /**
     * Parses string value into a JSON object.
     */
    parseValue(value, paramMetadata) {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                throw new ParameterParseJsonError_1.ParameterParseJsonError(paramMetadata.name, value);
            }
        }
        return value;
    }
    /**
     * Perform class-transformation if enabled.
     */
    transformValue(value, paramMetadata) {
        if (this.driver.useClassTransformer &&
            paramMetadata.actionMetadata.options.transformRequest !== false &&
            paramMetadata.targetType &&
            paramMetadata.targetType !== Object &&
            !(value instanceof paramMetadata.targetType)) {
            const options = paramMetadata.classTransform || this.driver.plainToClassTransformOptions;
            value = class_transformer_1.plainToClass(paramMetadata.targetType, value, options);
        }
        return value;
    }
    /**
     * Perform class-validation if enabled.
     */
    validateValue(value, paramMetadata) {
        const isValidationEnabled = paramMetadata.validate instanceof Object ||
            paramMetadata.validate === true ||
            (this.driver.enableValidation === true && paramMetadata.validate !== false);
        const shouldValidate = paramMetadata.targetType && paramMetadata.targetType !== Object && value instanceof paramMetadata.targetType;
        if (isValidationEnabled && shouldValidate) {
            const options = Object.assign({}, this.driver.validationOptions, paramMetadata.validate);
            return class_validator_1.validateOrReject(value, options)
                .then(() => value)
                .catch((validationErrors) => {
                const error = new BadRequestError_1.BadRequestError(`Invalid ${paramMetadata.type}, check 'errors' property for more info.`);
                error.errors = validationErrors;
                error.paramName = paramMetadata.name;
                throw error;
            });
        }
        return value;
    }
}
exports.ActionParameterHandler = ActionParameterHandler;
//# sourceMappingURL=ActionParameterHandler.js.map