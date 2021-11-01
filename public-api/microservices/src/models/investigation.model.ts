import { InvestigationField, InvestigationState } from "./configuration.model";

export interface InvestigationDetails {
  id: string;
  data: any;
  metadata: InvestigationMetadata[];
}

export interface InvestigationMetadata {
  name: string;
  value: any;
}

export interface InvestigationActions {
  id: string;
  label: string;
  formData: string;
}

export interface Application {
  id: string;
  label: string;
}

export interface InvestigationTrigger {
  label: string;
  value: string;
  fields: InvestigationTriggerAttributes[];
}

export interface InvestigationTriggerAttributes {
  label: string;
  value: string;
}

export interface InvestigationApplicationDefinition {
  fields: InvestigationField[];
  creators: InvestigationTrigger[];
  states: InvestigationState[]
}

export interface InvestigationCreateRequest {
  analysisId: string;
  analysisName: string;
  templateId: string;
  templateName: string;
  details: string;
  ids: string;
  summary: string;
  type: string;
}

export interface InvestigationCreateResponse {
  id: string;
}