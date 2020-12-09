import { Component, OnInit, ViewChild } from '@angular/core';
import { DiscoverConfiguration } from 'src/app/models/configuration';
import { CaseCreatorsList, CaseTypesList, LiveAppsService, TcCaseProcessesService } from '@tibco-tcstk/tc-liveapps-lib';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { map } from 'rxjs/operators';
import { cloneDeep, isEqual } from 'lodash-es';
import {MessageTopicService} from "@tibco-tcstk/tc-core-lib";

@Component({
  templateUrl: './settings-platform.component.html',
  styleUrls: ['./settings-platform.component.css']
})
export class SettingsPlatformComponent implements OnInit {

  public discover: DiscoverConfiguration;
  public availableApps;
  public availableCreators;

  constructor(protected configService: ConfigurationService,
              protected liveappsService: LiveAppsService,
              protected caseProcessesService: TcCaseProcessesService,
              protected messageService: MessageTopicService) { }

  ngOnInit(): void {
    this.handleReset();
    this.liveappsService.getApplications(this.configService.config.sandboxId, [], 100, false).pipe(
      map((apps: CaseTypesList) => {
        this.availableApps = [...apps.casetypes.map(app => { return {label: app.applicationName, value: app.applicationId }})];
        this.obtainCreators();
      })
    ).subscribe();
  }

  private obtainCreators = (): void => {
    this.caseProcessesService.getCaseCreators(this.configService.config.sandboxId, this.discover.analysis.applicationId, '1').pipe(
      map((casecreators: CaseCreatorsList) => {
        this.availableCreators = [...casecreators.creators.map(creator => {return {label: creator.label, value: creator.id }})];
      })
    ).subscribe();
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
    if (this.availableApps){
      this.obtainCreators();
    }
  }

  public handleAnalysisLifecycleSelection = ($event, field: string): void => {
    this.discover.analysis[field] = $event.detail.value;
    if (field === 'applicationId') {
      this.obtainCreators();
    }
  }

  public handleUpdateMessaging = ($event, field: string): void => {
    this.discover.messaging[field] = $event.detail.value;
  }
}
