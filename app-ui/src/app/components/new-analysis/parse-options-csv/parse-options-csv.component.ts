import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { NewAnalysisParse, NewAnalysisDatasourceFile } from 'src/app/models/discover';
import { CsvService } from 'src/app/service/csv.service';

@Component({
  selector: 'parse-options-csv',
  templateUrl: './parse-options-csv.component.html',
  styleUrls: ['./parse-options-csv.component.css']
})

export class ParseOptionsCsvComponent implements OnInit {
  @Input() data: NewAnalysisParse;
  @Input() datasource: NewAnalysisDatasourceFile;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();

  public encodingOptions;

  public columnSeparator: string;
  public customColumnSeparator: string = '';

  constructor(protected csvService: CsvService) { }

  ngOnInit(): void {
    this.encodingOptions = [
      {label: 'UTF-8', value: 'UTF-8'},
      {label: 'UTF-16', value: 'UTF-16'}
    ];
    this.initColumnSeparator();
  }

  public onChecked = (field, event): void => {
    this.data[field]=event.checked;
  }

  handleUpdate = (event, fieldName) => {
    this.data[fieldName] = event.detail.value;;
  }

  public clickedRefresh = (): void => {
    const config = {
      quoteChar: this.data.quoteChar,
      escapeChar: this.data.escapeChar,
      preview: this.data.numberRowsForPreview,
      encoding: this.data.encoding,
      comments: this.data.skipComments ? this.data.comments : '',
      skipEmptyLines: this.data.skipEmptyLines,
      download: true,
      delimiter: this.data.columnSeparator
    };
    this.csvService.refreshPreview(this.datasource.location, this.data.numberRowsForPreview, config).pipe(
      map(element => {
        this.handlePreviewData.emit(element);
      })
    ).subscribe();
  }

  public initColumnSeparator = (): void => {
    this.columnSeparator = this.data.columnSeparator === '\\t' || this.data.columnSeparator === ',' || this.data.columnSeparator === ';'? this.data.columnSeparator : 'other';
    if (this.columnSeparator === 'other') {
      this.customColumnSeparator = this.data.columnSeparator;
    }
  }

  setColumnSeparator(event) {
    const value = event.detail.value;
    if (value === ';' || value === ',' || value === '\\t'){
      this.columnSeparator = value
      this.data.columnSeparator = value;
    } else {
      this.columnSeparator = 'other';
      this.customColumnSeparator = value === 'other' ? this.customColumnSeparator: value;
      this.data.columnSeparator = this.customColumnSeparator;
    }
  }

  public handleEncodingSelection = ($event): void => {
    this.data.encoding = $event.detail.value;
  }
}
