import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { MessageTopicService, TcGeneralConfigService, TcGeneralLandingPageConfigService } from '@tibco-tcstk/tc-core-lib';
import { TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { cloneDeep, set, isEqual } from 'lodash-es';
import { SettingsService } from '../../service/settings.service';
import { MatDialog } from '@angular/material/dialog';
import { WelcomePreviewComponent } from 'src/app/components/welcome-preview/welcome-preview.component';
import { HightlighEditComponent } from 'src/app/components/hightligh-edit/hightligh-edit.component';
import { HttpEventType } from '@angular/common/http';
import { DiscoverConfiguration } from 'src/app/models/configuration';

@Component({
  selector: 'settings-branding',
  templateUrl: './settings-branding.component.html',
  styleUrls: ['./settings-branding.component.css', '../../components/process-analysis-table/process-analysis-table.component.scss']
})
export class SettingsBrandingComponent implements OnInit {

  public discover: DiscoverConfiguration;

  constructor(
    protected configService: ConfigurationService,
    protected generalConfigService: TcGeneralConfigService,
    protected landingPageConfigService: TcGeneralLandingPageConfigService,
    protected settingsService: SettingsService,
    protected dialog: MatDialog,
    protected messageService: MessageTopicService,
    protected documentService: TcDocumentService) { }

  ngOnInit(): void {
    this.handleReset();
  }

  public handleUpdate = (event, object: string, path?: string) => {
    if (object === 'general'){
      this.discover.general.applicationTitle = event.detail.value;
    }

    if (object === 'landingPage'){
      set(this.discover.landingPage, path, event.detail.value);
    }
  }

  public handleSave = (): void => {
    if (!isEqual(this.discover, this.configService.config.discover)) {
      this.configService.updateDiscoverConfig(this.configService.config.sandboxId, this.configService.config.uiAppId, this.discover, this.discover.id).subscribe(
        _ => {
          this.messageService.sendMessage('news-banner.topic.message', 'Settings saved...');
          this.configService.refresh();
        }
      );
    }
  }

  public handleReset = (): void => {
    this.discover = cloneDeep(this.configService.config.discover);
  }

  public handlePreview = (): void => {
    const dialogRef = this.dialog.open(WelcomePreviewComponent, {
      width: '100%',
      height: '90%',
      data: this.discover.landingPage
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  public handleHighlighEdit = (index) => {
    const dialogRef = this.dialog.open(HightlighEditComponent, {
      width: '40%',
      height: '40%',
      data: {...this.discover.landingPage.highlights[index]}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.discover.landingPage.highlights[index] = result;
      }
    });
  }

  public handleUpload = (file: File): void => {
    let uploadProgress = 0;
    this.documentService.uploadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.configService.config.sandboxId, file, file.name, 'File uploaded from browser.').subscribe(
      (response: any) => {
        if (response.type === HttpEventType.UploadProgress) {
          uploadProgress = Math.round(100 * response.loaded / response.total);
          if (uploadProgress === 100) {
            this.discover.landingPage.backgroundURL = file.name;
          }
        }
      },
      error => {
        console.log('error', error);
      }
    );
  }
}
