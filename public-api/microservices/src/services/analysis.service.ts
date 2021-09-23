import { Service } from "typedi";
import { logger } from "../common/logging";
import axios, { AxiosResponse } from "axios";
import { Actions, Analysis, AnalysisRequest, AnalysisStatus, Mapping } from "../models/analysis.model";
import { DiscoverCache } from "../cache/DiscoverCache";
import { AuthorizatinEngineService, CaseManagerService, Claims, GetTypeResponseItemAction, GetTypeResponseItem, ProcessManagementService, ProcessDetails } from '@tibco-discover/liveapps-lib';

@Service()
export class AnalysisService {

  private aes: AuthorizatinEngineService;
  private pms: ProcessManagementService; 
  private cms: CaseManagerService; 

  

  constructor (
    private liveappsURL: string,
    private cache: DiscoverCache,
  ) {
    // logger.info('AnalysisService constructor called with values: ');
    // logger.info('    Liveapps: ' + liveappsURL);
    // logger.info('    Redis host: ' + redisHost);
    // logger.info('    Redis port: ' + redisPort);

    // this.liveappsURL = liveappsURL;
    // this.cache = new DiscoverCache(redisHost, redisPort, this.liveappsURL);
    this.aes = new AuthorizatinEngineService();
    this.pms = new ProcessManagementService();
    this.cms = new CaseManagerService();
  }

  public getAnalysis = async (token: string, removeCompleted?: boolean): Promise<Analysis[]> => {
    const claims = await this.aes.getClaims(token) as Claims;
    let cases = await this.searchAnalysis('$' + claims.subscriptionId + '$');

    if (removeCompleted){
      cases = cases.filter(el => {
        const summary = JSON.parse(el.summary);
        return summary.state != 'Completed'
      });
    }
    const resultAnalisys = await this.formatAnalysis(cases);

    return resultAnalisys;
  }

  public createAnalysis = async (token: string, request: AnalysisRequest): Promise<any> => {
    const claims = await this.aes.getClaims(token) as Claims;
    let data: any = {
      ProcessAnalysisManagement: {...request, Organization: '$' + claims.subscriptionId + '$'}
    }

    // Create internal structure
    data.ProcessAnalysisManagement.Internal = {
      Progress: 0,
      Createdby: claims.firstName + ' ' + claims.lastName,
      Modifiedby: claims.firstName + ' ' + claims.lastName
    }
 
    const result = await this.runProcess('', '19094', JSON.stringify(data));
    data.ProcessAnalysisManagement.Internal.Casereference = result.caseReference;
    let update: any;
    while (!update) {
      await this.sleep(100);
      update = await this.runProcess(result.caseReference, '20019', JSON.stringify(data));
      logger.debug('UPDATE FIELD: ' + JSON.stringify(update));
    }
    return { ID: result.caseIdentifier };
  }

  private sleep = async (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 

  public getAnalysisDetails = async (token: string, name: string): Promise<Analysis|null> => {
    const claims = await this.aes.getClaims(token) as Claims;
    const cases = await this.searchAnalysis('$' + claims.subscriptionId + '$ ' + name);
    if (cases.length == 0){
      return null;
    }
    const resultAnalisys = await this.formatAnalysis(cases);
    return resultAnalisys[0];
  }

  public updateAnalysis = async (token: string, name: string, analysisRequest: AnalysisRequest): Promise<any> => {
    const claims = await this.aes.getClaims(token) as Claims;
    
    const commonToken = await this.cache.get('liveapps-common', 'config', 'cictoken');
    const commonSandbox = await this.cache.get('liveapps-common', 'config', 'sandbox')
    const applicationId = '3853';
    const analysis = await this.searchCases(commonToken, commonSandbox, '$' + claims.subscriptionId + '$ ' + name);

    let payloadData = {
      ProcessAnalysisManagement: { ...JSON.parse(analysis[0].untaggedCasedata), ...analysisRequest }
    }
    payloadData.ProcessAnalysisManagement.Internal.Modifiedby = claims.firstName + ' ' + claims.lastName;
    
    const payload: ProcessDetails = {
      id: '19107',
      applicationId: applicationId,
      sandboxId: commonSandbox,
      caseReference: analysis[0].caseReference,
      caseIdentifier: name,
      data: JSON.stringify(payloadData)
    };

    const result = await this.pms.processCreate(commonToken, payload) as ProcessDetails;
    return { ID: result.caseIdentifier };
  }

  public deleteAnalysis = async (token: string, name: string): Promise<any> => {
    // return this.cache.delete(token, 'templates', name);
    return;
  }
  
  public setAnalysisTemplate = async (token: string, analysis: string, template: string): Promise<any> => {
    const claims = await this.aes.getClaims(token) as Claims;
    const commonToken = await this.cache.get('liveapps-common', 'config', 'cictoken');
    const commonSandbox = await this.cache.get('liveapps-common', 'config', 'sandbox');
    const cases: any[] = await this.searchCases(commonToken, commonSandbox, analysis);
    const data = {
      ProcessAnalysisManagement: {
        Template: template,
        Internal: {...JSON.parse(cases[0].untaggedCasedata).Internal, Modifiedby: claims.firstName + ' ' + claims.lastName }
      }
    };
    const update = await this.runProcess(cases[0].caseReference, '19208', JSON.stringify(data));
    return { result: 'OK' };
  }

  public executeAction = async (token: string, name: string, actionId: string, bodyRequest?: string): Promise<any> => {
    const claims = await this.aes.getClaims(token) as Claims;
    const commonToken = await this.cache.get('liveapps-common', 'config', 'cictoken');
    const commonSandbox = await this.cache.get('liveapps-common', 'config', 'sandbox')
    const applicationId = '3853';
    const analysis = await this.searchCases(commonToken, commonSandbox, '$' + claims.subscriptionId + '$ ' + name);
    if (actionId === '19106')logger.debug('analysis for actionId: ' + actionId + ': ' + JSON.stringify(analysis));

    let payload: ProcessDetails = {
      id: actionId,
      applicationId: applicationId,
      sandboxId: commonSandbox,
      caseReference: analysis[0].caseReference,
      caseIdentifier: name
    };

    if (bodyRequest) {
      payload.data = bodyRequest
    }

    const result = await this.pms.processCreate(commonToken, payload);
    if ((result as ProcessDetails).caseIdentifier){
      return { ID: (result as ProcessDetails).caseIdentifier };
    } else {

    }
  }

  public getAnalysisStatus = async (token: string, name: string): Promise<AnalysisStatus|undefined > => {
    const claims = await this.aes.getClaims(token) as Claims;
    const cases = await this.searchAnalysis('$' + claims.subscriptionId + '$ ' + name);
    if (cases.length == 0){
      return;
    }
    const data = JSON.parse(cases[0].untaggedCasedata)
    const status = {
      Progression: data.Internal.Progress,
      Message: 'TBD'
    } as AnalysisStatus;
    return status;
  }

  private searchAnalysis = async (search: string): Promise<any[]> => {
    const commonToken = await this.cache.get('liveapps-common', 'config', 'cictoken');
    const commonSandbox = await this.cache.get('liveapps-common', 'config', 'sandbox')
    const cases: any[] = await this.searchCases(commonToken, commonSandbox, search);

    return cases;
  }

  private formatAnalysis = async (cases: any[]): Promise<Analysis[]> => {
    return await Promise.all(cases.map(async (el): Promise<any> => {
      const caseData = JSON.parse(el.untaggedCasedata);
      const actions = await this.getActions(caseData.state);
      let resultCase: Analysis = {
        data: {
          ID: caseData.ID,
          Name: caseData. Name,
          Description: caseData.Description,
          Dataset: caseData.Dataset,
          Template: caseData.Template,
          State: caseData.state,
          Mapping: caseData.Mapping as Mapping,
          Filters: [],
          Groups: []
        },
        metadata: {
          createdBy: caseData.Internal.Createdby,
          createdOn: el.metadata.creationTimestamp,
          modifiedBy: caseData.Internal.Modifiedby,
          modifiedOn: el.metadata.modificationTimestamp
        },
        actions: actions
      }
      return resultCase;
    }))
  }

  private searchCases = async (token: string, sandboxId: string, search: string): Promise<any[]> => {
    let url = this.liveappsURL + '/case/v1/cases';
    url += '?$search=' + search + '&$sandbox=' + sandboxId + '&$filter=applicationId eq ' + '3853' + ' and typeId eq 1' + '&$select=cr, c, uc, s, m&$top=100'; 
    return await axios.get( url,
    {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(response => {
      return response.data;
    }).catch(_error => {
      return [];
    });    
  }

  private runProcess = async(caseReference: string, id: string, data: string): Promise<any> => {    
    let url = this.liveappsURL + '/process/v1/processes';
    const commonToken = await this.cache.get('liveapps-common', 'config', 'cictoken');
    const commonSandbox = await this.cache.get('liveapps-common', 'config', 'sandbox')
    const applicationId = '3853';
    let request: any = {
      id: id,
      applicationId: applicationId,
      sandboxId: commonSandbox,
    };
    if (caseReference !== '') request.caseReference = caseReference
    if (data !== '') request.data = data;

    return axios.post( url, request,
    {
      headers: {
        'Authorization': 'Bearer ' + commonToken
      }
    }).then(response => {
      return response.data;
    }).catch(_error => {
      logger.error(_error);
      return;
    });    

  }

  private getActions = async (state: string): Promise<Actions[]> => {
    const actions = await this.cache.get('analysis-status', 'config', state);
    return JSON.parse(actions) as Actions[];
  }

  public initActions = async (): Promise<void> => {
    const state = await this.cache.get('analysis-status', 'config', 'Added');
    if (state) {
      logger.debug('Actions are initialized');
      return 
    }
    logger.debug('Actions are not initilized. Initializing ...');

    const commonToken = await this.cache.get('liveapps-common', 'config', 'cictoken');
    const commonSandbox = await this.cache.get('liveapps-common', 'config', 'sandbox')
    const applicationId = '3853';
    const types = await this.cms.getTypes(commonToken, commonSandbox, 'ac', 'isCase eq TRUE and applicationId eq ' + applicationId) as GetTypeResponseItem[];

    const added: Actions[] = [
      {label: 'Abort', id: this.getActionId('Abort', types[0].actions as GetTypeResponseItemAction[])},
      {label: 'Edit', id: this.getActionId('Edit', types[0].actions as GetTypeResponseItemAction[])}
    ];
    const processMining: Actions[] = [
      { label: 'Abort', id: this.getActionId('Abort', types[0].actions as GetTypeResponseItemAction[])}
    ];
    const ready: Actions[] = [
      { label: 'Archive', id: this.getActionId('Archive', types[0].actions as GetTypeResponseItemAction[])},
      { label: 'Edit', id: this.getActionId('Edit', types[0].actions as GetTypeResponseItemAction[])},
      { label: 'Rerun', id: this.getActionId('Rerun', types[0].actions as GetTypeResponseItemAction[])}
    ];
    const notReady: Actions[] = [
      { label: 'Edit', id: this.getActionId('Edit', types[0].actions as GetTypeResponseItemAction[])},
      { label: 'Delete', id: this.getActionId('Purge', types[0].actions as GetTypeResponseItemAction[])},
      { label: 'Rerun', id: this.getActionId('Rerun', types[0].actions as GetTypeResponseItemAction[])}
    ];
    const archived: Actions[] = [
      { label: 'Delete', id: this.getActionId('Purge', types[0].actions as GetTypeResponseItemAction[])}
    ];
    const purged: Actions[] = [
      { label: 'Force delete', id: this.getActionId('Force delete', types[0].actions as GetTypeResponseItemAction[])}
    ];
    const completed: Actions[] = [];


    await this.cache.set('analysis-status', 'config', 'Added', JSON.stringify(added));
    await this.cache.set('analysis-status', 'config', 'Process mining', JSON.stringify(processMining));
    await this.cache.set('analysis-status', 'config', 'Ready', JSON.stringify(ready));
    await this.cache.set('analysis-status', 'config', 'Not ready', JSON.stringify(notReady));
    await this.cache.set('analysis-status', 'config', 'Archived', JSON.stringify(archived));
    await this.cache.set('analysis-status', 'config', 'Purged', JSON.stringify(purged));
    await this.cache.set('analysis-status', 'config', 'Completed', JSON.stringify(completed));
    logger.debug('Actions are initilized.');

    return;
  }

  private getActionId = (actionName: string, actions: GetTypeResponseItemAction[]): string => {
    return actions.filter(el => el.name === actionName)[0].id as string
    
  }

  public getDatasetsDetails = async (token: string, id: string): Promise<any> => {
    const claims = await this.aes.getClaims(token) as any;
    logger.debug('222222 ******** ' + JSON.stringify(claims));
    const datasetsDetails = await this.cache.get(claims.globalSubscriptionId, 'datasets', id);
    return JSON.parse(datasetsDetails);
  }
}