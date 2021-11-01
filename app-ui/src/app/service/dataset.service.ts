import { HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, delay, filter, last, map, repeatWhen, take } from 'rxjs/operators';
import { CatalogService } from '../backend/api/catalog.service';
import { Dataset } from '../backend/model/dataset';
import { DatasetSource } from '../backend/model/datasetSource';
import { SchemaTdv } from '../backend/model/schemaTdv';
import { UnManageDataSetCopy } from '../backend/model/unManageDataSetCopy';
import { DiscoverBackendService } from '../service/discover-backend.service';

@Injectable({
  providedIn: 'root'
})

export class DatasetService {

  constructor(
    protected backendService: DiscoverBackendService,
    protected catalogService: CatalogService
  ) {
  }

  public uploadFileReturnProgress(dataSource: DatasetSource, file: File) {
    return this.backendService.login().pipe(
      concatMap((response: any) => {
        if (file) {
          // return this.catalogService.uploadCsvFile('\\r\\n', dataSource.FileSeparator, dataSource.FileQuoteChar, dataSource.Encoding, dataSource.FileEscapeChar, file, 'events', true).pipe(
          return this.backendService.uploadFile(response.orgId, file, dataSource).pipe(
            map((resp: any) => {
              return {uploadFileResponse: resp};
            })
          );
        } else {
          return of({
            uploadFileResponse: null
          })
        }
      })
    )
  }

  public uploadFile(dataset: Dataset, progress: any, file: File) {
    return this.backendService.login().pipe(
      concatMap((response: any) => {
        if (file) {
          // upload file
          progress.status = 'Uploading csv file. Please don\'t close browser or refresh page';
          progress.percentage += 10;
          return this.backendService.uploadFile(response.orgId, file, dataset.Dataset_Source as any).pipe(
            map((resp: any) => {
              if (resp.type === HttpEventType.Response && resp.ok) {
                return {uploadFileResponse: resp.body, orgId: response.orgId.toLowerCase()};
              }
              
            }),
            last()
          );
        } else {
          return of({
            orgId: response.orgId.toLowerCase(),
            uploadFileResponse: undefined
          })
        }
      })
    )
  }


  public uploadFileAndSaveDatasetAndPreview(dataset: Dataset, progress: any, file: File): Observable<any> {
    return this.uploadFile(dataset, progress, file).pipe(
      concatMap(resp => {
        if (resp.uploadFileResponse) {
          dataset.Dataset_Source.FilePath = resp.uploadFileResponse.file;
        }
        const action = dataset.Dataset_Id ? 'Updating' : 'Creating';
        progress.status = `${action} data virtualization. Please don't close browser or refresh page`;
        progress.percentage += 10;
        return this.catalogService.saveDatasetAndStartPreview(dataset);
      })
    ).pipe(
      concatMap(resp => {
        const datasetId = resp.datasetId;
        return this.catalogService.getStatus(datasetId).pipe(
          repeatWhen(obs => obs.pipe(delay(1000))),
          filter(data => {
            if (data.Progression !== 0) {
              progress.percentage = data.Progression;
              progress.status = data.Message;
            }
            return data.Progression != null && (data.Progression === 100 || data.Progression === 0)
          }),
          take(1)
        );
      })
    ).pipe(
      concatMap((resp) => {
        const datasetId = resp.DatasetID;
        return this.catalogService.getDataset(datasetId).pipe(
          repeatWhen(obs => obs.pipe(delay(1000))),
          filter(data => data.status === 'COMPLETED' || data.status === 'FAILED' || data.status === 'SUBMISSION_FAILED'),
          take(1)
        );
      })
    );
  }

  public pollPreviewStatus(datasetId: string, progress: any): Observable<any> {
    return this.catalogService.getStatus(datasetId).pipe(
      repeatWhen(obs => obs.pipe(delay(2000))),
      filter(data => {
        if (data.Progression !== 0) {
          progress.percentage = data.Progression;
          progress.status = data.Message;
        }
        return progress.stop === true || (data.Progression != null && (data.Progression === 100 || data.Progression === 0))
      }),
      take(1)
    ).pipe(
      concatMap((resp) => {
        const sparkAppName = resp.JobName;
        if (sparkAppName) {
          // the preview is already deleted, so no way to check final status from it, should check dataset detail to get final status
          return this.catalogService.getDataset(datasetId).pipe(
            repeatWhen(obs => obs.pipe(delay(1000))),
            filter(data => progress.stop === true || (data.status === 'COMPLETED' || data.status === 'FAILED' || data.status === 'SUBMISSION_FAILED')),
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
    return this.catalogService.refreshPreview(datasetId).pipe(
      concatMap(resp => {
        return of({});
      })
    ).pipe(
      concatMap(resp => {
        return this.pollPreviewStatus(datasetId, progress);
      })
    );
  }

  private getPreviewDatasetId(dataset: Dataset): Observable<string> {
    if (dataset.Dataset_Id) {
      return of(dataset.Dataset_Id);
    } else {
      return this.catalogService.copyUnmanagedTdv({
        DatasetName: dataset.TdvView.DatasetName,
        Annotation: dataset.TdvView.Annotation,
        DatasetPath: dataset.TdvView.DatasetPath
      } as UnManageDataSetCopy).pipe(
        map(datasetId => {
          return datasetId
        })
      );
    }
  }

  public pullPreviewData(dataset: Dataset): Observable<any> {
    if (dataset.type === 'tdv') {
      if (dataset.TdvView) {
        // create from tdv view
        return this.getPreviewDatasetId(dataset).pipe(
          concatMap(resp => {
            const datasetId = resp;
            dataset.Dataset_Id = datasetId;
            return forkJoin([
              this.catalogService.getManagedCsvData(datasetId),
              this.catalogService.getTdvMetaData(datasetId)
            ])
          })
        ).pipe(
          map(resp => {
            const dataResp = resp[0];
            const schemas: SchemaTdv[] = resp[1];
            const columns = this.convertTdvSchemaToColumns(schemas);
            return {
              previewData: dataResp,
              columns
            }
          })
        );
      }
    } else if (dataset.type === 'csv') {
      if (dataset.csvMethod === 'file' && dataset.CsvFile) {
        dataset.Dataset_Source.Encoding = dataset.CsvFile.Encoding;
        dataset.Dataset_Source.FileEscapeChar = dataset.CsvFile.EscapeChar;
        dataset.Dataset_Source.FileName = dataset.CsvFile.OriginalFilename;
        dataset.Dataset_Source.FilePath = dataset.CsvFile.FileLocation;
        dataset.Dataset_Source.FileQuoteChar = dataset.CsvFile.QuoteChar;
        dataset.Dataset_Source.FileSeparator = dataset.CsvFile.Separator;

        return this.catalogService.getUnmanagedCsvData(dataset.CsvFile.OriginalFilename).pipe(
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
      } else if (dataset.csvMethod === 'upload' && dataset.Dataset_Id && dataset.Dataset_Source.FilePath) {
        return this.catalogService.getManagedCsvData(dataset.Dataset_Id).pipe(
          map(data => {
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

  private convertTdvSchemaToColumns(schema: SchemaTdv[]) {
    return schema.map(s => s.COLUMN_NAME);
  }

  private getColumnsFromRowData(rowData: Object): any[];
  private getColumnsFromRowData(rowData: string): any[] {
    try {
      let jsonRowData;
      if (typeof rowData === 'string') {
        jsonRowData = JSON.parse(rowData);
      } else {
        jsonRowData = rowData;
      }
      const cols = [];
      for (const col in jsonRowData) {
        if (col) {
          cols.push(col);
        }
      }
      return cols;
    } catch (error) {
      console.error('The data of csv is invalid JSON string');
      return [];
    }
  }
}
