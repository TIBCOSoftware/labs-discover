import { Service } from "typedi";
import { DatasetSourceTdv, FilesOperationsApi, PreviewConfigFile, SchemaPreview, SparkPreviewJobApi, TdvJob, TibcoDataVirtualizationApi } from '../backend/api';
import { DiscoverCache } from '../cache/DiscoverCache';
import { logger } from "../common/logging";
import { DatasetListItem, Dataset, DatasetUpdated, PreviewStatus } from "../models/datasets.model";
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

  public createDataset = async (token: string, dataset: Dataset): Promise<DatasetUpdated> => {
    const now = new Date().getTime();
    dataset.createdDate = now;
    dataset.updatedDate = now;
    const result = await this.cache.set(token, this.DB_NAME, dataset.Dataset_Id, JSON.stringify(dataset));
    return {
      status: result,
      datasetId: dataset.Dataset_Id
    }
  }

  public getDataset = async (token: string, id: string): Promise<Dataset> => {
    const dataset = await this.cache.get(token, this.DB_NAME, id);
    return JSON.parse(dataset) as Dataset;
  }

  public getDatasets = async (token: string): Promise<DatasetListItem[]> => {
    let datasets = await this.cache.search(token, this.DB_NAME, '*');
    return datasets.map(el => {
      return JSON.parse(el) as Dataset;
    })
    .sort((a, b) => a.createdDate && b.createdDate ? a.createdDate - b.createdDate : -1)
    .filter(dataset => !dataset.deleted)
    .map(datasetDetail => {
      return {
        datasetid: datasetDetail.Dataset_Id,
        name: datasetDetail.Dataset_Name,
        fileName: datasetDetail.Dataset_Source?.FileName,
        filePath: datasetDetail.Dataset_Source?.FilePath,
        description: datasetDetail.Dataset_Description,
        createdDate: datasetDetail.createdDate,
        status: datasetDetail.status || undefined,
        lastPreviewDate: datasetDetail.lastPreviewDate || undefined,
        type: datasetDetail.type,
        message: datasetDetail.previewStatus?.Message || undefined
      } as DatasetListItem;
    });
  }

  public deleteDataset = async (token: string, id: string): Promise<any> => {
    return this.cache.delete(token, this.DB_NAME, id);
  }

  public updateDataset = async (token: string, id: string, dataset: Dataset): Promise<DatasetUpdated> => {
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
  
  public cleanDataset = async(token: string, dataset: Dataset): Promise<any> => {
    const orgId = await this.cache.getOrgId(token);
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
      } else {
        logger.debug(`[DatasetService] The dataset [${datasetId}] is not exist when saving the status`);
      }
    }
  }

  public syncSaveStatus = async(token: string, datasetId: string, status: PreviewStatus) => {
    if (datasetId) {
      const dataset = await this.getDataset(token, datasetId);
      if (dataset) {
        dataset.previewStatus = Object.assign(dataset.previewStatus || {}, status);
        
        await this.updateDataset(token, datasetId, dataset);
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

  public saveDatasetAndPreviewData = async(token: string, dataset: Dataset): Promise<DatasetUpdated> => {
    // if (!dataset || !dataset.Dataset_Source) {
    //   return null;
    // }

    const orgId = await this.cache.getOrgId(token);

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

      logger.debug(`[DatasetService] Update or create a TDV. TdvJob: ${JSON.stringify(tdvJob)}`);


      if (dataset.Dataset_Id) {
        tdvJob.DatasetID = dataset.Dataset_Id;
        const updateTdvResp = await this.tdvService.putJobTdvRoute(tdvJob);
        
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

    let datasetUpdated: DatasetUpdated;
    if (dataset.createdDate) {
      datasetUpdated = await this.updateDataset(token, dataset.Dataset_Id, dataset);
    } else {
      datasetUpdated = await this.createDataset(token, dataset);
    }

    logger.debug(`[DatasetService] Create/Update dataset [${dataset.Dataset_Id}]`);

    await this.saveStatus(token, dataset.Dataset_Id, {
      DatasetID: dataset.Dataset_Id,
      Organisation: orgId,
      Progression: 40,
      Message: 'Update dataset...'
    } as PreviewStatus);

    logger.debug(`[DatasetService] Saved the first initial dummy preview status`);

    // sleep 2 sec to show the progress change
    await this.sleep(2000);

    this.runPreview(token, dataset, orgId);

    return datasetUpdated;
  }

  public runPreview = async(token: string, dataset: Dataset, orgId: string = ''): Promise<any> => {
    logger.debug(`[DatasetService] Start to run preview and check status. DatasetId = ${dataset.Dataset_Id}`);
    if (!orgId) {
      orgId = (await this.cache.getTokenInformation(token)).globalSubscriptionId
    }

    const schema: SchemaPreview[] = dataset.schema?.map(ele => {
      return {
        format: ele.format,
        columnName: ele.key,
        dataType: ele.type
      }
    });
    const previewResp = await this.previewApi.postJobPrevRoute({
      DatasetId: dataset.Dataset_Id,
      Organization: orgId,
      Token: token,
      schema: schema
    } as PreviewConfigFile);
    const previewJobId = previewResp.body.jobId;

    logger.debug(`[DatasetService] Save the status of 45%`);
    await this.syncSaveStatus(token, dataset.Dataset_Id, {
      DatasetID: dataset.Dataset_Id,
      Organisation: orgId,
      Progression: 45,
      Message: 'Checking preview status...'
    } as PreviewStatus);

    const finalStatuses = ['COMPLETED', 'FAILED', 'SUBMISSION_FAILED'];

    const queryPreviewStatus = async () => {
      return await new Promise<PreviewStatus>((resolve, reject) => {
        const intervalId = setInterval(() => {
          this.getDataset(token, dataset.Dataset_Id).then(
            resp => {
              if (resp.previewStatus?.Progression == 0 || resp.previewStatus?.Progression == 100) {
                resolve(resp.previewStatus);
                clearInterval(intervalId);
              }
            },
            error => {
              reject(error);
              clearInterval(intervalId);
            }
          );
        }, 3000)
      })
    };

    const queryJobStatus = async () => {
      return await new Promise<string>(resolve => {
        const intervalId = setInterval(() => {
          this.previewApi.getJobPrevRoute(previewJobId).then(
            resp => {
              logger.debug(`[DatasetService] The preview job status is ${resp.body.status}`);
              if (finalStatuses.indexOf(resp.body.status) != -1) {
                resolve(resp.body.status);
                clearInterval(intervalId);
              }
            }
          );
        }, 3000)
      })
    };

    let currentDataset;
    try {
      const previewStatus = await queryPreviewStatus();
      logger.debug('[DatasetService] The previewStatus: ' + JSON.stringify(previewStatus));

      if (previewStatus.Progression == 0) {
        let log = `[DatasetService] The preview job ${previewResp} failed`;
        if (previewStatus.Level == 'debug') {
          log += `The error detail: ${previewStatus.Message}`;
        }
        logger.info(log);
      }

      const status = await queryJobStatus();
      logger.debug('[DatasetService] After complete The queryJobStatus: ' + JSON.stringify(status));

      currentDataset = await this.getDataset(token, dataset.Dataset_Id);
      
      currentDataset.status = status;
      // currentDataset.previewStatus = previewStatus;
      currentDataset.lastPreviewDate = new Date().getTime();
    } catch(error) {
      logger.debug('[DatasetService] Failed to query preview status, the error is' + JSON.stringify(error));
      currentDataset = await this.getDataset(token, dataset.Dataset_Id);
      currentDataset.status = 'FAILED';
      currentDataset.lastPreviewDate = new Date().getTime();
    }
    
    await this.updateDataset(token, currentDataset.Dataset_Id, currentDataset);
    
    await this.previewApi.deleteJobPrevRoute(previewJobId);
  }

  /**
   * 
   * @param token 
   * @param orgId 
   * @param dataset 
   * @deprecated
   */
  public saveDatasetAndPreview = async(token: string, orgId: string, dataset: Dataset): Promise<any> => {
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

  private sleep = async (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 


}