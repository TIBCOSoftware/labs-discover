import {Injectable} from '@angular/core';
import {Upload} from '../models_ui/fileUpload';
import {HttpEventType} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DatasetService} from './dataset.service';
import {DatasetSource} from '../backend/model/datasetSource';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private _Uploads: Upload[] = [];

  constructor(private datasetService: DatasetService) {
  }

  public get uploads(): Upload[] {
    return this._Uploads;
  }

  // private async addUpload(type: string, folderName: string, file: File, name: string, description: string): Promise<string> {
  private async addUpload(file: File, dataSource: DatasetSource): Promise<string> {
    return new Promise((resolve, reject) => {
      const newUpload: Upload = {
        name: file.name,
        type: dataSource.DatasourceType,
        folderName: '',
        fileSize: file.size,
        uploaded: 0,
        prevUploaded: 0,
        status: 'queued',
        progress: 0,
        speed: 0,
        timeStamp: Date.now()
      };
      this._Uploads = [...this._Uploads, newUpload];
      this.doUploadFile(file, dataSource).subscribe(
        (resp: any) => {
          const response = resp.uploadFileResponse;
          if (response.type === HttpEventType.UploadProgress) {
            newUpload.uploaded = response.loaded;
            newUpload.timeStamp = Date.now();
            newUpload.prevUploaded = response.loaded;
            newUpload.status = 'uploading';
            newUpload.progress = Math.round(100 * response.loaded / response.total);
            if (newUpload.progress === 100) {
              newUpload.status = 'finalizing';
              resolve(file.name + ' Uploaded successfully...')
            }
            this._Uploads = [...this.uploads];
          }
          if (response.type === HttpEventType.Response && response.ok) {
            newUpload.status = 'uploaded';
          }
        },
        error => {
          newUpload.status = 'failed';
          reject()
        }
      );
    });
  }

  // public async uploadFile(type: string, folderName: string, file: File, name: string, description: string, replace: boolean): Promise<string> {
  public async uploadFile(file: File, dataSource: DatasetSource): Promise<string> {
    return await this.addUpload(file, dataSource);
  }

  // public doUploadFile(type: string, folderName: string, file: File, name: string, description: string): Observable<any> {
  public doUploadFile(file: File, dataSource: DatasetSource): Observable<any> {
    return this.datasetService.uploadFileReturnProgress(dataSource, file);
  }

  public clearUploads() {
    this._Uploads.length = 0;
  }
}
