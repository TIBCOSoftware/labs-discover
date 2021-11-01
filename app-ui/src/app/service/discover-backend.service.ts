import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DatasetSource } from '../backend/model/datasetSource';
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
  public uploadFile(orgId: string, file: File, dataSource: DatasetSource): Observable<HttpEvent<any>> {
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
    return this.callApi(url, 'post', formData, {... headers, reportProgress: true, observe: 'events'}).pipe(
      map(event => {
        return event;
      })
    );
  }

  public login(): Observable<any> {
    const url = '/login/validate';
    let token = this.oauthService.token;
    return this.callApi(url, 'post', {
      "credentials": token
    }).pipe(
      map(response => {
        return response;
      })
    );
  }

  private callApi(url: string, method: string = 'GET', body: any = undefined, customOptions: any = {}): Observable<any> {
    url = environment.apiURL + url;
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