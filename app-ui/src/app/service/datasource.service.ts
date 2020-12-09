import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Datasource } from '../models/discover';

@Injectable({
  providedIn: 'root'
})
export class DatasourceService {

  constructor() { }
  private currentDatasource: Datasource;

  public getDatasource(): Datasource {
    return this.currentDatasource;
  }

  public setDatasource(datasource: Datasource) {
    this.currentDatasource = datasource;
    console.log('Datasource set: ' , this.currentDatasource);
  }

  public getCurrentDatasource = (): Observable<Datasource> => {
      return of(this.currentDatasource)
  }

  public setCurrentDatasource = (datasource: Datasource): Observable<Datasource> => {
      this.currentDatasource = datasource;
      console.log('Datasource set: ' , this.currentDatasource);
      return of(this.currentDatasource);
  }
}
