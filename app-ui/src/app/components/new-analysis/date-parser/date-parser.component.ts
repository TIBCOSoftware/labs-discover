import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { of, Subject } from 'rxjs';
import { debounceTime, pluck, tap } from 'rxjs/operators';
import { ParsingService } from 'src/app/service/parsing.service';
import { CsvNgpDataSource } from 'src/app/service/csv-ngp-datasource';
import { TdvNgpDataSource } from 'src/app/service/tdv-ngp-datasource';
import { NewAnalysisDatasourceFile, NewAnalysisDatasourceTDV, NewAnalysisMapping, NewAnalysisParse, NewAnalysisStepStatus } from 'src/app/models/discover';
import { TDVService } from 'src/app/service/tdv.service';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { DateParseRecord, DateParsingResult } from 'src/app/models/parsing';
import { Table } from 'primeng/table';

@Component({
  selector: 'date-parser',
  templateUrl: './date-parser.component.html',
  styleUrls: ['./date-parser.component.css', '../../process-analysis-table/process-analysis-table.component.scss']
})
export class DateParserComponent implements OnChanges, OnInit {

  @Input() data: NewAnalysisMapping;
  @Input() parse: NewAnalysisParse;
  @Input() tdvConfig: NewAnalysisDatasourceTDV;
  @Input() csvConfig: NewAnalysisDatasourceFile;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  @ViewChild('dt', { static: false }) table: Table;

  public validating = false;
  public columns: string[];
  public dateOptions: string[];
  public dateFields: string[];
  public possFormats: string[];
  public dataSource: CsvNgpDataSource | TdvNgpDataSource;
  public loadedData: any[];
  public rows: number = 100;
  public rows$: Subject<number> = new Subject<number>();
  public parsingResult: DateParsingResult;
  public bestPartialMatches: DateParseRecord[];
  public partialFormats: string[];
  public invalidDateColumnIdxs: number[] = [];
  public invalidDateColumns: string[] = [];

  constructor(protected parsingService: ParsingService, protected tdvService: TDVService, protected configService: ConfigurationService) { }

  ngOnInit(): void {
    this.rows$.pipe(
      debounceTime(500)
    ).subscribe(
      next => {
        this.rows = next;
        this.refreshData();
      }
    )
  }
  public isBadRow(rowIndex) {
    if (this.bestPartialMatches) {
      const matchRec: DateParseRecord = this.bestPartialMatches.find(rec => {
        return rec.format === this.parse.dateTimeFormat;
      });
      return matchRec.badRows.includes(rowIndex);
    } else {
      return false;
    }
  }

  public calcInvalidColumns() {
    this.invalidDateColumns = [];
    this.invalidDateColumnIdxs = [];
    if (this.bestPartialMatches) {
      const matchRec: DateParseRecord = this.bestPartialMatches.find(rec => {
        return rec.format === this.parse.dateTimeFormat;
      });
      if (matchRec) {
        this.invalidDateColumnIdxs = matchRec.badColumns;
        let idx: number = 0;
        this.invalidDateColumnIdxs.forEach(col => {
          this.invalidDateColumns.push(this.dateFields[idx]);
          idx++;
        })
      }
    }
  }

  public isBadColumn(col: string) {
    if (this.invalidDateColumns) {
      return this.invalidDateColumns.includes(col);
    } else {
      return false;
    }

  }

  public isNewFormat(format: string): boolean {
    if (!format || format.length === 0) {
      return false;
    } else {
      const idx = this.parsingResult.formats.findIndex((fmt: DateParseRecord) => { return fmt.format === format })
      return idx && idx < 0 ? true : false;
    }
  }

  public handleDateFormatUpdate = (event, formats?: string[]) => {
    this.dateOptions = event.detail.value && event.detail.value.length > 0 ? [ event.detail.value ] : undefined;
    this.parse.dateTimeFormat = event.detail.value;
    const stepStatus = {
      step: 'dates',
      completed: this.parse.dateTimeFormat && this.parse.dateTimeFormat !== ''
    } as NewAnalysisStepStatus;
    this.status.emit(stepStatus);
  }

  rowsUpdate(event: CustomEvent) {
    if (event && event.detail && event.detail.value) {
      const rows = Number(event.detail.value);
      if (this.rows !== rows) {
        this.rows$.next(rows);
      }
    }
  }

  public refreshData = () => {
    this.bestPartialMatches = undefined;
    this.partialFormats = undefined;
    this.parsingResult = undefined;
    this.loadedData = undefined;
    this.possFormats = undefined;
    this.partialFormats = undefined;
    this.bestPartialMatches = undefined;

    if (this.dataSource) {
      this.dataSource.disconnect();
    }
    let ds$;
    if (this.tdvConfig) {
      // TDV parsing
      this.dataSource = new TdvNgpDataSource(
        this.tdvService,
        this.rows,
        this.configService.config.discover.tdv.bdsServer,
        this.configService.config.discover.tdv.bdsPort.toString(),
        this.configService.config.discover.tdv.username,
        this.configService.config.discover.tdv.password,
        this.tdvConfig.tdvTable.id,
        this.tdvConfig.tdvTable.parentPath + '/' + this.tdvConfig.tdvTable.name
        );
    } else {
      // CSV parsing
      const config = {
        quoteChar: this.parse.quoteChar,
        escapeChar: this.parse.escapeChar,
        delimiter: this.parse.columnSeparator,
        preview: this.parse.numberRowsForPreview,
        encoding: this.parse.encoding,
        comments: this.parse.skipComments ? this.parse.comments : '',
        skipEmptyLines: this.parse.skipEmptyLines,
        download: true
      };
      this.dataSource = new CsvNgpDataSource(this.csvConfig.location, this.rows, config);
    }
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
            this.possFormats = this.possFormats.filter(fmt => {
              return newFmts.includes(fmt);
            })
          }

          if (this.possFormats.length === 1) {
            this.parse.dateTimeFormat = this.possFormats[0];
          } else {
            // this.parse.dateTimeFormat = undefined;
          }
        }
      }
    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data && (this.csvConfig || this.tdvConfig)) {
      this.dateFields = [ this.data.start ];
      if (this.data.end) {
        this.dateFields.push(this.data.end);
      }
      // this creates an array of all selected columns, removes any 'undefined', then removes any duplicates (via Set operation)
      this.columns = [...new Set([
        this.data.caseId,
        this.data.start,
        this.data.end,
        this.data.activity,
        this.data.resource,
        ...(this.data.other ? this.data.other : [])
      ].filter(item => item !== undefined))];
      if (this.parse.dateTimeFormat) {
        this.dateOptions = [ this.parse.dateTimeFormat];
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
    this.parse.dateTimeFormat = undefined;
    this.validating = false;
    this.dateOptions = undefined;
    this.refreshData();
  }

  selectBestMatch(res: DateParseRecord) {
    this.handleDateFormatUpdate({ detail: { value: res.format } });
    this.calcInvalidColumns();
  }

  public isSelectedBestMatch(res: DateParseRecord): boolean {
    return res.format === this.parse.dateTimeFormat;
  }

  private getPossibleDataFormats(data, dateOptions?: string[]): string[] {
    let targetData: string[][] = [];
    data.forEach(row => {
      let rowData: string[] = [];
      this.dateFields.forEach(df => {
        rowData.push(row[df]);
      })
      targetData.push(rowData);
    });
    /*this.dateFields.forEach(df => {
      if (data && data.length > 0) {
        let dateArray = [];
        data.forEach(dr => {
          // if (dr && dr[df]) {
            dateArray.push(dr[df]);
          //}
        })
        if (dateArray && dateArray.length > 0) {
          // can't remove duplicates any more since we are recording bad matches by row idx
          // data = [...new Set(dateArray) ];
          targetData = [ ...targetData, ...dateArray ];
        }
      }
    })*/
    data = targetData;
    this.parsingResult = this.parsingService.predictDateFormat(data, dateOptions, this.parsingResult);
    let possMatches: string[] = [];
    this.parsingResult.formats.filter(rec => { return rec.badRows.length <= 0 }).forEach(match => {
      possMatches.push(match.format);
    });
    if (possMatches.length < 1) {
      // assign best match
      let partialMatches = this.parsingResult.formats.filter(mtch => { return mtch.matches > 0 });
      // sort by highest number matches
      partialMatches.sort(function (a, b) { return b.matches - a.matches;});
      this.bestPartialMatches = partialMatches;
      this.partialFormats = [];
      this.bestPartialMatches.forEach(pm => this.partialFormats.push(pm.format));
      if (this.partialFormats.length > 0) {
        if (!this.parse.dateTimeFormat) {
          this.parse.dateTimeFormat = this.partialFormats[0];
        }
      }
      this.calcInvalidColumns();
    } else {
      this.parse.dateTimeFormat = possMatches[0];
    }
    return possMatches;
  }

  public dateClass(date: string, col: string): string {
    if (this.dateFields.indexOf(col) >= 0) {
      if ((!this.dateOptions || this.dateOptions.length <= 0) && (!this.possFormats || this.possFormats.length <= 0))
      // when no detected date but partial matches detected. Use the best date for marking.
      {
        if (this.partialFormats && this.partialFormats.length > 0) {
          if (this.parsingService.validateSingleDate(date, this.partialFormats[0])) {
            return 'valid';
          } else {
            return 'invalid';
          }
        }
      }
      if (this.dateOptions) {
      // manual date entry
        if (this.parsingService.validateSingleDate(date, this.dateOptions[0])) {
          return 'valid';
        } else {
          return 'invalid';
        }
      } else if (!this.possFormats || this.possFormats.length <= 0) {
        return undefined;
      } else if (this.possFormats.length === 1) {
        return this.parsingService.validateSingleDate(date, this.possFormats[0]) ? 'valid': 'invalid';
      } else {
        return 'indeterminate'
      }
    } else {
      return 'notdate'
    }

  }

}
