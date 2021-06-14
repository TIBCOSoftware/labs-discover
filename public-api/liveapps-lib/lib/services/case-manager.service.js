"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseManagerService = void 0;
var axios_1 = require("axios");
var CaseManagerService = /** @class */ (function () {
    function CaseManagerService() {
        var _this = this;
        this.basePath = 'https://eu.liveapps.cloud.tibco.com/case/v1';
        /**
         * Retrieves Cases by specifying a list of Case references or a set of criteria that Cases must match.  By default, only 10 items from the results list are returned, starting from the beginning of the list. You can override this default behaviour by using the $top and $skip parameters.
         * @summary Returns Cases that match the specified query parameters.
         * @param sandbox The id of the Sandbox from which to return Cases. (You can obtain Sandbox Ids using the Authorization Engine Service.)   Note: This parameter is required unless $count is specified.
         * @param filter A filter expression that defines the Cases to be returned. The expression can contain the following operands:  * __applicationId__ (required if $count is not used): The identifier of the specific application for which Cases should be returned.    Supported operators: &#39;eq&#39;    * __typeId__ (required if $count is not used): The identifier of the specific Case Type for which Cases should be returned.    Supported operators: &#39;eq&#39;  * __purgeable__ (optional): Boolean value specifying whether to return Cases that would (TRUE) or would not (FALSE) be affected by a purge request.    Supported operators: &#39;eq&#39;  * __modificationTimestamp__ (optional): The specification of a date/time range in which the Cases to be returned were last modified.    Supported operators: &#39;lt&#39;, &#39;le&#39;  * __stateId__ (optional): The identifier of the specific state for which Cases should be returned.    Supported operators: &#39;eq&#39;  * __lock__ (optional): Boolean value specifying whether to return Cases that are locked (TRUE) or locked (FALSE).    Supported operators: &#39;eq&#39;  * __caseReference__ (optional): A comma-separated list of Case references for which Cases should be returned. (Any Case reference that no longer exists,  because the Case has been deleted, is simply ignored.)    Supported functions: &#39;in&#39;  For example:   &#x60;$filter&#x3D;applicationId eq 8 and typeId eq 1 and stateId eq 9&#x60;  See the _Filtering and Sorting_ Key Concepts page for more information about how to construct valid filter expressions.
         * @param select A comma-separated list of identifiers defining the properties to be returned for each Case. If $select is not specified, all properties are returned.    * __caseReference__ (or __cr__): Returns the Case reference.      * __casedata__ (or __c__): Returns the current value of all Case attributes. This format contains the system identifiers (_id and _value properties), so is not compliant with the JSON schema returned by the GET /types method in the jsonSchema object.    * __untaggedCasedata__ (or __uc__): Returns the the current value of all Case attributes with system identifiers (_id and _value properties) removed. This format is compliant with the JSON schema returned by the GET /types method (in the jsonSchema object).                      * __summary__ (or __s__): Returns the current values of those Case attributes marked as summary attributes.      * __metadata__ (or __m__): Returns the following metadata for the Case. Individual metadata properties can be specified by suffixing &#39;metadata&#39; with a dot followed by the identifier.        * __createdBy__ (or __cb__)     * __creationTimestamp__ (or __ct__)      * __modifiedBy__ (or __mb__)     * __modificationTimestamp__ (or __mt__)     * __lock__ (or __l__)     * __lockType__ (or __lt__)     * __lockedBy__ (or __lb__)     * __msLockExpiry__ (or __msle__)     * __msSystemTime__ (or __msst__)     * __markedForPurge__ (or __mfp__)     * __applicationId__ (or __ai__)      * __typeId__ (or __ti__)        Note: &#39;metadata&#39; cannot be used if $search is used.  For example:  * The following string returns the Case reference and summary attributes:     &#x60;$select&#x3D;caseReference,summary&#x60;    * The following string returns the Case summary, modificationTimestamp and modifiedBy attributes:    &#x60;$select&#x3D;s,m.mt,m.mb&#x60;
         * @param skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list.    Note: If $search is used, the sum of $skip and $top must be less than or equal to 10000. An error will occur if this limit is exceeded.
         * @param top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be between 1 and 1000. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 19 or fewer items.  If $top is not specified, a default value of 10 is used (unless $count&#x3D;true is also specified, in which case the default value of 10 is ignored).
         * @param search Limits results to just those that match the given search string.  Only attributes that are defined as &#39;Searchable&#39; in Live Apps Designer are searched.  Note: If $search is used:   * $sandbox must be set to the value of the Production Sandbox. $search cannot be used on a Developer Sandbox.   * $select&#x3D;metadata cannot be used.   * $top is required.
         * @param count If set to &#39;TRUE&#39;, returns the number of Cases in the result, rather than the Cases themselves.    Note: $count cannot be used if $top is used. If $count&#x3D;true is specified, the default $top value (10) is ignored.
         * @param user Test userId for Development sandbox only. Claims must still contain a valid userid but will be overridden when the optional $user parameter is specified
         * @param {*} [options] Override http request options.
         */
        this.getCases = function (token, sandbox, filter, select, skip, top, search, count) { return __awaiter(_this, void 0, void 0, function () {
            var localVarPath, localVarQueryParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localVarPath = this.basePath + '/cases';
                        localVarQueryParameters = {};
                        if (sandbox !== undefined) {
                            localVarQueryParameters.$sandbox = sandbox;
                        }
                        if (filter !== undefined) {
                            localVarQueryParameters.$filter = filter;
                        }
                        if (select !== undefined) {
                            localVarQueryParameters.$select = select;
                        }
                        if (skip !== undefined) {
                            localVarQueryParameters.$skip = skip;
                        }
                        if (top !== undefined) {
                            localVarQueryParameters.$top = top;
                        }
                        if (search !== undefined) {
                            localVarQueryParameters.$search = search;
                        }
                        if (count !== undefined) {
                            localVarQueryParameters.$count = count;
                        }
                        return [4 /*yield*/, axios_1.default.get(localVarPath, {
                                headers: { 'Authorization': 'Bearer ' + token },
                                params: localVarQueryParameters
                            }).then(function (response) {
                                return response.data;
                            }).catch(function (error) {
                                return error.data;
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        /**
         * Purgeable Cases - meaning those that are in a terminal (or end) state - can be deleted to prevent them from, over time, building up and consuming excessive storage space in the current Subscription. However, __use caution when deleting Cases__, as doing so permanently deletes the Case, and the deletion cannot be undone. <br> You can use the GET /types method to determine which states are purgeable for a particular Case Type. Terminal states have the 'isTerminal' attribute set to 'true'. <br> Note: Cases are not deleted immediately when this method is executed. Instead, each Case's 'metadata.markedForPurge' attribute is set and the Case is deleted asynchronously later.
         * @summary Deletes all purgeable Cases that match the specified query parameters.
         * @param sandbox The id of the Sandbox from which to delete purgeable Cases. (You can obtain Sandbox Ids using the Authorization Engine Service.)
         * @param filter A filter expression that defines the Cases to be deleted. The expression can contain the following operands:  * __applicationId__ (required): The identifier of the specific application for which Cases should be deleted.    Supported operators: &#39;eq&#39;    * __typeId__ (required): The identifier of the specific Case Type for which Cases should be deleted.    Supported operators: &#39;eq&#39;  * __purgeable__ (required): Must be set to (TRUE).     Supported operators: &#39;eq&#39;  * __modificationTimestamp__ (optional): The specification of a date/time range in which the Cases to be deleted were last modified.    Supported operators: &#39;lt&#39;, &#39;le&#39;  * __stateId__ (optional): The identifier of the specific terminal state for which Cases should be deleted. If &#39;stateId&#39; is omitted, Cases in any terminal state are deleted.    Supported operators: &#39;eq&#39;               For example:   &#x60;$filter&#x3D;applicationId eq 8 and typeId eq 1 and  purgeable eq TRUE and stateId eq 9&#x60;  See the _Filtering and Sorting_ Key Concepts page for more information about how to construct valid filter expressions.
         */
        this.deleteCases = function (token, sandbox, filter) { return __awaiter(_this, void 0, void 0, function () {
            var localVarPath, localVarQueryParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localVarPath = this.basePath + '/cases';
                        localVarQueryParameters = {};
                        // verify required parameter 'sandbox' is not null or undefined
                        if (sandbox === null || sandbox === undefined) {
                            throw new Error('Required parameter sandbox was null or undefined when calling deleteCases.');
                        }
                        // verify required parameter 'filter' is not null or undefined
                        if (filter === null || filter === undefined) {
                            throw new Error('Required parameter filter was null or undefined when calling deleteCases.');
                        }
                        if (sandbox !== undefined) {
                            localVarQueryParameters.$sandbox = sandbox;
                        }
                        if (filter !== undefined) {
                            localVarQueryParameters.$filter = filter;
                        }
                        return [4 /*yield*/, axios_1.default.delete(localVarPath, {
                                headers: { 'Authorization': 'Bearer ' + token },
                                params: localVarQueryParameters
                            }).then(function (response) {
                                return response.data;
                            }).catch(function (error) {
                                return error.data;
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        /**
         * Unlocking a Case changes the value of the Case's 'metadata.lock' attribute. This method cannot be used to change the Case's content, state, or any other metadata.
         * @summary Unlocks a particular Case.
         * @param caseReference The Case reference of the Case.
         * @param sandbox The id of the Sandbox that contains the Case.
         * @param select The attribute to be returned (after a successul PUT operation). This must be &#39;metadata&#39; - that is:  &#x60;$select&#x3D;metadata&#x60;
         * @param payload Unlocks a Case. Use the following:  * _{\&quot;metadata\&quot;:{\&quot;lock\&quot;:false}}_: to unlock a Case  As the metadata&#39;s lock property is the only thing that can be updated, anything else in the request body will be ignored.
         * @param {*} [options] Override http request options.
         */
        this.updateCase = function (token, caseReference, sandbox, select, payload) { return __awaiter(_this, void 0, void 0, function () {
            var localVarPath, localVarQueryParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localVarPath = this.basePath + '/cases/{caseReference}'.replace('{' + 'caseReference' + '}', encodeURIComponent(String(caseReference)));
                        localVarQueryParameters = {};
                        // verify required parameter 'caseReference' is not null or undefined
                        if (caseReference === null || caseReference === undefined) {
                            throw new Error('Required parameter caseReference was null or undefined when calling updateCase.');
                        }
                        // verify required parameter 'sandbox' is not null or undefined
                        if (sandbox === null || sandbox === undefined) {
                            throw new Error('Required parameter sandbox was null or undefined when calling updateCase.');
                        }
                        // verify required parameter 'select' is not null or undefined
                        if (select === null || select === undefined) {
                            throw new Error('Required parameter select was null or undefined when calling updateCase.');
                        }
                        // verify required parameter 'payload' is not null or undefined
                        if (payload === null || payload === undefined) {
                            throw new Error('Required parameter payload was null or undefined when calling updateCase.');
                        }
                        if (sandbox !== undefined) {
                            localVarQueryParameters.$sandbox = sandbox;
                        }
                        if (select !== undefined) {
                            localVarQueryParameters.$select = select;
                        }
                        return [4 /*yield*/, axios_1.default.put(localVarPath, payload, {
                                headers: { 'Authorization': 'Bearer ' + token },
                                params: localVarQueryParameters
                            }).then(function (response) {
                                return response.data;
                            }).catch(function (error) {
                                return error.data;
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        /**
         *
         * @summary Returns the set of information about a particular Case that matches the specified query parameters.
         * @param caseReference The Case reference of the Case.
         * @param sandbox The ID of the Sandbox that contains the Case.
         * @param select A comma-separated list of identifiers defining the attributes to be returned for the Case. If $select is not specified, all attributes are returned.    * __casedata__ (or __c__): Returns the current value of all Case attributes. This format contains the system identifiers (_id and _value properties), so is not compliant with the JSON schema returned by the GET /types method in the jsonSchema object.    * __untaggedCasedata__ (or __uc__): Returns the the current value of all Case attributes with system identifiers (_id and _value properties) removed. This format is compliant with the JSON schema returned by the GET /types method (in the jsonSchema object).                    * __summary__ (or __s__): Returns the Case summary attributes and their current values.      * __metadata__ (or __m__): Returns the following metadata attributes for the Case. Individual attributes can be specified by suffixing &#39;metadata&#39; with a dot followed by the identifier.        * __createdBy__ (or __cb__)     * __creationTimestamp__ (or __ct__)      * __modifiedBy__ (or __mb__)     * __modificationTimestamp__ (or __mt__)     * __lock__ (or __l__)     * __lockType__ (or __lt__)     * __lockedBy__ (or __lb__)     * __msLockExpiry__ (or __msle__)     * __msSystemTime__ (or __msst__)     * __markedForPurge__ (or __mfp__)     * __applicationId__ (or __ai__)      * __typeId__ (or __ti__)    For example, the following string returns the Case summary, modificationTimestamp and modifiedBy attributes:    &#x60;$select&#x3D;s,m.mt,m.mb&#x60;
         * @param user Test userId for Development sandbox only. Claims must still contain a valid userid but will be overridden when the optional $user parameter is specified
         * @param {*} [options] Override http request options.
         */
        this.getCase = function (token, caseReference, sandbox, select) { return __awaiter(_this, void 0, void 0, function () {
            var localVarPath, localVarQueryParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localVarPath = this.basePath + '/cases/{caseReference}'.replace('{' + 'caseReference' + '}', encodeURIComponent(String(caseReference)));
                        localVarQueryParameters = {};
                        // verify required parameter 'caseReference' is not null or undefined
                        if (caseReference === null || caseReference === undefined) {
                            throw new Error('Required parameter caseReference was null or undefined when calling getCase.');
                        }
                        // verify required parameter 'sandbox' is not null or undefined
                        if (sandbox === null || sandbox === undefined) {
                            throw new Error('Required parameter sandbox was null or undefined when calling getCase.');
                        }
                        if (sandbox !== undefined) {
                            localVarQueryParameters.$sandbox = sandbox;
                        }
                        if (select !== undefined) {
                            localVarQueryParameters.$select = select;
                        }
                        return [4 /*yield*/, axios_1.default.get(localVarPath, {
                                headers: { 'Authorization': 'Bearer ' + token },
                                params: localVarQueryParameters
                            }).then(function (response) {
                                return response.data;
                            }).catch(function (error) {
                                return error.response.data;
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        /**
         * Case Types are always returned. If an 'applicationId' constraint is specified in the $filter query parameter, Structured Types are also included in the result. In other words, it is possible to get all Case Types for a Sandbox, or all Case Types *and* Structured Types for a specific application or set of applications.  By default, only 10 items from the results list are returned, starting from the beginning of the list. You can override this default behaviour by using the $top and $skip parameters.
         * @summary Returns Types that match the specified query parameters.
         * @param sandbox The id of the Sandbox from which to return Types. (You can obtain Sandbox Ids using the Authorization Engine Service.)
         * @param select A comma-separated list of identifiers defining the properties to be returned for each Type. If $select is not specified, all properties are returned.    * __basic__ (or  __b__): Returns basic details - &#39;id&#39;, &#39;name&#39;, &#39;label&#39;, &#39;isCase&#39;, &#39;applicationId&#39;, &#39;applicationName&#39; and &#39;applicationInternalName&#39;. &#39;isCase&#39; is not returned for a Structured Type.      * __attributes__ (or __a__): Returns details of all attributes defined in the Type.       * __summaryAttributes__ (or __sa__): Returns details of  attributes that are included in the Case summary. (&#39;summaryAttributes&#39; are not defined for a Structured Type, so no data is returned.)      * __states__ (or __s__): Returns details of all states defined in a Case Type. (&#39;states&#39; are not defined for a Structured Type, so no data is returned.)      * __jsonSchema__ (or __js__): Returns a JSON Schema describing the format of Case data that is returned in the &#39;untaggedCasedata&#39; property of the response items for the GET /cases and PUT /cases methods.      * __creators__ (or __c__): Returns details of Case Creator processes that are defined in the application containing the Case Type. (&#39;creators&#39; are not defined for a Structured Type, so no data is returned. Case Creator processes that contain participant fields are also excluded.)      * __actions__ (or __ac__): Returns details of Case Action processes that are defined in the application containing the Case Type. (&#39;actions&#39; are not defined for a Structured Type, so no data is returned. Case Action processes that contain participant fields are also excluded.)      Note: The properties returned by the &#39;creators&#39; and &#39;actions&#39; identifiers (&#39;id&#39;, &#39;name&#39; and &#39;jsonSchema&#39;) can be subsequently used from the POST /processes method in the Business Process Management service to either:      * start a new Case (by starting an instance of a Case Creator process).      * update an existing Case (by starting an instance of a Case Action process).      For example, the following string returns basic and states properties:   &#x60;$select&#x3D;basic,s&#x60;
         * @param filter A filter expression that defines the Types to be returned. The expression can contain one of the following operands:  * __applicationId__ : The identifier of the specific application for which Types should be returned. (Both Case Types and Structured Types will be returned.)    Supported operator:     * &#39;eq&#39; - to match a specific applicationId    Supported function:    * &#39;in&#39; - to match a comma-separated list of applicationIds    * __applicationName__ : The name of the specific application for which Types should be returned. (Both Case Types and Structured Types will be returned.)  Apostrophes should be prefixed with a backslash to avoid them being misinterpreted as the closing single quotation mark.    Supported operator:     * &#39;eq&#39; - to match a specific applicationName    * __isCase__ (optional): Boolean value specifying whether to return only Case Types (TRUE). When specifying a given application or applications via applicationId/applicationName, this option is implicitly set TRUE.    Supported operators:      * &#39;eq&#39; - when TRUE, limits results to just Case Types  For example:    &#x60;$filter&#x3D;applicationId eq 9&#x60;    &#x60;$filter&#x3D;applicationId in(8,9,16)&#x60;    &#x60;$filter&#x3D;applicationName eq &#39;Policy&#39;&#x60;   &#x60;$filter&#x3D;applicationName eq &#39;Employee\\&#39;s Contract&#39;&#x60;   &#x60;$filter&#x3D;applicationName eq &#39;Purchase Order&#39; and isCase eq TRUE&#x60;  You can use applicationId or applicationName (but not both) to limit the response to given application(s). Both Case Types and Structured Types are returned, unless &#39;isCase eq TRUE&#39; is included, which limits the results to just Case Types. If neither applicationId nor applicationName is specified, the response includes all applications in the Sandbox; In this scenario, only Case Types are returned.
         * @param skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list.
         * @param top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be between 1 and 1000. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items.  If $top is not specified, a default value of 10 is used (unless $count&#x3D;true is also specified, in which case the default value of 10 is ignored).
         * @param count If set to &#39;TRUE&#39;, returns the number of Types in the result, rather than the Types themselves.    Note: $count cannot be used if $top is used. If $count&#x3D;true is specified, the default $top value (10) is ignored.
         * @param {*} [options] Override http request options.
         */
        this.getTypes = function (token, sandbox, select, filter, skip, top, count) { return __awaiter(_this, void 0, void 0, function () {
            var localVarPath, localVarQueryParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localVarPath = this.basePath + '/types';
                        localVarQueryParameters = {};
                        // verify required parameter 'sandbox' is not null or undefined
                        if (sandbox === null || sandbox === undefined) {
                            throw new Error('Required parameter sandbox was null or undefined when calling getTypes.');
                        }
                        if (sandbox !== undefined) {
                            localVarQueryParameters.$sandbox = sandbox;
                        }
                        if (select !== undefined) {
                            localVarQueryParameters.$select = select;
                        }
                        if (filter !== undefined) {
                            localVarQueryParameters.$filter = filter;
                        }
                        if (skip !== undefined) {
                            localVarQueryParameters.$skip = skip;
                        }
                        if (top !== undefined) {
                            localVarQueryParameters.$top = top;
                        }
                        if (count !== undefined) {
                            localVarQueryParameters.$count = count;
                        }
                        return [4 /*yield*/, axios_1.default.get(localVarPath, {
                                headers: { 'Authorization': 'Bearer ' + token },
                                params: localVarQueryParameters
                            }).then(function (response) {
                                return response.data;
                            }).catch(function (error) {
                                return error.response.data;
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this.basePath = this.basePath;
    }
    return CaseManagerService;
}());
exports.CaseManagerService = CaseManagerService;