import { Component, OnInit } from '@angular/core';
import { DiscoverConfiguration } from 'src/app/models/configuration';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { cloneDeep, isEqual } from 'lodash-es';
import { MessageTopicService } from "@tibco-tcstk/tc-core-lib";

@Component({
  templateUrl: './settings-platform-analytics.component.html',
  styleUrls: ['./settings-platform-analytics.component.css']
})
export class SettingsPlatformAnalyticsComponent implements OnInit {

  public discover: DiscoverConfiguration;

  constructor(protected configService: ConfigurationService,
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

  public updateSpotfireEdit = ($event): void => {
    this.discover.analytics.edit = $event.detail.checked;
  }

  public updateSpotfireCloud = ($event): void => {
    let server: string;
    if (!$event.detail.checked) {
      server = this.discover.analytics.customServer;
    } else {
      switch (window.location.origin) {
        case 'https://eu.liveapps.cloud.tibco.com':
          server = 'https://eu.spotfire-next.cloud.tibco.com';
          break;

        case 'https://liveapps.cloud.tibco.com':
          server = 'https://spotfire-next.cloud.tibco.com';
          break;

        default:
          server = 'https://eu.spotfire-next.cloud.tibco.com';
          break;
      }
    }
    this.discover.analytics.server = server;
    this.discover.analytics.useCustomServer = !$event.detail.checked;
  }

  public disabledCustomAnalyticsServer = (): boolean => {
    return !this.discover.analytics.useCustomServer;
  }

  public handleCustomeSpotfireServer = ($event): void => {
    this.discover.analytics.customServer = $event.detail.value;
    // this.discover.analytics.server = $event.detail.value;
  }
}
