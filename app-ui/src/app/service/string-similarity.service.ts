import {Injectable} from '@angular/core';
import * as STSim from 'string-similarity';
import {HeadersSSResult, SSConfig, SSResult} from '../models/configuration';
import {ConfigurationService} from './configuration.service';

// @ts-ignore
@Injectable({
  providedIn: 'root'
})
export class StringSimilarityService {

  private ssConfig: SSConfig;

  constructor(protected configService: ConfigurationService) {
    this.ssConfig = this.configService.config.discover.ssConfig;
  }

  public compare(string1, string2): number {
    const re = STSim.compareTwoStrings(string1, string2);
    return re;
  }

  public findBestMatch(word: string, compareTo: string[]): SSResult {
    return STSim.findBestMatch(word, compareTo);
  }

  public autoMap = (fieldName: string, candidates: string[]): string => {
    const columns = this.ssConfig[fieldName] as string[];
    const possibleMap = columns?.map(element => {
      return this.findBestMatch(element, candidates);
    }).sort((a, b) => (a.bestMatch.rating > b.bestMatch.rating) ? -1 : 1);

    if (possibleMap && possibleMap.length > 0 && possibleMap[0].bestMatch.rating > this.ssConfig.threshold) {
      return candidates[possibleMap[0].bestMatchIndex];
    } else {
      return null;
    }
  }
}
