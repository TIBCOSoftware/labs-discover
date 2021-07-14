import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { parse } from 'papaparse';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, delay, filter, map, repeatWhen, take } from 'rxjs/operators';
import { ActionPerformedLoginValidate, Schema, UploadFileResponse } from '../models_ui/backend';
import { Dataset, DatasetListItem, DatasetListItemArray } from '../models_ui/dataset';
import { DiscoverBackendService } from './discover-backend.service';
import { OauthService } from './oauth.service';


@Injectable({
  providedIn: 'root'
})

export class DatasetService {

  private baseUrl = 'https://discover.labs.tibcocloud.com/catalog';

  constructor(
    private http: HttpClient,
    private oService: OauthService,
    protected backendService: DiscoverBackendService
  ) {
    if (!oService.isCloud()) {
      this.baseUrl = '/catalog';
    }
  }

  public getDatasets(): Observable<DatasetListItem[]> {
    const url = '/datasets';
    return this.callApi(url, 'get', null)
      .pipe(
        map(resp => {
          return new DatasetListItemArray().deserialize(resp).listItems;
        })
      );
  }

  public getPreview = (id: string): Observable<any> => {
    const url = '/dataset/preview/' + id;
    return this.callApi(url, 'get', null).pipe(
      map((resp: any) => {
        return parse(resp.content, {header: true});
      })
    );
  }

  public createDataset(dataset: Dataset): Observable<any> {
    const url = '/dataset';
    return this.callApi(url, 'post', dataset);
  }

  public updateDataset(dataset: Dataset): Observable<any> {
    const url = `/dataset/${dataset.Dataset_Id}`;
    return this.callApi(url, 'put', dataset);

  }

  public getDataset(id: string): Observable<Dataset> {
    const url = '/dataset/' + id;
    return this.callApi(url, 'get', null)
      .pipe(
        map(resp => {
          return new Dataset().deserialize(resp);
        })
      );
  }

  public deleteDataset(id: string) {
    const url = `/dataset/${id}`;
    return this.callApi(url, 'delete', null)
      .pipe(
        map(resp => {
          return resp;
        })
      );
  }

  public isExist(name: string, id: string | null): Observable<any> {
    const url = '/dataset/exist';
    const body = {
      Dataset_Name: name
    };
    if (id) {
      body['Dataset_Id'] = id;
    }
    return this.callApi(url, 'post', body);
  }

  private callApi(url: string, method: string = 'GET', body: any = null) {
    url = this.baseUrl + url;
    const options = this.generateOptions();
    if (method.toUpperCase() === 'POST') {
      return this.http.post(url, body, options);
    } else if (method.toUpperCase() === 'PUT') {
      return this.http.put(url, body, options);
    } else if (method.toUpperCase() === 'DELETE') {
      return this.http.delete(url, options);
    } else {
      return this.http.get(url, options);
    }
  }

  private generateOptions = () => {
    return {
      withCredentials: true
    };
  }

  public localizeUrl(url: string): string {
    url = url.replace(/\s/g, '');
    url = url.replace(/^(http:\/\/|https:\/\/)/, '');
    const p = url.indexOf('/');
    if (p !== -1) {
      url = url.substr(p + 1);
    }
    if (url.indexOf('/') !== 0) {
      url = '/' + url;
    }
    return url;
  }

  public getStatus(id: string): Observable<any> {
    const url = `/status/${id}`;
    return this.callApi(url, 'get', null);
  }

  public saveDatasetAndPreview(dataset: Dataset): Observable<any> {
    const url= '/dataset/preview';
    return this.callApi(url, 'post', dataset);
  }

  public refreshPreview(datasetId: string): Observable<any> {
    const url = `/preview/${datasetId}`;
    return this.callApi(url, 'post', null);
  }

  public getCsvFiles(): Observable<any> {
    const url = '/files';
    return this.callApi(url, 'get');
  }

  public deleteCsvFile(filename: string): Observable<any> {
    const url = `/files/${filename}`;
    return this.callApi(url, 'delete');
  }

  public getCsvFilePreview(filename: string): Observable<any> {
    const url = `/files/preview/${filename}`;
    return this.callApi(url, 'get');
  }

  public getTdvData(id: string): Observable<any> {
    const url = `/tdv/data/${id}`;
    return this.callApi(url, 'get');
  }

  /** some service orchestration  **/

  public uploadFileAndSaveDatasetAndPreview(dataset: Dataset, progress: any, file: File): Observable<Dataset> {
    return this.backendService.login().pipe(
      concatMap((response: ActionPerformedLoginValidate) => {
        if (file) {
          // upload file
          progress.status = "Uploading csv file. Please don't close browser or refresh page";
          progress.percentage += 10;
          return this.backendService.uploadFile(response.orgId, file, dataset.Dataset_Source).pipe(
            map((uploadFileResponse: UploadFileResponse) => {
              return {uploadFileResponse, orgId: response.orgId.toLowerCase()};
            })
          );
        } else {
          return of({
            orgId: response.orgId.toLowerCase(),
            uploadFileResponse: undefined
          })
        }
      })
    ).pipe(
      concatMap(resp => {
        const orgId = resp.orgId;
        if (resp.uploadFileResponse) {
          dataset.Dataset_Source.FilePath = resp.uploadFileResponse.file;
        }
        const action = dataset.Dataset_Id ? 'Updating' : 'Creating';
        progress.status = `${action} data virtualization. Please don't close browser or refresh page`;
        progress.percentage += 10;
        return this.saveDatasetAndPreview(dataset);
      })
    ).pipe(
      concatMap(resp => {
        const datasetId = resp.datasetId;
        return this.getStatus(datasetId).pipe(
          repeatWhen(obs => obs.pipe(delay(1000))),
          filter(data => {
            if (data.Progression != 0) {
              progress.percentage = data.Progression;
              progress.status = data.Message;
            }
            return data.Progression != null && (data.Progression == 100 || data.Progression == 0)
          }),
          take(1)
        );
      })
    ).pipe(
      concatMap((resp) => {
        const datasetId = resp.DatasetID;
        return this.getDataset(datasetId).pipe(
          repeatWhen(obs => obs.pipe(delay(1000))),
          filter(data => data.status == 'COMPLETED' || data.status == 'FAILED' || data.status == 'SUBMISSION_FAILED'),
          take(1)
        );
      })
    );
  }

  public pollPreviewStatus(datasetId: string, progress: any): Observable<any> {
    return this.getStatus(datasetId).pipe(
      repeatWhen(obs => obs.pipe(delay(2000))),
      filter(data => {
        if (data.Progression != 0) {
          progress.percentage = data.Progression;
          progress.status = data.Message;
        }
        return progress.stop == true || (data.Progression != null && (data.Progression == 100 || data.Progression == 0))
      }),
      take(1)
    ).pipe(
      concatMap((resp) => {
        const sparkAppName = resp.JobName;
        if (sparkAppName) {
          // the preview is already deleted, so no way to check final status from it, should check dataset detail to get final status
          return this.getDataset(datasetId).pipe(
            repeatWhen(obs => obs.pipe(delay(1000))),
            filter(data => progress.stop == true || (data.status == 'COMPLETED' || data.status == 'FAILED' || data.status == 'SUBMISSION_FAILED')),
            take(1)
          );
        } else {
          // In theory this only happens when the status polling is stopped
          return of({
            DatasetID: datasetId
          });
        }
      })
    );
  }

  public refresh(datasetId: string, progress: any): Observable<any> {
    return this.refreshPreview(datasetId).pipe(
      concatMap(resp => {
        return of({});
      })
    ).pipe(
      concatMap(resp => {
        return this.pollPreviewStatus(datasetId, progress);
      })
    );
  }

  public pullPreviewData(dataset: Dataset): Observable<any> {
    if (dataset.type == 'tdv') {
      if (dataset.TdvView) {
        // create from tdv view
        return this.backendService.login().pipe(
          concatMap(resp => {
            const orgId = resp.orgId;
            if (dataset.Dataset_Id) {
              return of({
                orgId,
                datasetId: dataset.Dataset_Id
              });
            } else {
              return this.backendService.copyUnmanagedTdv(orgId, dataset.TdvView).pipe(
                map(copyResp => {
                  return {
                    orgId,
                    datasetId: copyResp.DatasetId
                  }
                })
              );
            }
          })
        ).pipe(
          concatMap(resp => {
            const datasetId = resp.datasetId;
            dataset.Dataset_Id = datasetId;
            const orgId = resp.orgId;
            return forkJoin([
              this.backendService.getTdvData(orgId, datasetId),
              this.backendService.getTdvMetaData(orgId, datasetId)
            ])
          })
        ).pipe(
          map(resp => {
            const dataResp = resp[0];
            const schemas: Schema[] = resp[1];
            const columns = this.convertTdvSchemaToColumns(schemas);
            return {
              jsonData: dataResp.Data,
              columns
            }
          })
        );
      }
    } else if (dataset.type == 'csv') {
      if (dataset.csvMethod == 'file' && dataset.CsvFile) {
        dataset.Dataset_Source.Encoding = dataset.CsvFile.Encoding;
        dataset.Dataset_Source.FileEscapeChar = dataset.CsvFile.EscapeChar;
        dataset.Dataset_Source.FileName = dataset.CsvFile.OriginalFilename;
        dataset.Dataset_Source.FilePath = dataset.CsvFile.FileLocation;
        dataset.Dataset_Source.FileQuoteChar = dataset.CsvFile.QuoteChar;
        dataset.Dataset_Source.FileSeparator = dataset.CsvFile.Separator;

        return this.getCsvFilePreview(dataset.CsvFile.OriginalFilename).pipe(
          map(data => {
            if (data && data.length > 0) {
              return {
                jsonDataArray: data,
                columns: this.getColumnsFromRowData(data[0])
              };
            } else {
              return {};
            }
          })
        );
      } else if (dataset.csvMethod == 'upload' && dataset.Dataset_Id && dataset.Dataset_Source.FilePath) {
        return this.getTdvData(dataset.Dataset_Id).pipe(
          map(data => {
            console.log(data);
            if (data && data.length > 0) {
              return {
                previewData: data,
                columns: this.getColumnsFromRowData(data[0])
              };
            } else {
              return {};
            }
          })
        );

      } else {
        return of({});
      }
    } else {
      return of({});
    }
  }

  private convertTdvSchemaToColumns(schema: Schema[]) {
    return schema.map(s => s.COLUMN_NAME);
  }

  private getColumnsFromRowData(rowData: Object): any[];
  private getColumnsFromRowData(rowData: string): any[] {
    try {
      let jsonRowData;
      if (typeof rowData == 'string') {
        jsonRowData = JSON.parse(rowData);
      } else {
        jsonRowData = rowData;
      }
      const cols = [];
      for(let col in jsonRowData) {
        cols.push(col);
      }
      return cols;
    } catch(error) {
      console.error('The data of csv is invalid JSON string');
      return [];
    }
  }
}
