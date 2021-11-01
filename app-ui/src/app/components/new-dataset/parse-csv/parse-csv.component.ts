import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatasetSource } from 'src/app/backend/model/datasetSource';
import { CsvService } from 'src/app/service/csv.service';
import { DatasetService } from 'src/app/service/dataset.service';
import { ParsingService } from 'src/app/service/parsing.service';

@Component({
  selector: 'parse-csv',
  templateUrl: './parse-csv.component.html',
  styleUrls: ['./parse-csv.component.scss']
})

export class DatasetParseCsvComponent implements OnInit {

  @Input() dataSource: DatasetSource;
  @Input() numberRowsForPreview: number;
  @Input() file: File;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateNumberRowsForPreview: EventEmitter<any> = new EventEmitter<any>();

  public encodingOptions;

  public columnSeparator: string;
  public customColumnSeparator = '';

  constructor(
    protected datasetService: DatasetService,
    protected parsingService: ParsingService,
    protected csvService: CsvService) { }

  ngOnInit(): void {
    const supportedEncoding = this.parsingService.getSupportEncoding();
    this.encodingOptions = supportedEncoding.map(ec => {return {label: ec, value: ec}});
    this.initColumnSeparator();
  }

  handleUpdate = (event, fieldName) => {
    this.dataSource[fieldName] = event.detail.value;
    this.clickedRefresh()
  }

  updateNumForRowsPreview = (event) => {
    const value = event.detail.value;
    this.updateNumberRowsForPreview.emit(value);
  }

  public clickedRefresh = (): void => {
    /**
     * Confirmed with Florent. The form of editing parsing option only shows if a csv file is uploaded when create/update dataset.
     * Even for a dataset created by uploading a csv file, when edit it, since in web UI that file handler is not there, so I cannot
     * let the user to change csv parsing options and refresh
     */
    if (this.file) {
      const lines = this.numberRowsForPreview;
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
    this.clickedRefresh()
  }

  public handleEncodingSelection = ($event): void => {
    this.dataSource.Encoding = $event.detail.value;
  }
}
