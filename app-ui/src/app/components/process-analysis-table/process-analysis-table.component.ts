import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { get } from 'lodash-es';
import { Analysis } from 'src/app/model/models';
import {DatePipe} from '@angular/common';
import {getRelativeTime} from '../../functions/analysis';

@Component({
  selector: 'process-analysis-table',
  templateUrl: './process-analysis-table.component.html',
  styleUrls: ['./process-analysis-table.component.scss']
})

export class ProcessAnalysisTableComponent implements OnInit, OnChanges {

  @Input() processAnalyses: Analysis[];
  @Input() searchTerm: string;
  @Input() statusMap: {[key: string]: any};
  @Input() loading;

  @Output() caseActionSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() openAnalysis: EventEmitter<string> = new EventEmitter<string>();
  @Output() forceRefresh: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('dt', {static: true}) dt;

  public showPagination = false;
  public NUMBER_OF_ITEMS_BEFORE_PAGINATION = 50;
  public REFRESH_DELAY_AFTER_ON_DONE_MS = 3000;

  cols: any[];

  constructor(private datePipe: DatePipe) {}

  ngOnInit() {
    if (this.processAnalyses.length > this.NUMBER_OF_ITEMS_BEFORE_PAGINATION) {
      this.showPagination = true;
    }

    this.cols = [
      {field: 'data.name', header: 'Name'},
      {field: 'data.description', header: 'Description'},
      {field: 'metadata.modifiedBy', header: 'Last updated by'},
      {field: 'metadata.modifiedOn', header: 'Last updated'},
      {field: 'metadata.state', header: 'Status'},
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.searchTem?.firstChange) {
      this.dt.filterGlobal(changes.searchTerm.currentValue, 'contains');
    }
  }

  public buttonClicked = (rowData): void => {
    if (rowData.data.templateId === undefined || rowData.data.templateId === '') {
      this.caseActionSelect.emit({analysisId: rowData.id, name: 'change-template'});
    } else {
      if (rowData.metadata.state === 'Ready' || rowData.metadata.state === 'Archived') {
        this.openAnalysis.emit(rowData.id);
      }
    }
  }

  public obtainData = (rowData: any, col: any): string => {
    if(col === 'metadata.modifiedOn'){
      const date = new Date(get(rowData, col));
      if (date && date.getTime){
        return getRelativeTime(date.getTime());
      } else {
        return '';
      }
      // return this.datePipe.transform(get(rowData, col), 'fullDate') + ' ' + this.datePipe.transform(get(rowData, col), 'shortTime');
    } else {
      return get(rowData, col);
    }
  }

  public getToolTip = (field: any, data: any): string => {
    let re = '';
    if (field === 'state') {
      const cellData = get(data,field);
      if (cellData.trim() === 'Process mining') {
        if (data.ProcessMining && data.ProcessMining.Message) {
          re = data.ProcessMining.Status + '(' + data.ProcessMining.Progress + '%): ' + data.ProcessMining.Message;
          // {{processAnalysis.ProcessMining.Status}}({{processAnalysis.ProcessMining.Progress}}%): {{processAnalysis.ProcessMining.Message}}
        }
      }
    }
    return re;
  }

  public getProgress = (field: any, data: any): string => {
    let re = 100
    if (field === 'data.State') {
      const cellData = get(data,field);
      if (cellData.trim() === 'Process mining') {
        re = 10;
        if (data.ProcessMining && data.ProcessMining.Progress) {
          re = data.data.Progress;
        }
      }
    }
    return re + '%'
  }

  public getNgClass(field, data) {
    let re = null;
    if (field === 'metadata.state') {
      const cellData = get(data,field).trim();
      // re = 'neutral';
      if (cellData === 'Not ready') {
        re = '#F9E1E4';
      }
      if (cellData === 'Ready') {
        re = '#E1F7EB';
      }
      if (cellData === 'Archived' || cellData === 'Completed' || cellData === 'Purged') {
        re = '#F4F4F4';
      }
      if (cellData === 'Added') {
        re = '#E0F0F9';
      }
      if (cellData === 'Process mining') {
        re = '#FEF7EA';
      }
    }
    return re;
  }

  public getAction = (rowData): any => {
    const actionButtons = rowData.actions.map(element => {
      return {
        id: element,
        label: element,
        data: {
          analysisId: rowData.id,
          name: element,
          action: element
        }
      }
    });

    if(rowData.data.templateId && rowData.data.templateId !== '' && rowData.metadata.state === 'Ready'){
      actionButtons.splice(0, 0, {
        label: 'Change template',
        data: {
          analysisId: rowData.id,
          name: 'change-template',
        }
      })
    }

    return {options: actionButtons}
  }

  public async handleCaseActionSelect(event) {
    this.caseActionSelect.emit(event.detail.data);
  }

  public getValue = (rowData, column): any => {
    return get(rowData, column);
  }
}
