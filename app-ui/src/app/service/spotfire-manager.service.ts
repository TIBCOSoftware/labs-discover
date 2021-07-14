import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {SFLibObjects, SFLibraryObject, SFCopyRequest} from '../models_ui/spotfireManagement';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {OauthService} from './oauth.service';
import {notifyUser} from '../functions/message';

@Injectable({
  providedIn: 'root'
})
export class SpotfireManagerService {

  public endpoint = 'https://eu-west-1.integration.cloud.tibcoapps.com:443/nfvthzbohgelvgmrdqfthqfene7mjz5q';

  constructor(
    protected http: HttpClient,
    protected messageService: MessageTopicService,
    private oService: OauthService
  ) {
    if (!oService.isCloud()) {
      this.endpoint = '/nfvthzbohgelvgmrdqfthqfene7mjz5q';
      // this.endpoint = 'https://localhost:8000'
    }
  }

  // private copyItem = (copyRequest: SFCopyRequest): Observable<any> => {
  //   const url = this.endpoint + '/CopyItem';
  //   const bodyStr = TcCoreCommonFunctions.escapeString(JSON.stringify(copyRequest));
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json'
  //   });
  //   return this.http.post(url, bodyStr, {headers}).pipe(
  //     map(response => response),
  //     catchError(error => {
  //       console.log('Get SF COPY ERROR: ', error);
  //       return error;
  //     })
  //   );
  // }

  // public async copyDXP(copyRequest: SFCopyRequest): Promise<SFLibraryObject> {
  //   const copy: any = await this.copyItem(copyRequest).toPromise();
  //   if (copy.httpErrorCode) {
  //     notifyUser('ERROR', 'Error copying the DXP...', this.messageService);
  //     return null;
  //   } else {
  //     return copy;
  //   }
  // }


}
