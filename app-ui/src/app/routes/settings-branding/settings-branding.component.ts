import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/api/configuration.service';
import { MessageTopicService } from '@tibco-tcstk/tc-core-lib';
import { TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { set } from 'lodash-es';
import { MatDialog } from '@angular/material/dialog';
import { WelcomePreviewComponent } from 'src/app/components/welcome-preview/welcome-preview.component';
import { HightlighEditComponent } from 'src/app/components/hightligh-edit/hightligh-edit.component';
import { HttpEventType } from '@angular/common/http';
import { GeneralInformation } from 'src/app/model/generalInformation';
import { LandingPage } from 'src/app/model/landingPage';
import { map } from 'rxjs/operators';
import { Analytics } from 'src/app/model/analytics';

@Component({
  selector: 'settings-branding',
  templateUrl: './settings-branding.component.html',
  styleUrls: ['./settings-branding.component.css', '../../components/process-analysis-table/process-analysis-table.component.scss']
})
export class SettingsBrandingComponent implements OnInit {

  public generalInformation: GeneralInformation;
  public updatedGeneralInformation: boolean;

  public landingPage: LandingPage;
  public updatedLandingPage: boolean;

  public analytics: Analytics
  public updatedAnalytics: boolean;

  public showAdvanced: boolean;
  public showServer: boolean;

  constructor(
    protected configurationService: ConfigurationService,
    protected dialog: MatDialog,
    protected messageService: MessageTopicService,
    protected documentService: TcDocumentService) {
  }

  ngOnInit(): void {
    this.showAdvanced = false;
    this.showServer = false;
    this.handleReset();
  }

  public handleUpdate = (event, object: string, path?: string) => {
    if (object === 'general') {
      this.generalInformation.applicationTitle = event.detail.value;
      this.updatedGeneralInformation = true;
    }

    if (object === 'landingPage') {
      set(this.landingPage, path, event.detail.value);
      this.updatedLandingPage = true;
    }

    if (object === 'advanced') {
      set(this.analytics, path, event.detail.value);
      this.updatedAnalytics = true;
    }

  }

  public handleSave = async (): Promise<void> => {
    let calls = [];
    if (this.updatedGeneralInformation){
      calls.push(this.configurationService.postGeneralConfiguration(this.generalInformation).toPromise());
    }
    if (this.updatedLandingPage) {
      calls.push(this.configurationService.postLandingPagesConfiguration(this.landingPage).toPromise());
    }
    if (this.updatedAnalytics) {
      calls.push(this.configurationService.postAnalytics(this.analytics).toPromise());
    }
    const results = await Promise.all(calls);

    this.updatedGeneralInformation = false;
    this.updatedLandingPage = false;
    this.updatedAnalytics = false;

    this.messageService.sendMessage('news-banner.topic.message', 'Settings saved...');
  }

  public handleReset = (): void => {
    this.configurationService.getGeneralConfiguration().pipe(
      map((result: GeneralInformation) => {
        this.generalInformation = result;
        this.updatedGeneralInformation = false;
      })
    ).subscribe();
    this.configurationService.getLandingPagesConfiguration().pipe(
      map((result: LandingPage) => {
        this.landingPage = result;
        this.updatedLandingPage = false;
      })
    ).subscribe();
    this.configurationService.getAnalytics().pipe(
      map((result: Analytics) => {
        this.analytics = result;
        this.updatedAnalytics = false;
      })
    ).subscribe();
  }

  public handlePreview = (): void => {
    const dialogRef = this.dialog.open(WelcomePreviewComponent, {
      width: '100%',
      height: '90%',
      data: this.landingPage
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  public handleHighlighEdit = (index) => {
    const dialogRef = this.dialog.open(HightlighEditComponent, {
      width: '40%',
      height: '40%',
      data: {...this.landingPage.highlights[index]}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.landingPage.highlights[index] = result;
      }
    });
  }

  public handleUpload = (file: File): void => {
    // let uploadProgress = 0;
    // this.documentService.uploadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.configService.config.sandboxId, file, file.name, 'File uploaded from browser.').subscribe(
    //   (response: any) => {
    //     if (response.type === HttpEventType.UploadProgress) {
    //       uploadProgress = Math.round(100 * response.loaded / response.total);
    //       if (uploadProgress === 100) {
    //         this.landingPage.backgroundURL = file.name;
    //       }
    //     }
    //   },
    //   error => {
    //     console.log('error', error);
    //   }
    // );
  }
}
