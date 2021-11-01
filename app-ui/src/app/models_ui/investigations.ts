import {InvestigationCreateRequest} from '../backend/model/investigationCreateRequest';

export interface  InvestigationConfig {
  data?: InvestigationCreateRequest;
  investigationType?: string;
  investigationId?: string;
}
