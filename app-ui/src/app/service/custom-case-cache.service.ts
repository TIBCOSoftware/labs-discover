import { Injectable } from '@angular/core';
import {CaseInfo, LiveAppsService, TcCaseDataService} from '@tibco-tcstk/tc-liveapps-lib';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {LOCALE_ID, Inject} from '@angular/core';
import { CCEntry} from "../models/caseCacheModels";


@Injectable({
  providedIn: 'root'
})
export class CaseCacheService {

  private cCache = {};

  constructor(protected liveApps: LiveAppsService,
              protected caseDataService: TcCaseDataService,
              protected messageService: MessageTopicService,
              @Inject(LOCALE_ID) public locale: string) {
    this.cCache = {};
  }

  sandboxId: any;

  // Initial Cases to Load
  protected INITIAL_CASES_TO_LOAD = 30;
  protected CASES_TO_LOAD_AT_THE_TIME = 500;

  private TRY_TIMES = 20;
  private MS_DELAY = 1000;


  //private numberOfCharsAfterComma = 3;

  public init(sandboxId: number, appIds: string[]) {
    this.sandboxId = sandboxId;
    // TODO: Construct model and pass it as input.
    //this.caseAppId = appIds[0];
    for(let aId of appIds){
      const newEntry:CCEntry = {
        caseAppId: aId,
        caseArray: [],
        caseRefs: [],
        casesLoaded: false,
        loadingAdditional: false,
        hideTerminalStates: true
      };
      this.cCache[aId] = newEntry;
    }
    // This call is async, sot it does not hold up...
    (async () => {
      for(let aId of appIds) {
        await this.loadCases(aId);
      }
    })();
  }

  private getCCE(appId):CCEntry{
    return this.cCache[appId];
  }

  // Function to reload the Cases in the cache
  public async loadCases(appId) {
    const wsCaseRefs = await this.loadCaseRefsAsync(appId);
    this.getCCE(appId).caseRefs = wsCaseRefs;
    if (this.getCCE(appId).caseRefs.length > 0) {
      this.getCCE(appId).caseArray = await this.loadCasesAsync(appId, this.getCCE(appId).caseRefs);
    }
    this.getCCE(appId).casesLoaded = true;
  }

  public async loadAdditionalData(appId) {
    this.getCCE(appId).loadingAdditional = true;
    let areThereMoreCases = true;
    let callIndex = 0;
    while (areThereMoreCases) {
      const skip = (callIndex * this.CASES_TO_LOAD_AT_THE_TIME) + this.INITIAL_CASES_TO_LOAD;
      const pRefs = (await this.liveApps.caseSearchEntries('', this.sandboxId, this.getCCE(appId).caseAppId, '1', true, skip, this.CASES_TO_LOAD_AT_THE_TIME, undefined, undefined, this.getCCE(appId).hideTerminalStates).toPromise()).caserefs;
      if (pRefs && pRefs.length > 0) {
        const cases = await this.caseDataService.getCaseDataByRefs(this.sandboxId, pRefs).toPromise().catch(err => {
          if (err.status == 431) {
            this.reduceCasesToLoad(appId);
          } else {
            console.error('[CASE-CACHE:'+appId+'] caught an error ' + JSON.stringify(err));
          }
        });
        if (cases) {
          const casesTemp = new Array<CaseInfo>();
          for (const cI in cases) {
            casesTemp.push(cases[cI]);
          }
          this.getCCE(appId).caseRefs = this.getCCE(appId).caseRefs.concat(pRefs);
          this.getCCE(appId).caseArray = this.getCCE(appId).caseArray.concat(casesTemp);
          callIndex++;
          // show more loaded
          if (pRefs.length < this.CASES_TO_LOAD_AT_THE_TIME) {
            areThereMoreCases = false;
          } else {
            this.messageService.sendMessage('case.cache.loaded.' + appId, this.getCCE(appId).caseArray.length + '');
          }
        }
      } else {
        areThereMoreCases = false;
      }
    }
    // Signal All Cases Loaded
    this.messageService.sendMessage('case.cache.loaded.'+appId, 'OK');
    this.getCCE(appId).loadingAdditional = false;
  }

  public async loadCaseRefsAsync(appId): Promise<string[]> {
    if (!this.getCCE(appId).loadingAdditional) {
      // this.CasesLoaded = false;
      this.getCCE(appId).caseRefs = (await this.liveApps.caseSearchEntries('', this.sandboxId, this.getCCE(appId).caseAppId, '1', true, 0, this.INITIAL_CASES_TO_LOAD, undefined, undefined, this.getCCE(appId).hideTerminalStates).toPromise()).caserefs;
    } else {
      console.warn('[CASE-CACHE:'+appId+'] --- C - Still Loading Additional Data...');
      const mes = {
        type: 'WARNING',
        message: 'Still refreshing...'
      };
      this.messageService.sendMessage('news-banner.topic.message', 'MESSAGE:' + JSON.stringify(mes));
    }
    return this.getCCE(appId).caseRefs;
  }

  public async loadCasesAsync(appId, caseRefs: string[]): Promise<CaseInfo[]> {
    if (!this.getCCE(appId).loadingAdditional) {
      const re = new Array<CaseInfo>();
      const cases = await this.caseDataService.getCaseDataByRefs(this.sandboxId, caseRefs).toPromise();
      this.getCCE(appId).caseArray = new Array<CaseInfo>();
      for (const cas of cases) {
        re.push(cas);
      }
      this.getCCE(appId).caseArray = [...re];
      // Are there more cases on the server //TODO Switch these lines off if not working
      if (this.getCCE(appId).caseArray.length >= this.INITIAL_CASES_TO_LOAD) {
        this.loadAdditionalData(appId);
        this.messageService.sendMessage('case.cache.loaded', this.getCCE(appId).caseArray.length + '');
      } else {
        this.messageService.sendMessage('case.cache.loaded',  'OK');
      }
    } else {
      console.warn('[CASE-CACHE:'+appId+'] --- P - Still Loading Additional Data...');
    }
    return this.getCCE(appId).caseArray;
  }


  // Function to Refreh a specific set of ID's in Cache
  public async updateCasesInCache(appId, caseRefs: string[]) {
    // Getting the updated records
    const cases = await this.caseDataService.getCaseDataByRefs(this.sandboxId, caseRefs).toPromise();
    // for (let per in this.caseArray) {
    for (let i = 0; i < this.getCCE(appId).caseArray.length; i++) {
      for (const cas of cases) {
        if (cas.caseReference == this.getCCE(appId).caseArray[i].caseReference) {
          this.getCCE(appId).caseArray.splice(i, 1);
          this.getCCE(appId).caseArray.unshift(cas);
        }
      }
    }
  }

  public hardRefresh(appId) {
    (async () => {
      await this.loadCases(appId);
    })();
  }

  private async checkForLoaded(appId) {
    let i = 0;
    if (!this.getCCE(appId).casesLoaded) {
      while (!this.getCCE(appId).casesLoaded && i < this.TRY_TIMES) {
        i++;
        await new Promise(resolve => setTimeout(resolve, this.MS_DELAY));
      }
    }
    if (i >= this.TRY_TIMES) {
      console.warn('[CASE-CACHE:'+appId+'] Waited Too Long, Reloading the Cases: ' + i);
      await this.loadCases(appId);
    }
  }

  public async getCaseRefsP(appId): Promise<string[]> {
    await this.checkForLoaded(appId);
    return this.getCCE(appId).caseRefs;
  }

  public async getCasesP(appId): Promise<CaseInfo[]> {
    await this.checkForLoaded(appId);
    return this.getCCE(appId).caseArray;
  }

  public async getCasesPbyCaseRefs(appId, caseRefs: string[]): Promise<CaseInfo[]> {
    const re = new Array<CaseInfo>();
    if (caseRefs && caseRefs.length > 0) {
      await this.checkForLoaded(appId);
      for (const cRef of caseRefs) {
        for (const pers of this.getCCE(appId).caseArray) {
          if (pers.caseReference == cRef) {
            re.push(pers);
          }
        }
      }
    }
    return re;
  }

  private reduceCasesToLoad(appId) {
    this.CASES_TO_LOAD_AT_THE_TIME = Math.floor(this.CASES_TO_LOAD_AT_THE_TIME / 2);
    if (this.CASES_TO_LOAD_AT_THE_TIME <= 0) {
      this.CASES_TO_LOAD_AT_THE_TIME = 10;
    }
  }

}

