import {DatasetSource} from '../backend/model/datasetSource';

export class DatasetWizard {
    numberRowsForPreview?: number;
    dataSourceChanged?: boolean;
    attributesUnpredicted?: boolean;
    skipComments?: boolean;
    skipEmptyLines?: boolean;
    dataSourceType?: string;
}

export interface DiscoverFileInfo {
  file: File,
  dataSource: DatasetSource
}
