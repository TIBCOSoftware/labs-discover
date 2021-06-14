import { Response } from 'koa';
import { Body, Delete, Get, HeaderParam, JsonController, Param, Post, Put, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { DatasetDetail, Dataset, PreviewStatus } from '../models/datasets.model';
import { CommonService } from '../services/common.service';
import { DatasetService } from '../services/dataset.service';

@Service()
@JsonController('/catalog')
export class DatasetController {

  constructor (
    protected datasetService: DatasetService,
    protected commonService: CommonService
  ){}

  private async preflightCheck(token: string, response: Response) {
    if (!token) {
      response.status = 400;
      return response;
    }
    const resp = await this.commonService.validateToken(this.getToken(token));
    if (resp.status != 200) {
      response.status = resp.status;
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
  async getAllDatasets(@HeaderParam("authorization")token: string, @Res() response: Response): Promise<Dataset[] | Response> {
    const check = await this.preflightCheck(token, response);

    if (check !== true) {
      return check;
    }
    return this.datasetService.getDatasets(this.getToken(token));
    
  }

  @Get("/dataset/:id")
  async getDataset(@HeaderParam("authorization")token: string, @Param("id")id: string, @Res() response: Response): Promise<Response | DatasetDetail> {
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
    datasetDetail.previewStatus = undefined;
    delete datasetDetail.previewStatus;
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
  async createDataset(@HeaderParam("Authorization") token: string, @Res() response: Response, @Body() body: DatasetDetail): Promise<any> {
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

  @Put("/dataset/:id")
  async updateDataset(@HeaderParam("Authorization") token: string, @Param("id")id: string, @Res() response: Response, @Body() body: DatasetDetail): Promise<any> {
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

    const result = await this.datasetService.deleteDataset(this.getToken(token), id);
    if (!result) {
      response.status = 404;
      return response;
    }

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

}