import {Injectable} from '@angular/core';
import {Upload} from '../models_ui/fileUpload';
import {HttpEventType} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DatasetService} from './dataset.service';
import {Dataset} from '../models_ui/dataset';

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

  private async addUpload(type: string, folderName: string, file: File, name: string, description: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const newUpload: Upload = {
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
              resolve(name + ' Uploaded successfully...')
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

  public async uploadFile(type: string, folderName: string, file: File, name: string, description: string, replace: boolean): Promise<string> {
    return await this.addUpload(type, folderName, file, name, description);
  }

  public doUploadFile(type: string, folderName: string, file: File, name: string, description: string): Observable<any> {
    const dummyDataset = new Dataset().deserialize({
      Dataset_Source: {
        DatasourceType: 'File-Delimited',
        Encoding: 'UTF-8',
        FileEscapeChar: '\\',
        FileHeaders: 'true',
        FileQuoteChar: '"',
        FileSeparator: ','
      },
      Dataset_Description: '',
      Dataset_Id: '',
      Dataset_Name: '',
      type: '',
      csvMethod: 'upload'
    })
    return this.datasetService.uploadFile(dummyDataset, {}, file);
  }

  public clearUploads() {
    this._Uploads.length = 0;
  }
}
