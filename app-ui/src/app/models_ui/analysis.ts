export interface StartStop {
  startActivities?: string[],
  stopActivities?: string[]
}

export class MapDef {
  static PROP_NAMES: string[] = [
    'caseId',
    'activity',
    'requester',
    'resource',
    'resourceGroup',
  ];
  static PROP_NAMES_TIME: string[] = [
    'startTime',
    'endTime',
    'scheduledStart',
    'scheduledEnd'
  ];
}

export interface Schedule {
  Schedule: string;
  isSchedule: string;
}

export interface MappingDetails {
  fieldName: string;
  fieldDescription: string;
  lockFieldName: string;
  isLocked: boolean;
  isAutomapped: boolean;
  type: 'TIME' | 'STRING'
}

export interface MappingUI {
  mappings: MappingDetails[];
}

export interface ColumnUI {
  headerName: string;
  field: string;
  sortable: boolean;
  filter: boolean;
  resizable: boolean;
}

export interface PreviewUI {
  availableColumns: string[];
  columns: ColumnUI[];
  data: any;
}

export interface Option {
  label: string;
  value: string;
}

