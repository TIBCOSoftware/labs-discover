import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DatasetSource} from '../../backend/model/datasetSource';
import {calculateDatasetColumns, calculateDatasetData} from '../../functions/dataset';
import {DatasetParseCsvComponent} from '../new-dataset/parse-csv/parse-csv.component';
import {DiscoverFileInfo} from '../../models_ui/dataset';
import {TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {Location} from '@angular/common';

@Component({
  selector: 'upload-file-dialog',
  templateUrl: './upload-file-dialog.component.html',
  styleUrls: ['./upload-file-dialog.component.css']
})
export class UploadFileDialogComponent implements OnInit {

  @Input() display: boolean;
  @Output() hide: EventEmitter<null> = new EventEmitter();
  @Output() uploadFile: EventEmitter<DiscoverFileInfo> = new EventEmitter();
  @ViewChild('parseCSV', {static: true}) parseCSV: DatasetParseCsvComponent

  noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');
  csvError: string;
  filename: string;
  previewColumns: any;
  previewData: any;
  file: File;
  numberRowsForPreview: number;
  datasource: DatasetSource;
  disableUpload: boolean;

  constructor(private location: Location) {
    this.datasource = {
      DatasourceType: 'File-Delimited',
      Encoding: 'UTF-8',
      FileEscapeChar: '\\',
      FileHeaders: true,
      FileQuoteChar: '"',
      FileSeparator: ','
    }
    this.numberRowsForPreview = 100
  }

  ngOnInit(): void {
    this.reset()
  }

  toggleDisplay() {
    this.hide.emit();
  }

  handleDialogClose() {
    this.display = false;
  }

  selectedFile(ev: File) {
    this.file = new File([ev], ev.name, { type: ev.type });
    this.filename = this.datasource.FileName = this.file.name;
    // Make this happen on the next cycle otherwise the file is null in that class
    window.setTimeout(() => {
      this.parseCSV.clickedRefresh()
    })
  }

  refreshCSVPreview(preview: any) {
    this.previewColumns = calculateDatasetColumns(preview.columns);
    if(this.previewColumns.length < 2) {
      this.csvError = 'The table should have at least 3 columns'
      this.disableUpload = true;
    } else {
      this.csvError = null;
      this.disableUpload = false;
    }
    this.previewData = calculateDatasetData(preview.columns, preview.preview);
  }

  handleUploadFile() {
    if(this.file) {
      this.hide.emit();
      this.uploadFile.emit({
        file: this.file,
        dataSource: this.datasource
      })
      this.reset()
    }
  }

  private reset() {
    this.disableUpload = true;
    this.filename = null
    this.previewColumns = [];
    this.previewData = [];
  }

}
