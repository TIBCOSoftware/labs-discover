import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'src/app/api/configuration.service';
import { map } from 'rxjs/operators';
import { Automapping } from 'src/app/model/automapping';
import { AutomapingField } from 'src/app/model/automapingField';

@Component({
  selector: 'settings-automap',
  templateUrl: './settings-automap.component.html',
  styleUrls: ['./settings-automap.component.css']
})
export class SettingsAutomapComponent implements OnInit {

  public automap: Automapping[];

  constructor(
    protected configurationService: ConfigurationService
  ) {}

  // discover: DiscoverConfiguration;
  showTestResult: boolean;
  testValue = 'Case, ResourceHeader, End, beginning, Task, AdditionalHeader';

  // autoMapResults: AllAutoMapResults = {};

  // FIELD_NAMES = MapDef.PROP_NAMES.concat(MapDef.PROP_NAMES_TIME);

  ngOnInit(): void {
    this.handleReset();
    this.showTestResult = false;
    this.testChanged();
  }

  public handleSave = (): void => {
    // if (!isEqual(this.discover, this.configService.config.discover)) {
    //   this.configService.updateDiscoverConfig(this.configService.config.sandboxId, this.configService.config.uiAppId, this.discover, this.discover.id).subscribe(
    //     _ => {
    //       this.messageService.sendMessage('news-banner.topic.message', 'Settings saved...');
    //       this.configService.refresh();
    //     }
    //   );
    // }
  }

  public handleReset = (): void => {
    this.configurationService.getAutomap().pipe(
      map((result: Automapping[]) => {
        this.automap = result;
      })
    ).subscribe();
  }

  handleUpdate(event, field) {
    // if (event?.detail?.value?.split) {
    //   const wordMappingToStore: AutomapWord[] = []
    //   const wordsAndO = event.detail.value.split(',');
    //   for (const wAO of wordsAndO) {
    //     const aMapWord: AutomapWord = {
    //       word: '',
    //       occurrence: 0
    //     }
    //     if (wAO.indexOf('(') > -1 && wAO.indexOf(')') > -1) {
    //       aMapWord.word = wAO.substring(0, wAO.indexOf('(')).trim();
    //       aMapWord.occurrence = Number(wAO.substring(wAO.indexOf('(') + 1, wAO.indexOf(')')))
    //     } else {
    //       aMapWord.word = wAO.trim();
    //       aMapWord.occurrence = 0;
    //     }
    //     if(aMapWord.word !== '') {
    //       wordMappingToStore.push(aMapWord);
    //     }
    //   }
    //   this.discover.autoMapConfig[field] = wordMappingToStore;
    // } else {
    //   if (event.detail.value[0] === '') {
    //     this.discover.autoMapConfig[field] = [];
    //   } else {
    //     this.discover.autoMapConfig[field] = event.detail.value
    //   }
    // }
    // this.testChanged();
  }

  public handleUpdatethreshold = (event): void => {
    // this.discover.autoMapConfig.threshold = event.detail.value;
    // this.testChanged();
  }

  createWordsString(field: string): string {
    return this.automap.
      filter((el: Automapping) => el.fieldName === field)[0].values
      .map(
        ((el: AutomapingField) => {
          return el.word + '(' + el.occurrence + ')'
        })
      ).join(', ');
  }

  testChanged() {
    // // this.FIELD_NAMES.forEach(field => this.autoMapResults[field] = this.autoMapService.autoMapOccurrence(field,this.testValue.split(',')));
    // this.autoMapResults = this.autoMapService.autoMapAll(this.FIELD_NAMES, this.testValue.split(','));
    // // console.log('Automapping Result: ', this.autoMapResults);
    // this.showTestResult = true;
  }

  getWords() {
    // ********** Should be an API call

    // // // Get words from previous cases
    // this.repositoryService.getAnalysis().subscribe(
    //   analysis => {
    //     this.FIELD_NAMES.forEach(field => {
    //       for (const ana of analysis) {
    //         if (ana.metadata.state === 'Ready') {
    //           let addField = true;
    //           if(this.discover.autoMapConfig[field] && this.discover.autoMapConfig[field].length > 0) {
    //             for (const resWord of this.discover.autoMapConfig[field]) {
    //               if (resWord.word === ana.data.mappings[field]) {
    //                 addField = false;
    //                 for (const mapW of this.discover.autoMapConfig[field]) {
    //                   if (mapW.word === ana.data.mappings[field]) {
    //                     mapW.occurrence++
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //           if (addField && ana.data.mappings[field] && ana.data.mappings[field].trim() !== '') {
    //             const word: AutomapWord = {
    //               word: ana.data.mappings[field],
    //               occurrence: 1
    //             }
    //             if(!this.discover.autoMapConfig[field]){
    //               this.discover.autoMapConfig[field] = [];
    //             }
    //             this.discover.autoMapConfig[field].push(word);
    //           }
    //         }
    //       }
    //     });
    //   }
    // );
  }

  clearAll() {
    // this.FIELD_NAMES.forEach(field => this.discover.autoMapConfig[field] = []);
  }
}
