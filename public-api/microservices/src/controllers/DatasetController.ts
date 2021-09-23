import { Response } from 'koa';
import { Body, Delete, Get, HeaderParam, JsonController, Param, Post, Put, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { FilesOperationsApi, LoginApi, LoginCredentials, RedisFileInfo, TibcoDataVirtualizationApi } from '../backend/api';
import { DiscoverCache } from '../cache/DiscoverCache';
import { CsvFile, Dataset, DatasetListItem, DatasetUpdated, PreviewStatus } from '../models/datasets.model';
import { AnalysisService } from '../services/analysis.service';
import { DatasetService } from '../services/dataset.service';



@Service()
@JsonController('/catalog')
export class DatasetController {

  constructor (
    protected datasetService: DatasetService,
    protected analysisService: AnalysisService,
    private loginApi: LoginApi,
    private tdvApi: TibcoDataVirtualizationApi,
    private fileApi: FilesOperationsApi,
    private cache: DiscoverCache
  ){
  }

  public static getName = (): string => {
    return 'DatasetController';
  }

  private async preflightCheck(token: string, response: Response) {
    if (!token) {
      response.status = 400;
      return response;
    }
    // todo: the schema for /validate/login is wrong
    try {
      await this.loginApi.postValidCredsRoute({
        credentials: this.getToken(token)
      } as LoginCredentials);
    } catch(resp: any) {
      response.status = resp.statusCode;
      return response;
    }
    
    return true;
  }

  private getToken(token: string) {
    if (token.indexOf('Bearer ') == 0) {
      return token.split(' ')[1];
    }
    return token;
  }

  @Get('/datasets')
  async getAllDatasets(@HeaderParam("authorization")token: string, @Res() response: Response): Promise<DatasetListItem[] | Response> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }
    return this.datasetService.getDatasets(this.getToken(token));
    
  }

  @Get("/dataset/:id")
  async getDataset(@HeaderParam("authorization")token: string, @Param("id")id: string, @Res() response: Response): Promise<Response | Dataset> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }
    const datasetDetail = await this.datasetService.getDataset(this.getToken(token), id);
    if (!datasetDetail) {
      response.status = 404;
      return response;
    }
    // don't return preview status in detail
    // datasetDetail.previewStatus = undefined;
    // delete datasetDetail.previewStatus;
    return datasetDetail;
  }

  @Post('/dataset/exist')
  async datasetExist(@HeaderParam("authorization")token: string, @Res() response: Response, @Body() body: {[key: string]: string}): Promise<{[key: string]: boolean} | Response> {
    const name = body['Dataset_Name'];
    if (!name) {
      response.status = 400;
      return response;
    }

    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }
    return {
      exist: await this.datasetService.isDatasetExist(this.getToken(token), body)
    }
  }

  @Post("/dataset")
  async createDataset(@HeaderParam("Authorization") token: string, @Res() response: Response, @Body() body: Dataset): Promise<Response | DatasetUpdated> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    if (!body.Dataset_Name) {
      response.status = 400;
      return response;
    }

    if (await this.datasetService.isDatasetExist(token, {"Dataset_Name": body.Dataset_Name})) {
      response.status = 409;
      return response;
    }

    return await this.datasetService.createDataset(this.getToken(token), body);
  }

  @Post("/dataset/preview")
  async saveDatasetAndPreview(@HeaderParam("Authorization") token: string, @Res() response: Response, @Body() body: Dataset): Promise<Response | DatasetUpdated> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    if (!body || !body.Dataset_Source) {
      response.status = 400;
      return response;
    }

    const resp = this.datasetService.saveDatasetAndPreviewData(this.getToken(token), body);
    // response.status = 204;
    return resp;
  }

  @Post("/preview/:id")
  async refreshPreview(@HeaderParam("Authorization") token: string, @Res() response: Response, @Param("id")id: string): Promise<Response> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    const dataset = await this.datasetService.getDataset(this.getToken(token), id);

    if (!dataset) {
      response.status = 404;
      return response;
    }

    this.datasetService.runPreview(this.getToken(token), dataset);
    response.status = 204;
    return response;
  }

  @Put("/dataset/:id")
  async updateDataset(@HeaderParam("Authorization") token: string, @Param("id")id: string, @Res() response: Response, @Body() body: Dataset): Promise<Response | DatasetUpdated> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    if (!body.Dataset_Name) {
      response.status = 400;
      return response;
    }

    // the id in the path is not the same as the id in the payload
    if (id != body.Dataset_Id) {
      response.status = 400;
      return response;
    }

    const dataset = await this.datasetService.getDataset(this.getToken(token), id);
    if (!dataset) {
      response.status = 404;
      return response;
    }

    body = Object.assign(dataset, body);
    if (await this.datasetService.isDatasetExist(token, {"Dataset_Name": body.Dataset_Name, "Dataset_Id": body.Dataset_Id})) {
      response.status = 409;
      return response;
    }

    return await this.datasetService.updateDataset(this.getToken(token), body.Dataset_Id, body);;
  }

  @Delete('/dataset/:id')
  async deleteDataset(@HeaderParam("Authorization") token: string, @Param("id")id: string, @Res() response: Response) {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    const oauthToken = this.getToken(token);

    // step 1, get the dataset
    const dataset = await this.datasetService.getDataset(oauthToken, id);
    if (!dataset) {
      response.status = 404;
      return response;
    }

    // step 2: check analysis state to see whether it can be deleted
    const foundPersistDataset = await this.datasetService.checkAnalysisOfDataset(oauthToken, id);

    if (foundPersistDataset) {
      // the dataset can not be deleted due to the associated analysis state 
      response.status = 409;
      return response;
    }

    // step 3, mark the dataset to be deleted and update it 
    dataset.deleted = true;
    await this.datasetService.updateDataset(this.getToken(token), id, dataset);

    // step 4. launch to delete tdv and s3 file connected with it and delete the entry in dataset table    
    // don't wait it finished
    this.datasetService.cleanDataset(oauthToken, dataset);

    response.status = 204;
    return response;
  }

  @Post('/status')
  async saveStatus(@HeaderParam("Authorization") token: string, @Res() response: Response, @Body() body: PreviewStatus) {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    if (!body.DatasetID || body.Progression == null) {
      response.status = 400;
      return response;
    }

    const dataset =  await this.datasetService.getDataset(this.getToken(token), body.DatasetID);
    if (!dataset) {
      response.status = 404;
      return response;
    }

    dataset.previewStatus = body;
    return await this.datasetService.updateDataset(this.getToken(token), body.DatasetID, dataset);
  }

  @Get('/status/:id')
  async getStatus(@HeaderParam("authorization")token: string, @Param("id")id: string, @Res() response: Response): Promise<Response | PreviewStatus | any> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }
    const datasetDetail = await this.datasetService.getDataset(this.getToken(token), id);
    if (!datasetDetail) {
      response.status = 404;
      return response;
    }
    return datasetDetail.previewStatus || {};
  }

  @Get('/files')
  async getCsvFiles(@HeaderParam("authorization")token: string, @Res() response: Response): Promise<Response | CsvFile[]> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    const oauthToken = this.getToken(token);
    const orgId = await this.cache.getOrgId(oauthToken);

    const resp = await this.fileApi.getRouteFileV2(orgId);
    const datasets = await this.datasetService.getDatasets(oauthToken);

    const files: any = {};
    for (const dataset of datasets) {
      if (dataset.filePath) {
        files[dataset.filePath] = 1;
      }
    }

    const existFiles: RedisFileInfo[] = resp.body.list;
    const csvFiles: CsvFile[] = existFiles.map(file => {
      return {
        redisFileInfo: file,
        beingUsed: files[file.FileLocation] === 1
      } as CsvFile
    });
    
    return csvFiles;
  }

  @Delete('/files/:filename')
  async deleteCsvFile(@HeaderParam("authorization")token: string, @Param("filename")filename: string, @Res() response: Response): Promise<Response> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    const oauthToken = this.getToken(token);
    const orgId = await this.cache.getOrgId(oauthToken);

    const datasets = await this.datasetService.getDatasets(oauthToken);

    const files: any = {};
    let beingUsed = false;
    for (const dataset of datasets) {
      if (dataset.fileName && dataset.fileName == filename) {
        beingUsed = true;
        break;
      }
    }

    if (beingUsed) {
      response.status = 409;
      return response;
    }

    try {
      await this.fileApi.deleteRouteSegment(orgId, filename);
    } catch(error) {
      response.status = 406;
      return response;
    }

    response.status = 204;
    return response;
  }

  @Get('/files/preview/:filename')
  async getCsvFilePreview(@HeaderParam("authorization")token: string, @Param("filename")filename: string, @Res() response: Response): Promise<Response | string[]> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    const oauthToken = this.getToken(token);
    const orgId = await this.cache.getOrgId(oauthToken);

    try {
      const resp = await this.fileApi.getPreviewRoute(orgId, filename);
      return resp.body.data;
    } catch(error: any) {
      response.status = error.statusCode;
      return response;
    }
  }

  @Get('/tdv/data/:id')
  async getTdvData(@HeaderParam("authorization")token: string, @Param("id")id: string, @Res() response: Response): Promise<Response | string> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }

    const oauthToken = this.getToken(token);
    const orgId = await this.cache.getOrgId(oauthToken);

    try {
      const resp = await this.tdvApi.getDataJobTdvRoute(orgId, id);
      return resp.body.Data;
    } catch(error: any) {
      response.status = error.statusCode;
      return response;
    }
    
  }

}