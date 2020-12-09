import {CaseInfo} from "@tibco-tcstk/tc-liveapps-lib";

/*
export interface CaseCache {
  caseCacheEntries: CaseCacheEntry[];
}*/

export interface CCEntry {
  caseAppId: string;
  caseRefs: string[];
  caseArray: CaseInfo[];
  casesLoaded: boolean;
  hideTerminalStates: boolean;
  loadingAdditional: boolean;
  // TODO: Implement; only load first 30 and then wait for message to load the rest
  lazyLoad?:boolean;
  // TODO: Implement; start loading after the delay
  loadDelayMS?:number;
}
