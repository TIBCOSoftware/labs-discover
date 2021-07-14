import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {SelectOption} from '@tibco-tcstk/tc-web-components/dist/types/models/selectInputConfig';
import {Table} from 'primeng/table';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Dataset, DatasetDataSource, DatasetSchema, DatasetWizard} from 'src/app/models_ui/dataset';
import {NewAnalysisStepStatus} from 'src/app/models_ui/discover';
import {DateParseRecord, DateParsingResult} from 'src/app/models_ui/parsing';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {CsvNgpDataSource} from 'src/app/service/csv-ngp-datasource';
import {DatasetService} from 'src/app/service/dataset.service';
import {ParsingService} from 'src/app/service/parsing.service';
import {cloneDeep} from 'lodash-es';

@Component({
  selector: 'dataset-date-parser',
  templateUrl: './date-parser.component.html',
  styleUrls: ['./date-parser.component.scss', '../../process-analysis-table/process-analysis-table.component.scss']
})
export class NewDatesetDateParserComponent implements OnChanges, OnInit {

  @Input() data: Dataset;
  @Input() wizard: DatasetWizard;
  @Input() csvFile: File;
  @Input() previewData: any[];
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('dt', {static: false}) table: Table;

  public validating = false;
  public columns: string[];
  public dateOptions: string[][];
  public dateFields: { name: string, index: number }[];
  public possFormats: string[][];
  public dataSource: CsvNgpDataSource;
  public loadedData: any[];
  public rows = 100;
  public formatChanged: Subject<any> = new Subject<any>();
  public parsingResult: DateParsingResult[];
  public bestPartialMatches: DateParseRecord[][];
  public partialFormats: string[][];
  public invalidDateColumnIdxs: number[] = [];
  public invalidDateColumns: string[] = [];

  public datasetDataSource: DatasetDataSource;
  public schema: DatasetSchema[];

  public validRowsCount = -1;  // -1 means not all column has format and cannot count

  constructor(
    protected parsingService: ParsingService,
    protected datasetService: DatasetService,
    protected configService: ConfigurationService) {
  }

  ngOnInit(): void {
    this.formatChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(model => {
        const myFormat = model.format;
        const dfIndex = model.dfIndex;
        this.dateOptions[dfIndex] = [myFormat];
        this.getDatesetColumn(dfIndex).format = myFormat;
        this.emitStepStatus();
        this.countValidRows();
      });
  }

  public isBadRow(rowIndex) {
    // todo
    // if (this.bestPartialMatches) {
    //   const matchRec: DateParseRecord = this.bestPartialMatches.find(rec => {
    //     return rec.format === this.parse.dateTimeFormat;
    //   });
    //   return matchRec.badRows.includes(rowIndex);
    // } else {
    //   return false;
    // }
    return false;
  }

  public clickDateFormat(event: Event) {
    setTimeout(() => {
      // @ts-ignore
      const ul = event.target.shadowRoot.querySelector('.uxpl-options-menu');
      if (ul) {
        ul.style.position = 'fixed';
        ul.style.width = '360px';
      }
    }, 100);

  }

  public calcInvalidColumns() {
    this.invalidDateColumns = [];
    this.invalidDateColumnIdxs = [];
    // todo
    // if (this.bestPartialMatches) {
    //   const matchRec: DateParseRecord = this.bestPartialMatches.find(rec => {
    //     return rec.format === this.parse.dateTimeFormat;
    //   });
    //   if (matchRec) {
    //     this.invalidDateColumnIdxs = matchRec.badColumns;
    //     let idx: number = 0;
    //     this.invalidDateColumnIdxs.forEach(col => {
    //       this.invalidDateColumns.push(this.dateFields[idx]);
    //       idx++;
    //     })
    //   }
    // }
  }

  public isBadColumn(col: string) {
    if (this.invalidDateColumns) {
      return this.invalidDateColumns.includes(col);
    } else {
      return false;
    }

  }

  public isNewFormat(): boolean {
    // let noformat = false;
    for (let i = 0; i < this.dateFields.length; i++) {
      const myFormat = this.getDatesetColumn(i).format;
      if (myFormat && this.parsingResult[i] && this.parsingResult[i].formats) {
        const idx = this.parsingResult[i].formats.findIndex((fmt: DateParseRecord) => {
          return fmt.format === myFormat
        });
        if (idx < 0) {
          return true;
        }
      }
    }
    return false;

  }

  public handleDateFormatUpdate = (event, dfIndex: number) => {
    const format = event.detail && event.detail.value && event.detail.value.length > 0 ? event.detail.value : undefined;
    this.formatChanged.next({
      format,
      dfIndex
    });
  }

  private countValidRows() {
    this.validRowsCount = 0;
    if (this.loadedData && this.loadedData.length > 0 && this.isAllDateFormatSet()) {
      let count = 0;
      for (const dl of this.loadedData) {
        if (dl) {
          let valid = true;
          for (let j = 0; j < this.dateFields.length; j++) {
            const schema: DatasetSchema = this.getDatesetColumn(j);
            if (!schema.format || !this.parsingService.validateSingleDate(dl[schema.key], schema.format)) {
              valid = false;
              break;
            }
          }
          if (valid) {
            count++;
          }
        }
      }
      this.validRowsCount = count;
    }
  }

  public refreshData = () => {
    this.bestPartialMatches = [];
    this.partialFormats = [];
    this.parsingResult = [];
    this.loadedData = undefined;
    this.possFormats = undefined;

    if (this.dataSource) {
      this.dataSource.disconnect();
    }


    if (this.csvFile && this.data.csvMethod === 'upload') {
      // CSV parsing
      // const config = this.getCsvConfig();
      const config = {
        quoteChar: this.data.Dataset_Source.FileQuoteChar,
        escapeChar: this.data.Dataset_Source.FileEscapeChar,
        delimiter: this.data.Dataset_Source.FileSeparator,
        preview: this.wizard.numberRowsForPreview,
        encoding: this.data.Dataset_Source.Encoding,
        comments: '//',
        skipEmptyLines: true,
        download: true
      };
      this.dataSource = new CsvNgpDataSource(this.csvFile, this.rows, config);
    }

    if (this.dataSource) {
      this.dataSource.connect().subscribe(
        next => {
          if (next && next.length > 0) {
            this.loadedData = next;
            if (!this.possFormats) {
              const startIdx = 0;
              const rows = next.slice(startIdx - (this.rows + 1), next.length - 1);
              if (this.validating) {
                this.possFormats = this.getPossibleDataFormats(rows, this.dateOptions);
              } else {
                this.possFormats = this.getPossibleDataFormats(rows);
              }
            } else {
              // only need to test the last new rows
              const startIdx = next.length - (this.rows + 1);
              const newRows = next.slice(startIdx, next.length - 1);
              let newFmts;
              if (this.validating) {
                newFmts = this.getPossibleDataFormats(newRows, this.dateOptions);
              } else {
                newFmts = this.getPossibleDataFormats(newRows);
              }

              this.possFormats.forEach((pf, index) => {
                pf = pf.filter(fmt => {
                  return newFmts[index].includes(fmt);
                });
              });
            }

            this.emitStepStatus();
            this.countValidRows();
          }
        }
      )
    } else {
      // edit dataset, no way to get file data source(File instance or file http url) again
      setTimeout(() => {
        if (this.previewData) {
          this.refreshDataWithAvailablePreview();
        } else {
          this.datasetService.pullPreviewData(this.data).subscribe(data => {
            if (data.columns) {
              this.handlePreviewData.emit(data);
            }
          });
        }
      }, 0);

    }
  }

  private refreshDataWithAvailablePreview() {
    if (this.previewData) {
      this.loadedData = cloneDeep(this.previewData);
      if (this.validating) {
        this.possFormats = this.getPossibleDataFormats(this.previewData, this.dateOptions);
      } else {
        this.possFormats = this.getPossibleDataFormats(this.previewData);
      }
      this.emitStepStatus();
      this.countValidRows();
    }
  }

  private isAllDateFormatSet(): boolean {
    let allSet = true;
    for (const df of this.dateFields) {
      if (!this.schema[df.index].format || this.schema[df.index].format === 'None') {
        allSet = false;
        break;
      }
    }
    return allSet;
  }

  private emitStepStatus() {
    const stepStatus = {
      step: 'dataset-dates',
      completed: this.isAllDateFormatSet()
    } as NewAnalysisStepStatus;
    this.status.emit(stepStatus);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.datasetDataSource = this.data.Dataset_Source;
    this.schema = this.data.schema;

    if (this.schema) {

      this.dateFields = [];
      this.schema.forEach((column, index) => {
        if (column.type === 'timestamp') {
          this.dateFields.push({
            name: column.key,
            index
          });
        }
      });

      this.columns = this.schema.map(column => column.key);

      if (this.dateFields) {
        this.dateOptions = this.dateFields.map((df, dfIndex) => {
          const dateFormat = this.getDatesetColumn(dfIndex).format;
          return dateFormat && dateFormat !== 'None' ? [dateFormat] : undefined;
        });
        this.validate();
      } else {
        this.refreshData();
      }
    }
  }

  validate() {
    this.validating = true;
    this.refreshData();
  }

  reset() {
    this.validRowsCount = -1;
    this.dateFields.forEach((df, dfIndex) => {
      this.getDatesetColumn(dfIndex).format = undefined;
      this.dateOptions[dfIndex] = undefined;
    });
    this.validating = false;
    this.refreshData();
  }

  selectBestMatch(res: DateParseRecord, dfIndex: number) {
    this.handleDateFormatUpdate({detail: {value: res.format}}, dfIndex);
    this.calcInvalidColumns();
  }

  public isSelectedBestMatch(res: DateParseRecord): boolean {
    // todo:
    return true;
  }

  private getPossibleDataFormats(data, dateOptions?: string[][]): string[][] {
    const possibleMatches = [];

    this.dateFields.forEach((df, dfIndex) => {
      const targetData: string[][] = [];

      data.forEach(row => {
        const rowData: string[] = [];
        rowData.push(row[df.name]);
        targetData.push(rowData);
      });

      // data = targetData;
      this.parsingResult[dfIndex] = this.parsingService.predictDateFormat(targetData, dateOptions ? dateOptions[dfIndex] : undefined, this.parsingResult[dfIndex]);
      const possMatches: string[] = [];
      this.parsingResult[dfIndex].formats.filter(rec => {
        return rec.badRows.length <= 0
      }).forEach(match => {
        possMatches.push(match.format);
      });
      if (possMatches.length < 1) {
        // no format matches all the row data, so need to assign best match
        const partialMatches = this.parsingResult[dfIndex].formats.filter(mtch => {
          return mtch.matches > 0
        });
        // sort by highest number matches
        partialMatches.sort((a, b) => {
          return b.matches - a.matches;
        });
        this.bestPartialMatches[dfIndex] = partialMatches;
        const partialFormats = [];
        this.bestPartialMatches[dfIndex].forEach(pm => partialFormats.push(pm.format));
        this.partialFormats[dfIndex] = partialFormats;
        if (this.partialFormats[dfIndex].length > 0) {
          this.getDatesetColumn(dfIndex).format = this.partialFormats[dfIndex][0];
        }
        this.calcInvalidColumns();
      } else {
        this.getDatesetColumn(dfIndex).format = possMatches[0];
      }
      possibleMatches[dfIndex] = possMatches;
    });

    return possibleMatches;

  }

  private getDatesetColumn(dfIndex: number): DatasetSchema {
    return this.schema[this.dateFields[dfIndex].index];
  }

  public getOptions(index: number) {
    const options: SelectOption[] = [];
    if (this.possFormats && this.possFormats[index] && this.possFormats[index].length > 0) {
      this.possFormats[index].forEach((fmt: string) => {
        options.push(
          {
            label: fmt,
            value: fmt,
            disabled: false
          }
        );
      })
    } else if (this.partialFormats && this.partialFormats[index] && this.partialFormats[index].length > 0) {
      this.partialFormats[index].forEach((fmt: string) => {
        options.push(
          {
            label: fmt,
            value: fmt,
            disabled: false
          }
        );
      })
    }

    return options;
  }

  public isDateField(col: string) {
    return this.dateFields.filter(f =>
      f.name === col
    ).length > 0;
  }

  private getDatesetColumnByName(col: string): DatasetSchema {
    let index = -1;
    for (const df of this.dateFields) {
      if (df.name === col) {
        index = df.index;
        break;
      }
    }

    if (index !== -1) {
      return this.schema[index];
    }
  }

  public dateClass(date: string, col: string, dfIndex: number): string {
    const column = this.getDatesetColumnByName(col);
    if (column) {

      if ((!this.dateOptions[dfIndex] || this.dateOptions[dfIndex].length <= 0) && (!this.possFormats || !this.possFormats[dfIndex] || this.possFormats[dfIndex].length <= 0))
        // when no detected date but partial matches detected. Use the best date for marking.
      {
        if (this.partialFormats && this.partialFormats[dfIndex] && this.partialFormats[dfIndex].length > 0) {
          if (this.parsingService.validateSingleDate(date, this.partialFormats[dfIndex][0])) {
            return 'valid';
          } else {
            return 'invalid';
          }
        }
      }
      if (this.dateOptions[dfIndex] && this.dateOptions[dfIndex][0]) {
        // manual date entry
        if (this.parsingService.validateSingleDate(date, this.dateOptions[dfIndex][0])) {
          return 'valid';
        } else {
          return 'invalid';
        }
      } else if (!this.possFormats || !this.possFormats[dfIndex] || this.possFormats[dfIndex].length <= 0) {
        return undefined;
      } else if (this.possFormats[dfIndex].length === 1) {
        return this.parsingService.validateSingleDate(date, this.possFormats[dfIndex][0]) ? 'valid' : 'invalid';
      } else {
        return 'indeterminate'
      }
    } else {
      return 'notdate'
    }

  }

}
