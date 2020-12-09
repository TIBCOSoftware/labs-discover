import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewAnalysisDatasource, NewAnalysisParse, NewAnalysisMapping, NewAnalysisStepStatus } from '../../../models/discover';
import {get} from 'lodash';
import {ParsingService} from '../../../service/parsing.service';

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
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  public availableColumns: any[];
  public dateOptions: string[] = [];

  constructor(protected parsingService: ParsingService) { }

  ngOnInit(): void {
    this.updateStatus();
    this.availableColumns = this.columns.map(element => { return {label: element, value: element}; });
  }

  public handleSelection = ($event, field): void =>{
    if (field === 'other'){
      this.data[field] = $event.detail.map(element => element.value);
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
    let value = get(rowdata, column.field);
    return value;
  }

  public handleUpdate = (event, fieldName) => {
    this.parse[fieldName] = event.detail.value;;
  }

  public calculateOption = (field: string): any[] => {
    const values = Object.values(this.data);
    let options = this.availableColumns.filter(column => {
      return !values.includes(column.value) || this.data[field]?.includes(column.value);
    });
    options.sort((a,b)=> a.label.toLowerCase().localeCompare(b.label.toLowerCase()) )
    return options;
  }
}
