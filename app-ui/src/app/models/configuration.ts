import { Claim, GeneralConfig } from '@tibco-tcstk/tc-core-lib';
import { TDVConfig } from './tdv';
import { CSVConfig } from './csv';
import { CaseInfo, LandingPageConfig } from '@tibco-tcstk/tc-liveapps-lib';
import { Observable } from 'rxjs';
import {AnalyticTemplateUI} from './analyticTemplate';

export interface Configuration {
    uiAppId: string;
    sandboxId: number;
    claims: Claim;
    discover: DiscoverConfiguration;
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
  ssConfig: SSConfig;
<<<<<<< HEAD
  analyticTemplates: AnalyticTemplateUI[];
  navBarMessages?: NavBarMessage[];
}

export interface NavBarMessage {
  id: string;
  message: string;
  persistClose: boolean;
}

export interface SSConfig {
  CaseID: string[];
  Activity: string[];
  Starttime: string[];
  Endtime: string[];
  Requester: string[];
  Resource: string[];
  Resourcegroup: string[];
  Scheduledstart: string[];
  Scheduledend: string[];
  threshold: number;
=======
}

export interface SSConfig {
  caseIdWords: string[];
  resourceWords: string[];
  activityWords: string[];
  startWords: string[];
  endWords: string[];
  doAddAdditional: boolean;
  threshold: number;
  debug: boolean;
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
}

export interface SSResult {
  ratings?: Rating[];
  bestMatch?: Rating;
  bestMatchIndex?: number;
  [k: string]: unknown;
}

export interface HeadersSSResult {
  caseIdColumn: string;
  caseIdRating?: number;
  resourceColumn: string;
  resourceRating?: number;
  activityColumn: string;
  activityRating?: number;
  startColumn: string;
  startRating?: number;
  endColumn: string;
  endRating?: number;
  otherFields?: string[];
}


export interface Rating {
  target?: string;
  rating?: number;
  [k: string]: unknown;
}


export interface InvestigationConfig {
  numberApplications: number;
  caseConfig: CaseConfig[];
}

// CCS Case Configuration / Custom Case Table / Custom Case List / Custom Case View / Custom Case Details

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
