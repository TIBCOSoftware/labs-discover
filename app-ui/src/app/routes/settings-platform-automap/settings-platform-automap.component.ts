import {Component, OnInit} from '@angular/core';
import {cloneDeep, isEqual} from 'lodash-es';
import {ConfigurationService} from '../../service/configuration.service';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {DiscoverConfiguration, HeadersSSResult, SSConfig} from '../../models/configuration';
import {StringSimilarityService} from '../../service/string-similarity.service';
import {CaseService} from '../../service/custom-case.service';
import {ProcessAnalysis} from '../../models/ProcessAnalysisModel';

@Component({
  selector: 'settings-platform-automap',
  templateUrl: './settings-platform-automap.component.html',
  styleUrls: ['./settings-platform-automap.component.css']
})
export class SettingsPlatformAutomapComponent implements OnInit {

  public discover: DiscoverConfiguration;
  // public ssConfig: SSConfig;
  public showTestResult: boolean;
  public testValue: string = 'CaseHeader, ResourceHeader, End, beginning, Task, AdditionalHeader';
  // public caseIDColumn: string;
  public headSSResult: HeadersSSResult;

  constructor(protected configService: ConfigurationService,
              protected messageService: MessageTopicService,
              protected ssService: StringSimilarityService,
              protected caseService: CaseService) {
  }

  ngOnInit(): void {
    this.handleReset();
    this.showTestResult = false;
    this.testChanged();
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

  handleUpdate(event, field) {
    if (event?.detail?.value?.split) {
      this.discover.ssConfig[field] = event.detail.value.split(',');
    } else {
      if (event.detail.value[0] === '') {
        this.discover.ssConfig[field] = [];
      } else {
        this.discover.ssConfig[field] = event.detail.value
      }
    }
    this.testChanged();
  }

  public handleUpdatethreshold = (event): void => {
    this.discover.ssConfig.threshold = event.detail.value;
    this.testChanged();
  }

  testChanged() {
    // this.headSSResult = this.ssService.autoMap(this.testValue.split(','), this.discover.ssConfig);
    // this.showTestResult = true;
  }

  async getWords() {
    // // Get words from previous cases

    // const cases = await this.caseService.getCasesP(this.discover.analysis.applicationId);
    // // console.log(cases);
    // // Load cases in cache
    // for (const pmCase of cases) {
    //   const paDetails: ProcessAnalysis = pmCase.untaggedCasedataObj;
    //   // Case ID
    //   let addCaseID = true;
    //   for (const cIdWord of this.discover.ssConfig.caseIdWords) {
    //     if (cIdWord === paDetails.EventMap.case_id) {
    //       addCaseID = false;
    //     }
    //   }
    //   if (addCaseID && paDetails.EventMap?.case_id && paDetails.EventMap?.case_id.trim() !== '') {
    //     this.discover.ssConfig.caseIdWords.push(paDetails.EventMap.case_id);
    //   }

    //   // Resoucre
    //   let addResource = true;
    //   for (const resWord of this.discover.ssConfig.resourceWords) {
    //     if (resWord === paDetails.EventMap.resource_id) {
    //       addResource = false;
    //     }
    //   }
    //   if (addResource && paDetails.EventMap?.resource_id && paDetails.EventMap.resource_id.trim() !== '') {
    //     this.discover.ssConfig.resourceWords.push(paDetails.EventMap.resource_id);
    //   }

    //   // Activitiy
    //   let addActivity = true;
    //   for (const word of this.discover.ssConfig.activityWords) {
    //     if (word === paDetails.EventMap.activity_id) {
    //       addActivity = false;
    //     }
    //   }
    //   if (addActivity && paDetails.EventMap?.activity_id && paDetails.EventMap.activity_id.trim() !== '') {
    //     this.discover.ssConfig.activityWords.push(paDetails.EventMap.activity_id);
    //   }

    //   // Start Time
    //   let addStart = true;
    //   for (const word of this.discover.ssConfig.startWords) {
    //     if (word === paDetails.EventMap.activity_start_time) {
    //       addStart = false;
    //     }
    //   }
    //   if (addStart && paDetails.EventMap?.activity_start_time && paDetails.EventMap.activity_start_time.trim() !== '') {
    //     this.discover.ssConfig.startWords.push(paDetails.EventMap.activity_start_time);
    //   }

    //   // End Time
    //   let addEnd = true;
    //   for (const word of this.discover.ssConfig.endWords) {
    //     if (word === paDetails.EventMap.activity_end_time) {
    //       addEnd = false;
    //     }
    //   }
    //   if (addEnd && paDetails.EventMap?.activity_end_time && paDetails.EventMap.activity_end_time.trim() !== '') {
    //     this.discover.ssConfig.endWords.push(paDetails.EventMap.activity_end_time);
    //   }


    // }
    // this.discover.ssConfig.caseIdWords = [...this.discover.ssConfig.caseIdWords];
    // this.discover.ssConfig.resourceWords = [...this.discover.ssConfig.resourceWords];
    // this.discover.ssConfig.activityWords = [...this.discover.ssConfig.activityWords];
    // this.discover.ssConfig.startWords = [...this.discover.ssConfig.startWords];
    // this.discover.ssConfig.endWords = [...this.discover.ssConfig.endWords];

    // // Get all the words


  }

}
