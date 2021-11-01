import { CaseInfo } from '@tibco-tcstk/tc-liveapps-lib';
import { WhoAmI } from '../backend/model/whoAmI';

export interface Configuration {
    uiAppId: string;
    sandboxId: number;
    user: WhoAmI;
    discover: any;
}

export interface AppInitializationInfo {
    applicationId: string;
    creatorId: string;
}

export interface NavBarMessage {
  id: string;
  message: string;
  persistClose: boolean;
}

export interface AutomapWord {
  word: string;
  occurrence: number;
}

export interface SSResult {
  ratings?: Rating[];
  bestMatch?: Rating;
  bestMatchIndex?: number;
  [k: string]: unknown;
}

export interface AutoMapResult {
  likelihood: number;
  occurrences: number;
  columnName: string;
}

export interface AllAutoMapResults {
  caseId?: AutoMapResult;
  activity?: AutoMapResult;
  requester?: AutoMapResult;
  resource?: AutoMapResult;
  resourceGroup?: AutoMapResult;
  startTime?: AutoMapResult;
  endTime?: AutoMapResult;
  scheduledStart?: AutoMapResult;
  scheduledEnd?: AutoMapResult;
  [k: string]: AutoMapResult;
}

export interface Rating {
  target?: string;
  rating?: number;
  [k: string]: unknown;
}


// To remove
export interface InvestigationConfig {
  numberApplications: number;
  caseConfig: CaseConfig[];
}

// CCS Case Configuration / Custom Case Table / Custom Case List / Custom Case View / Custom Case Details
// To remove
export interface CaseConfig {
  customTitle: string;
  appId: string;
  creatorId: string;
  creatorConfig: any;
  allowMultiple: boolean;
  showMilestone?: boolean;
  headerFields: CaseField[];
  detailTitle: CaseField;
  detailFields: CaseField[][];
  iconLocation?:string;
  states?: CaseStateConfig[];
}

export interface CaseField {
  label: string;
  field: string;
  format?: string;
}

export interface CaseStateConfig {
  name: string,
  color: string,
  icon?: string
}

export interface CaseEvent {
  caseInfo: CaseInfo,
  caseFieldEvent?: CaseField
}

export interface MessagingConfig {
  endpoint: string;
  key: string;
  configURL: string;
}

export interface AnalyticsMenuConfigUI {
  uiId?: string;
  id: string;
  label: string;
  icon?: string;
  enabled?: boolean;
  isDefault?: boolean;
  child?: AnalyticsMenuConfigUI[];
}

export type CardMode = 'copy' | 'select' | 'edit' | 'delete' ;

export interface CaseField {
  field: string;
  label: string,
  format?: string;
}
