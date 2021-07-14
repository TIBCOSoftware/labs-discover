import {DateTime} from 'luxon';

export const START_NAME = 'Starting Activities';
export const STOP_NAME = 'Stopping Activities';


export function normalizeColumnName(columnName: string): string {
  return columnName.replace('_', ' ');
}

export function encodeColumnName(columnName: string): string {
  return columnName.replace(' ', '_');
}


export function calculateColumns(columns: any[]): any[] {
  return columns.map(column => {
    let name = column
    if (column.COLUMN_NAME) {
      name = column.COLUMN_NAME
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

export function getRelativeTime(millisec: number) {
  const diff = new Date().getTime() - new Date(millisec).getTime();
  if (diff < 60000) {
    return 'Less than a minute ago...'
  }
  return millisec ? DateTime.fromMillis(millisec).toRelative() : '';
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
