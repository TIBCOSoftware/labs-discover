import { Injectable } from '@angular/core';
import { parse } from 'papaparse';
import { Observable, Subject } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { DatasetService } from './dataset.service';
import { DiscoverBackendService } from './discover-backend.service';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  constructor(
    protected configService: ConfigurationService,
    protected backendService: DiscoverBackendService,
    protected datasetService: DatasetService
  ) { }
  
  public refreshPreview = (file: string | File, lines: number, config?: any): Observable<any> => {
    let columns = [];
    let preview = [];
    let columnSeparator: string;
    let subject = new Subject<any>();
    this.previewFile(file, lines, config).subscribe({
      next: element => {
        if (columns.length == 0) {
          columns = element.data;
          columnSeparator = element.meta.delimiter;
        } else {
          preview.push(element.data);
        }
      },
      complete: () => {
        subject.next({
          preview: preview,
          columns: columns,
          columnSeparator: columnSeparator
        });
        subject.complete();
      }
    });
    return subject;
  }

  private previewFile = (file: string | File, lines, config?: any): Observable<any> => {
    if ( typeof(lines) === 'string'){
      lines = Number(lines)
    }
    let localConfig = {
      preview: lines + 1,
      download: true
    }

    if (config) {
      localConfig =  config;
      localConfig.preview = lines + 1;
    }

    let lineCount = 0;
    return new Observable(
      observable =>  {
        localConfig['step'] =  (result, parser) => {
          lineCount++;
          observable.next(result);
          if (lineCount === localConfig.preview){
            parser.abort();
            observable.complete();
          }
        }  
        parse(file, localConfig);
      }
    );
  }

  public previewData = (data: string): any => {
    return parse(data, { header: true });    
  }
}
