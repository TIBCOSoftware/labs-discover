import {SpotfireConfig} from '@tibco-tcstk/tc-spotfire-lib';
import {ProcessAnalysis} from './ProcessAnalysisModel';
import { DataVirtualizationTable } from './tdv';

export interface Datasource {
    datasourceId: string;
    description: string;
    caseRef: string;
    idDefinition: string;
    addSuffix: boolean;
    analysisName?: string;
    analysisDescription?: string;
    analysisCreatedBy?: string;
    analysisCreatedOn?: string;
}

export interface NewAnalysis {
    basicInfo: NewAnalysisBasicInfo,
    datasource: NewAnalysisDatasource,
    columns: string[],
    parse: NewAnalysisParse,
    mapping: NewAnalysisMapping
}

export interface NewAnalysisBasicInfo {
    analysisName: string,
    analysisDescription: string
}

export interface NewAnalysisDatasource {
    inputType: string,
    file?: NewAnalysisDatasourceFile,
    tdv?: NewAnalysisDatasourceTDV
}

export interface NewAnalysisDatasourceFile {
    filename: string,
    location: string
}

export interface NewAnalysisDatasourceTDV {
    username: string,
    password: string,
    site: string,
    domain: string,
    database: string,
    table: string,
    query: string,
    numPartition: string,
    primaryKey: string,
    tdvTable: DataVirtualizationTable
}

export interface NewAnalysisParse {
    skipComments?: boolean,
    comments?: string,
    columnSeparator?: string,
    numberRowsForPreview?: number,
    skipEmptyLines?: boolean,
    encoding?: string,
    dateTimeFormat?: string,
    quoteChar?: string,
    escapeChar?: string
}

export interface NewAnalysisMapping {
    caseId?: string,
    activity?: string,
    start?: string,
    end?: string,
    resource?: string,
    other?: string
}

export interface NewAnalysisStepStatus {
    step: string,
    completed: boolean
}

export interface FullSpotfireConfig {
  hasAnalytics: boolean,
  name?: string,
  dataSource?: Datasource,
  analytic?: ProcessAnalysis
  /*parameters?: string*/
}

export type InvestigationType = 'Compliance' | 'Improvement';

export interface NewInvestigation {
  type: InvestigationType,
  summary: string,
  additionalDetails?: string
}

export interface TCM_Message_discover_actions {
  analysis_id: string;
  ids: number[];
  label: string;
  case_type: string;
  LAcase_state: string;
  LAcase_ref: string;
  timestamp: string;
  isReference: number;
}
