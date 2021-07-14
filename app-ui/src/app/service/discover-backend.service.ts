import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActionPerformed4, ActionPerformedLoginValidate, ActionPerformedPreview, ActionPerformedTDVCreate, ActionPerformedUpdate, PreviewConfigFile, PublishedTdvDataset, PublishedViews, Schema, TdvJob, UploadFileResponse } from '../models_ui/backend';
import { DatasetDataSource } from '../models_ui/dataset';
import { OauthService } from './oauth.service';
import { ParsingService } from './parsing.service';


@Injectable({
  providedIn: 'root'
})

export class DiscoverBackendService {


  private baseUrl = 'https://discover.labs.tibcocloud.com';

  constructor(
    private http: HttpClient,
    private oauthService: OauthService,
    private parsingService: ParsingService
  ) {
    if (!oauthService.isCloud()) {
      this.baseUrl = '/api';
    }
  }

  /**
   * Upload file to the Discover backend storage which is S3 now.
   * Ref: https://discover.labs.tibcocloud.com/swagger#/Files%20Operations/postRouteFile
   * @param orgId The organization id.
   * @param file The File instance of the file.
   * @param fileName The file name.
   * @returns
   */
  public uploadFile(orgId: string, file: File, dataSource: DatasetDataSource): Observable<UploadFileResponse> {
    const url = `/files/${orgId.toLowerCase()}`;
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'multipart/form-data',
      'filename': dataSource.FileName,
      'enctype': 'multipart/form-data'
    });
    const formData: FormData = new FormData();
    formData.append('newline', '\\r\\n');
    formData.append('encoding', this.parsingService.getJavaIOEncoding(dataSource.Encoding));
    formData.append('separator', dataSource.FileSeparator);
    formData.append('quoteChar', dataSource.FileQuoteChar);
    formData.append('escapeChar', dataSource.FileEscapeChar);
    formData.append('csv', file);
    return this.callApi(url, 'post', formData, {... headers}).pipe(
      map(response => {
        return response as UploadFileResponse;
      })
    );
  }

  public deleteFile(orgId: string, filename: string) {
     const url = `/files/${orgId}/${filename}`;
     return this.callApi(url, 'delete');
  }

  public downloadFile(path: string): Observable<Blob> {
    return this.http.get(path, {
      responseType: 'blob',
      withCredentials: true
    });
  }

  public createTdvForCsv(tdvJob: TdvJob): Observable<ActionPerformedTDVCreate> {
    const url = '/tdv/managed/csv';
    return this.callApi(url, 'post', tdvJob).pipe(
      map(response => {
        return response as ActionPerformedTDVCreate;
      })
    );
  }

  public updateTdvForCsv(tdvJob: TdvJob): Observable<ActionPerformedUpdate> {
    const url = '/tdv/managed/csv';
    return this.callApi(url, 'put', tdvJob).pipe(
      map(response => {
        return response as ActionPerformedUpdate;
      })
    );
  }

  public login(): Observable<ActionPerformedLoginValidate> {
    const url = '/login/validate';
    let token = this.oauthService.token;
    return this.callApi(url, 'post', {
      "credentials": token
    }).pipe(
      map(response => {
        return response as ActionPerformedLoginValidate;
      })
    );
  }

  public triggerPreview(config: PreviewConfigFile): Observable<ActionPerformedPreview> {
    const url = '/preview';
    return this.callApi(url, 'post', config).pipe(
      map(response => {
        return response as ActionPerformedPreview;
      })
    );
  }

  public getTdvData(orgId: string, datasetId: string): Observable<ActionPerformed4> {
    const url = `/tdv/data/${orgId}/${datasetId}`;
    return this.callApi(url, 'get').pipe(
      map(response => {
        return response as ActionPerformed4;
      })
    );
  }

  public getTdvMetaData(orgId: string, datasetId: string): Observable<Schema[]> {
    const url = `/tdv/metadata/${orgId}/${datasetId}`;
    return this.callApi(url, 'get').pipe(
      map(response => {
        return response.tdv.schema as Schema[];
      })
    );
  }

  public getPreview(jobId: string): Observable<ActionPerformedPreview> {
    const url = `/preview/${jobId}`;
    return this.callApi(url, 'get').pipe(
      map(response => {
        return response as ActionPerformedPreview;
      })
    );
  }

  public deletePreview(jobId: string): Observable<ActionPerformedPreview> {
    const url = `/preview/${jobId}`;
    return this.callApi(url, 'delete').pipe(
      map(response => {
        return response as ActionPerformedPreview;
      })
    );
  }

  public getUnmanagedTdvView(orgId: string): Observable<PublishedViews[]> {
    const url = `/tdv/unmanaged/views/${orgId.toLowerCase()}`;
    return this.callApi(url, 'get').pipe(
      map((response: any) => {
        return response.Datasets;
      })
    );
  }

  public copyUnmanagedTdv(orgId: string, tdv: PublishedViews): Observable<any> {
    const url = '/tdv/unmanaged/copy';
    return this.callApi(url, 'post', {
      Organization: orgId,
      DatasetName: tdv.DatasetName,
      Annotation: tdv.Annotation,
      DatasetPath: tdv.DatasetPath
    });
  }

  public getPreviewFromSpark = (dsname: string, orgId: string): Observable<any> => {
    const url = `/tdv/data/${orgId}/${dsname}`;
    return this.callApi(url, 'get').pipe(
      map((response: any) => {
        return response.Data;
      })
    )
  }

  public getColumnsFromSpark = (dsname: string, orgId: string): Observable<any> => {
    const url = `/tdv/metadata/${orgId}/${dsname}`;
    return this.callApi(url, 'get').pipe(
      map((response: any) => {
        return response.tdv.schema;
      })
    )
  }

  public createSparkJob = (request: any): Observable<any> => {
    const url = '/processmining';
    return this.callApi(url, 'post', request)
  }

  public deleteTdv = (orgId: string, datasetId: string): Observable<any> => {
    const url = `/tdv/managed/csv/${orgId}/${datasetId}`;
    return this.callApi(url, 'delete');
  }

  private callApi(url: string, method: string = 'GET', body: any = undefined, customOptions: any = {}): Observable<any> {
    url = this.baseUrl + url;
    const options = {... this.generateOptions(), ... customOptions};
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
}
