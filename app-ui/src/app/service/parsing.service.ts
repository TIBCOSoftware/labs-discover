import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { ConfigurationService } from './configuration.service';
import { DateParseRecord, DateParsingResult } from '../models_ui/parsing';


@Injectable({
  providedIn: 'root'
})
export class ParsingService {

  DATE_FORMATS: string[] =
  [
    "d/M/y",
    "d-M-y",
    "d.M.y",
    "M/d/y",
    "M-d-y",
    "M.d.y",
    "y/M/d",
    "y-M-d",
    "y.M.d",
    "d/M/y H:m",
    "d/M/y H:m:s",
    "d/M/y H:m:s.S",
    "d-M-y H:m",
    "d-M-y H:m:s",
    "d-M-y H:m:s.S",
    "d.M.y H:m",
    "d.M.y H:m:s",
    "d.M.y H:m:s.S",
    "M/d/y H:m",
    "M/d/y H:m:s",
    "M/d/y H:m:s.S",
    "M-d-y H:m",
    "M-d-y H:m:s",
    "M-d-y H:m:s.S",
    "M.d.y H:m",
    "M.d.y H:m:s",
    "M.d.y H:m:s.S",
    "y/M/d H:m",
    "y/M/d H:m:s",
    "y/M/d H:m:s.S",
    "y-M-d H:m",
    "y-M-d H:m:s",
    "y-M-d H:m:s.S",
    "y.M.d H:m",
    "y.M.d H:m:s",
    "y.M.d H:m:s.S",
    "y/d/M H:m",
    "y/d/M H:m:s",
    "y/d/M H:m:s.S",
    "y-d-M H:m",
    "y-d-M H:m:s",
    "y-d-M H:m:s.S",
    "y.d.M H:m",
    "y.d.M H:m:s",
    "y.d.M H:m:s.S",
    "d/M/y h:m a",
    "d/M/y h:m:s a",
    "d/M/y h:m:s.S a",
    "d-M-y h:m a",
    "d-M-y h:m:s a",
    "d-M-y h:m:s.S a",
    "d.M.y h:m a",
    "d.M.y h:m:s a",
    "d.M.y h:m:s.S a",
    "M/d/y h:m a",
    "M/d/y h:m:s a",
    "M/d/y h:m:s.S a",
    "M-d-y h:m a",
    "M-d-y h:m:s a",
    "M-d-y h:m:s.S a",
    "M.d.y h:m a",
    "M.d.y h:m:s a",
    "M.d.y h:m:s.S a",
    "y/M/d h:m a",
    "y/M/d h:m:s a",
    "y/M/d h:m:s.S a",
    "y-M-d h:m a",
    "y-M-d h:m:s a",
    "y-M-d h:m:s.S a",
    "y.M.d h:m a",
    "y.M.d h:m:s a",
    "y.M.d h:m:s.S a",
    "y/d/M h:m a",
    "y/d/M h:m:s a",
    "y/d/M h:m:s.S a",
    "y-d-M h:m a",
    "y-d-M h:m:s a",
    "y-d-M h:m:s.S a",
    "y.d.M h:m a",
    "y.d.M h:m:s a",
    "y.d.M h:m:s.S a ",
    "yyyy-MM-dd'T'HH:mm:ss.SSS",
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd'T'HH:mm:ss'Z'",
    "yyyy-MM-dd'T'HH:mm:ss.SSS",
    "yyyy-MM-dd'T'HH:mm:ss"
  ]

  constructor(protected config: ConfigurationService) {
  }

  public validateSingleDate = (value: string, pattern: string): boolean => {
      return DateTime.fromFormat(value, pattern).isValid;
  }

  /**
   * Validate a single string to the predefined date/time format.
   * @param value
   * @returns
   */
  public validateDateAgainstDateFormats(value: string): boolean {
    let valid = false;
    const dateFormats = this.config.config.discover.dateTimeFormats ? this.config.config.discover.dateTimeFormats : this.DATE_FORMATS;
    for (let i = 0; i < dateFormats.length; i++) {
      if (this.validateSingleDate(value, dateFormats[i])) {
        valid = true;
        break;
      }
    }
    return valid;
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

  public readonly supportedEncoding = [
    "ISO-8859-1",
    "ISO-8859-2",
    "ISO-8859-3",
    "ISO-8859-5",
    "ISO-8859-15",
    "US-ASCII",
    "UTF-8",
    "UTF-16",
    "windows-1252"
  ];

  public readonly encodingNameForJavaIO = [
    "ISO8859_1",
    "ISO8859_2",
    "ISO8859_3",
    "ISO8859_5",
    "ISO8859_15",
    "ASCII",
    "UTF8",
    "UTF-16",
    "Cp1252"
  ];

  public getSupportEncoding(): string[] {
    return this.supportedEncoding;
  }

  public getJavaIOEncoding(encoding: string) {
    const index = this.supportedEncoding.indexOf(encoding);
    if (index != -1) {
      return this.encodingNameForJavaIO[index];
    }
    return encoding;
  }


}
