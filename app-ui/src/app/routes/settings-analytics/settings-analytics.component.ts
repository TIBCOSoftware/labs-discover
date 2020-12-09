import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { cloneDeep, isEqual } from 'lodash-es';
import { DiscoverConfiguration } from 'src/app/models/configuration';
import { stringify } from '@angular/compiler/src/util';
import {MatDialog} from "@angular/material/dialog";
import {MessageTopicService} from "@tibco-tcstk/tc-core-lib";

@Component({
  templateUrl: './settings-analytics.component.html',
  styleUrls: ['./settings-analytics.component.css']
})
export class SettingsAnalyticsComponent implements OnInit {

  public discover: DiscoverConfiguration;
  aceEditorOptions: any = {
    printMargin: false,
    showGutter: true,
    autoScrollEditorIntoView: true,
    highlightActiveLine: true
  };
  @ViewChild('editor') editor;

  constructor(
    protected configService: ConfigurationService,
    protected messageService: MessageTopicService) { }

  ngOnInit(): void {
    this.handleReset();
  }

  ngAfterViewInit() {
    this.editor.getEditor().setOptions({
        enableBasicAutocompletion: true
    });
    this.editor.getEditor().setValue(this.getText());
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

  public updateTemplate = ($event): void => {
    this.discover.analytics.template = $event.detail.value;
  }

  public getText = (): string => {
    return JSON.stringify(this.discover.analytics.menuConfig, null, 1);
  }

  public updateConfigJSON = ($event): void => {
    this.discover.analytics.menuConfig = JSON.parse($event);
  }
}
