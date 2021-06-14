import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  public updateSettings = (calls$): Observable<any> => {
    return forkJoin(calls$).pipe(
      map(x => {
        return x;
      }),
      catchError(_ => 
        of(undefined)
      )
    );
  }
}
