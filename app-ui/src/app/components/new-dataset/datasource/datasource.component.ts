import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { CatalogService } from 'src/app/backend/api/catalog.service';
import { CsvFile } from 'src/app/backend/model/csvFile';
import { Dataset } from 'src/app/backend/model/dataset';
import { DatasetSource } from 'src/app/backend/model/datasetSource';
import { PublishedViews } from 'src/app/backend/model/publishedViews';
import { CsvService } from 'src/app/service/csv.service';
import { DatasetWizard } from '../../../models_ui/dataset';
import { NewAnalysisStepStatus } from '../../../models_ui/discover';

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

  public dataSource: DatasetSource;

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
    private csvService: CsvService,
    protected catalogService: CatalogService,
    private location: Location) { }

  ngOnInit(): void {

    this.wizard.dataSourceType = this.data.type ? this.data.type : this.dataSourceOptions[0].value;

    this.getListDataOfType();

    this.dataSource = this.data.Dataset_Source;
    this.updateStatus();
  }

  private getCsvFiles() {
    this.catalogService.getUnmanagedCsvFiles().subscribe(list => {
      this.files = list
    });
  }

  private getUnmanagedTdvView() {
    this.catalogService.getUnmanagedTdv().subscribe((response: PublishedViews[]) => {
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
    console.log('On upload file: ' , file)
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
