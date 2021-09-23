import { Claim, GeneralConfig } from '@tibco-tcstk/tc-core-lib';
import { TDVConfig } from './tdv';
import { CSVConfig } from './csv';
import { CaseInfo, LandingPageConfig } from '@tibco-tcstk/tc-liveapps-lib';
import { Observable } from 'rxjs';
import {AnalyticTemplateUI} from './analyticTemplate';
// import { ApplicationConfiguration } from '../model/models'

export interface Configuration {
    uiAppId: string;
    sandboxId: number;
    claims: Claim;
    discover: any;
}

export interface AppInitializationInfo {
    applicationId: string;
    creatorId: string;
}

export interface DiscoverConfiguration {
  id: string;
  investigations: InvestigationConfig;
  analysis: AppInitializationInfo;
  tdv: TDVConfig;
  csv: CSVConfig;
  messaging: MessagingConfig;
  storage: StorageConfig;
  analytics: AnalyticsConfig;
  analyticsSF: AnalyticsConfigSF;
  landingPage: LandingPageConfig;
  general: GeneralConfig;
  dateTimeFormats: string[];
  autoMapConfig: AutomapConfig;
  analyticTemplates: AnalyticTemplateUI[];
  navBarMessages?: NavBarMessage[];
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

export interface AutomapConfig {
  caseId: AutomapWord[];
  activity: AutomapWord[];
  startTime: AutomapWord[];
  endTime: AutomapWord[];
  requester: AutomapWord[];
  resource: AutomapWord[];
  resourceGroup: AutomapWord[];
  scheduledStart: AutomapWord[];
  scheduledEnd: AutomapWord[];
  threshold: number;
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
  showMilestones?: boolean;
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

export interface StorageConfig {
  type: string;
  batchSize: number;
  partitions: number;
  url: string;
  driver: string;
  username: string;
  password: string;
}


export interface AnalyticsConfigSF {
  previewDXPLocation: string;
  previewDataTableName: string;
  customUserDXPFolder: string;
  customServer?: string;
}

export interface AnalyticsConfig {
  useCustomServer: boolean;
  server: string;
  customServer: string;
  template: string;
  edit?: boolean;
  menuConfig: AnalyticsMenuConfigUI[];
  marking: AnalyticsMarkingConfig[];
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

/*
export interface UIMenu extends AnalyticsMenuConfig {
  child?: UIMenu[];
} */


export interface AnalyticsMarkingConfig {
  type: string;
  table: string;
  marking: string;
}

export type CardMode = 'copy' | 'select' | 'edit' | 'delete' ;

export interface ResetAction {
  label: string;
  action: Observable<any>;
  done: boolean;
}

export interface CaseField {
  field: string;
  label: string,
  format?: string;
}
