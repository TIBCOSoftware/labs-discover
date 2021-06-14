import {Pipe, PipeTransform} from '@angular/core';

import { getRelativeTime } from '../../../functions/analysis';

@Pipe({name: 'csvFiletime'})
export class CsvFiletimePipe implements PipeTransform {
  transform(value: string): string {
    const time = new Date(value).getTime();
    if (!isNaN(time) && time > 0) {
      return getRelativeTime(time);
    }
    return '';
  }
}