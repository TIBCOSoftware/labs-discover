import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NewAnalysisDatasource, NewAnalysisParse, NewAnalysisMapping, NewAnalysisStepStatus} from '../../../models/discover';
import {get} from 'lodash';
import {ParsingService} from '../../../service/parsing.service';
import {StringSimilarityService} from '../../../service/string-similarity.service';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css', '../../process-analysis-table/process-analysis-table.component.scss']
})
export class MapComponent implements OnInit {

  @Input() datasource: NewAnalysisDatasource;
  @Input() parse: NewAnalysisParse;
  @Input() data: NewAnalysisMapping;
  @Input() columns: string[];
  @Input() previewColumns: any[];
  @Input() previewData: any[];
  @Input() firstRowAdded;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Output() hasAutoMapped: EventEmitter<Boolean> = new EventEmitter();

  public availableColumns: any[];
  public dateOptions: string[] = [];


  constructor(protected parsingService: ParsingService, protected ssService: StringSimilarityService) {
  }

  ngOnInit(): void {
    this.updateStatus();
    this.availableColumns = this.columns.map(element => {
      return {label: element, value: element};
    });
  }

  public handleSelection = ($event, field): void => {
      if (field === 'other') {
        this.data[field] = $event.detail?.map(element => element.value);
      } else {
        this.data[field] = $event.detail?.value;
      }
      this.updateStatus();
  }

  private updateStatus = (): void => {
    const status = this.data.caseId !== undefined && this.data.activity !== undefined && this.data.start !== undefined;
    const stepStatus = {
      step: 'map',
      completed: status
    } as NewAnalysisStepStatus;
    this.status.emit(stepStatus);
  }

  public getObjectValue = (rowdata, column): string => {
    return get(rowdata, column.field);
  }

  public handleUpdate = (event, fieldName) => {
    this.parse[fieldName] = event.detail.value;
  }

  public calculateOption = (field: string): any[] => {
    const values = Object.values(this.data);
    const options = this.availableColumns.filter(column => {
      return !values.includes(column.value) || this.data[field]?.includes(column.value);
    });
    options.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
    return options;
  }


  public autoMap() {
    const pHeaders = [];
    for (const col of this.availableColumns) {
      pHeaders.push(col.value);
    }
    const autoMapResult = this.ssService.autoMap(pHeaders);
    const columsToMatch = ['caseId', 'resource', 'activity', 'start', 'end'];
    for (const colM of columsToMatch) {
      if (autoMapResult[colM + 'Column'] !== 'none') {
        window.setTimeout(() => {
          this.data[colM] = autoMapResult[colM + 'Column'];
        })
      }
    }

    // Display results on first row
    const fistRow = {};
    for (const col of this.availableColumns) {
      fistRow[col.value] = '';
      for (const colM of columsToMatch) {
        if (autoMapResult[colM + 'Column'] === col.value) {
          let showType = colM.toUpperCase();
          if (colM === 'caseId') {
            showType = 'CASE ID';
          }
          fistRow[col.value] = showType + ' (' + autoMapResult[colM + 'Rating'].toFixed(2) * 100 + '%)';
        }
      }
    }
    if (!this.firstRowAdded) {
      this.previewData.unshift(fistRow);
    } else {
      this.previewData[0] = fistRow;
    }

    // Find Other Fields (select all not selected)
    // map others based on config
    if (autoMapResult.otherFields?.length > 0) {
      window.setTimeout(() => {
        this.data.other = [...autoMapResult.otherFields];
      });
    }
    this.hasAutoMapped.emit(true);
    this.updateStatus();
  }


}
