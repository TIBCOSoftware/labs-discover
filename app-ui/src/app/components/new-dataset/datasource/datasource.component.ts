import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { concatMap } from 'rxjs/operators';
import { PublishedViews } from 'src/app/models_ui/backend';
import { CsvService } from 'src/app/service/csv.service';
import { DatasetService } from 'src/app/service/dataset.service';
import { DiscoverBackendService } from 'src/app/service/discover-backend.service';
import { CsvFile, Dataset, DatasetDataSource, DatasetWizard } from '../../../models_ui/dataset';
import { NewAnalysisStepStatus } from '../../../models_ui/discover';
import { ConfigurationService } from '../../../service/configuration.service';

@Component({
  selector: 'dataset-datasource',
  templateUrl: './datasource.component.html',
  styleUrls: ['./datasource.component.scss', '../wizard/wizard.preview.table.scss']
})
export class NewDatasetDatasourceComponent implements OnInit {

  @Input() data: Dataset;
  @Input() backupDataset: Dataset;
  @Input() wizard: DatasetWizard;
  @Input() previewColumns: any[];
  @Input() file: File;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Output() uploadedFile: EventEmitter<any> = new EventEmitter<any>();
  @Output() stopEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetPreview: EventEmitter<any> = new EventEmitter<any>();

  public noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');

  public dataSource: DatasetDataSource;

  public isError = false;
  public csvError: string;
  public errorDescription: string;
  public orgId: string;

  readonly dataSourceOptions = [
    {label: 'Upload CSV', value: 'csv'},
    {label: 'Select from TDV', value: 'tdv'}
  ];
  public tdvViews: PublishedViews[];
  public files: CsvFile[];

  constructor(
    protected configService: ConfigurationService,
    protected documentsService: TcDocumentService,
    protected csvService: CsvService,
    protected datasetService: DatasetService,
    protected backendService: DiscoverBackendService,
    protected location: Location) { }

  ngOnInit(): void {

    this.wizard.dataSourceType = this.data.type ? this.data.type : this.dataSourceOptions[0].value;

    this.getListDataOfType();

    this.dataSource = this.data.Dataset_Source;
    this.updateStatus();
  }

  private getCsvFiles() {
    this.datasetService.getCsvFiles().subscribe(list => {
      this.files = list;
    });
  }

  private getUnmanagedTdvView() {
    this.backendService.login().pipe(
      concatMap(response => {
        this.orgId = response.orgId;
        return this.backendService.getUnmanagedTdvView(response.orgId);
      })
    ).subscribe((response: PublishedViews[]) => {
      this.tdvViews = response;
    });
  }

  public refreshFiles(event) {
    this.getCsvFiles();
  }

  public refreshTdvs() {
    this.getUnmanagedTdvView();
  }

  public onUploadFile = (file: File): void => {
    this.isError = false;
    this.data.type = this.wizard.dataSourceType;
    this.data.csvMethod = 'upload';
    this.stopStepperNaviIfNeeded();
    this.preview(file);
    this.uploadedFile.emit(file);

  }

  /**
   * The only reason to parse the csv file and do preview here is to validate the column names.
   * @param file
   */
  public preview = (file: File): void => {
    this.dataSource.FileName = file.name;
    this.refreshPreview(file);
  }

  public refreshPreview = (file: File): void => {
    // todo:
    // this.loadingStatus = 'preview'
    const response = this.csvService.refreshPreview(file, this.wizard.numberRowsForPreview).subscribe(
      element => {
        // this.loadingStatus = undefined;
        this.handlePreviewData.emit(element);
        const columns = this.validateColumnHeader(element.columns);

        if (columns.length > 0) {
          this.isError = true;
          // this.csvError = "The column header of " + (columns.length == 1 ? '' : 's') + " " + columns.join(' , ') + " can't contain the following characters: ,;{}()=.+";
          this.csvError = 'Column headers can’t be blank or contain the following characters: ,;{}()=.+';
        }
        this.updateStatus();
      }
    );
  }

  /**
   * Check if the column names are legal for tdv
   * @param columns
   * @returns invalid columns names. If it's empty array, then all the columns are valid
   */
  private validateColumnHeader(columns: string[]): string[] {
    const result = [];
    for (let i = 0; i < columns.length; i++) {
      if (/[,;{}()=.+]+/.test(columns[i])) {
        result.push(columns[i]);
      }
    }
    return result;
  }

  public updateStatus = (): void => {
    const status = !this.isError && ((this.data.type === 'csv' && (this.dataSource.FileName != null || this.data.CsvFile != null)) || (this.data.type === 'tdv' && this.data.TdvView != null));
    const stepStatus = {
      step: 'dataset-datasource',
      completed: status
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }

  public changeDataSourceMethod(event) {
    const value = event.detail.value;
    // this.data.type = value;
    this.wizard.dataSourceType = value;

    // if (value == 'tdv') {
    //   this.data.csvMethod = 'tdv';
    // }

    this.getListDataOfType();
    this.updateStatus();
  }

  private getListDataOfType() {
    if (this.wizard.dataSourceType === 'csv') {
      this.getCsvFiles();
    } else if (this.wizard.dataSourceType === 'tdv') {
      this.getUnmanagedTdvView();
    }
  }

  public selectTdvView(event) {
    this.stopStepperNaviIfNeeded();
    this.data.TdvView = event;
    this.data.type = this.wizard.dataSourceType;
    this.data.csvMethod = 'tdv';
    this.updateStatus();
    this.resetPreview.emit();
  }

  public selectCsvFile(event) {
    this.stopStepperNaviIfNeeded();
    this.data.CsvFile = event;
    this.data.type = this.wizard.dataSourceType;
    this.updateStatus();
    this.resetPreview.emit();
  }

  private stopStepperNaviIfNeeded() {
    if (this.data.Dataset_Id) {
      // select data source when edit
      this.wizard.dataSourceChanged = true;
      this.wizard.attributesUnpredicted = true;
      this.stopEdit.emit('dataset-datasource');
    }
  }
}
