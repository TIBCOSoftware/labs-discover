import { Injectable } from '@angular/core';
import { ThemeService } from 'ng2-charts';
import * as papa from 'papaparse';
import { parse } from 'papaparse';
import { Observable, Subject } from 'rxjs';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class CsvParsingService {

  constructor(protected configService: ConfigurationService) { }

  private parser: any;
  private resumer: any;

  private localConfig: any;

  private results: any[];
  private preview: any[];
  private columns: any[];
  private columnSeparator: string;
  private itemCount = 0;

  private _datarows = new Subject<any>();

  public initialize(filepath: string, lines, config?: any): Observable<any> {
    if (this.parser) {
      this.parser.abort();
      this.parser = undefined;
    }
    this.itemCount = 0;
    this.results = [];
    this.preview = [];
    this.columns = [];
    this.columnSeparator = undefined;
    if ( typeof(lines) === 'string'){
      lines = Number(lines)
    }
    this.localConfig = {
      download: true
    }
    if (config) {
      this.localConfig = config;
    }
    this.localConfig.preview = undefined;
    let lineCount = 0;
    // this.localConfig.chunkSize = 1024;
    // this.localConfig.worker = false;
    this.localConfig.error = function(error) {
      this.columns = [];
      console.log(error);
    }
    this.localConfig['complete'] = function(stuff) {
      this.columns = [];
      console.log('file complete', stuff);
    }
    this.localConfig['step'] =  (result, parser) => {
      if (!this.parser) {
        this.parser = parser;
      }
      if (this.columns.length === 0) {
        // first row
        this.columns = result.data;
        this.columnSeparator = result.meta.delimiter;
      } else {
        if (result.data.length > 0) {
          this.results.push(result.data);
        }
        if (this.itemCount === lines) {
          this.parser.pause();
          this._datarows.next({
            preview: this.results,
            columns: this.columns,
            columnSeparator: this.columnSeparator
          });
        }
      }
      this.itemCount++;
    }
    papa.parse(filepath, this.localConfig);
    return this._datarows;
  }

  public getRowUpdates(): Observable<any> {
    return this._datarows;
  }

  public getMore() {
    this.itemCount = 0;
    this.parser.resume();
  }

}
