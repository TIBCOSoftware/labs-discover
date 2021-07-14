import { Location } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { ConfigurationService } from 'src/app/service/configuration.service';

@Component({
  templateUrl: './hightligh-edit.component.html',
  styleUrls: ['./hightligh-edit.component.css']
})
export class HightlighEditComponent implements OnInit {

  public highlight;
  public iconURL: string;

  constructor(
    protected configService: ConfigurationService,
    protected documentService: TcDocumentService,
    protected location: Location,
    public dialogRef: MatDialogRef<HightlighEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  ngOnInit(): void {
    this.highlight = this.data;
    this.iconURL = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, '/webresource/orgFolders/' + this.configService.config.uiAppId + '_assets/' +  this.highlight.iconURL);
  }

  public onNoClick = (): void => {
    this.dialogRef.close();
  }

  public handleUpdate = ($event, field: string): void => {
    this.highlight[field] = $event.detail.value;
  }

  public onCloseClick = (): void => {
    this.dialogRef.close(this.highlight);
  }

  public handleUpload = (file: File): void => {
    let uploadProgress = 0;
    this.documentService.uploadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.configService.config.sandboxId, file, file.name, 'File uploaded from browser.').subscribe(
      (response: any) => {
        if (response.type === HttpEventType.UploadProgress) {
          uploadProgress = Math.round(100 * response.loaded / response.total);
          if (uploadProgress === 100) {
            this.highlight.iconURL = file.name;
            this.iconURL = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, '/webresource/orgFolders/' + this.configService.config.uiAppId + '_assets/' +  this.highlight.iconURL);
          }
        }
      },
      error => {
        console.log('error');
      }
    );
  }
}
