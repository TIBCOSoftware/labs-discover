import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { ConfigurationService } from './configuration.service';
import { DateParseRecord, DateParsingResult } from '../models/parsing';


@Injectable({
  providedIn: 'root'
})
export class ParsingService {

  DATE_FORMATS: string[] =
  [
    "yyyy-MM-dd'T'HH:mm:ssZZ",
    "dd-MM-yyyy HH:mm:ss.SSS",
    "M.d.yy H:mm",
    "d.M.yy H:mm",
    "DD/MM/YYYY h:m:s",
    "dd/mm/yyyy hh:mm:ss",
    "MM/DD/YYYY HH:mm:ss",
    "dd/MM/yyyy’T’HH:mm:ss.SSS",
    "yyyy/MM/dd HH:mm:ss.SSS",
    "yyyy-MM-dd HH:mm:ss.SSS",
    "yyyy/MM/dd HH:mm:ss",
    "yyyy-MM-dd HH:mm:ss",
    "dd-MM-yyyy HH:mm:ss",
    "dd.MM.yyyy HH:mm:ss",
    "MM/dd/yyyy KK:mm:ss aa",
    "dd-MM-yyyy HH:mm",
    "dd.MM.yyyy HH:mm",
    "yyyy-MM-dd HH:mm",
    "MM/dd/yy HH:mm",
    "dd/MM/yy HH:mm",
    "dd.MM.yy HH:mm",
    "yyyy/MM/dd",
    "yyyy-MM-dd’T’HH:mm:ss.SSS",
    "yyyy-MM-dd'T'HH:mm:ss*SSSZZZZ",
    "yyyy MMM dd HH:mm:ss.SSS zzz",
    "MMM dd HH:mm:ss ZZZZ yyyy",
    "dd/MMM/yyyy:HH:mm:ss ZZZZ",
    "MMM dd, yyyy hh:mm:ss a",
    "MMM dd yyyy HH:mm:ss",
    "MMM dd HH:mm:ss yyyy",
    "MMM dd HH:mm:ss ZZZZ",
    "yyyy-MM-dd'T'HH:mm:ssZZZZ",
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
    "yyyy-MM-dd HH:mm:ss ZZZZ",
    "yyyy-MM-dd HH:mm:ss,SSS",
    "yyyy/MM/dd*HH:mm:ss",
    "yyyy MMM dd HH:mm:ss.SSS*zzz",
    "yyyy MMM dd HH:mm:ss.SSS",
    "yyyy-MM-dd HH:mm:ss,SSSZZZZ",
    "yyyy-MM-dd HH:mm:ss.SSS",
    "yyyy-MM-dd HH:mm:ss.SSSZZZZ",
    "yyyy-MM-dd'T'HH:mm:ss.SSS",
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd'T'HH:mm:ss'Z'",
    "yyyy-MM-dd'T'HH:mm:ss.SSS",
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd*HH:mm:ss:SSS",
    "yyyy-MM-dd*HH:mm:ss",
    "yy-MM-dd HH:mm:ss,SSS",
    "yy-MM-dd HH:mm:ss,SSS",
    "yy-MM-dd HH:mm:ss",
    "yy/MM/dd HH:mm:ss",
    "yyMMdd HH:mm:ss",
    "yyyyMMdd HH:mm:ss.SSS",
    "MM/dd/yy*HH:mm:ss",
    "MM/dd/yyyy*HH:mm:ss",
    "MM/dd/yyyy*HH:mm:ss*SSS",
    "MM/dd/yy HH:mm:ss ZZZZ",
    "MM/dd/yyyy HH:mm:ss ZZZZ",
    "HH:mm:ss",
    "HH:mm:ss.SSS",
    "HH:mm:ss,SSS",
    "dd/MMM HH:mm:ss,SSS",
    "dd/MMM/yyyy:HH:mm:ss",
    "dd/MMM/yyyy HH:mm:ss",
    "dd-MMM-yyyy HH:mm:ss",
    "dd-MMM-yyyy HH:mm:ss.SSS",
    "dd MMM yyyy HH:mm:ss",
    "dd MMM yyyy HH:mm:ss*SSS",
    "MMdd_HH:mm:ss",
    "MMdd_HH:mm:ss.SSS",
    "MM/dd/yyyy hh:mm:ss a:SSS",
    "MM/dd/yyyy hh:mm:ss a"
  ]

  constructor(protected config: ConfigurationService) {
  }

  public validateSingleDate = (value: string, pattern: string): boolean => {
      return DateTime.fromFormat(value, pattern).isValid;
  }

  public predictDateFormat(dateStrings: string[][], dateOptions?: string[], previousResult?: DateParsingResult): DateParsingResult {
    let dateFormats;
    if (dateOptions) {
      dateFormats = dateOptions;
    } else {
      dateFormats = this.config.config.discover.dateTimeFormats ? this.config.config.discover.dateTimeFormats : this.DATE_FORMATS;
    }
    const validFormats: string[] = [];
    dateFormats.forEach((formatStr: string) => {
      let badMatch = false;
      let formatRec: DateParseRecord;
      if (previousResult) {
        // use existing
        formatRec = previousResult.formats.find(res => { return res.format === formatStr})
      }
      if (!formatRec) {
        // initialize
        formatRec = { format: formatStr, matches: 0, badRows: [], badColumns: []}
      }
      let idx: number = formatRec.badRows.length + 1;
      dateStrings.forEach((row: string[]) => {
        let badRow = false;
        let colIdx = 0;
        row.forEach(dateStr => {
            let isValid: boolean;
            if (dateStr && dateStr.length > 0) {
              const aDate = DateTime.fromFormat(dateStr, formatStr);
              isValid = aDate.isValid;
            } else {
              // empty date field
              isValid = false;
            }
            if (!isValid) {
              badRow = true;
              if (!formatRec.badColumns.includes(colIdx)) {
                formatRec.badColumns.push(colIdx);
              }
            }
          colIdx++;
        })
        if (!badRow) {
          formatRec.matches++;
        } else {
          formatRec.badRows.push(idx);
          badMatch = true;
        }
        idx++;
      })
      const replaceIdx: number = previousResult && previousResult.formats ? previousResult.formats.findIndex((rec: DateParseRecord) => { return rec.format === formatStr }) : -1;
      if ((replaceIdx !== undefined) && replaceIdx >= 0) {
        previousResult.formats[replaceIdx] = formatRec;
      } else {
        if (!previousResult) {
          previousResult = new DateParsingResult();
          previousResult.formats = [ formatRec ];
        } else {
          previousResult.formats.push(formatRec);
        }
      }
    })
    return previousResult;
  }

}
