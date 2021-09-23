import {Location} from '@angular/common';
import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {cloneDeep, isEqual} from 'lodash-es';
import {Dataset, DatasetListItem, DatasetSchema, DatasetWizard} from 'src/app/models_ui/dataset';
import {DatasetService} from 'src/app/service/dataset.service';
import {notifyUser} from '../../../functions/message';
import {NewAnalysisStepStatus} from '../../../models_ui/discover';
import {ConfigurationService} from '../../../service/configuration.service';
import {CsvService} from '../../../service/csv.service';
import {DiscoverBackendService} from '../../../service/discover-backend.service';
import {TDVService} from '../../../service/tdv.service';

@Component({
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class NewDatasetWizardComponent implements OnInit {

  @Output() datasetSaved: EventEmitter<any> = new EventEmitter();

  successImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/success-image.svg');
  errorImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/error-image.svg');

  dataset: Dataset;
  // the backup dataset before editing. In datasource it's needed to get the preview data.
  backupDataset: Dataset;
  datasetWizard: DatasetWizard;
  previewData: any[];
  previewColumns: any[];
  file: File;

  config: any;
  saveEnabled = false;

  progress: any = {};
  showResult = false;

  success = true;
  errorMsg;

  isNewDataSet: boolean;

  private statuses: NewAnalysisStepStatus[];

  constructor(
    private configService: ConfigurationService,
    public dialogRef: MatDialogRef<NewDatasetWizardComponent>,
    private csvService: CsvService,
    private tdvService: TDVService,
    private datasetService: DatasetService,
    private messageService: MessageTopicService,
    private backendService: DiscoverBackendService,
    private location: Location,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // don't close dialog when the outside is clicked
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.isNewDataSet = true;
    if (this.data.dataset) {
      this.isNewDataSet = false
    }
    this.messageService.sendMessage('integratedHelp', 'discover/process-analysis/wizard');
    if (this.data.dataset) {
      this.initFromListItem(this.data.dataset);
    } else {
      this.initializeForm();
    }
    this.getStepperConfiguration();

    // this.progress = {
    //   message1: "Your dataset will take a few minutes to be created. ",
    //   message2: "You can stick around and wait or come back later to see it in the Datasets table.",
    //   percentage: 50,
    //   enabled: true
    // }

    // this.showResult = true;

  }

  private initFromListItem(datasetListItem: DatasetListItem) {
    this.datasetService.getDataset(datasetListItem.datasetid).subscribe(dataset => {
      this.backupDataset = cloneDeep(dataset);
      this.initializeForm(dataset)
    });
  }

  private getStepperConfiguration = (): void => {
    let last = 'Confirmation'
    if(!this.isNewDataSet){
      last = 'Summary'
    }
    const stepConfig = {
      steps: [
        {
          slot: 'dataset-basic-info',
          name: '1',
          label: 'Basic info',
          available: true
        },
        {
          slot: 'dataset-datasource',
          name: '2',
          label: 'Data source',
        },
        {
          slot: 'dataset-parse',
          name: '3',
          label: 'Preview',
        },
        {
          slot: 'dataset-attributes',
          name: '4',
          label: 'Attributes',
        },
        {
          slot: 'dataset-dates',
          name: '5',
          label: 'Dates',
        },
        {
          slot: 'dataset-confirmation',
          name: '6',
          label: last
        }
      ],
      currentStepIdx: 0
    };
    if (this.data.dataset?.datasetid) {
      // make all steps available
      stepConfig.steps.forEach(step => step.available = true);
    }
    this.config = {...stepConfig};
    this.initStatuses();
    if (this.data.dataset?.datasetid) {
      // make all steps complete
      this.statuses.forEach(status => status.completed = true);
    }
  }

  public stopEdit($event) {
    const name = $event;
    let start = false;
    let i = 0;
    while (i < this.config.steps.length) {
      if (start) {
        this.config.steps[i].available = false;
      } else {
        start = this.config.steps[i].slot === name;
      }
      i++;
    }

    start = false;
    i = 0;
    while (i < this.statuses.length) {
      if (start) {
        this.statuses[i].completed = false;
      } else {
        start = this.statuses[i].step === name;
      }
      i++;
    }

    // disable the "Save" button and force the user to go through all steps
    // this.saveEnabled = false;
  }

  private initStatuses = (): void => {
    this.statuses = [
      {step: 'dataset-basic-info', completed: false},
      {step: 'dataset-datasource', completed: false},
      {step: 'dataset-parse', completed: false},
      {step: 'dataset-attributes', completed: false},
      {step: 'dataset-dates', completed: false},
      {step: 'dataset-confirmation', completed: false}
    ];
  }

  public onCancel = (): void => {
    this.dialogRef.close();
    if (this.progress.enabled) {
      this.datasetSaved.emit();
    }
  }

  public changeTab = (delta: number): void => {
    const newSteptStep = this.config.currentStepIdx + delta;
    this.config.steps[newSteptStep].available = true;
    this.config = {...this.config, currentStepIdx: newSteptStep};
  }

  public createUpdateDataset = (): void => {

    let onlyEditDataset = true;
    // tdv needs to be created/updated and preview needs to be started
    // 1. create new dataset
    // 2. edit dataset and schema changes
    // 3. edit dataset and upload a new file
    // 4. change the data source
    if (this.file ||
      (this.backupDataset && !isEqual(this.dataset.schema, this.backupDataset.schema)) ||
      !this.dataset.createdDate ||
      this.datasetWizard.dataSourceChanged) {
      onlyEditDataset = false;
    }

    this.progress = {
      message1: this.dataset.Dataset_Id ? 'Your dataset will take a few minutes to be updated.' : 'Your dataset will take a few minutes to be created.',
      message2: 'You can stick around and wait or come back later to see it in the Datasets table.',
      percentage: 0,
      enabled: !onlyEditDataset
    }

    if (onlyEditDataset) {
      // only save dataset
      this.datasetService.updateDataset(this.dataset).subscribe(resp => {
        this.dialogRef.close();
        this.datasetSaved.emit();
      });
    } else {
      this.datasetService.uploadFileAndSaveDatasetAndPreview(this.dataset, this.progress, this.file).subscribe(resp => {
        const dataset = resp;

        if (dataset.previewStatus.Progression === 100) {
          this.success = true;
          this.progress.status = 'Success';
          this.progress.percentage = 100;
        } else {
          this.success = false;
          this.progress.status = 'Error';
          if (dataset.previewStatus.Level === 'ERROR' && dataset.previewStatus.Message) {
            this.errorMsg = dataset.previewStatus.Message
          }
        }
        setTimeout(() => {
          this.progress.enabled = false;
          this.showResult = true;
          this.datasetSaved.emit();
        }, 2000);
      }, error => {
        console.warn('save dataset error', error)
        this.progress.status = 'Fail';
        setTimeout(() => {
          notifyUser('ERROR', 'Saving dataset failed.', this.messageService);
          this.datasetSaved.emit();
          this.dialogRef.close();
        }, 2000);

      });
    }
  }

  private initializeForm = (dataset: Dataset | undefined = undefined): void => {
    if (dataset) {
      this.dataset = dataset;
    } else {
      this.dataset =
        {
          Dataset_Source: {
            DatasourceType: 'File-Delimited',
            Encoding: 'UTF-8',
            FileEscapeChar: '\\',
            FileHeaders: 'true',
            FileQuoteChar: '"',
            FileSeparator: ','
          },
          schema: []
        } as Dataset;
    }

    this.datasetWizard = {
      numberRowsForPreview: 15
    } as DatasetWizard;
  }

  public assembleCsvConfig() {
    const config = {
      quoteChar: this.dataset.Dataset_Source.FileQuoteChar,
      escapeChar: this.dataset.Dataset_Source.FileEscapeChar,
      preview: this.datasetWizard.numberRowsForPreview,
      encoding: this.dataset.Dataset_Source.Encoding,
      comments: true,
      skipEmptyLines: true,
      download: true,
      delimiter: this.dataset.Dataset_Source.FileSeparator
    };
    return config;
  }

  get csvConfig() {
    return this.assembleCsvConfig.bind(this);
  }


  public hide = (element: string): boolean => {
    if (element === 'prev') {
      return this.config.currentStepIdx === 0;
    }
    if (element === 'next') {
      return this.config.currentStepIdx === 5;
    }
    if (element === 'finish') {
      return this.config.currentStepIdx !== 5;
    }
    if (element === 'save') {
      return false;
    }
  }

  public display = (element: string): boolean => {
    if (element === 'dataset-basic-info') {
      return this.config.currentStepIdx === 0
    }
    if (element === 'dataset-datasource') {
      return this.config.currentStepIdx === 1
    }
    if (element === 'dataset-parse') {
      return this.config.currentStepIdx === 2
    }
    if (element === 'dataset-attributes') {
      return this.config.currentStepIdx === 3
    }
    if (element === 'dataset-dates') {
      return this.config.currentStepIdx === 4
    }
    if (element === 'dataset-confirmation') {
      return this.config.currentStepIdx === 5
    }
  }

  public handleStepClick = (step): void => {
    this.config.currentStepIdx = step.detail;
  }

  public handleStatus = ($event: NewAnalysisStepStatus): void => {
    const stepStatus = this.statuses.filter(status => status.step === $event.step)[0];
    stepStatus.completed = $event.completed;

    this.saveEnabled = (this.dataset != null && !this.dataset.Dataset_Id) || this.file != null || !isEqual(this.dataset, this.backupDataset);
  }

  public allStepCompleted() {
    return this.statuses.filter(status => !status.completed).length === 0;
  }

  public handleDisableNextButton = (): boolean => {
    return !this.statuses.filter(status => status.step === this.config.steps[this.config.currentStepIdx].slot)[0].completed;
  }

  public handleDisablePrevButton = (): boolean => {
    return false;
  }

  public handleSaveStatus($event: boolean) {
    this.saveEnabled = $event;
  }

  public handlePreviewData = (event): void => {
    if (event) {
      // clear the old data before setting the new data.
      this.resetPreviewData(undefined);

      if (event.jsonData) {
        try {
          const data = JSON.parse(event.jsonData);
          this.previewData = data;
        } catch (e) {
          console.error('Parse data from json string failed');
        }
      } else if (event.jsonDataArray) {
        try {
          const data = [];
          for (const jd of event.jsonDataArray) {
            data.push(JSON.parse(jd));
          }
          this.previewData = data;
        } catch (error) {
          console.error('Parse data from json string failed');
        }
      } else if (event.previewData) {
        this.previewData = event.previewData;
      } else if (event.preview) {
        this.previewData = this.calculateData(event.columns, event.preview);
      }

      this.datasetWizard.numberRowsForPreview = this.previewData.length;
      this.previewColumns = this.calculateColumns(event.columns);

      if (this.previewColumns.length !== this.dataset.schema.length) {
        console.warn('The columns parsed from file are not same as the schema in dataset.');
      }

      // todo: if user is allowed to upload a different csv file, then here we need reset schemas
      if (!this.dataset.createdDate || this.datasetWizard.dataSourceChanged) {
        this.dataset.schema = this.calculateDatesetColumns(event.columns);
      }

      if (event.columnSeparator) {
        this.dataset.Dataset_Source.FileSeparator = event.columnSeparator;
      }
      // this.newDataset.columns = this.assembelColumns();
    } else {
      this.previewData = undefined;
      this.previewColumns = undefined;
      this.dataset.schema = [];
    }
  }

  public resetPreviewData(event) {
    this.previewData = null;
  }

  // datesetColumn is about the column name and its attributes type
  private calculateDatesetColumns = (columns: string[]): DatasetSchema[] => {
    return columns.map(column => {
      const newColumn = {
        key: column,
        type: 'string',
        importance: 'None',
        format: 'None',
        featureType: 'None'
      } as DatasetSchema;
      return newColumn;
    })
  }

  // previewColumn is the object array for displaying data preview
  private calculateColumns = (columns: string[]): any[] => {
    return columns.map(column => {
      const newColumn = {
        headerName: column,
        field: column,
        sortable: false,
        filter: false,
        resizable: false
      };
      return newColumn;
    })
  }

  private calculateData = (columns: any[], data: any[]): any[] => {
    const returnData = [];
    data.forEach(element => {
      const row = {};
      for (let index = 0; index < columns.length; index++) {
        row[columns[index]] = element[index];
      }
      returnData.push(row)
    });
    return returnData;
  }

  public uploadFile = (event) => {
    this.file = event;
  }

  public goToDatasets() {
    this.dialogRef.close();
  }

  public goToAnalysis() {
    this.dialogRef.close();
    this.router.navigate(['/discover/process-analysis']);
  }

}
