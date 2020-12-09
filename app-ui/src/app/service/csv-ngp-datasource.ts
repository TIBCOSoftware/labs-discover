import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import * as papa from 'papaparse';
import { LazyLoadEvent } from 'primeng/api';

export class CsvNgpDataSource {
  private _pageSize = 15;
  private _cachedData: any[] = [];
  private _fetchedPages = new Set<number>();
  private _dataStream = new BehaviorSubject<(string | undefined)[]>(this._cachedData);
  private _subscription = new Subscription();
  private parser: any;
  private itemCount = 0;
  public data: any[];
  private columnsArray: any[];
  private columnSeparator: string;
  private lines = 15;
  private localConfig: any;
  private filePath: string;
  private nextPageIdx = 0;
  private fileComplete = false;
  private parsing = false;
  private firstTime = false;

  constructor(filePath: string, pagesize: number, config?: any) {
    this._pageSize = pagesize;
    this.lines = pagesize;
    this.filePath = filePath;
    this.localConfig = config ? config : {};
  }

  connect(): Observable<(string | undefined)[]> {
    if (this.parser) {
      this.parser.abort();
      this.parser = undefined;
    }
    this.itemCount = 0;
    this.data = [];
    this.columnsArray = [];
    this.localConfig = {
      ...this.localConfig,
      preview: undefined,
      download: true,
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.fileComplete = true;
        this._cachedData = Array.from<any>(this.data);
        this._dataStream.next(this._cachedData);
      },
      step: (result, parser) => {
        if (!this.parser) {
          this.parser = parser;
          this.firstTime = true;
        }
        if (this.columnsArray.length === 0) {
          // first row
          this.columnsArray = result.data;
          this.columnSeparator = result.meta.delimiter;
        } else {
            if (result.data.length > 0) {
              this.data.push(this.createObjectFromColumns(result.data));
            }
        }
        if (this.itemCount === this.lines) {
            this._fetchedPages.add(this.nextPageIdx);
            this._cachedData.splice(this.nextPageIdx * this._pageSize, this._pageSize,
              ...Array.from({length: this._pageSize})
                  .map((_, i) => this.data[this.nextPageIdx * this._pageSize + i ]));
            this._dataStream.next([...this._cachedData, undefined]);
            this.parser.pause();
          }
          this.itemCount++;
      }
    }
    this._fetchPage(0);
    return this._dataStream;
  }

  createObjectFromColumns(rowData: any): any {
    const result = {};
    for (let x = 0; x < this.columns.length; x++) {
      result[this.columns[x]] = rowData[x];
    }
    return result;
  }

  get dataStream(): BehaviorSubject<(string | undefined)[]> {
    return this._dataStream;
  }

  disconnect(): void {
    this._subscription.unsubscribe();
    this.data = [];
    this._cachedData = [];
    this.columnsArray = [];
    this._dataStream.complete();
    this._dataStream = new BehaviorSubject<(string | undefined)[]>(this._cachedData);
    this.nextPageIdx = 0;
    this.fileComplete = false;
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this._pageSize);
  }

  private _fetchPage(page: number) {
    if (!this.fileComplete) {
      if (!this.parsing) {
        this.parsing = true;
        papa.parse(this.filePath, this.localConfig);
      } else if (this._fetchedPages.has(page)) {
        return;
      } else {
        this._fetchedPages.add(page);
        this.nextPageIdx = page;
        this.itemCount = 0;
        this.parser.resume();
      }
    }
  }

  public get columns() {
    return this.columnsArray;
  }

  public loadMore(event: LazyLoadEvent) {
    const startPage = event.first;
    const page = this._getPageForIndex(event.first);
    this._fetchPage(page);
  }
}
