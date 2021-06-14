import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import * as papa from 'papaparse';
import { LazyLoadEvent } from 'primeng/api';
import { TDVService } from './tdv.service';
import { take } from 'rxjs/operators';

export class TdvNgpDataSource {
  private _pageSize = 15;
  private _cachedData: any[] = [];
  private _fetchedPages = new Set<number>();
  private _dataStream = new BehaviorSubject<(string | undefined)[]>(this._cachedData);
  private _subscription = new Subscription();
  public data: any[];
  private columnsArray: any[];
  private columnSeparator: string;
  private lines = 15;
  private nextPageIdx = 0;
  private fileComplete = false;
  private hostname: string;
  private port: string;
  private username: string;
  private password: string;
  private tableNumber: number;
  private tablePath: string;
  private configured = false;

  constructor(protected tdvService: TDVService, pagesize: number, hostname: string, port: string, username: string, password: string, tableNumber: number, tablePath: string, columnSeperator?: string) {
    this._pageSize = pagesize;
    this.lines = pagesize;
    this.columnSeparator = columnSeperator;
    this.hostname = hostname;
    this.port = port;
    this.username = username;
    this.password = password;
    this.tableNumber = tableNumber;
    this.tablePath = tablePath;
  }

  connect(): Observable<(string | undefined)[]> {
    this.data = [];
    this._cachedData = [];
    this.columnsArray = [];
    this.configured = true;
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
    this.configured = false;
    this.nextPageIdx = 0;
    this.fileComplete = false;
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this._pageSize);
  }

  private _fetchPage(page: number) {
    if (this.configured) {
      if (!this.fileComplete) {
        if (this._fetchedPages.has(page)) {
          return;
        } else {
          const offset = page * this.lines;
          this.tdvService.refreshPreview(this.hostname, this.port, this.username, this.password, this.tableNumber, this.tablePath, this.lines, offset).pipe(
            take(1),
          ).subscribe(
            next => {
              if (this.columnsArray.length === 0) {
                // first row
                this.columnsArray = next.columns;
              }
              next.preview.forEach(row => {
                this.data.push(this.createObjectFromColumns(row));
              })
              this._fetchedPages.add(this.nextPageIdx);
              this._cachedData.splice(this.nextPageIdx * this._pageSize, this._pageSize,
                ...Array.from({length: this._pageSize})
                  .map((_, i) =>
                    this.data[this.nextPageIdx * this._pageSize + i ]));
              if (next.preview.length < this._pageSize) {
                // remove any undefined if this wasnt a full page
                this._cachedData = this._cachedData.filter(row => row !== undefined);
              }
              if (next.preview.length === this._pageSize) {
                this._dataStream.next([...this._cachedData, undefined]);
              } else {
                this._dataStream.next(this._cachedData);
                    // this.fileComplete = true;
              }

            }
          );
          this._fetchedPages.add(page);
          this.nextPageIdx = page;
        }
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
