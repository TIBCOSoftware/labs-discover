export interface AnalysisRequest {
  name: string;
  description: string;
  datasetId: string;
  mappings: Mapping;
  filters: TypeValue[];
  groups: TypeValue[];
}

export interface Analysis {
  id: string;
  data: AnalysisData;
  metadata: AnalysisMetadata;
  actions: String[];
}

export interface AnalysisData {
  name: string;
  description: string;
  datasetId: string;
  templateId: string;
  mappings: Mapping;
  filters: TypeValue[];
  groups: TypeValue[];
  progress: number;
}

export interface Mapping {
  caseId: string;
  activity: string;
  startTime: string;
  endTime: string;
  scheduledStart: string;
  scheduledEnd: string;
  requester: string;
  resource: string;
  resourceGroup: string;
  otherAttributes: boolean;
}

 export interface AnalysisMetadata {
  state: string;
  sparkJobName: string;
  message: string;
  createdBy: string;
  createdOn: number;
  modifiedBy: string;
  modifiedOn: number;
  lockedBy: string;
  lockedOn: number;
}

export interface TypeValue {
  name?: string;
  description?: string;
  filterType: string;
  values: string[];
  includeEmpty?: boolean
}

export interface AnalysisStatus {
  organisation?: string;
  jobName?: string;
  analysisId?: string;
  message: string;
  level?: string; // "ERROR|INFO",
  progression: number;
  timeStamp?: string;
}

  