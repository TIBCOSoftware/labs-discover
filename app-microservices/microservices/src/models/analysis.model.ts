 export interface Analysis {
  data: AnalysisData;
  metadata: Metadata;
  actions: Actions[];
}

export interface AnalysisData {
  ID: string;
  Name: string;
  Description: string;
  Organization?: string;
  Dataset: string;
  Template: string;
  State: string;
  Mapping: Mapping;
  Filters: TypeValue[];
  Groups: TypeValue[];
}

export interface AnalysisRequest {
  Name: string;
  Description: string;
  Dataset: string;
  Mapping: Mapping;
  Filters: TypeValue[];
  Groups: TypeValue[];
}

export interface Mapping {
  CaseID: string;
  Activity: string;
  Starttime: string;
  Endtime: string;
  Scheduledstart: string;
  Scheduledend: string;
  Requester: string;
  Resource: string;
  Resourcegroup: string;
  Otherattributes: boolean;
}

export interface Actions {
  id: string;
  label: string;
}

 export interface Metadata {
  createdBy: string;
  createdOn: string;
  modifiedBy: string;
  modifiedOn: string;
}

export interface TypeValue {
  Name?: string;
  Description?: string;
  Type: string;
  Value: string[];
  IncludeEmpty?: boolean
}

export interface AnalysisStatus {
  Organisation?: string;
  JobName?: string;
  AnalysisID?: string;
  Message: string;
  Level?: string; // "ERROR|INFO",
  Progression: number;
  TimeStamp?: string;
}

  