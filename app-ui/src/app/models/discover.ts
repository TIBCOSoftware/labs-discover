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
    selectNewTemplate?: boolean;
}

export interface NewAnalysis {
    basicInfo: NewAnalysisBasicInfo,
    columns: string[],
    mapping: NewAnalysisMapping
}

export interface NewAnalysisBasicInfo {
    analysisName: string,
    analysisDescription: string
}
export interface NewAnalysisMapping {
    caseId?: string,
    activity?: string,
    start?: string,
    end?: string,
    resource?: string,
    other?: string[]
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

// export type InvestigationType = 'Compliance' | 'Improvement';

export type ContextType = 'Case' | 'Variants';

export interface NewInvestigation {
  type: string;
  contextType: ContextType;
  contextIds: string[];
  summary: string;
  additionalDetails?: string;
  templateName?: string;
  analysisId?: string;
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


export interface Cloudstarter {
  name: string;
  version: string;
  build_date: string;
  description: string;
}

export interface CSDescriptor {
  cloudstarter: Cloudstarter;
}
