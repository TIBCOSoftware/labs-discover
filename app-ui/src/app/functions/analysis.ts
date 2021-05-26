import { DateTime } from 'luxon';

export const START_NAME = 'Starting Activities';
export const STOP_NAME = 'Stopping Activities';


export function normalizeColumnName(columnName: string): string {
  return columnName.replace('_', ' ');
}

export function encodeColumnName(columnName: string): string {
  return columnName.replace(' ', '_');
}

export function getRelativeTime(millisec: number) {
  const diff = new Date().getTime() - new Date(millisec).getTime() ;
  if(diff < 60000) {
    return 'Less than a minute ago...'
  }
  return millisec ? DateTime.fromMillis(millisec).toRelative() : '';
}
