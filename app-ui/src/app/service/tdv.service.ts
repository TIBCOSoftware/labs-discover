import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { DataVirtualizationSite, DataVirtualizationTable, DataVirtualizationDatabase, DataVirtualizationColumn, TDVConfig } from '../models_ui/tdv';

@Injectable({
  providedIn: 'root'
})
export class TDVService {

  // DEFAULT_PREFIX = '.tdv.config.tibcolabs.client.context.PUBLIC';

  constructor(
    private http: HttpClient
    // private sharedStateService: TcSharedStateService
  ) { }

  public getSites(hostname: string, port: string, username: string, password: string): Observable<DataVirtualizationSite[]> {

    return this.http.get(hostname + ':' + port + '/rest/v2/sites', {headers: this.generateOptions(username, password)}).pipe(
      map((value: any[]) => {
        const sites: DataVirtualizationSite[] = [];
        value.forEach(element => {
          sites.push(new DataVirtualizationSite().deserialize(element));
        })
        return sites;
      })
    );
  }

  public getDatabases(hostname: string, port: string, username: string, password: string, site: string): Observable<DataVirtualizationDatabase[]> {
    const body = {
      "query": "select DATASOURCE_ID, BD_DATASOURCE_NAME, BD_DATASOURCE_TYPE \"RESOURCE_TYPE\", BD_PARENT_PATH, ANNOTATION, SITE_NAME, guid, DATASOURCE_CREATION_TIMESTAMP, DATASOURCE_MODIFICATION_TIMESTAMP, LAST_MODIFICATION_TIMESTAMP " +
                "from ALL_DATASOURCES " +
                "where SITE_NAME = '" + site + "' and BD_DATASOURCE_TYPE = 'database' and cast(BD_PARENT_PATH AS varchar) = '/" + site + "/services/databases' ORDER BY lower(BD_DATASOURCE_NAME) ASC ",
      "standardSQL": "true"
    }

    return this.http.post(hostname + ':' + port + '/rest/v2/data/typed', body, {headers: this.generateOptions(username, password)}).pipe(
      map((value: any[]) => {
        const databases: DataVirtualizationDatabase[] = [];
        value.forEach(element => {
          databases.push(new DataVirtualizationDatabase().deserialize(element))
        })
        return databases;
      })
    );
  }

  public getTables(hostname: string, port: string, username: string, password: string, database: number): Observable<DataVirtualizationTable[]> {
    const body = {
      "query": "select TABLE_ID \"RESOURCE_ID\", TABLE_NAME \"RESOURCE_NAME\", BD_TABLE_TYPE \"RESOURCE_TYPE\", BD_PARENT_PATH, ANNOTATION, SITE_NAME, guid from ALL_TABLES  WHERE DATASOURCE_ID = " + database + " and SCHEMA_ID is NULL and CATALOG_ID is NULL",
      "standardSQL": "true"
    }

    return this.http.post(hostname + ':' + port + '/rest/v2/data/typed', body, {headers: this.generateOptions(username, password)}).pipe(
      map((value: any[]) => {
        const tables: DataVirtualizationTable[] = [];
        value.forEach(element => {
          tables.push(new DataVirtualizationTable().deserialize(element))
        })
        return tables;
      })
    );
  }

  public getColumns = (hostname: string, port: string, username: string, password: string, database: number): Observable<DataVirtualizationColumn[]> => {
    const body = {
      "query": "SELECT distinct c.COLUMN_ID, c.COLUMN_NAME, 'COLUMN' \"RESOURCE_TYPE\", c.BD_PARENT_PATH, c.ANNOTATION, listagg(i.INDEX_TYPE, ',') WITHIN GROUP (ORDER BY i.INDEX_TYPE) \"INDEX_TYPE\", c.DATA_TYPE, c.COLUMN_LENGTH, c.COLUMN_PRECISION, c.COLUMN_SCALE, f.FK_NAME  , F.PK_TABLE_ID, F.PK_TABLE_NAME, c.TABLE_ID, c.ORDINAL_POSITION  FROM ALL_COLUMNS c     LEFT JOIN ALL_INDEXES i     ON i.TABLE_ID = c.TABLE_ID and i.COLUMN_NAME = c.COLUMN_NAME     LEFT JOIN ALL_FOREIGN_KEYS f     ON f.FK_TABLE_ID = c.TABLE_ID and f.FK_COLUMN_NAME = c.COLUMN_NAME WHERE c.TABLE_ID=" + database + "  GROUP BY     c.COLUMN_ID, c.COLUMN_NAME, c.BD_PARENT_PATH, c.ANNOTATION, c.DATA_TYPE, c.COLUMN_LENGTH,    c.COLUMN_PRECISION, c.COLUMN_SCALE, f.FK_NAME, F.PK_TABLE_ID, F.PK_TABLE_NAME, c.TABLE_ID, c.ORDINAL_POSITION  order by c.ORDINAL_POSITION ASC",
      "standardSQL": "true"
    }

    return this.http.post(hostname + ':' + port + '/rest/v2/data/typed', body, {headers: this.generateOptions(username, password)}).pipe(
      map((value: any[]) => {
        const columns: DataVirtualizationColumn[] = [];
        value.forEach(element => {
          columns.push(new DataVirtualizationColumn().deserialize(element))
        })
        return columns;
      })
    );
  }

  public refreshPreview = (hostname: string, port: string, username: string, password: string, tableNumber: number, tablePath: string, numRows: number, offset?: number):  Observable<any>  => {
    let tablePathSplit = tablePath.split('/').slice(1);

    tablePathSplit = tablePathSplit.map(element => {
      return  (!element.match(/^[0-9a-z_]+$/) ?  '"' + element + '"': element)
    })
    tablePath = '/' + tablePathSplit.join('/');

    return this.getColumns(hostname, port, username, password, tableNumber).pipe(
      mergeMap((tdvColumns: DataVirtualizationColumn[]) => {
        const columns = tdvColumns.map(tdvColumn => tdvColumn.name);
        return this.getPreview(hostname, port, username, password, tablePath, tdvColumns, numRows, offset).pipe(
            map(data => {
              return {
                preview: data,
                columns: columns
              }
            })
        )
      })
    );
  }

  private getPreview = (hostname: string, port: string, username: string, password: string, table: string, columns: DataVirtualizationColumn[], numRows: number, offset?: number): Observable<any[]> => {
    offset = offset ? offset : 0;
    const regExp = new RegExp('^[a-zA-Z0-9]*$', 'g');
    const selectStmt = columns.map((column: DataVirtualizationColumn) => { return '\"' + column.name + '\"';}).join(', ');

    const body = {
      "query": "SELECT " + selectStmt + " FROM " + table + " offset " + offset + " rows  fetch next " + numRows + " rows only",
      "standardSQL": "false",
      "system": "false"
    }

    return this.http.post(hostname + ':' + port + '/rest/v2/data/typed', body, {headers: this.generateOptions(username, password)}).pipe(
      map((value: any[]) => {
        return value;
      })
    );
  }

  private generateOptions = (username: string, password: string): HttpHeaders => {
    const httpOptions = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      });
    return httpOptions;
  }
}


