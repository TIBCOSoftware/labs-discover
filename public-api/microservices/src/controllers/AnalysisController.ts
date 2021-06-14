import { Response } from 'koa';
import { Param, Body, Get, Post, Put, Delete, HeaderParam, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { logger } from '../common/logging';
import { Analysis, AnalysisRequest, AnalysisStatus } from '../models/analysis.model';
import { AnalysisService } from '../services/analysis.service';
import { PmConfigLiveApps, SparkOneTimeJobApi } from '../backend/api'
import { AuthorizatinEngineService } from '@tibco-discover/liveapps-lib';

@Service()
@JsonController('/repository')
export class AnalysisController {
  
  private aes: AuthorizatinEngineService;
  private sparkService: SparkOneTimeJobApi;
  constructor(
    private analysisService: AnalysisService
  ) {
    this.sparkService = new SparkOneTimeJobApi();
    // this.analysisService = new AnalysisService(process.env.LIVEAPPS as string, process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string));
    this.analysisService.initActions();
    this.aes = new AuthorizatinEngineService();

  }

  private preflightCheck = (token: string, response: Response): boolean | Response => {
    if (!token) {
      response.status = 401;
      return response;
    }
    return true;
  }

  public static getName = (): string => {
    return 'AnalysisController';
  }

  @Get('/analysis')
  async getAnalysis(@HeaderParam("authorization") token: string, @Res() response: Response): Promise<Analysis[] | Response> {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    return this.analysisService.getAnalysis(token.replace('Bearer ', ''));
  }

  @Post('/analysis')
  async postAnalysis(@HeaderParam("authorization") token: string, @Body() analysis: AnalysisRequest, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    const output = await this.analysisService.createAnalysis(token.replace('Bearer ', ''), analysis);
    // const output = { ID: 'PAM-0000000' };
    const datasetsDetails = await this.analysisService.getDatasetsDetails(token.replace('Bearer ', ''), analysis.Dataset);
    const claims = await this.aes.getClaims(token.replace('Bearer ', '')) as any;

    const sparkPayload: PmConfigLiveApps ={
      Schema: datasetsDetails.schema.map((el: any) => {
        return {
          format: el.format,
          ColumnName: el.key,
          DataType: el.type
        }
      }),
      Dataset_Source: {
        Source: '/services/databases/ORG_' + claims.globalSubcriptionId.toLowerCase() + '/datasets/' + analysis.Dataset
      },
      Filter: analysis.Filters as any[],
      Groups: analysis.Groups as any[],
      id: output.ID,
      token: token.replace('Bearer ', ''),
      Mapping: {
        Activity: analysis.Mapping.Activity,
        CaseID: analysis.Mapping.CaseID,
        Endtime: analysis.Mapping.Endtime,
        Otherattributes: String(analysis.Mapping.Otherattributes),
        Requester: analysis.Mapping.Requester,
        Resource: analysis.Mapping.Resource,
        Resourcegroup: analysis.Mapping.Resourcegroup,
        Scheduledend: analysis.Mapping.Scheduledend,
        Scheduledstart: analysis.Mapping.Scheduledstart,
        Starttime: analysis.Mapping.Starttime
      },
      Organization: claims.globalSubcriptionId.toLowerCase(),
      Schedule: {
        Schedule: "every5min",
        isSchedule: "false"
      }
    }
    await this.sparkService.postJobRoute(sparkPayload)
    return output;
  }

  @Get('/analysis/:name')
  public async getAnalysisDetails(@HeaderParam("authorization") token: string, @Param('name') name: string, @Res() response: Response): Promise<Analysis | Response> {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    const analysisDetail = await this.analysisService.getAnalysisDetails(token.replace('Bearer ', ''), name);
    if (!analysisDetail) {
      response.status = 404;
      return response;
    }

    return analysisDetail;
  }

  @Put('/analysis/:name')
  putAnalysis(@HeaderParam("authorization") token: string, @Param('name') name: string, @Body({ required: true }) analysis: AnalysisRequest, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    return this.analysisService.updateAnalysis(token.replace('Bearer ', ''), name, analysis);
  }

  @Delete('/analysis/:name')
  deleteAnalysis(@HeaderParam("authorization") token: string, @Param('name') name: string, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    return this.analysisService.deleteAnalysis(token.replace('Bearer ', ''), name);
  }

  @Post('/analysis/:name/template/:template')
  setAnalysisTemplate(@HeaderParam("authorization") token: string, @Param('name') name: string, @Param('template') template: string, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    return this.analysisService.setAnalysisTemplate(token.replace('Bearer ', ''), name, template);
  }

  @Post('/analysis/:name/action/:action')
  runAnalysisAction(@HeaderParam("authorization") token: string, @Param('name') name: string, @Param('action') action: string, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }

    // if (action === '19109'){

    //   this.
    // }
    return this.analysisService.executeAction(token.replace('Bearer ', ''), name, action);
  }

  @Get('/analysis/:id/status')
  public async getAnalysisStatus(@HeaderParam("authorization") token: string, @Param('id') id: string, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }

    const analysisDetail = await this.analysisService.getAnalysisStatus(token.replace('Bearer ', ''), id);
    if (!analysisDetail) {
      response.status = 404;
      return response;
    }

    return analysisDetail;
  }

  @Post('/analysis/:id/status')
  public async reportAnalysisStatus(@HeaderParam("authorization") token: string, @Param('id') id: string, @Body({ required: true }) status: AnalysisStatus, @Res() response: Response) {
    logger.debug('Status message is: ' + JSON.stringify(status));
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }

    const payload = { status: status.Progression};
    const update = await this.analysisService.executeAction(token.replace('Bearer ', ''), id, '19106', JSON.stringify(payload));
    // const update = { ID: 'PAM-000035' }

    if (status.JobName && status.Progression == 100){
      this.purgeJob(status.JobName);
    }

    return update;
  }

  private sleep = async (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 

  private purgeJob = async (jobName: string): Promise<void> => {
    let isCompleted = false;
    while (!isCompleted){
      const jobStatus = await this.sparkService.getJobRoute(jobName);
      if (jobStatus.body.status === 'COMPLETED') {
        isCompleted = true;
      } else {
        await this.sleep(5000);
      }
    }
    const output = await this.sparkService.deleteJobRoute(jobName)
  }
}