import {Injectable} from '@angular/core';
import * as STSim from 'string-similarity';
import {AutoMapResult, AutomapConfig, AutomapWord, SSResult, AllAutoMapResults, DiscoverConfiguration} from '../models_ui/configuration';
import {ConfigurationService} from './configuration.service';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {Mapping} from '../model/mapping';
import {cloneDeep} from 'lodash-es';
import {MapDef} from '../models_ui/analysis';
import { Automapping } from '../model/models';

@Injectable({
  providedIn: 'root'
})
export class AutoMappingService {

  private autoMapConfig: Automapping[];
  private MAX_DOUBLE_MAPPING_ITERATIONS = 1000;

  constructor(private configService: ConfigurationService,
              private messageService: MessageTopicService) {
    this.autoMapConfig = this.configService.config.discover.automap;
  }

  public compare(string1, string2): number {
    const re = STSim.compareTwoStrings(string1, string2);
    return re;
  }

  public findBestMatch(word: string, compareTo: string[]): SSResult {
    if (compareTo?.length > 0) {
      // console.log('Finding best match for: ' , word, ' on: ', compareTo);
      const result = STSim.findBestMatch(word, compareTo);
      // console.log('Best match result: ' , result);
      return result
    } else {
      return null;
    }
  }

  /*
  public autoMap = (fieldName: string, candidates: string[]): string => {
    const columns = this.autoMapConfig[fieldName] as string[];
    const possibleMap = columns?.map(element => {
      return this.findBestMatch(element, candidates);
    }).sort((a, b) => (a?.bestMatch.rating > b?.bestMatch.rating) ? -1 : 1);
    if (possibleMap && possibleMap.length > 0 && possibleMap[0]?.bestMatch.rating > this.autoMapConfig.threshold) {
      return candidates[possibleMap[0].bestMatchIndex];
    } else {
      return null;
    }
  }*/

  public autoMapOccurrence = (fieldName: string, candidates: string[]): AutoMapResult => {
    const columns = this.autoMapConfig[fieldName] as AutomapWord[];
    const possibleMap = columns?.map(element => {
      return {result: this.findBestMatch(element.word, candidates), occurrences: element.occurrence};
    }).sort((a, b) => (a?.result?.bestMatch?.rating > b?.result?.bestMatch?.rating) ? -1 : 1);
    if (possibleMap && possibleMap.length > 0 && possibleMap[0]?.result?.bestMatch?.rating > 0.8){ // this.autoMapConfig.threshold) {
      return {
        columnName: candidates[possibleMap[0].result.bestMatchIndex],
        likelihood: possibleMap[0]?.result.bestMatch.rating,
        occurrences: possibleMap[0]?.occurrences
      };
    } else {
      return null;
    }
  }

  public autoMapAll(allFields: string[], candidates: string[]): AllAutoMapResults {
    // console.log('AUTO MAP ALL] Fields: ', allFields , ' candidates: ', candidates);
    const re = {}
    // First mapping
    allFields.forEach(field => re[field] = this.autoMapOccurrence(field, candidates));
    // Check if there are double mappings
    let it = 0;
    while (this.areThereDoubleMappings(re) && it < this.MAX_DOUBLE_MAPPING_ITERATIONS) {
      it++;
      // console.log('There is a double mapping.');
      const colNames = [];
      const colMapResults: AutoMapResult[] = [];
      const colIndicatorValue = [];
      for (const val in re) {
        if (val && re[val]) {
          if (colNames.indexOf(re[val].columnName) > -1) {
            // Value is double
            const firstMapResult = colMapResults[colNames.indexOf(re[val].columnName)];
            const firstMapVal = colIndicatorValue[colNames.indexOf(re[val].columnName)];
            const secondMapResult = re[val] as AutoMapResult;
            // Remove element from candidates
            // console.log('Removing: ', re[val].columnName, '  i: ', candidates.indexOf(re[val].columnName))
            candidates.splice(candidates.indexOf(re[val].columnName), 1);
            // If likelyhoods are the same look at occurence
            if (firstMapResult.likelihood === secondMapResult.likelihood) {
              // console.log('Likelyhoods are the same...');
              if(firstMapResult.occurrences > secondMapResult.occurrences){
                re[val] = this.autoMapOccurrence(val, candidates)
              } else {
                re[firstMapVal] = this.autoMapOccurrence(firstMapVal, candidates)
              }
            } else {
              if (firstMapResult.likelihood > secondMapResult.likelihood) {
                // First map-result stays
                re[val] = this.autoMapOccurrence(val, candidates)
              } else {
                // Second map result stays
                re[firstMapVal] = this.autoMapOccurrence(firstMapVal, candidates)
              }
            }
          } else {
            colNames.push(re[val].columnName);
            colMapResults.push(re[val])
            colIndicatorValue.push(val);
          }
        }
      }
    }
    // console.log('Automap Result: ' , re);
    return re;
  }

  private areThereDoubleMappings(results: AllAutoMapResults): boolean {
    let re = false;
    const columNames = [];
    for (const val in results) {
      if (val && results[val]) {
        // console.log('Result: ', val, ' Value: ' , results[val]);
        if (columNames.indexOf(results[val].columnName) > -1) {
          // Value is double
          re = true;
        } else {
          columNames.push(results[val].columnName);
        }
      }
    }
    if (!re) {
      // console.log('There are no more double mappings !!!');
    }
    return re;
  }

  storeMappings(mapping: Mapping){
    this.configService.readConfig().then( config => {
      const discover: DiscoverConfiguration = cloneDeep(config.discover);
      let changeMade = false;
      const FIELD_NAMES = MapDef.PROP_NAMES.concat(MapDef.PROP_NAMES_TIME);
      FIELD_NAMES.forEach( field => {
        let fieldExist = false;
        if(!discover.autoMapConfig[field]){
          discover.autoMapConfig[field] = []
        }
        if(mapping[field]) {
          for (const word of discover.autoMapConfig[field]) {
            if (word.word === mapping[field]) {
              word.occurrence++
              changeMade = true;
              fieldExist = true;
            }
          }
          if (!fieldExist) {
            discover.autoMapConfig[field].push({
              word: mapping[field],
              occurrence: 1
            });
            changeMade = true;
          }
        }
      })
      if(changeMade) {
        this.configService.updateDiscoverConfig(this.configService.config.sandboxId, this.configService.config.uiAppId, discover, discover.id).subscribe(
          async (_) => {
            this.messageService.sendMessage('news-banner.topic.message', 'Mappings saved...');
            await this.configService.refresh();
            this.autoMapConfig = this.configService.config.discover.automap;
          }
        );
      }
    })
  }

}
