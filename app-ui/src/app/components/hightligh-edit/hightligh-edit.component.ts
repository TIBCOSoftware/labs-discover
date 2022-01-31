import { Location } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { ConfigurationService } from 'src/app/backend/api/configuration.service';
import { LandingPageUploadResponse } from 'src/app/backend/model/landingPageUploadResponse';
import { OauthService } from 'src/app/service/oauth.service';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './hightligh-edit.component.html',
  styleUrls: ['./hightligh-edit.component.css']
})
export class HightlighEditComponent implements OnInit {

  public highlight;
  public iconURL: string;

  constructor(
    protected configurationService: ConfigurationService,
    protected documentService: TcDocumentService,
    protected location: Location,
    protected oauthService: OauthService,
    public dialogRef: MatDialogRef<HightlighEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  async ngOnInit(): Promise<void> {
    this.highlight = this.data;
    this.iconURL = await this.fetchWithAuthentication(environment.apiURL + '/configuration/assets/' + this.highlight.iconURL, this.oauthService.token);
  }

  private async fetchWithAuthentication(url, authToken) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ` + authToken);
    const file = await fetch(url, { headers });
    const blob = await file.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
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
    this.configurationService.postLandingPagesUploadConfiguration(file).subscribe(
      (response: LandingPageUploadResponse) => {
        this.highlight.iconURL = file.name;
        this.iconURL = file.name;
      },
      error => {
        console.log('error', error);
      }
    );
  }
}
