import { Template } from '../model/template';
import {AnalyticsMenuConfigUI} from './configuration';
import {TemplateFilterConfig} from '../model/templateFilterConfig';

export type anType = 'General' | 'Vertical' | 'User defined';

export interface AnalyticTemplateUI extends Template {
  // name: string;
  // type: anType;
  // enabled?: boolean;
  // description?: string;
  // icon?: string;
  // splash?: string;
  // spotfireLocation?: string;
  // menuConfig?: AnalyticsMenuConfig[];
  // marking?: AnalyticsMarkingConfig;
  // previewParameters?: string;
  // This field is just for the UI to store between pages if the DXP needs to be copied
  menuConfig?: AnalyticsMenuConfigUI[];
  filters?: TemplateFilterConfigUI[];
  spotfireServer?: string;
  doCopyDXP?: boolean;
  newDXPName?: string;
}

export interface TemplateFilterConfigUI extends TemplateFilterConfig {
  uiId?: string;
}


export interface AnalyticsMarkingConfig {
  listenOnMarking: string;
  casesSelector: string;
  variantSelector: string;
}

export interface MConfig {
  markingName: string;
  dataTable: string;
  columnName: string;
}

export interface StepStatus {
  step: string;
  completed: boolean;
}