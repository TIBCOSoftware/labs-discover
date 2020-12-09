import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DiscoverConfiguration } from 'src/app/models/configuration';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { cloneDeep, isEqual } from 'lodash-es';
import {MessageTopicService} from "@tibco-tcstk/tc-core-lib";
import { TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';

@Component({
  templateUrl: './settings-platform-environment.component.html',
  styleUrls: ['./settings-platform-environment.component.css']
})
export class SettingsPlatformEnvironmentComponent implements OnInit {

  public environment: string;
  public changed: boolean;
  private filename = "environment.json";

  // Brace editor
  aceEditorOptions: any = {
    printMargin: false,
    showGutter: true,
    autoScrollEditorIntoView: true,
    highlightActiveLine: true
  };

  constructor(protected configService: ConfigurationService,
              protected documentService: TcDocumentService,
              protected messageService: MessageTopicService) { }

  ngOnInit(): void {
    this.handleReset();
  }

  public handleSave = (): void => {
    if (this.changed) {
      let file = new File([this.environment], this.filename, {type: "text/plain"})
      this.documentService.uploadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.configService.config.sandboxId, file, file.name, 'File uploaded from browser.').subscribe(
        _ => {
          this.messageService.sendMessage('news-banner.topic.message', 'Settings saved...');
        }
      );
    }
  }

  public handleReset = (): void => {
    this.documentService.downloadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.filename, "", this.configService.config.sandboxId, true).subscribe(
      element => {
        var reader = new FileReader();
        reader.readAsText(element); 
        reader.onloadend = (e) => {
          var textdata = reader.result;
          this.environment = textdata === '' ? '{}' : textdata.toString();
        }    
      },
      _ => {
        this.environment = '{}';
      }
    );
    this.changed = false;
  }

  public handleUpdateEnvironment = (value: string): void => {
    this.changed = true;
    this.environment = value;
  }
}

