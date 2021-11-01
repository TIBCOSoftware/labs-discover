import {Injectable} from '@angular/core';
import * as STSim from 'string-similarity';
import {
  AutoMapResult,
  AutomapWord,
  SSResult,
  AllAutoMapResults,
} from '../models_ui/configuration';
import {ConfigurationService} from 'src/app/backend/api/configuration.service';
import {Mapping} from '../backend/model/mapping';
import {MapDef} from '../models_ui/analysis';
import {Automapping} from '../backend/model/models';
import {map} from 'rxjs/operators';
import {DEFAULT_AUTOMAPPING_THRESHOLD} from '../app.settings';

@Injectable({
  providedIn: 'root'
})
export class AutoMappingService {

  public autoMapConfig: Automapping[] = [];
  private MAX_DOUBLE_MAPPING_ITERATIONS = 1000;

  constructor(private configurationService: ConfigurationService) {
    (async () => {
     this.autoMapConfig = await this.getAutoMapConfig()
    })();
  }

  public async getAutoMapConfig() {
    return new Promise<Automapping[]>(resolve => {
      this.configurationService.getAutomap().pipe(map( res => {
        this.autoMapConfig = res;
        return res
      })).subscribe(result => resolve(result));
    })
  }

  public async saveAutoMapConfig(AMConfig: Automapping[] ) {
    return new Promise<void>(resolve => {
      this.configurationService.postAutomap(AMConfig).subscribe(_ => resolve());
    })
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

  public autoMapOccurrence = (fieldName: string, candidates: string[], customConfig?: Automapping[]): AutoMapResult => {
    let amConfig = this.autoMapConfig.find(v => v.fieldName === fieldName);
    if(customConfig) {
      amConfig = customConfig.find(v => v.fieldName === fieldName);
    }
    if (amConfig) {
      const columns = amConfig.values as AutomapWord[];
      const possibleMap = columns?.map(element => {
        return {result: this.findBestMatch(element.word, candidates), occurrences: element.occurrence};
      }).sort((a, b) => (a?.result?.bestMatch?.rating > b?.result?.bestMatch?.rating) ? -1 : 1);
      if (possibleMap && possibleMap.length > 0 && possibleMap[0]?.result?.bestMatch?.rating > amConfig.threshold) {
        return {
          columnName: candidates[possibleMap[0].result.bestMatchIndex],
          likelihood: possibleMap[0]?.result.bestMatch.rating,
          occurrences: possibleMap[0]?.occurrences
        };
      }
    }
    return null;
  }

  public autoMapAll(allFields: string[], candidates: string[], customConfig?: Automapping[]): AllAutoMapResults {
    // console.log('AUTO MAP ALL] Fields: ', allFields , ' candidates: ', candidates);
    const re = {}
    // First mapping
    allFields.forEach(field => re[field] = this.autoMapOccurrence(field, candidates, customConfig));
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
              if (firstMapResult.occurrences > secondMapResult.occurrences) {
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

  async storeMappings(mapping: Mapping) {
    this.autoMapConfig = await this.getAutoMapConfig()
      let changeMade = false;
      const FIELD_NAMES = MapDef.PROP_NAMES.concat(MapDef.PROP_NAMES_TIME);
      FIELD_NAMES.forEach(field => {
        let fieldExist = false;
        if (!this.autoMapConfig.find(v => v.fieldName === field)) {
          this.autoMapConfig.push({
            fieldName: field,
            values: [],
            threshold: DEFAULT_AUTOMAPPING_THRESHOLD
          })
        }
        if (mapping[field]) {
          const words = this.autoMapConfig.find(v => v.fieldName === field).values
          for (const word of words) {
            if (word.word === mapping[field]) {
              word.occurrence++
              changeMade = true;
              fieldExist = true;
            }
          }
          if (!fieldExist) {
            words.push({
              word: mapping[field],
              occurrence: 1
            });
            changeMade = true;
          }
        }
      })
      if (changeMade) {
        await this.saveAutoMapConfig(this.autoMapConfig)
      }
  }
}
