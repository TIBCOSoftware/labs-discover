import { Injectable } from '@angular/core';
import {Upload} from '../models/fileUpload';
import {TcAppDefinitionService, TcDocumentService} from '@tibco-tcstk/tc-liveapps-lib';
import {HttpEventType} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

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
    this.documentService.uploadDocument(type, folderName, Number(this.appDefinitionService.claims.primaryProductionSandbox.id), file, name, description).subscribe(
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
        newUpload.status = 'failed'
      }
    )
  }

  public uploadFile(type: string , folderName: string, file: File, name: string, description: string, replace: boolean): boolean {
    if (replace){
      this.documentService.deleteDocument('orgFolders', folderName, name, Number(this.appDefinitionService.claims.primaryProductionSandbox.id)).subscribe(
        _ => {
          this.uploadFile(type, folderName, file, name, description, false);
        }
      )
    } else {
      this.addUpload(type, folderName, file, name, description);
    }
    return true;
  }

  public cancelUpload(upload: Upload) {
    return;
  }

  public clearUploads() {
    this._Uploads.length = 0;
  }
}
