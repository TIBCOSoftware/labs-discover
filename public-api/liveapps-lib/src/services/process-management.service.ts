import axios from 'axios';
import { Instance, InstanceState, PMModelError, ProcessDetails } from '../model/processmanagement.models';

export class ProcessManagementService  {

  private basePath = 'https://eu.liveapps.cloud.tibco.com/process/v1'
  
  public constructor(){
    this.basePath = this.basePath;
  }

  /**
   * 
   * @summary Returns summary information about a specified Process Instance.
   * @param id The unique identifier of the Process Instance.
   */
  public getInstance = (token: string, id: string): Promise<Instance|PMModelError> => {
    const localVarPath = this.basePath + '/instances/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getInstance.');
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
   * Information is returned only for Process Instances to which the current User has access.
   * @summary Returns summary information about Process Instances that match the specified query parameters.
   * @param sandbox The id of the Sandbox from which to return data. (You can obtain Sandbox Ids using the GET /sandboxes method in the Authorization Engine Service.)
   * @param filter A filter expression that defines the Process Instances to be returned. The expression can contain the following operands:  * __caseReference__ (required if &#39;state&#39; is not used): The reference of the specific Case for which Process Instances should be returned.  * __state__ (required if &#39;caseReference&#39; is not used): The identifier of the specific State for which Process Instances should be returned. This must be one of the following strings: &#39;STARTING&#39;, &#39;ACTIVE&#39;, &#39;COMPLETED&#39;, &#39;CANCELLED, &#39;DELAYED&#39; or &#39;HALTED&#39;.  Supported operators: &#39;eq&#39;  Note: Either &#39;caseReference&#39; or &#39;state&#39; must be specified, or both can be specified by using the &#39;AND&#39; operator.  For example, the following string returns all Process Instances for caseReference &#39;35&#39; that are currently &#39;ACTIVE&#39;:     $filter&#x3D;caseReference eq 35 and state eq &#39;ACTIVE&#39; 
   * @param skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list.   Note: &#39;$top&#39; must also be used if &#39;$skip&#39; is used. 
   * @param top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items.  Note: &#39;$skip&#39; must also be used if &#39;$top&#39; is used. 
   */
  public listInstances = (token: string, sandbox: string, filter?: string, skip?: number, top?: number) : Promise<Instance[]|PMModelError> => {
    const localVarPath = this.basePath + '/instances';
    const localVarQueryParameters: any = {};

    // verify required parameter 'sandbox' is not null or undefined
    if (sandbox === null || sandbox === undefined) {
        throw new Error('Required parameter sandbox was null or undefined when calling listInstances.');
    }

    if (sandbox !== undefined) {
        localVarQueryParameters.$sandbox = sandbox;
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
   * Returns the current State of the Process Instance, along with its current data fields (system-defined and process-defined) and values.  Information returned from this method can be updated as required and then passed to the  PUT InstanceStates method - for example, to retry the execution of a HALTED Process Instance. 
   * @summary Returns the current state and data for a specified Process Instance.
   * @param id The unique identifier of the Process Instance.
   * @param sandbox The id of the Sandbox from which to return data. (You can obtain Sandbox Ids using the GET /sandboxes method in the Authorization Engine Service.)
   */
  public getInstanceState = (token: string, id: string, sandbox: string) : Promise<InstanceState|PMModelError> => {
    const localVarPath = this.basePath + '/instanceStates/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling getInstanceState.');
    }

    // verify required parameter 'sandbox' is not null or undefined
    if (sandbox === null || sandbox === undefined) {
        throw new Error('Required parameter sandbox was null or undefined when calling getInstanceState.');
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
      return error.data;
    });  
  }

  /**
   * Updates the current State of a Process Instance, along with the values of any (process-defined) data fields.   This method can be used to manage Process Instance lifecycle, for example:  * Retry the execution of a HALTED Process Instance (by changing State from HALTED to ACTIVE).  * Cancel a Process Instance (by changing State to CANCELLED).  * Fire a timer to continue a delayed Process Instance immediately (by changing State from DELAYED to ACTIVE).  Note: The calling User must be a member of the Administrator Group to be able to use this method. 
   * @summary Updates the current state and data for a specified Process Instance.
   * @param id The unique identifier of the Process Instance.
   * @param state An &#39;InstanceState&#39; object containing:  * __state__ (required): The new State in which to place the Process Instance.  * __sandboxId__ (optional): The id of the Sandbox containing the specified Process Instance id. (You can obtain the sandboxId by using the GET /sandboxes method in the Authorization Engine Service.)   * __systemAttributes__ and __definitionAttributes__ (optional): Any updated values for data fields. 
   */
  public updateInstanceState = (token: string, id: string, state: InstanceState) : Promise<InstanceState|PMModelError> => {
    const localVarPath = this.basePath + '/instanceStates/{id}'.replace('{' + 'id' + '}', encodeURIComponent(String(id)));
    const localVarQueryParameters: any = {};

    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
        throw new Error('Required parameter id was null or undefined when calling updateInstanceState.');
    }

    // verify required parameter 'state' is not null or undefined
    if (state === null || state === undefined) {
        throw new Error('Required parameter state was null or undefined when calling updateInstanceState.');
    }

    return axios.put( localVarPath, state, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.data;
    });  
  }


  /**
   * This method can be used to:  * Create a new Case (creating an instance of a Case Creator process).  * Update an existing Case by performing a specific action (creating an instance of a Case Action process). Note: The calling User must have the appropriate permissions to execute the requested action.          Any data required to start the process can also be supplied.  In each case, you can obtain the necessary details of the process to be started from the GET /types and GET /cases methods in the Case Manager service. 
   * @summary Creates an instance of a specified Case Creator or Case Action process.
   * @param details A &#39;ProcessDetails&#39; object containing:   * __id__ (required): The id of the Case Creator process or Case Action process from which you want to start a Process Instance. (You can obtain this id by using the GET /types method in the Case Manager Service.)   * __applicationId__ (required): The id of the application that contains the specified Case Creator process or Case Action process. (You can obtain the applicationId by using the GET /types method in the Case Manager Service.)   * __sandboxId__ (required): The id of the Sandbox containing the specified applicationId. (You can obtain the sandboxId by using the GET /sandboxes method in the Authorization Engine Service.)   * __caseReference__ (optional - but see Note below): The Case reference of an existing Case for which you want to start a Case Action Process Instance. (You can obtain the caseReference by using the GET /cases method in the Case Manager Service.)     Note:       * A &#39;caseReference&#39; is __required__ when starting an Instance of a Case Action process, otherwise a 400 error is returned.       * If you supply a &#39;caseReference&#39; when starting an Instance of a Case Creator process, a 400 error is returned.    * __data__ (optional): The data that you wish to supply when starting the Process Instance. This data must conform to the JSON schema of the Case Creator process or Case Action process that you are starting. (You can obtain that JSON schema by using the GET /types method in the Case Manager Service.)   
   */
  public processCreate = (token: string, details: ProcessDetails) : Promise<ProcessDetails|PMModelError> => {
    const localVarPath = this.basePath + '/processes';
    const localVarQueryParameters: any = {};

    // verify required parameter 'details' is not null or undefined
    if (details === null || details === undefined) {
        throw new Error('Required parameter details was null or undefined when calling processCreate.');
    }

    return axios.post( localVarPath, details, {
      headers: { 'Authorization': 'Bearer ' + token },
      params: localVarQueryParameters
    }).then(response => {
      return response.data;
    }).catch(error => {
      return error.response.data;
    });  
  }
}
