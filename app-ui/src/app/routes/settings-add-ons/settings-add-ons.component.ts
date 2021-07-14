import { Component, OnInit } from '@angular/core';
import { DiscoverConfiguration } from 'src/app/models_ui/configuration';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { cloneDeep, isEqual } from 'lodash-es';
import {MatDialog} from "@angular/material/dialog";
import {MessageTopicService} from "@tibco-tcstk/tc-core-lib";

@Component({
  templateUrl: './settings-add-ons.component.html',
  styleUrls: ['./settings-add-ons.component.css']
})
export class SettingsAddOnsComponent implements OnInit {

  public discover: DiscoverConfiguration;

  constructor(public configService: ConfigurationService,
              protected messageService: MessageTopicService) { }

  ngOnInit(): void {
    this.handleReset();
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


  public handleDataVirtualization = ($event): void => {
    this.discover.tdv.enable = $event.detail.checked;
  }

  public disableDVSection = (): boolean => {
    return !this.discover.tdv.enable;
  }

  public handleK8SSupport = ($event): void => {
    this.discover.tdv.k8sEnable = $event.detail.checked;
  }

  public disableK8SSection = (): boolean => {
    return !this.discover.tdv.k8sEnable;
  }

  public handleUpdate = ($event, field: string): void => {
    this.discover.tdv[field] = $event.detail.value;
  }
}
