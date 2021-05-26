import { Service } from "typedi";
import { DatasetSourceTdv, FilesOperationsApi, PreviewConfigFile, SparkPreviewJobApi, TdvJob, TibcoDataVirtualizationApi } from '../backend/api';
import { DiscoverCache } from '../cache/DiscoverCache';
import { Dataset, DatasetDetail, PreviewStatus } from "../models/datasets.model";
import { AnalysisService } from './analysis.service';

@Service()
export class DatasetService {
  
  private DB_NAME = 'datasets';

  constructor (
    protected analysisService: AnalysisService,
    protected cache: DiscoverCache,
    protected tdvService: TibcoDataVirtualizationApi,
    protected fileService: FilesOperationsApi,
    protected previewApi: SparkPreviewJobApi
  ) {
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
    .filter(dataset => !dataset.deleted)
    .map(datasetDetail => {
      return {
        datasetid: datasetDetail.Dataset_Id,
        name: datasetDetail.Dataset_Name,
        fileName: datasetDetail.Dataset_Source?.FileName,
        description: datasetDetail.Dataset_Description,
        createdDate: datasetDetail.createdDate,
        status: datasetDetail.status || undefined,
        lastPreviewDate: datasetDetail.lastPreviewDate || undefined,
        type: datasetDetail.type
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

  public checkAnalysisOfDataset = async(token: string, id: string): Promise<boolean> => {
    const cannotDeleteState = ['Archived'];
    const analysisList = await this.analysisService.getAnalysis(token);
    const cannotDeleteAnalysis = analysisList.filter(el => el.data.Dataset === id && cannotDeleteState.indexOf(el.data.State) != -1)
    return cannotDeleteAnalysis.length > 0;
  }
  
  public cleanDataset = async(token: string, dataset: DatasetDetail): Promise<any> => {
    const orgId = await this.cache.getSubscriptionName(token);
    if (orgId) {
      this._alwaysResolvePromise(this.tdvService.deleteJobTdvRoute(orgId, dataset.Dataset_Id));
      if (dataset.Dataset_Source?.FileName) {
        // Now just leave the file there
        // this._alwaysResolvePromise(this.fileService.deleteRouteSegment(orgId, dataset.Dataset_Source?.FileName));
      }
      this._alwaysResolvePromise(this.deleteDataset(token, dataset.Dataset_Id));
    }
    
  }

  public saveStatus = async(token: string, datasetId: string, status: PreviewStatus) => {
    if (datasetId) {
      const dataset = await this.getDataset(token, datasetId);
      if (dataset) {
        dataset.previewStatus = Object.assign(dataset.previewStatus || {}, status);
        
        this._alwaysResolvePromise(this.updateDataset(token, datasetId, dataset));
      }
    }
  }

  /**
   * A utility method to resolve the promise no matter if the promose is resolved or rejected.
   */
  private _alwaysResolvePromise = async(promise: Promise<any>) => {
    promise.then(
      data => ({ok: true, data}),
      error => Promise.resolve({ok: false, error}));
  }

  public saveDatasetAndPreviewData = async(token: string, dataset: DatasetDetail): Promise<any> => {
    if (!dataset || !dataset.Dataset_Source) {
      return null;
    }

    const orgId = await this.cache.getSubscriptionName(token);

    // now file is uploaded if the type

    let publishedView;
    let datasetId = dataset.Dataset_Id;
    if (dataset.type != 'tdv') {
      const tdvDataSource = {
        DatasourceType: dataset.Dataset_Source.DatasourceType,
        Encoding: dataset.Dataset_Source.Encoding,
        EscapeChar: dataset.Dataset_Source.FileEscapeChar,
        FileName: dataset.Dataset_Source.FileName,
        FilePath: dataset.Dataset_Source.FilePath,
        QuoteChar: dataset.Dataset_Source.FileQuoteChar,
        Separator: dataset.Dataset_Source.FileSeparator,
        CommentsChar: "#",
        Headers: dataset.Dataset_Source.FileHeaders
      } as DatasetSourceTdv;
      const tdvJob = {
        DatasetName: dataset.Dataset_Name,
        DatasetDescription: dataset.Dataset_Description,
        DatasetSource: tdvDataSource,
        Organization: orgId
      } as TdvJob


      if (dataset.Dataset_Id) {
        tdvJob.DatasetID = dataset.Dataset_Id;
        const updateTdvResp = await this.tdvService.putJobTdvRoute(tdvJob);
        this.saveStatus(token, dataset.Dataset_Id, {
          DatasetID: dataset.Dataset_Id,
          Organisation: orgId,
          Progression: 30,
          Message: 'Update data virtualization...'
        } as PreviewStatus);
        // publishedView = updateTdvResp.body.resource;
      } else {
        const createTdvResp = await this.tdvService.postJobTdvRoute(tdvJob);
        // no dataset yet, so no way to update status
        publishedView = createTdvResp.body.publishedview;
        datasetId = createTdvResp.body.dataSetId;
        dataset.Dataset_Id = datasetId;
      }
    }

    if (publishedView) {
      dataset.PublishedView = publishedView;
    }

    this.saveDatasetAndPreview(token, orgId, dataset);

    return {
      datasetId: datasetId
    }
  }

  public runPreview = async(token: string, dataset: DatasetDetail, orgId: string = ''): Promise<any> => {
    if (!orgId) {
      orgId = await this.cache.getSubscriptionName(token);
    }
    const previewResp = await this.previewApi.postJobPrevRoute({
      DatasetId: dataset.Dataset_Id,
      Organization: orgId,
      Token: token
    } as PreviewConfigFile);
    const previewJobId = previewResp.body.jobId;

    await this.saveStatus(token, dataset.Dataset_Id, {
      DatasetID: dataset.Dataset_Id,
      Organisation: orgId,
      Progression: 45,
      Message: 'Checking preview status...'
    } as PreviewStatus);

    const finalStatuses = ['COMPLETED', 'FAILED', 'SUBMISSION_FAILED'];

    const queryStatus = async () => {
      return await new Promise<string>(resolve => {
        const intervalId = setInterval(() => {
          this.previewApi.getJobPrevRoute(previewJobId).then(
            resp => {
              if (finalStatuses.indexOf(resp.body.status) != -1) {
                resolve(resp.body.status);
                clearInterval(intervalId);
              }
            }
          );
        }, 3000)
      })
    };

    const status = await queryStatus();

    const currentDataset = await this.getDataset(token, dataset.Dataset_Id);
    currentDataset.status = status;
    currentDataset.lastPreviewDate = new Date().getTime();

    await this.updateDataset(token, currentDataset.Dataset_Id, currentDataset);
    
    await this.previewApi.deleteJobPrevRoute(previewJobId);
  }

  public saveDatasetAndPreview = async(token: string, orgId: string, dataset: DatasetDetail): Promise<any> => {
    if (dataset.createdDate) {
      await this.updateDataset(token, dataset.Dataset_Id, dataset);
    } else {
      await this.createDataset(token, dataset);
    }

    await this.saveStatus(token, dataset.Dataset_Id, {
      DatasetID: dataset.Dataset_Id,
      Organisation: orgId,
      Progression: 40,
      Message: 'Update dataset...'
    } as PreviewStatus);

    await this.runPreview(token, dataset, orgId);
  }


}