import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { MessageTopicService } from "@tibco-tcstk/tc-core-lib";
import { TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { SettingsService } from 'src/app/service/settings.service';

@Component({
  templateUrl: './settings-platform-process-miner.component.html',
  styleUrls: ['./settings-platform-process-miner.component.css']
})
export class SettingsPlatformProcessMinerComponent implements OnInit {

  public processMinerSimple: string;
  public processMinerScheduled: string;
  public changed: boolean;
  private filename1 = "processMinerSimple_template.json";
  private filename2 = "processMinerScheduled_template.json";


  // Brace editor
  aceEditorOptions: any = {
    printMargin: false,
    showGutter: true,
    autoScrollEditorIntoView: true,
    highlightActiveLine: true
  };

  constructor(protected configService: ConfigurationService,
              protected documentService: TcDocumentService,
              protected settingsService: SettingsService,
              protected messageService: MessageTopicService) { }

  ngOnInit(): void {
    this.handleReset();
  }

  public handleSave = (): void => {
    let tocall = [];
    if (this.changed) {
      let file1 = new File([this.processMinerSimple], this.filename1, {type: "text/plain"})
      tocall.push(this.documentService.uploadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.configService.config.sandboxId, file1, file1.name, 'File uploaded from browser.'));
      let file2 = new File([this.processMinerScheduled], this.filename2, {type: "text/plain"})
      tocall.push(this.documentService.uploadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.configService.config.sandboxId, file2, file2.name, 'File uploaded from browser.'));
    }
    this.settingsService.updateSettings(tocall).subscribe(
      x => {
        this.messageService.sendMessage('news-banner.topic.message', 'Settings saved...');
      }
    )
  }

  public handleReset = (): void => {
    let tocall = [];
    tocall.push(this.documentService.downloadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.filename1, "", this.configService.config.sandboxId, true));
    tocall.push(this.documentService.downloadDocument('orgFolders', this.configService.config.uiAppId + '_assets', this.filename2, "", this.configService.config.sandboxId, true));

    this.settingsService.updateSettings(tocall).subscribe(
      (responses: any[]) => {
        if (responses !== undefined){
          responses.map(
            (element, index) => {
              var reader = new FileReader();
              reader.readAsText(element); 
              reader.onloadend = (e) => {
                var textdata = reader.result;
                switch (index) {
                  case 0:
                    this.processMinerSimple = textdata === '' ? '{}' : textdata.toString();
                    break;
                  case 1:
                    this.processMinerScheduled = textdata === '' ? '{}' : textdata.toString();
                    break;
                }
              }    
            }
          )
        } else {
          this.processMinerSimple = '{}';
          this.processMinerScheduled = '{}';
        }
      }
    ) 
    this.changed = false;
  }

  public handleUpdateProcessMiner = (value: string, field: string): void => {
    this.changed = true;
    if (field === 'processMinerSimple'){
      this.processMinerSimple = value;
    } else {
      this.processMinerScheduled = value; 
    }
  }
}

