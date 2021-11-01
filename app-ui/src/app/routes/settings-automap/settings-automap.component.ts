import {Component, OnInit} from '@angular/core';
import {ConfigurationService} from 'src/app/backend/api/configuration.service';
import {Automapping} from 'src/app/backend/model/automapping';
import {AutomapingField} from 'src/app/backend/model/automapingField';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {MapDef} from '../../models_ui/analysis';
import {AllAutoMapResults} from '../../models_ui/configuration';
import {cloneDeep, isEqual} from 'lodash-es';
import {KeyValue} from '@angular/common';
import {AutoMappingService} from '../../service/auto-mapping.service';
import {DEFAULT_AUTOMAPPING_THRESHOLD} from '../../app.settings';
import {RepositoryService} from '../../backend/api/repository.service';

@Component({
  selector: 'settings-automap',
  templateUrl: './settings-automap.component.html',
  styleUrls: ['./settings-automap.component.css']
})
export class SettingsAutomapComponent implements OnInit {

  autoMapConfig: Automapping[];
  private originalAutomapConfig: Automapping[];
  threshold: number;
  showTestResult: boolean;
  testValue = 'Case, ResourceHeader, End, beginning, Task, AdditionalHeader';
  autoMapResults: AllAutoMapResults = {};
  autoMapStrings = {}

  readonly FIELD_NAMES = MapDef.PROP_NAMES.concat(MapDef.PROP_NAMES_TIME);

  constructor(
    private configurationService: ConfigurationService,
    private autoMapService: AutoMappingService,
    private repositoryService: RepositoryService,
    private messageService: MessageTopicService
  ) {
  }

  // Preserve original property order
  originalOrder = (_a: KeyValue<string, string>, _b: KeyValue<string, string>): number => {
    return 0;
  }

  async ngOnInit() {
    await this.handleReset();
    this.showTestResult = false;
    this.testChanged();
  }

  async handleSave() {
    if (!isEqual(this.autoMapConfig, this.originalAutomapConfig)) {
      await this.autoMapService.saveAutoMapConfig(this.autoMapConfig)
      this.messageService.sendMessage('news-banner.topic.message', 'Automap configuration saved...');
    }
  }

  async handleReset() {
    this.autoMapConfig = await this.autoMapService.getAutoMapConfig()
    this.originalAutomapConfig = cloneDeep(this.autoMapConfig)
    if (this.autoMapConfig.length > 0) {
      this.threshold = this.autoMapConfig[0].threshold
      this.createAutoMapStrings()
    }
  }

  handleUpdate(event, field) {
    // console.log('Handle update event: ', event , ' field: ', field)
    if (event?.detail?.value?.split) {
      const wordMappingToStore: Automapping = {
        fieldName: field,
        threshold: this.threshold,
        values: []
      }
      const wordsAndO = event.detail.value.split(',');
      for (const wAO of wordsAndO) {
        const aMapWord: AutomapingField = {
          word: '',
          occurrence: 0
        }
        if (wAO.indexOf('(') > -1 && wAO.indexOf(')') > -1) {
          aMapWord.word = wAO.substring(0, wAO.indexOf('(')).trim();
          aMapWord.occurrence = Number(wAO.substring(wAO.indexOf('(') + 1, wAO.indexOf(')')))
        } else {
          aMapWord.word = wAO.trim();
          aMapWord.occurrence = 0;
        }
        if (aMapWord.word !== '') {
          wordMappingToStore.values.push(aMapWord);
        }
      }
      this.upsertField(wordMappingToStore)
      // this.discover.autoMapConfig[field] = wordMappingToStore;
    } else {
      if (event.detail.value[0] === '') {
        // this.discover.autoMapConfig[field] = [];
        this.upsertField({
          fieldName: field,
          values: [],
          threshold: this.threshold
        })
      } else {
        // this.discover.autoMapConfig[field] = event.detail.value
        this.upsertField({
          fieldName: field,
          values: [{word: event.detail.value, occurrence: 1}],
          threshold: this.threshold
        })
      }
    }
    // console.log('Updated automap: ' , this.automap)
    this.testChanged();
  }

  private upsertField(am: Automapping) {
    if (!this.autoMapConfig) {
      this.autoMapConfig = []
    }
    let updated = false;
    for (const amI in this.autoMapConfig) {
      if (this.autoMapConfig[amI].fieldName === am.fieldName) {
        this.autoMapConfig[amI] = am;
        updated = true
      }
    }
    if (!updated) {
      this.autoMapConfig.push(am)
    }
  }

  handleUpdateThreshold(event) {
    this.autoMapConfig = this.autoMapConfig.map((el: Automapping) => {
      el.threshold = event.detail.value
      return el;
    });
    this.testChanged();
  }

  createAutoMapStrings() {
    for (const am of this.autoMapConfig) {
      const field = am.fieldName;
      this.autoMapStrings[field] = this.autoMapConfig.filter((el: Automapping) => el.fieldName === field)[0].values
        .map(
          ((el: AutomapingField) => {
            return el.word + '(' + el.occurrence + ')'
          })
        ).join(', ');
    }
  }

  testChanged() {
    this.autoMapResults = this.autoMapService.autoMapAll(this.FIELD_NAMES, this.testValue.split(','), this.autoMapConfig);
    // console.log('Automapping Result: ', this.autoMapResults);
    this.showTestResult = true;
  }

  getWords() {
    // ********** TODO: Should be an API call
    // Get words from previous cases
    if (this.autoMapConfig && this.autoMapConfig.length > 0) {
      this.repositoryService.getAnalysis().subscribe(
        analysis => {
          this.FIELD_NAMES.forEach(field => {
            for (const ana of analysis) {
              if (ana.metadata.state === 'Ready') {
                let addField = true;
                const amConf = this.autoMapConfig.find(v => v.fieldName === field).values
                if (amConf && amConf.length > 0) {
                  for (const resWord of amConf) {
                    if (resWord.word === ana.data.mappings[field]) {
                      addField = false;
                      for (const mapW of amConf) {
                        if (mapW.word === ana.data.mappings[field]) {
                          mapW.occurrence++
                        }
                      }
                    }
                  }
                }
                if (addField && ana.data.mappings[field] && ana.data.mappings[field].trim() !== '') {
                  const word: AutomapingField = {
                    word: ana.data.mappings[field],
                    occurrence: 1
                  }
                  if (!amConf) {
                    this.autoMapConfig.push({fieldName: field, values: [], threshold: DEFAULT_AUTOMAPPING_THRESHOLD})
                  }
                  this.autoMapConfig.find(v => v.fieldName === field).values.push(word);
                }
              }
            }
          });
          this.createAutoMapStrings()
        }
      );
    }
  }

  clearAll() {
    this.autoMapConfig = []
    this.FIELD_NAMES.forEach(field => {
      this.autoMapConfig.push({
        threshold: DEFAULT_AUTOMAPPING_THRESHOLD,
        fieldName: field,
        values: []
      })
      this.autoMapStrings[field] = ''
    });
  }
}
