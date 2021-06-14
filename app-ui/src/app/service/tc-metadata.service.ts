import { Injectable } from '@angular/core';
import { Location } from '@angular/common'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { flatMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TcMetadataService {

  constructor(
    protected http: HttpClient,
    private loc: Location
  ) { }

  public getPreview = (assetId: string): Observable<string> => {
    return this.http.get('/s/ghknokhoemng/ebx-ca-tabula/rest/v1/dataset/' + assetId).pipe(
      flatMap((value: any) => {
        return this.http.get('/s/ghknokhoemng/ebx-ca-tabula/rest/v1/asset/' + value.preferredAsset).pipe(
          flatMap((value: any) => {
            return this.http.get('/s/ghknokhoemng/ebx-addon-dama/rest-service/getAssetInformation?assetUUID=' + value.samplefile.attachment).pipe(
              flatMap((value: any) => {
                return this.http.get(value.data.URL.replace('https://eu.metadata.cloud.tibco.com', ''), { headers: this.generateOptions(), responseType: 'text' }).pipe(
                  map((value: string) => {
                    return value;
                  })
                );
              })
            );
          })
        );
      })
    );
  }

  public getPreviewURL = (assetId: string): Observable<string> => {
    return this.http.get('/s/ghknokhoemng/ebx-ca-tabula/rest/v1/dataset/' + assetId, { headers: this.generateOptions()}).pipe(
      flatMap((value: any) => {
        return this.http.get('/s/ghknokhoemng/ebx-ca-tabula/rest/v1/asset/' + value.preferredAsset, { headers: this.generateOptions() }).pipe(
          flatMap((value: any) => {
            return this.http.get('/s/ghknokhoemng/ebx-addon-dama/rest-service/getAssetInformation?assetUUID=' + value.samplefile.attachment, { headers: this.generateOptions()}).pipe(
              map((value: any) => {
                return value.data.URL.replace('https://eu.metadata.cloud.tibco.com', '')
              })
            );
          })
        );
      })
    );
  }


  private generateOptions = (): HttpHeaders => {
     return new HttpHeaders({
        'Authorization': 'Bearer CIC~7adY6124p92GDrJ7izC9lRmr'
      });
  }
}
