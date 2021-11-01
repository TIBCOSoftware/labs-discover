import { Service } from "typedi";
import { logger } from "../common/logging";
import { Analysis, AnalysisRequest, AnalysisData, AnalysisMetadata, AnalysisStatus } from "../models/analysis-redis.model";
import { DiscoverCache } from "../cache/DiscoverCache";
import { cloneDeep } from 'lodash';

@Service()
export class AnalysisRedisService {

  DATABASE = 'analysis';

  constructor (
    protected cache: DiscoverCache
  ) {
    this.initActions();
    this.initProgressDescription();
  }

  public getAnalysis = async (token: string): Promise<Analysis[]> => {
    let analysis = await this.searchAnalysis(token, '*');
    const resultAnalisys = await this.formatAnalysis(analysis);
    return resultAnalisys;
  }

  public createAnalysis = async (token: string, request: AnalysisRequest): Promise<any> => {
    // Get subscription from cache
    const userInfo = await this.cache.getTokenInformation(token);

    // Get new analysisID
    const id = this.cache.obtainUUID();

    // Create analysis
    const data = {
      name: request.name,
      description: request.description,
      datasetId: request.datasetId,
      templateId: '',
      mappings: request.mappings,
      filters: request.filters,
      groups: request.groups,
      progress: 0
    } as AnalysisData;

    // Add metadata
    const metadata = {
      state: 'Process mining',
      createdBy: userInfo.firstName + ' ' + userInfo.lastName,
      createdOn: new Date().valueOf(),
      modifiedBy: userInfo.firstName + ' ' + userInfo.lastName  ,
      modifiedOn: new Date().valueOf(),
      lockedBy: '',
      lockedOn: 0
    } as AnalysisMetadata;

    // Insert analysis
    const analysis = { id: id, data, metadata };
    await this.cache.set(token, this.DATABASE, String(id), JSON.stringify(analysis));

    // Return
    return { id: id + '-' + analysis.metadata.modifiedOn };
  }

  public getAnalysisDetails = async (token: string, id: string, version: string): Promise<Analysis> => {
    const cases = await this.searchAnalysis(token, id);
    if (cases.length == 0){
      return {} as Analysis;
    }
    const resultAnalisys = await this.formatAnalysis(cases);
    return resultAnalisys[0];
  }

  public updateAnalysis = async (token: string, id: string, version: string, analysisRequest: AnalysisRequest): Promise<any> => {
    // Get subscription from cache
    const userInfo = await this.cache.getTokenInformation(token);

    // Get current value
    let payload = JSON.parse(await this.cache.get(token, this.DATABASE, id)) as Analysis;

    // Add the data
    payload.data = { ...payload.data, ...analysisRequest };

    // Update metadata
    payload.metadata.modifiedBy = userInfo.firstName + ' ' + userInfo.lastName;
    payload.metadata.modifiedOn = new Date().valueOf();

    const result = await this.cache.set(token, this.DATABASE, id, JSON.stringify(payload), undefined, true, 'metadata.modifiedOn', version);
    
    return this.getAnalysisDetails(token, id, version);
  }

  public deleteAnalysis = async (token: string, id: string, version: string): Promise<any> => {
    logger.debug('deleteAnalysis: token: ' + token + ' ID: ' + id + ' version: ' + version);

    // Get current value
    let payload = JSON.parse(await this.cache.get(token, this.DATABASE, id)) as Analysis;

    // Check if it is the same version
    if (payload.metadata.modifiedOn == Number(version)){
      return await this.cache.delete(token, this.DATABASE, id);
    } else {
      logger.error('Not same version')
      return 'KO';
    }
  }
  
  public setAnalysisTemplate = async (token: string, id: string, version: string, templateId: string): Promise<any> => {
    // Get subscription from cache
    const userInfo = await this.cache.getTokenInformation(token);

    const analysis: Analysis[] = await this.searchAnalysis(token, id);
    const data = {
      id: analysis[0].id,
      data: {
        ...analysis[0].data,
        templateId: templateId
      },
      metadata: {
        ...analysis[0].metadata, 
        modifiedBy: userInfo.firstName + ' ' + userInfo.lastName,
        modifiedOn: new Date().valueOf()
      }
    };
    const result = await this.cache.set(token, this.DATABASE, id, JSON.stringify(data), undefined, true, 'metadata.modifiedOn', version);
    return { result: result };
  }

  public getAnalysisStatus = async (token: string, id: string): Promise<AnalysisStatus|undefined > => {
    // const statusDescription = JSON.parse(await this.cache.get('analysis', 'config', 'progress'));
    const analysisStatus = JSON.parse(await this.cache.get(token, this.DATABASE, id + '-spark-status')) as AnalysisStatus;
    if (!analysisStatus){
      return;
    }
    // const status = {
    //   progression: analysis.data.progress,
    //   message: statusDescription.filter((el: any) => el.id == analysis.data.progress)[0].description
    // } as AnalysisStatus;
    return analysisStatus;
  }

  public setAnalysisStatus = async (token: string, id: string, sparkJobResponse: any): Promise<string> => {
    return await this.cache.set(token, this.DATABASE, String(id)+'-spark-status', JSON.stringify(sparkJobResponse));
  }

  public deleteAnalysisStatus = async (token: string, id: string): Promise<number> => {
    return await this.cache.delete(token, this.DATABASE, id + '-spark-status');
  }

  public changeState = async (token: string, id: string, version: string, oldState: string, newState: string, setModification?: boolean, message?: string) : Promise<Analysis> => {
    logger.debug('analysis-redis-changeState-start: Token: ' + token + ' ID: ' + id + ' New state: ' + newState);
    let current = await this.getAnalysisDetails(token, id, version) as any;
    if (current.metadata.state === oldState){
      const userInfo = await this.cache.getTokenInformation(token);

      // It is in same state. Move to newState
      current.id = id;
      current.metadata.state = newState;
      if (setModification){
        current.metadata.modifiedBy = userInfo.firstName + ' ' + userInfo.lastName;
        current.metadata.modifiedOn = new Date().valueOf();  
      }

      if (message){
        current.metadata.message = message;
      } else {
        delete current.metadata.message;
      }

      const output = cloneDeep(current);
      delete current['actions'];

      const result = await this.cache.set(token, this.DATABASE, id, JSON.stringify(current));
      return output;
    } else {
      logger.debug('analysis-redis-changeState-start: Token: ' + token + ' ID: ' + id + ' New state: ' + newState + ' Old and new state are different');
      // It is in a different state. Don't move
      return {} as Analysis;
    }
  }

  private searchAnalysis = async (token: string, search: string): Promise<Analysis[]> => {
    logger.debug('analysis-redis-searchAnalysis-start: Token: ' + token + ' search: ' + search);
    const analysis = await this.cache.search(token, this.DATABASE, search);
    const parsedAnalysis = analysis.filter(item => !item.includes('jobName')).map(item => JSON.parse(item) as Analysis);
    logger.debug('analysis-redis-searchAnalysis: Returned ' + parsedAnalysis.length + ' analysis');
    return parsedAnalysis;
  }

  private formatAnalysis = async (analysis: Analysis[]): Promise<Analysis[]> => {
    return await Promise.all(analysis.map(async (el): Promise<any> => {
      const actions = await this.getActions(el.metadata.state);
      let resultCase: Analysis = {
        id: el.id + '-' + el.metadata.modifiedOn,
        data: el.data,
        metadata: el.metadata,
        actions: actions
      }
      return resultCase;
    }))
  }

  private getActions = async (state: string): Promise<String[]> => {
    logger.debug('Get actions for state: ' + state);
    let actions = await this.cache.get('analysis-status', 'config', state);
    logger.debug('Actions: ' + actions);
    if (actions){
      return JSON.parse(actions) as String[];
    } else {
      return [];
    }
  }

  private initActions = async (): Promise<void> => {
    const state = await this.cache.get('analysis-status', 'config', 'Added');
    if (state) {
      logger.debug('Actions are initialized');
      return 
    }
    logger.debug('Actions are not initilized. Initializing ...');

    const added: String[] = [ 'Abort', 'Edit'];
    const processMining: String[] = [ 'Abort' ];
    const ready: String[] = [ 'Archive', 'Edit', 'Rerun' ];
    const notReady: String[] = ['Edit', 'Delete', 'Rerun' ];
    const archived: String[] = [ 'Delete' ];
    const purged: String[] = [ 'Force delete' ];
    const completed: String[] = [];

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

  private initProgressDescription = async (): Promise<void> => {
    const state = await this.cache.get('analysis', 'config', 'progress');
    if (state) {
      logger.debug('Progress is already initialized');
      return 
    }
    logger.debug('Progress is not initilized. Initializing ...');

    const progress = [
      { id:  0, description: 'Starting ...'},
      { id: 10, description: 'Load Analysis Config' },
      { id: 15, description: 'Load Datasource' },
      { id: 18, description: '' },
      { id: 20, description: 'Generate Events table first pass' },
      { id: 24, description: 'Generate Attributes Table' },
      { id: 30, description: 'Generate Activities table' },
      { id: 36, description: 'Polish Events table' },
      { id: 42, description: 'Generate Variants table' },
      { id: 48, description: 'Generate Compliance table' },
      { id: 54, description: 'Generate Cases table' },
      { id: 58, description: 'Polish Events table Second pass' },
      { id: 60, description: 'Event Table Saved' },
      { id: 70, description: 'Activities Table Saved' },
      { id: 80, description: 'Variant Table Saved' },
      { id: 85, description: 'Cases Table Saved' },
      { id: 90, description: 'Variant Status Table Saved' },
      { id: 100, description: 'Thanks for your patience' },
    ]
    await this.cache.set('analysis', 'config', 'progress', JSON.stringify(progress));
    logger.debug('Progress is initilized.');

    return;
  }

  public getDatasetsDetails = async (token: string, id: string): Promise<any> => {
    // const claims = await this.aes.getClaims(token) as any;
    logger.debug('GetDatasetsDetails: Token: ' + token + ' ID: ' + id);
    const datasetsDetails = await this.cache.get((await this.cache.getTokenInformation(token)).globalSubscriptionId, 'datasets', id);
    return JSON.parse(datasetsDetails);
  }
}