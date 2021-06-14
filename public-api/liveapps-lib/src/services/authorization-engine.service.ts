import axios from 'axios';
import { Claims, Group, GroupDetails, AESModelError, Parameter, Sandbox, User, UserGroupMapping, UserGroupMappingContent } from '../model/authorizationengine';

export class AuthorizatinEngineService  {

  private basePath = 'https://eu.liveapps.cloud.tibco.com/organisation/v1'
  
  public constructor(){
    this.basePath = this.basePath;
  }

  /**
   * 
   * @summary Returns the details for each User in the current subscription whose name matches the specified query parameters.
   * @param skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list.
   * @param top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items.
   * @param filter A filter expression that defines the Users to be returned. The expression can contain the following operands:    * __firstName__ (optional): The case-insensitive first name of the User to be returned.    * __lastName__ (optional): The case-insensitive last name of the User to be returned.    * __username__ (optional): The case-insensitive username of the User to be returned.    * __type__ (optional): The type of User to be returned. This value must be either __Standard__ or __Test__.              Supported operator: &#39;eq&#39;     Supported function: &#39;contains(name,&#39;value&#39;)&#39;     Supported keywords: &#39;and&#39;, &#39;or&#39;      _Note_:    * When using &#39;firstName&#39;, &#39;lastName&#39; or &#39;username&#39;, only one name can be used. You can search for partial names by using the contains function.   * When using &#39;type&#39;:       * The &#39;contains&#39; function is not supported.       * The &#39;type&#39; value must be _Standard_ if &#39;firstName&#39;, &#39;lastName&#39; or &#39;username&#39; is also used.   * You cannot use both the &#39;and&#39; and &#39;or&#39; keywords in a single filter, as additional bracketing is not supported. For more information, see the Filtering and Sorting Key Concepts page.  For example:    The following string returns all Users whose last name is &#39;Smith&#39; or &#39;smith&#39;:       $filter&#x3D;lastName eq &#39;Smith&#39;     The following string returns all Users whose first name contains &#39;Jon&#39; or &#39;jon&#39;:       $filter&#x3D;contains(firstName,&#39;Jon&#39;)     The following string returns all Users whose first name is &#39;John&#39; or &#39;john&#39; and whose last name is &#39;Smith&#39; or &#39;smith&#39;:       $filter&#x3D;firstName eq &#39;John&#39; and lastName eq &#39;Smith&#39;     The following string returns all Users whose first name contains either &#39;Jon&#39;, &#39;jon&#39;, &#39;Bil&#39; or &#39;bil&#39;:       $filter&#x3D;contains(firstName,&#39;Jon&#39;) or contains(firstName,&#39;Bil&#39;)     The following string returns Standard users only.       $filter&#x3D;type eq Standard 
   */
  public getUsers = (token: string, skip?: number, top?: number, filter?: string) : Promise<User[]|AESModelError> => {
    const localVarPath = this.basePath + '/users';
    const localVarQueryParameters: any = {};

    if (skip !== undefined) {
        localVarQueryParameters.$skip = skip;
    }

    if (top !== undefined) {
        localVarQueryParameters.$top = top;
    }

    if (filter !== undefined) {
        localVarQueryParameters.$filter = filter;
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for a specfic User.
   * @param id The unique identifier (&#39;id&#39;) of the required User.   NOTE: Do not use the User&#39;s &#39;externalId&#39; value. 
   */
  public getUser = (token: string, id: string) : Promise<User|AESModelError> => {
    const localVarPath = this.basePath + '/users/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getUser.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.data;
    });  
  }

  /**
   * 
   * @summary Returns details of all the Groups to which the specified User has access. The $sandbox parameter is required.
   * @param id The unique identifier (&#39;id&#39;) of the required User.
   * @param sandbox The unique identifier of the required Sandbox. (Required)
   * @param skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list.
   * @param top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items.
   */
  public getGroupsForUser = (token: string, id: string, sandbox: string, skip?: number, top?: number) : Promise<Group[]|AESModelError> => {
    const localVarPath = this.basePath + '/users/{id}/groups'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getGroupsForUser.');
    }

    // verify required parameter 'sandbox' is not null or undefined
    if (sandbox === null || sandbox === undefined) {
        throw new Error('Required parameter sandbox was null or undefined when calling getGroupsForUser.');
    }

    if (sandbox !== undefined) {
        localVarQueryParameters.$sandbox = sandbox;
    }

    if (skip !== undefined) {
        localVarQueryParameters.$skip = skip;
    }

    if (top !== undefined) {
        localVarQueryParameters.$top = top;
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.data;
    });  
  }

  /**
   * 
   * @summary Returns details of all the Sandboxes to which the specified User has access.
   * @param id The unique identifier (&#39;id&#39;) of the required User.
   */
  public getSandboxesForUser = (token: string, id: string) : Promise<Sandbox[]|AESModelError> => {
    const localVarPath = this.basePath + '/users/{id}/sandboxes'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getSandboxesForUser.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.data;
    });  
  }

  /**
   * 
   * @summary Returns a list of UserGroupMappings that reference the specified User.
   * @param id The unique identifier (&#39;id&#39;) of the required User.
   * @param sandbox The unique identifier of the required Sandbox.
   */
  public getUserGroupMappingsForUser = (token: string, id: string, sandbox?: string) : Promise<UserGroupMapping[]|AESModelError> => {
    const localVarPath = this.basePath + '/users/{id}/userGroupMappings'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getUserGroupMappingsForUser.');
    }

    if (sandbox !== undefined) {
        localVarQueryParameters.$sandbox = sandbox;
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the Claims held for the currently logged in User.
   */
  public getClaims = (token: string) : Promise<Claims|AESModelError> => {
    const localVarPath = this.basePath + '/claims';
    const localVarQueryParameters: any = {};

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }  

  /**
   * 
   * @summary Returns the details for each Group in the current subscription that matches the specified query parameters.
   * @param skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list.
   * @param top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items.
   * @param filter A filter expression that defines the Groups for which data should be returned. The expression can contain the following operand:    * __name__ (optional): The case-insensitive name of the Group(s) for which data should be returned. Only one name can be used. You can search for partial names by using the contains function.      Supported operator: &#39;eq&#39;   Supported function: &#39;contains(name,&#39;value&#39;)&#39;  Note: Using this filter automatically restricts the returned data to match only Groups of type SubscriptionDefined.  For example, the following string returns data for the Group called &#39;Support&#39; or &#39;support&#39;:        $filter&#x3D;contains(name,&#39;support&#39;)      The following string returns data for all Groups that contain &#39;Support&#39; or &#39;support&#39; in their name:        $filter&#x3D;contains(name,&#39;Support&#39;)             
   */
  public getGroups = (token: string, skip?: number, top?: number, filter?: string) : Promise<Group[]|AESModelError> => {
    const localVarPath = this.basePath + '/groups';
    const localVarQueryParameters: any = {};

    if (skip !== undefined) {
        localVarQueryParameters.$skip = skip;
    }

    if (top !== undefined) {
        localVarQueryParameters.$top = top;
    }

    if (filter !== undefined) {
        localVarQueryParameters.$filter = filter;
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * __Note__: You cannot create a system-defined Group. 
   * @summary Creates a subscription-defined Group.
   * @param groupContent The GroupDetails (name, description and type) for the Group that you want to create.   Note: _type_ must be &#39;SubscriptionDefined&#39;. You cannot create any other type of Group. 
   */
   public createGroup = (token: string, groupContent: GroupDetails) : Promise<string|AESModelError> => {
    const localVarPath = this.basePath + '/groups';
    const localVarQueryParameters: any = {};

    // verify required parameter 'groupContent' is not null or undefined
    if (groupContent === null || groupContent === undefined) {
        throw new Error('Required parameter groupContent was null or undefined when calling createGroup.');
    }

    return axios.post( localVarPath, groupContent, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Updates the details for one or more Groups.
   * @param groups The full details of each Group that you wish to update.  - _type_ must be &#39;SubscriptionDefined&#39; You cannot update any other type of Group. 
   */
  public updateGroups = (token: string, groups: Group[]) : Promise<Group[]|AESModelError> => {
    const localVarPath = this.basePath + '/groups';
    const localVarQueryParameters: any = {};

    // verify required parameter 'groups' is not null or undefined
    if (groups === null || groups === undefined) {
        throw new Error('Required parameter groups was null or undefined when calling updateGroups.');
    }

    return axios.put( localVarPath, groups, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for a specific Group.
   * @param id The unique identifier of the required Group.
   */
  public getGroup = (token: string, id: string) : Promise<Group|AESModelError> => {
    const localVarPath = this.basePath + '/groups/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getGroup.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }  

  /**
   * 
   * @summary Updates the details for a specific Group.
   * @param id The unique identifier of the required Group.
   * @param groupDetails The GroupDetails (name, description and type) of the Group that you wish to update.
   */
  public updateGroup = (token: string, id: string, groupDetails: GroupDetails) : Promise<Group|AESModelError> => {
    const localVarPath = this.basePath + '/groups/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling updateGroup.');
    }

    // verify required parameter 'groupDetails' is not null or undefined
    if (groupDetails === null || groupDetails === undefined) {
        throw new Error('Required parameter groupDetails was null or undefined when calling updateGroup.');
    }

    return axios.put( localVarPath, groupDetails, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Deletes a specific Group.
   * @param id The unique identifier of the required Group.
   */
  public deleteGroup = (token: string, id: string) : Promise<any|AESModelError> => {
    const localVarPath = this.basePath + '/groups/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling deleteGroup.');
    }

    return axios.delete( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns details of all the Users who are mapped to a specific Group, whose names match the specified query parameters. The $sandbox parameter is required.
   * @param id The unique identifier of the required Group.
   * @param sandbox The unique identifier of the required Sandbox. (Required)
   * @param skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list.
   * @param top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items.
   * @param filter A filter expression that defines the Users to be returned. The expression can contain the following operands:    * __firstName__ (optional): The case-insensitive first name of the User to be returned.    * __lastName__ (optional): The case-insensitive last name of the User to be returned.    * __username__ (optional): The case-insensitive username of the User to be returned.    * __type__ (optional): The type of User to be returned. This value must be either __Standard__ or __Test__.              Supported operator: &#39;eq&#39;     Supported function: &#39;contains(name,&#39;value&#39;)&#39;     Supported keywords: &#39;and&#39;, &#39;or&#39;      _Note_:    * When using &#39;firstName&#39;, &#39;lastName&#39; or &#39;username&#39;, only one name can be used. You can search for partial names by using the contains function.   * When using &#39;type&#39;:       * The &#39;contains&#39; function is not supported.       * The &#39;type&#39; value must be _Standard_ if &#39;firstName&#39;, &#39;lastName&#39; or &#39;username&#39; is also used.   * You cannot use both the &#39;and&#39; and &#39;or&#39; keywords in a single filter, as additional bracketing is not supported. For more information, see the Filtering and Sorting Key Concepts page.  For example:    The following string returns all Users whose last name is &#39;Smith&#39; or &#39;smith&#39;:       $filter&#x3D;lastName eq &#39;Smith&#39;     The following string returns all Users whose first name contains &#39;Jon&#39; or &#39;jon&#39;:       $filter&#x3D;contains(firstName,&#39;Jon&#39;)     The following string returns all Users whose first name is &#39;John&#39; or &#39;john&#39; and whose last name is &#39;Smith&#39; or &#39;smith&#39;:       $filter&#x3D;firstName eq &#39;John&#39; and lastName eq &#39;Smith&#39;     The following string returns all Users whose first name contains either &#39;Jon&#39;, &#39;jon&#39;, &#39;Bil&#39; or &#39;bil&#39;:       $filter&#x3D;contains(firstName,&#39;Jon&#39;) or contains(firstName,&#39;Bil&#39;)     The following string returns Standard users only.       $filter&#x3D;type eq Standard 
   */
  public getUsersMappedToGroup = (token: string, id: string, sandbox: string, skip?: number, top?: number, filter?: string) : Promise<User[]|AESModelError> => {
    const localVarPath = this.basePath + '/groups/{id}/users'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getUsersMappedToGroup.');
    }

    // verify required parameter 'sandbox' is not null or undefined
    if (sandbox === null || sandbox === undefined) {
        throw new Error('Required parameter sandbox was null or undefined when calling getUsersMappedToGroup.');
    }

    if (sandbox !== undefined) {
        localVarQueryParameters.$sandbox = sandbox;
    }

    if (skip !== undefined) {
        localVarQueryParameters.$skip = skip;
    }

    if (top !== undefined) {
        localVarQueryParameters.$top = top;
    }

    if (filter !== undefined) {
        localVarQueryParameters.$filter = filter;
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }
  
  /**
   * 
   * @summary Returns the details for each Sandbox in the current subscription that matches the specified query parameters.
   * @param filter A filter expression that defines the type of Sandbox to be returned. The expression can contain the following operands:      * __type__ (optional): The type of Sandbox to be returned. This value must be either __Production__ or __Developer__.        Supported operator: &#39;eq&#39;      For example, the following string returns the details for each Developer Sandbox:        $filter&#x3D;type eq Developer 
   */
    public getSandboxes = (token: string, filter?: string) : Promise<Sandbox[]|AESModelError> => {
    const localVarPath = this.basePath + '/sandboxes';
    const localVarQueryParameters: any = {};

    if (filter !== undefined) {
        localVarQueryParameters.$filter = filter;
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for a specific Sandbox.
   * @param id The unique identifier of the required Sandbox.
   */
  public getSandbox = (token: string, id: string) : Promise<Sandbox|AESModelError> => {
    const localVarPath = this.basePath + '/sandboxes/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getSandbox.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details of each UserGroupMapping in a specific Sandbox.
   * @param id The unique identifier of the required Sandbox.
   */
  public getSandboxUserGroupMappings = (token: string, id: string) : Promise<UserGroupMapping[]|AESModelError> => {
    const localVarPath = this.basePath + '/sandboxes/{id}/userGroupMappings'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getSandboxUserGroupMappings.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for each UserGroupMapping in a specific Sandbox.
   * @param sandbox The unique identifier of the required Sandbox.
   */
  public getUserGroupMappings = (token: string, sandbox?: string) : Promise<UserGroupMapping[]|AESModelError> => {
    const localVarPath = this.basePath + '/userGroupMappings';
    const localVarQueryParameters: any = {};

    if (sandbox !== undefined) {
        localVarQueryParameters.$sandbox = sandbox;
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * __Note__: You cannot create a UserGroupMapping to a system-defined Group. 
   * @summary Creates a UserGroupMapping between a User and a subscription-defined Group.
   * @param userGroupMappingContents The UserGroupMappingContent (sandboxId, groupId and userId) for the UserGroupMapping that you want to create.
   */
  public createUserGroupMapping = (token: string, userGroupMappingContents: UserGroupMappingContent) : Promise<string|AESModelError> => {
    const localVarPath = this.basePath + '/userGroupMappings';
    const localVarQueryParameters: any = {};

    // verify required parameter 'userGroupMappingContents' is not null or undefined
    if (userGroupMappingContents === null || userGroupMappingContents === undefined) {
        throw new Error('Required parameter userGroupMappingContents was null or undefined when calling createUserGroupMapping.');
    }

    return axios.post( localVarPath, userGroupMappingContents, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }
  
  /**
   * 
   * @summary Returns the details for a specific UserGroupMapping.
   * @param id The unique identifier of the required user group Mapping.
   */
  public getUserGroupMapping = (token: string, id: string) : Promise<UserGroupMapping|AESModelError> => {
    const localVarPath = this.basePath + '/userGroupMappings/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getUserGroupMapping.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * __Note__: You cannot delete a UserGroupMapping to a system-defined Group.   
   * @summary Deletes a specific UserGroupMapping between a User and a subscription-defined Group.
   * @param id The unique identifier of the required user group Mapping.
   */
  public deleteUserGroupMapping = (token: string, id: string) : Promise<any|AESModelError> => {
    const localVarPath = this.basePath + '/userGroupMappings/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling deleteUserGroupMapping.');
    }

    return axios.delete( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for the Sandbox identified in a specific UserGroupMapping.
   * @param id The unique identifier of the required user group Mapping.
   */
  public getSandboxForUserGroupMapping = (token: string, id: string) : Promise<Sandbox[]|AESModelError> => {
    const localVarPath = this.basePath + '/userGroupMappings/{id}/sandboxes'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getSandboxForUserGroupMapping.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for the Group identified in a specific UserGroupMapping.
   * @param id The unique identifier of the required user group Mapping.
   */
  public getGroupForUserGroupMapping = (token: string, id: string) : Promise<Group|AESModelError> => {
    const localVarPath = this.basePath + '/userGroupMappings/{id}/groups'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getGroupForUserGroupMapping.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for the User identified in a specific UserGroupMapping.
   * @param id The unique identifier of the required user group Mapping.
   */
  public getUserForUserGroupMapping = (token: string, id: string) : Promise<User|AESModelError> => {
    const localVarPath = this.basePath + '/userGroupMappings/{id}/users'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getUserForUserGroupMapping.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for each subscription Parameter in the current Subscription.
   */
  public getParameters = (token: string) : Promise<Parameter[]|AESModelError> => {
    const localVarPath = this.basePath + '/parameters';
    const localVarQueryParameters: any = {};

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }

  /**
   * 
   * @summary Returns the details for a specific subscription Parameter.
   * @param name The name of the required subscription Parameter.
   */
  public getParameter = (token: string, name: string) : Promise<Parameter|AESModelError> => {
    const localVarPath = this.basePath + '/parameters/{name}'.replace('{' + 'name' + '}', encodeURIComponent(String(name)));
    const localVarQueryParameters: any = {};
 
    // verify required parameter 'name' is not null or undefined
    if (name === null || name === undefined) {
        throw new Error('Required parameter name was null or undefined when calling getParameter.');
    }

    return axios.get( localVarPath, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
 }  
}