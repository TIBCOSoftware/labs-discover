import { DiscoverCache } from '@tibco-discover/redis-lib';
import { Service } from "typedi";
import { DatasetDetail, Dataset } from "../models/datasets.model";

@Service()
export class DatasetService {

  private cache: DiscoverCache;
  private DB_NAME = 'datasets';

  constructor () {
    const redisHost = process.env.REDIS_HOST as string;
    const redisPort = Number(process.env.REDIS_PORT as string);
    const liveappsUrl = process.env.LIVEAPPS as string;
    this.cache = new DiscoverCache(redisHost, redisPort, liveappsUrl);
  }

  public createDataset = async (token: string, dataset: DatasetDetail): Promise<any> => {
    const now = new Date().getTime();
    dataset.createdDate = now;
    dataset.updatedDate = now;
    const result = await this.cache.set(token, this.DB_NAME, dataset.Dataset_Id, JSON.stringify(dataset));
    return {
      status: result,
      datasetId: dataset.Dataset_Id
    }
  }

  public getDataset = async (token: string, id: string): Promise<DatasetDetail> => {
    const dataset = await this.cache.get(token, this.DB_NAME, id);
    return JSON.parse(dataset) as DatasetDetail;
  }

  public getDatasets = async (token: string): Promise<Dataset[]> => {
    let datasets = await this.cache.search(token, this.DB_NAME, '*');
    return datasets.map(el => {
      return JSON.parse(el) as DatasetDetail;
    })
    .sort((a, b) => a.createdDate && b.createdDate ? a.createdDate - b.createdDate : -1)
    .map(datasetDetail => {
      return {
        datasetid: datasetDetail.Dataset_Id,
        name: datasetDetail.Dataset_Name,
        fileName: datasetDetail.Dataset_Source?.FileName,
        description: datasetDetail.Dataset_Description,
        createdDate: datasetDetail.createdDate,
        status: datasetDetail.status || undefined,
        lastPreviewDate: datasetDetail.lastPreviewDate || undefined
      } as Dataset;
    });
  }

  public deleteDataset = async (token: string, id: string): Promise<any> => {
    return this.cache.delete(token, this.DB_NAME, id);
  }

  public updateDataset = async (token: string, id: string, dataset: DatasetDetail): Promise<any> => {
    const now = new Date().getTime();
    dataset.updatedDate = now;
    const result = await this.cache.set(token, this.DB_NAME, id, JSON.stringify(dataset));
    return {
      status: result,
      datasetId: id
    }
  }

  public isDatasetExist = async(token: string, body: {[key: string]: string}): Promise<boolean> => {
    const datasetId = body['Dataset_Id'];
    const name = body['Dataset_Name'];

    const datasets = await this.getDatasets(token);
    const filteredDatasets = datasets.filter(d => d.datasetid != datasetId && d.name == name);
    return filteredDatasets.length > 0;
  }
  
}