import {DateTime} from 'luxon';
import {Mapping} from '../backend/model/mapping';

export const START_NAME = 'Starting Activities';
export const STOP_NAME = 'Stopping Activities';


export function normalizeColumnName(columnName: string): string {
  return columnName.replace('_', ' ');
}

export function encodeColumnName(columnName: string): string {
  return columnName.replace(' ', '_');
}

export function transformMapping(mapping: Mapping) {
  const colMappObj = {};
  for (const key of Object.keys(mapping)) {
    if (mapping[key]) {
      if (typeof (mapping[key]) === 'string') {
        colMappObj[key] = encodeColumnName(mapping[key]);
        // this.mapping[key] = encodeColumnName(this.mapping[key]);
      }
    }
  }
  return colMappObj;
}

export function calculateColumns(columns: any[]): any[] {
  return columns.map(column => {
    let name = column
    if (column.columnName) {
      name = column.columnName
    }
    const newColumn = {
      headerName: name,
      field: name,
      sortable: false,
      filter: false,
      resizable: false
    };
    return newColumn;
  })
}

export function stripOrgFolder(dxpLocation): string {
  let re = '';
  if (dxpLocation) {
    const fpArr = dxpLocation.split('/');
    if (fpArr.length > 2) {
      let folder = '';
      for (let i = 3; i < fpArr.length; i++) {
        folder += '/' + fpArr[i];
      }
      re = folder;
    } else {
      re = dxpLocation;
    }
  }
  return re;
}


export function convertDateFromLocale(date: string): string {
  const locale = window.navigator.language;
  const newDateLocale = Intl.DateTimeFormat(locale).formatToParts(new Date());
  let format = '';
  newDateLocale.forEach((element: Intl.DateTimeFormatPart) => {
    switch (element.type) {
      case 'day':
        format = format + 'd';
        break;
      case 'month':
        format = format +  'M';
        break;
      case 'year':
        format = format + (element.value.length === 2 ? 'yy' : 'yyyy');
        break;
      case 'literal':
        // TODO: This does not work for dutch keyboard ('-' signs are separators)
        format = format + element.value;
        // format = format + '/';
        break;
      default:
        break;
    }
  })
  if(date.indexOf('PM') > - 1 || date.indexOf('AM') > - 1) {
    format = format + ' tt';
  } else {
    format = format + ' hh:mm:ss';
  }
  // format = format + ' hh:mm:ss';

  const newDate = DateTime.fromFormat(date, format, {locale}).toISO();
  // console.log('OLD DATE: ' + date + ' NEW DATE: ' + newDate);
  return newDate;
}

export function convertDateToLocale(date: string): string {
  const currentDate = new Date(date);
  const locale = window.navigator.language;
  return currentDate.toLocaleDateString(locale) + ' ' + currentDate.toLocaleTimeString(locale)
}
