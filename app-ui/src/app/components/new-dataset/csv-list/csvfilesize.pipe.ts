import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'csvFilesize'})
export class CsvFilesizePipe implements PipeTransform {
  transform(value: number): string {
    if (value < 1024) {
      return 'less than 1K';
    } else if (value < 1024 * 1024) {
      return Math.round(value / 1024) + 'K';
    } else if (value < Math.pow(1024, 3)) {
      return Math.round(value / 1024 / 1024) + 'M';
    } else {
      return Math.round(value / 1024 / 1024 / 1024) + 'G';
    }
  }
}