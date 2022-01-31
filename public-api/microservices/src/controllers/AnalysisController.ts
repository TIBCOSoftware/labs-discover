import { Response } from 'koa';
import { Param, Body, Get, Post, Put, Delete, HeaderParam, JsonController, Res, QueryParam } from 'routing-controllers';
import { Service } from 'typedi';
import { logger } from '../common/logging';
import { ActionPerformedSparkSingle, MetricsApi, MiningDataApi, PmConfigLiveApps, SparkOneTimeJobApi } from '../api/backend/api';
import { AnalysisRedisService } from '../services/analysis-redis.service';
import { Analysis, AnalysisData, AnalysisRequest, AnalysisStatus } from '../models/analysis-redis.model';
import { DiscoverCache } from '../cache/DiscoverCache';
import { Template, VisualisationApi } from '../api/discover/api';

@Service()
@JsonController('/repository')
export class AnalysisController {

  constructor(
    protected analysisService: AnalysisRedisService,
    protected cache: DiscoverCache,
    protected sparkService: SparkOneTimeJobApi,
    protected miningData: MiningDataApi,
    protected metricsService: MetricsApi,
    protected templatesService: VisualisationApi
  ) {}

  public static getName = (): string => {
    return 'AnalysisController';
  }

  @Get('/analysis')
  async getAnalysis(@HeaderParam("authorization") token: string, @Res() response: Response): Promise<Analysis[] | Response> {

    const analysisData = await this.addTemplateLabel(
      token.replace('Bearer ', ''),
      (await this.analysisService.getAnalysis(token.replace('Bearer ', '')))
    );

    return this.addMetricsInformation(token.replace('Bearer ', ''), analysisData);
  }

  @Post('/analysis')
  async postAnalysis(@HeaderParam("authorization") token: string, @Body() analysis: AnalysisRequest, @Res() response: Response) {
    const output = await this.analysisService.createAnalysis(token.replace('Bearer ', ''), analysis);
    const version = output.id.slice(output.id.lastIndexOf('-') + 1);
    const id = output.id.slice(0, output.id.lastIndexOf('-'));

    let analysisData = analysis as AnalysisData;
    await this.triggerSparkJob(token.replace('Bearer ', ''), id, version, analysisData);
    return output;
  }

  @Get('/analysis/:id')
  public async getAnalysisDetails(@HeaderParam("authorization") token: string, @Param('id') id: string, @Res() response: Response): Promise<Analysis | Response> {

    const analysisDetail = (await this.addTemplateLabel(
      token.replace('Bearer ', ''),
      [await this.analysisService.getAnalysisDetails(token.replace('Bearer ', ''), id.slice(0, id.lastIndexOf('-')), id.slice(id.lastIndexOf('-') +1))]
    ))[0];

    return (await this.addMetricsInformation(token.replace('Bearer ', ''), [analysisDetail]))[0];
  }

  @Put('/analysis/:id')
  putAnalysis(@HeaderParam("authorization") token: string, @Param('id') id: string, @Body({ required: true }) analysis: AnalysisRequest, @Res() response: Response) {
    const version = id.slice(id.lastIndexOf('-') +1);
    id = id.slice(0, id.lastIndexOf('-'));

    return this.analysisService.updateAnalysis(token.replace('Bearer ', ''), id, version, analysis);
  }

  @Delete('/analysis/:id')
  public async deleteAnalysis(@HeaderParam("authorization") token: string, @Param('id') id: string, @Res() response: Response) {
    const version = id.slice(id.lastIndexOf('-') +1);
    id = id.slice(0, id.lastIndexOf('-'));
    logger.debug('Deleting analysis id: ' + id + ' Version: ' + version);
 
    let backendResponse: object;
    try {
      const header = { headers: { 'Authorization': token}};
      backendResponse = await this.miningData.deleteAnalysisRoute(id, header);
      return this.analysisService.deleteAnalysis(token.replace('Bearer ', ''), id, version);
    } catch (e: any) {
      response.status = e.statusCode as number;
      response.message = e.statusMessage as string;
      return response;
    }
  }

  @Post('/analysis/:id/template/:templateId')
  setAnalysisTemplate(@HeaderParam("authorization") token: string, @Param('id') id: string, @Param('templateId') templateId: string, @Res() response: Response) {

    const version = id.slice(id.lastIndexOf('-') + 1);
    id = id.slice(0, id.lastIndexOf('-'));

    return this.analysisService.setAnalysisTemplate(token.replace('Bearer ', ''), id, version, templateId);
  }

  @Post('/analysis/:id/action/:action')
  async runAnalysisAction(@HeaderParam("authorization") token: string, @Param('id') id: string, @Param('action') action: string, @Res() response: Response) {

    let version = id.slice(id.lastIndexOf('-') + 1);
    id = id.slice(0, id.lastIndexOf('-'));

    // Check if the action is available
    let actionResult = {};
    const storedAnalysis =await this.analysisService.getAnalysisDetails(token.replace('Bearer ', ''), id, version);
    if (!storedAnalysis.actions.includes(action)){
      response.status = 405;
      return response;
    } else {
      // Action is available
      switch (action) {
        case 'Abort':
          actionResult = await this.analysisService.changeState(token.replace('Bearer ', ''), id, version, storedAnalysis.metadata.state, 'Not ready', true, 'User aborted');
          const currentJob = await this.analysisService.getAnalysisStatus(token.replace('Bearer ', ''), id) as AnalysisStatus;
          this.purgeJob(currentJob.jobName as string, token.replace('Bearer ', ''), id, false);
          break;
        case 'Complete':
          actionResult = await this.analysisService.changeState(token.replace('Bearer ', ''), id, version, storedAnalysis.metadata.state, 'Ready', true);      
          break;
        case 'Archive':
          actionResult = await this.analysisService.changeState(token.replace('Bearer ', ''), id, version, storedAnalysis.metadata.state, 'Archived', true);
          break;
        case 'Rerun':
          actionResult = await this.analysisService.changeState(token.replace('Bearer ', ''), id, version, storedAnalysis.metadata.state, 'Process mining', true);
          version = String((actionResult as Analysis).metadata.modifiedOn);
          const sparkJob = await this.triggerSparkJob(token.replace('Bearer ', ''), id, version, storedAnalysis.data);
          const payload = {
            jobName: sparkJob.jobName,
            progression: 0, 
            level: 'INFO', 
            message: 'Init for rerun'
          }
          await this.reportAnalysisStatus(token, id+'-'+version, payload, response);
          return actionResult;
        case 'Delete':
          return this.deleteAnalysis(token, id + '-' + version, response);
        default:
          break;
      }
    }
    return actionResult;
  }

  @Get('/analysis/:id/status')
  public async getAnalysisStatus(@HeaderParam("authorization") token: string, @Param('id') id: string, @Res() response: Response) {

    const version = id.slice(id.lastIndexOf('-') + 1);
    id = id.slice(0, id.lastIndexOf('-'));

    const analysisDetail = await this.analysisService.getAnalysisStatus(token.replace('Bearer ', ''), id);
    if (!analysisDetail) {
      response.status = 404;
      return response;
    }

    return analysisDetail;
  }

  @Post('/analysis/:id/status')
  public async reportAnalysisStatus(@HeaderParam("authorization") token: string, @Param('id') id: string, @Body({ required: true }) status: AnalysisStatus, @Res() response: Response) {

    const version = id.slice(id.lastIndexOf('-') + 1);
    id = id.slice(0, id.lastIndexOf('-'));
    logger.debug('ID: ' + id + ' Version: ' + version + ' Progression: ' + status.progression);

    let analysis: Analysis;
    analysis = await this.analysisService.getAnalysisDetails(token.replace('Bearer ', ''), id, version);

    // if the level is not INFO, then it is ERROR and the analysis is moved to 'Not Ready' state
    if (status.level === 'INFO'){
      await this.analysisService.setAnalysisStatus(token.replace('Bearer ', ''), id, status);
      if (status.jobName && status.progression == 100){
        analysis = await this.analysisService.changeState(token.replace('Bearer ', ''), id, version, 'Process mining', 'Ready', false);
        // this.purgeJob(status.jobName, token.replace('Bearer ', ''), id, true);
      }
    } else {
      analysis = await this.analysisService.changeState(token.replace('Bearer ', ''), id, version, 'Process mining', 'Not ready', false, status.message);
      this.purgeJob(status.jobName as string, token, id, false);
    }
    return analysis;
  }

  private sleep = async (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 

  private triggerSparkJob = async (token: string, id: string, version: string, analysis: AnalysisData): Promise<ActionPerformedSparkSingle> => {
    logger.debug('Starting triggerSparkJob for ID: ' + id);
    const datasetsDetails = await this.analysisService.getDatasetsDetails(token.replace('Bearer ', ''), analysis.datasetId);

    const tokenInformation = await this.cache.getTokenInformation(token);

    const sparkJobPayload: PmConfigLiveApps = {
      schema: datasetsDetails.schema.map((el: any) => {
        return {
          format: el.format,
          columnName: el.key,
          dataType: el.type
        }
      }),
      datasetSource: {
        source: '/services/databases/ORG_' + tokenInformation.globalSubscriptionId + '/datasets/' + analysis.datasetId
      },
      filters: analysis.filters as any[],
      groups: analysis.groups as any[],
      id: id,
      version: version,
      token: token.replace('Bearer ', ''),
      mappings: {
        activity: analysis.mappings.activity,
        caseId: analysis.mappings.caseId,
        endTime: analysis.mappings.endTime,
        otherAttributes: analysis.mappings.otherAttributes ? String(analysis.mappings.otherAttributes): "false",
        requester: analysis.mappings.requester,
        resource: analysis.mappings.resource,
        resourceGroup: analysis.mappings.resourceGroup,
        scheduledEnd: analysis.mappings.scheduledEnd,
        scheduledStart: analysis.mappings.scheduledStart,
        startTime: analysis.mappings.startTime
      },
      organization: tokenInformation.globalSubscriptionId.toLowerCase(),
      schedule: {
        schedule: "every5min",
        isSchedule: "false"
      }
    };
    const sparkJobResponse = (await this.sparkService.postJobRoute(sparkJobPayload)).body;
    await this.analysisService.setAnalysisStatus(token, id, sparkJobResponse);
    return sparkJobResponse;    
  }

  private purgeJob = async (jobName: string, token: string, id: string, waitComplete: boolean): Promise<void> => {
    logger.debug('Purging job: ' + jobName);
    let isCompleted = false;

    if (waitComplete){
      while (!isCompleted){
        const jobStatus = await this.sparkService.getJobRoute(jobName);
        if (jobStatus.body.status === 'COMPLETED') {
          isCompleted = true;
        } else {
          await this.sleep(5000);
        }      
      } 
    }

    const output = await this.sparkService.deleteJobRoute(jobName);
    await this.analysisService.deleteAnalysisStatus(token, id);  
  }

  private async addTemplateLabel(token: string, analysis: Analysis[]): Promise<Analysis[]> {
    const header = { headers: { 'Authorization': token}};
    const templates = (await this.templatesService.getTemplates(header)).body;

    return analysis.map((analysis: Analysis) => {
      const templateName = templates.find((template: Template) => template.id === analysis.data.templateId) as Template;
      analysis.data.templateLabel = templateName?.name;
      return analysis;
    });
  }

  private async addMetricsInformation(token: string, analysis: Analysis[]): Promise<Analysis[]> {
    const orgId = (await this.cache.getTokenInformation(token)).globalSubscriptionId;
    const analysisForReportData = analysis.filter((analysis: Analysis) => analysis.metadata.state === 'Ready').map((analysis: Analysis) => analysis.id.substring(0, analysis.id.lastIndexOf('-')));
    const analysisPromises = analysisForReportData.map((el:string) => this.metricsService.getAnalysisMetricsRoute(orgId, el));
    const results = ( await Promise.all(analysisPromises.map(p => p.catch(e => e)))) as any[];
    const validResults = results.filter(result => !(result instanceof Error));

    return analysis.map((analysis: Analysis) => {
      const metrics = validResults.find((vr => analysis.id.includes(vr.response.body.data.analysisID)));
      if (metrics) {
        analysis.metrics = metrics.response.body.data.Metrics;
      };
      return analysis;
    });
  }
}