import { Component, OnInit } from '@angular/core';
import {DiscoverConfiguration} from '../../models_ui/configuration';
import {ConfigurationService} from '../../service/configuration.service';
import { cloneDeep, isEqual } from 'lodash-es';
import {MessageTopicService, TcGeneralConfigService, TcGeneralLandingPageConfigService} from '@tibco-tcstk/tc-core-lib';
import {TcAppDefinitionService, TcDocumentService} from '@tibco-tcstk/tc-liveapps-lib';
import {MatDialog} from '@angular/material/dialog';
import {notifyUser} from '../../functions/message';

@Component({
  selector: 'settings-analytic-templates',
  templateUrl: './settings-analytic-templates.component.html',
  styleUrls: ['./settings-analytic-templates.component.css']
})
export class SettingsAnalyticTemplatesComponent implements OnInit {

  // Brace editor
  aceEditorOptions: any = {
    printMargin: false,
    showGutter: true,
    autoScrollEditorIntoView: true,
    highlightActiveLine: true
  };

  public JSONText;

  public discover: DiscoverConfiguration;
  public showACE = true;
  public saveDisabled = true;

  constructor(
    protected configService: ConfigurationService,
    protected messageService: MessageTopicService) { }

  ngOnInit(): void {
    // this.messageService.sendMessage('news-banner.topic.message', 'Init...');
    this.handleReset();
    this.showACE = true;
  }

  public handleUpdate = (ev) => {
    // console.log('Update: ' , ev);
    try {
      this.discover.analyticTemplates = [...JSON.parse(ev)];
    } catch (e) {
      notifyUser('ERROR', 'Error parsing the JSON...', this.messageService);
    }
    if (!isEqual(this.discover, this.configService.config.discover)) {
      this.saveDisabled = false;
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
    } else {
      notifyUser('WARNING', 'No Changes...', this.messageService);
    }
  }

  public async handleReset() {
    this.discover = cloneDeep(this.configService.config.discover);
    this.JSONText = JSON.stringify(this.discover.analyticTemplates, null, 1);
    this.showACE = false;
    // console.log('RESET: ' , this.JSONText);
    window.setTimeout(() =>  {
      this.showACE = true;
    })
    this.saveDisabled = true;
  }
}
