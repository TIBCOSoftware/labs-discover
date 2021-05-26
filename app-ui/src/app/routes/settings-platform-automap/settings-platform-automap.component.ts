<<<<<<< HEAD
import {Component, OnInit} from '@angular/core';
=======
import {Component, Input, OnInit} from '@angular/core';
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
import {cloneDeep, isEqual} from 'lodash-es';
import {ConfigurationService} from '../../service/configuration.service';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {DiscoverConfiguration, HeadersSSResult, SSConfig} from '../../models/configuration';
import {StringSimilarityService} from '../../service/string-similarity.service';
<<<<<<< HEAD
import {CaseService} from '../../service/custom-case.service';
=======
import {CaseCacheService} from '../../service/custom-case-cache.service';
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
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
<<<<<<< HEAD
  public testValue: string = 'CaseHeader, ResourceHeader, End, beginning, Task, AdditionalHeader';
=======
  public testValue: string;
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
  // public caseIDColumn: string;
  public headSSResult: HeadersSSResult;

  constructor(protected configService: ConfigurationService,
              protected messageService: MessageTopicService,
              protected ssService: StringSimilarityService,
<<<<<<< HEAD
              protected caseService: CaseService) {
=======
              protected caseCache: CaseCacheService) {
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
  }

  ngOnInit(): void {
    this.handleReset();
<<<<<<< HEAD
    this.showTestResult = false;
=======
    this.testValue = 'CaseHeader, ResourceHeader, End, beginning, Task, AdditionalHeader';
    // this.testValue = 'Start,End,re';
    this.showTestResult = false;
    // this.ssConfig = this.configService.config.discover.ssConfig;
    // console.log(this.ssConfig);
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
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

<<<<<<< HEAD
  handleUpdate(event, field) {
    if (event?.detail?.value?.split) {
      this.discover.ssConfig[field] = event.detail.value.split(',');
    } else {
      if (event.detail.value[0] === '') {
        this.discover.ssConfig[field] = [];
      } else {
        this.discover.ssConfig[field] = event.detail.value
      }
=======
  handleUpdate(event, type) {
    console.log('Handle Update: ' , event , ' type: ' , type , ' event.detail.value:' ,event.detail.value);
    switch(type) {
      case 'threshold':
        this.discover.ssConfig.threshold = event.detail.value;
        break;
      case 'doAddAdditional':
        this.discover.ssConfig.doAddAdditional = event.detail.checked;
        break;
      case 'debug':
        this.discover.ssConfig.debug = event.detail.checked;
        break;
      default:
        if (event?.detail?.value?.split) {
          this.discover.ssConfig[type + 'Words'] = event.detail.value.split(',');
        } else {
          // console.log('Value: ' , event.detail.value);
          if (event.detail.value[0] === '') {
            this.discover.ssConfig[type + 'Words'] = [];
          } else {
            this.discover.ssConfig[type + 'Words'] = event.detail.value
          }
          // console.log('Setting value: ' , this.discover.ssConfig[type + 'Words']);
        }
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
    }
    this.testChanged();
  }

<<<<<<< HEAD
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
=======
  testChanged() {
    // const caseIDM = this.ssService.findBestMatch(this.testValue, this.ssConfig.caseIdWords);
    this.headSSResult = this.ssService.autoMap(this.testValue.split(','), this.discover.ssConfig);
    this.showTestResult = true;
  }

  async getWords() {
    // Get words from previous cases

    const cases = await this.caseCache.getCasesP(this.discover.analysis.applicationId);
    // console.log(cases);
    // Load cases in cache
    for (const pmCase of cases) {
      const paDetails: ProcessAnalysis = pmCase.untaggedCasedataObj;
      // Case ID
      let addCaseID = true;
      for (const cIdWord of this.discover.ssConfig.caseIdWords) {
        if (cIdWord === paDetails.EventMap.case_id) {
          addCaseID = false;
        }
      }
      if (addCaseID && paDetails.EventMap?.case_id && paDetails.EventMap?.case_id.trim() !== '') {
        this.discover.ssConfig.caseIdWords.push(paDetails.EventMap.case_id);
      }

      // Resoucre
      let addResource = true;
      for (const resWord of this.discover.ssConfig.resourceWords) {
        if (resWord === paDetails.EventMap.resource_id) {
          addResource = false;
        }
      }
      if (addResource && paDetails.EventMap?.resource_id && paDetails.EventMap.resource_id.trim() !== '') {
        this.discover.ssConfig.resourceWords.push(paDetails.EventMap.resource_id);
      }

      // Activitiy
      let addActivity = true;
      for (const word of this.discover.ssConfig.activityWords) {
        if (word === paDetails.EventMap.activity_id) {
          addActivity = false;
        }
      }
      if (addActivity && paDetails.EventMap?.activity_id && paDetails.EventMap.activity_id.trim() !== '') {
        this.discover.ssConfig.activityWords.push(paDetails.EventMap.activity_id);
      }

      // Start Time
      let addStart = true;
      for (const word of this.discover.ssConfig.startWords) {
        if (word === paDetails.EventMap.activity_start_time) {
          addStart = false;
        }
      }
      if (addStart && paDetails.EventMap?.activity_start_time && paDetails.EventMap.activity_start_time.trim() !== '') {
        this.discover.ssConfig.startWords.push(paDetails.EventMap.activity_start_time);
      }

      // End Time
      let addEnd = true;
      for (const word of this.discover.ssConfig.endWords) {
        if (word === paDetails.EventMap.activity_end_time) {
          addEnd = false;
        }
      }
      if (addEnd && paDetails.EventMap?.activity_end_time && paDetails.EventMap.activity_end_time.trim() !== '') {
        this.discover.ssConfig.endWords.push(paDetails.EventMap.activity_end_time);
      }


    }
    this.discover.ssConfig.caseIdWords = [...this.discover.ssConfig.caseIdWords];
    this.discover.ssConfig.resourceWords = [...this.discover.ssConfig.resourceWords];
    this.discover.ssConfig.activityWords = [...this.discover.ssConfig.activityWords];
    this.discover.ssConfig.startWords = [...this.discover.ssConfig.startWords];
    this.discover.ssConfig.endWords = [...this.discover.ssConfig.endWords];

    // Get all the words
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771


  }

}
