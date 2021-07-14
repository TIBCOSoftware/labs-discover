import {Component, OnInit} from '@angular/core';
import {cloneDeep, isEqual} from 'lodash-es';
import {ConfigurationService} from '../../service/configuration.service';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {AllAutoMapResults, AutomapWord, DiscoverConfiguration} from '../../models_ui/configuration';
import {AutoMappingService} from '../../service/auto-mapping.service';
import {MapDef} from '../../models_ui/analysis';
import {map} from 'rxjs/operators';
import {RepositoryService} from '../../api/repository.service';

@Component({
  selector: 'settings-automap',
  templateUrl: './settings-automap.component.html',
  styleUrls: ['./settings-automap.component.css']
})
export class SettingsAutomapComponent implements OnInit {

  constructor(private configService: ConfigurationService,
              private messageService: MessageTopicService,
              private autoMapService: AutoMappingService,
              private repositoryService: RepositoryService) {
  }

  discover: DiscoverConfiguration;
  showTestResult: boolean;
  testValue = 'Case, ResourceHeader, End, beginning, Task, AdditionalHeader';

  autoMapResults: AllAutoMapResults = {};

  FIELD_NAMES = MapDef.PROP_NAMES.concat(MapDef.PROP_NAMES_TIME);

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
      const wordMappingToStore: AutomapWord[] = []
      const wordsAndO = event.detail.value.split(',');
      for (const wAO of wordsAndO) {
        const aMapWord: AutomapWord = {
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
        if(aMapWord.word !== '') {
          wordMappingToStore.push(aMapWord);
        }
      }
      this.discover.autoMapConfig[field] = wordMappingToStore;
    } else {
      if (event.detail.value[0] === '') {
        this.discover.autoMapConfig[field] = [];
      } else {
        this.discover.autoMapConfig[field] = event.detail.value
      }
    }
    this.testChanged();
  }

  public handleUpdatethreshold = (event): void => {
    this.discover.autoMapConfig.threshold = event.detail.value;
    this.testChanged();
  }

  createWordsString(words: AutomapWord[]): string {
    let re = '';
    if (words && words.length) {
      for (const word of words) {
        if(word && word.word && word.word.trim() !== '') {
          re += word.word + '(' + word.occurrence + '), '
        }
      }
      if (re.length > 2) {
        re = re.substring(0, re.length - 2);
      }
    }
    return re;
  }

  testChanged() {
    // this.FIELD_NAMES.forEach(field => this.autoMapResults[field] = this.autoMapService.autoMapOccurrence(field,this.testValue.split(',')));
    this.autoMapResults = this.autoMapService.autoMapAll(this.FIELD_NAMES, this.testValue.split(','));
    // console.log('Automapping Result: ', this.autoMapResults);
    this.showTestResult = true;
  }

  getWords() {
    // // Get words from previous cases
    this.repositoryService.getAnalysis().subscribe(
      analysis => {
        this.FIELD_NAMES.forEach(field => {
          for (const ana of analysis) {
            if (ana.metadata.state === 'Ready') {
              let addField = true;
              if(this.discover.autoMapConfig[field] && this.discover.autoMapConfig[field].length > 0) {
                for (const resWord of this.discover.autoMapConfig[field]) {
                  if (resWord.word === ana.data.mappings[field]) {
                    addField = false;
                    for (const mapW of this.discover.autoMapConfig[field]) {
                      if (mapW.word === ana.data.mappings[field]) {
                        mapW.occurrence++
                      }
                    }
                  }
                }
              }
              if (addField && ana.data.mappings[field] && ana.data.mappings[field].trim() !== '') {
                const word: AutomapWord = {
                  word: ana.data.mappings[field],
                  occurrence: 1
                }
                if(!this.discover.autoMapConfig[field]){
                  this.discover.autoMapConfig[field] = [];
                }
                this.discover.autoMapConfig[field].push(word);
              }
            }
          }
        });
      }
    );
  }

  clearAll() {
    this.FIELD_NAMES.forEach(field => this.discover.autoMapConfig[field] = []);
  }
}
