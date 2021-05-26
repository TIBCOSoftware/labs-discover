import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Dataset, DatasetDataSource, DatasetWizard } from 'src/app/models/dataset';
import { CsvService } from 'src/app/service/csv.service';
import { DatasetService } from 'src/app/service/dataset.service';
import { ParsingService } from 'src/app/service/parsing.service';

@Component({
  selector: 'parse-csv',
  templateUrl: './parse-csv.component.html',
  styleUrls: ['./parse-csv.component.scss']
})

export class DatasetParseCsvComponent implements OnInit {
  @Input() data: Dataset;
  @Input() wizard: DatasetWizard;
  @Input() file: File;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();

  public encodingOptions;

  public columnSeparator: string;
  public customColumnSeparator: string = '';

  public dataSource: DatasetDataSource;

  constructor(
    protected datasetService: DatasetService,
    protected parsingService: ParsingService,
    protected csvService: CsvService) { }

  ngOnInit(): void {
    this.dataSource = this.data.Dataset_Source;
    const supportedEncoding = this.parsingService.getSupportEncoding();
    this.encodingOptions = supportedEncoding.map(ec => {return {label: ec, value: ec}});
    this.initColumnSeparator();
  }

  public onChecked = (field, event): void => {
    this.data[field]=event.checked;
  }

  handleUpdate = (event, fieldName) => {
    this.data.Dataset_Source[fieldName] = event.detail.value;
  }

  handleUpdateWizard = (event, fieldName) => {
    this.wizard[fieldName] = event.detail.value;
  }

  public clickedRefresh = (): void => {

    /**
     * Confirmed with Florent. The form of editing parsing option only shows if a csv file is uploaded when create/update dataset. 
     * Even for a dataset created by uploading a csv file, when edit it, since in web UI that file handler is not there, so I cannot 
     * let the user to change csv parsing options and refresh
     */

    if (this.file) {
      const lines = this.wizard.numberRowsForPreview;
      const config = {
        quoteChar: this.dataSource.FileQuoteChar,
        escapeChar: this.dataSource.FileEscapeChar,
        delimiter: this.dataSource.FileSeparator,
        preview: lines,
        encoding: this.dataSource.Encoding,
        comments: '//',
        skipEmptyLines: true,
        download: true
      };
  
      this.csvService.refreshPreview(this.file, lines, config).subscribe(parseResult => {
        this.handlePreviewData.emit(parseResult);
      });
    }
  }

  public initColumnSeparator = (): void => {
    this.columnSeparator = this.dataSource.FileSeparator === '\\t' || this.dataSource.FileSeparator === ',' || this.dataSource.FileSeparator === ';' ? this.dataSource.FileSeparator : 'other';
    if (this.columnSeparator === 'other') {
      this.customColumnSeparator = this.dataSource.FileSeparator;
    }
  }

  setColumnSeparator(event) {
    const value = event.detail.value;
    if (value === ';' || value === ',' || value === '\\t'){
      this.columnSeparator = value
      this.dataSource.FileSeparator = value;
    } else {
      this.columnSeparator = 'other';
      this.customColumnSeparator = value === 'other' ? this.customColumnSeparator: value;
      this.dataSource.FileSeparator = this.customColumnSeparator;
    }
  }

  public handleEncodingSelection = ($event): void => {
    this.dataSource.Encoding = $event.detail.value;
  }
}
