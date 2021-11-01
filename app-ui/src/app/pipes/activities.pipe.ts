import { Pipe, PipeTransform } from '@angular/core';
import { TypeValue } from '../backend/model/models';

@Pipe({
  name: 'activities',
  pure: false
})
export class ActivitiesPipe implements PipeTransform {

  transform(items: TypeValue[], filter: string): TypeValue[] {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.name.indexOf(filter) !== -1);
  }
}
