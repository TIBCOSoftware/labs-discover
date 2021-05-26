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
<<<<<<< HEAD
  }

  public compare(string1, string2): number {
    const re = STSim.compareTwoStrings(string1, string2);
=======
    this.log('Created with Config: ', this.ssConfig);
  }

  public compare(string1, string2): number {
    this.log('Comparing ' + string1 + ' and ' + string2);
    const re = STSim.compareTwoStrings(string1, string2);
    this.log(' --> Matches: ', re);
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
    return re;
  }

  public findBestMatch(word: string, compareTo: string[]): SSResult {
<<<<<<< HEAD
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
=======
    this.log('Finding best match on: ', word, ' in list: ', compareTo);
    const re: SSResult = STSim.findBestMatch(word, compareTo);
    this.log('Found best match: ', re);
    return re;
  }

  public autoMap(possibleHeaders: string[], configToUse?: SSConfig): HeadersSSResult {
    let config = this.ssConfig;
    if(configToUse){
      config = configToUse;
    }

    let myPossibleHeaders = [...possibleHeaders];
    this.log('        Auto Map on Possible headers: ', possibleHeaders);
    let possibleHeadersLower = possibleHeaders.map(v => v.toLowerCase());
    this.log('Auto Map on Possible headers (lower): ', possibleHeadersLower);

    const re: HeadersSSResult = {
      caseIdColumn: 'none',
      caseIdRating: 0,
      resourceColumn: 'none',
      resourceRating: 0,
      activityColumn: 'none',
      activityRating: 0,
      startColumn: 'none',
      startRating: 0,
      endColumn: 'none',
      endRating: 0
    }
    // We need to figure out which columns to set
    // So the possible headers can be any Columns, if they meet the threshold
    // We can't send back one possible header for multiple columns
    // Go over each header and then determine if they are case ID Column.
    let columsToMatch = ['caseId', 'resource', 'activity', 'start', 'end'];
    // FIND THE CASE ID Column
    const limit = 10;
    let index = 0;
    let searchMoreColums = true;
    while (searchMoreColums && index < limit) {
      index++;
      for (const col of columsToMatch) {
        for (const cIDWord of config[col + 'Words']) {
          if (possibleHeadersLower.length > 0) {
            const ciMatch = this.findBestMatch(cIDWord.toLowerCase(), possibleHeadersLower);
            // console.log(re[col + 'Rating']);
            if (re[col + 'Rating'] < ciMatch.bestMatch.rating && ciMatch.bestMatch.rating > config.threshold) {
              // Check if this one is already added to another rating
              let doAdd = true;
              for (const colComp of columsToMatch) {
                // console.log('[SS]' + colComp + ' !== ' + col + ' && ' + re[colComp + 'Column'] + ' !== ' + 'none' + ' && ' + re[colComp + 'Column'] + ' !== ' + 'removed');
                if (colComp !== col && re[colComp + 'Column'] !== 'none' && re[colComp + 'Column'] !== 'removed') {
                  if (re[colComp + 'Column'].toLowerCase() === ciMatch.bestMatch.target) {
                    // Header is already once selected, we won't select it again; TODO: Why does start get added twice ??
                    // Start, End
                    // console.log('[SS] Rating used: (' + colComp + '):' + re[colComp + 'Rating'] + ' New Rating: ' + ciMatch.bestMatch.rating);
                    if (re[colComp + 'Rating'] > ciMatch.bestMatch.rating) {
                      doAdd = false;
                    } else {
                      doAdd = true;
                      // console.log('[SS] Removing: ', colComp, ' --> ', re[colComp + 'Column']);
                      re[colComp + 'Column'] = 'removed';
                      // console.log('[SS]  Removed: ', colComp, ' --> ', re[colComp + 'Column']);
                      re[colComp + 'Rating'] = 0;
                      // console.log('[SS] RE INT: ', re);
                    }
                    this.log('Not adding ' + ciMatch.bestMatch.target + ' to ' + col + 'Column cause it exists on ' + colComp + 'Column (' + re[colComp + 'Column'] + ')');
                  }
                }
              }
              if (doAdd) {
                // console.log('[SS] Adding: ', ciMatch.bestMatch, ciMatch.bestMatchIndex, myPossibleHeaders[ciMatch.bestMatchIndex], ' to ', col + 'Column');
                re[col + 'Column'] = myPossibleHeaders[ciMatch.bestMatchIndex]; // ciMatch.bestMatch.target;
                re[col + 'Rating'] = ciMatch.bestMatch.rating;
              }
            }
            // console.log(ciMatch.ratings[ciMatch.bestMatchIndex].rating);
          }
        }
      }
      searchMoreColums = false;
      // Remove headers that are used from possibleHeadersLower
      let newColumsToMatch = [...columsToMatch];
      // Remove colums that are matched
      for (const colComp of columsToMatch) {
        if (re[colComp + 'Column'] === 'removed') {
          searchMoreColums = true;
        } else {
          if (re[colComp + 'Column'] !== 'none') {
            // Remove used headers
            possibleHeadersLower = [...possibleHeadersLower.filter(e => e !== (re[colComp + 'Column']).toLowerCase())];
            myPossibleHeaders = [...myPossibleHeaders.filter(e => e !== (re[colComp + 'Column']))];
            newColumsToMatch = newColumsToMatch.filter(e => e !== colComp);
          }
        }
      }
      columsToMatch = [...newColumsToMatch];
      // console.log('[SS] INDEX: ' , index, ' Columns to Match: ' , columsToMatch);
      // console.log('[SS] LOWER: ' , possibleHeadersLower);
      // console.log('[SS]    RE: ' , re);
      // if there are colums that are removed run again
    }
    // If there are items that did not find a match set them back to none
    for (const colComp of ['caseId', 'resource', 'activity', 'start', 'end']) {
      if (re[colComp + 'Column'] === 'removed') {
        re[colComp + 'Column'] = 'none';
      }
    }

    // Add other fields
    if(config.doAddAdditional){
      re.otherFields = [];
      for(const head of possibleHeaders){
        let doAdd = true;
        const myColumsToMatch = ['caseId', 'resource', 'activity', 'start', 'end'];
        for (const colComp of myColumsToMatch) {
          // this.log('colComp', colComp , '=' , head);
          if (re[colComp + 'Column'] === head) {
            // do not add since it is selected
            doAdd = false;
          }
        }
        if(doAdd){
          this.log('Adding additional Field: ', head);
          re.otherFields.push(head);
        }
      }
    }
    return re;
  }

  private log(...message) {
    if (this.ssConfig.debug) {
      console.log('[STRING SIMILARITY SERVICE] ', ...message);
    }
  }

>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
}
