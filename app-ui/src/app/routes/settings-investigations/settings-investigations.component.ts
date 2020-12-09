import { Component, OnInit } from '@angular/core';
import { CaseCreatorsList, CaseTypesList, LiveAppsService, TcCaseProcessesService } from '@tibco-tcstk/tc-liveapps-lib';
import { map } from 'rxjs/operators';
import { DiscoverConfiguration } from 'src/app/models/configuration';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { cloneDeep, isEqual } from 'lodash-es';
import {MatDialog} from "@angular/material/dialog";
import {MessageTopicService} from "@tibco-tcstk/tc-core-lib";

@Component({
  selector: 'settings-investigations',
  templateUrl: './settings-investigations.component.html',
  styleUrls: ['./settings-investigations.component.css']
})
export class SettingsInvestigationsComponent implements OnInit {

  public availableApps;
  public availableCreators = [];
  private discover: DiscoverConfiguration;

  constructor(
    protected configService: ConfigurationService,
    protected liveappsService: LiveAppsService,
    protected caseProcessesService: TcCaseProcessesService,
    protected messageService: MessageTopicService) { }

  ngOnInit(): void {
    this.liveappsService.getApplications(this.configService.config.sandboxId, [], 100, false).pipe(
      map((apps: CaseTypesList) => {
        this.availableApps = [...apps.casetypes.map(app => { return {label: app.applicationName, value: app.applicationId }})];
      })
    ).subscribe();
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

    this.availableCreators.length = this.discover.investigations.numberApplications;
    this.obtainCreators(0);
    this.obtainCreators(1);
  }

  public counter = (): Array<number> => {
    return new Array(this.discover.investigations.numberApplications);
  }

  public getApplication = (index: number): string => {
    return this.discover.investigations.applications[index].applicationId;
  }

  public getCreator = (index: number): string => {
    return this.discover.investigations.applications[index].creatorId;
  }

  private obtainCreators = (index: number): void => {
    this.caseProcessesService.getCaseCreators(this.configService.config.sandboxId, this.getApplication(index), '1').pipe(
      map((casecreators: CaseCreatorsList) => {
        this.availableCreators[index] = [...casecreators.creators.map(creator => {return {label: creator.label, value: creator.id }})];
      })
    ).subscribe();
  }

  public getCreators = (index: number): any => {
    return this.availableCreators[index];
  }

  public handleApplicationSelection = ($event, i): void => {
    this.discover.investigations.applications[i].applicationId = $event.detail.value;
    this.discover.investigations.applications = [...this.discover.investigations.applications]
    this.obtainCreators(i);
  }

  public handleCreatorSelection = ($event, i): void => {
    this.discover.investigations.applications[i].creatorId = $event.detail.value;
  }
}
