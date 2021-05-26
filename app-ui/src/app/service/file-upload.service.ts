import { Injectable } from '@angular/core';
import {Upload} from '../models/fileUpload';
import {TcAppDefinitionService, TcDocumentService} from '@tibco-tcstk/tc-liveapps-lib';
import {HttpEventType} from '@angular/common/http';
import { concatMap, map, mapTo } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  readonly ORG_FOLDERS: string = 'orgFolders';

  private _Uploads: Upload[] = [];

  constructor(protected appDefinitionService: TcAppDefinitionService, protected documentService: TcDocumentService) { }

  public get uploads(): Upload[] {
    return this._Uploads;
  }

  private addUpload(type: string , folderName: string, file: File, name: string, description: string) {
    const newUpload:Upload = {
      name,
      type,
      folderName,
      fileSize: file.size,
      uploaded: 0,
      prevUploaded: 0,
      status: 'queued',
      progress: 0,
      speed: 0,
      timeStamp: Date.now()
    };
    this._Uploads = [...this._Uploads, newUpload];
    this.doUploadFile(type, folderName, file, name, description).subscribe(
      (response: any) => {
        // console.log(response);
        if (response.type === HttpEventType.UploadProgress) {
          newUpload.uploaded = response.loaded;
          newUpload.timeStamp = Date.now();
          newUpload.prevUploaded = response.loaded;
          newUpload.status = 'uploading';
          newUpload.progress = Math.round(100 * response.loaded / response.total);
          if (newUpload.progress === 100) {
            newUpload.status = 'finalizing';
          }
          this._Uploads = [...this.uploads];
        }
        if (response.type === HttpEventType.Response && response.ok) {
          newUpload.status = 'uploaded';
        }
      },
      error => {
        newUpload.status = 'failed';
      }
    );
  }

  public uploadFile(type: string , folderName: string, file: File, name: string, description: string, replace: boolean): boolean {
    if (replace){
      this.doUploadFile(type, folderName, file, name, description).subscribe(
        _ => {
          this.uploadFile(type, folderName, file, name, description, false);
        }
      )
    } else {
      this.addUpload(type, folderName, file, name, description);
    }
    return true;
  }

  public deleteFile(folderName: string, name: string): Observable<any> {
    return this.documentService.deleteDocument(this.ORG_FOLDERS, folderName, name, Number(this.appDefinitionService.claims.primaryProductionSandbox.id));
  }

  public doUploadFile(type: string , folderName: string, file: File, name: string, description: string): Observable<any> {
    return this.documentService.uploadDocument(type, folderName, Number(this.appDefinitionService.claims.primaryProductionSandbox.id), file, name, description);
  }

  /**
   * Upload file synchrously without adding the it to uploads status array.
   * @param type 
   * @param folderName 
   * @param file 
   * @param name 
   * @param description 
   * @param replace 
   */
  public syncUploadFile(type: string , folderName: string, file: File, name: string, description: string, replace: boolean): Observable<any> {
    if (replace){
      return this.deleteFile(folderName, name)
        .pipe(
          map((result) => {
            console.log(result);
            return this.doUploadFile(type, folderName, file, name, description);
          })
        );
    } else {
      return this.doUploadFile(type, folderName, file, name, description);
    }
  }

  public cancelUpload(upload: Upload) {
    return;
  }

  public clearUploads() {
    this._Uploads.length = 0;
  }
}
