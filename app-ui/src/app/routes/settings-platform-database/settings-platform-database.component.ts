import { Component, OnInit } from '@angular/core';
import { DiscoverConfiguration } from 'src/app/models_ui/configuration';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { cloneDeep, isEqual } from 'lodash-es';
import { MessageTopicService } from "@tibco-tcstk/tc-core-lib";

@Component({
  templateUrl: './settings-platform-database.component.html',
  styleUrls: ['./settings-platform-database.component.css']
})
export class SettingsPlatformDatabaseComponent implements OnInit {

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

  public handleUpdateStorage = ($event, field: string): void => {
    this.discover.storage[field] = $event.detail.value;
  }
}
