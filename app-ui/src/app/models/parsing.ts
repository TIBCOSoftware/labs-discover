export class DateParsingResult {
  formats: DateParseRecord[];
}

export class DateParseRecord {
  format: string;
  matches: number;
  badRows: number[];
  badColumns: number[];
}
