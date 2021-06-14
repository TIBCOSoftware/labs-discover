import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import { get } from 'lodash-es';
import { Analysis } from 'src/app/models_generated/models';
import {DatePipe} from '@angular/common';
import {getRelativeTime} from '../../functions/analysis';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';

@Component({
  selector: 'process-analysis-table',
  templateUrl: './process-analysis-table.component.html',
  styleUrls: ['./process-analysis-table.component.scss']
})

export class ProcessAnalysisTableComponent implements OnInit, OnChanges {

  constructor() {}

  @Input() processAnalyses: Analysis[];
  @Input() searchTerm: string;
  @Input() statusMap: {[key: string]: any};
  @Input() loading;

  @Output() caseActionSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() openAnalysis: EventEmitter<string> = new EventEmitter<string>();
  @Output() forceRefresh: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('dt', {static: true}) dt;
  @ViewChild('deletePopup', {static: true}) deletePopup: ElementRef<UxplPopup>;

  readonly NUMBER_OF_ITEMS_BEFORE_PAGINATION = 50;
  showPagination = false;
  cols: any[];
  popupX:string;
  popupY:string;

  private paToDelete: {action: string, analysisId: string, name: string};
  paToDeleteName = '';

  latestMouseEvent:MouseEvent;

  ngOnInit() {

    this.cols = [
      {field: 'data.name', header: 'Name'},
      {field: 'data.description', header: 'Description'},
      {field: 'metadata.modifiedBy', header: 'Last updated by'},
      {field: 'metadata.modifiedOn', header: 'Last updated'},
      {field: 'metadata.state', header: 'Status'},
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.searchTerm?.firstChange) {
      this.dt.filterGlobal(changes.searchTerm?.currentValue, 'contains');
    }
    if (this.processAnalyses.length > this.NUMBER_OF_ITEMS_BEFORE_PAGINATION) {
      this.showPagination = true;
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
    } else {
      return get(rowData, col);
    }
  }

  public getToolTip = (field: any, data: any): string => {
    let re = '';
    if (field === 'metadata.state') {
      const cellData = get(data,field);
      if (cellData.trim() === 'Not ready') {
        if (data.metadata.message) {
          re = data.metadata.message;
        }
      }
    }
    return re;
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
  public async handleCaseActionSelect(event: any, rowNumber: number) {
    if(event?.detail?.data.name === 'Delete') {
      const paToDeleteTemp = this.processAnalyses.find(pa => pa.id === event?.detail?.data.analysisId)
      if(paToDeleteTemp){
        this.paToDelete = event.detail.data;
        this.paToDeleteName = paToDeleteTemp.data.name;
        this.popupX = this.latestMouseEvent.pageX - 160 + 'px';
        let yDif = 20;
        if(rowNumber < 5){
          yDif += 150
        }
        this.popupY = this.latestMouseEvent.pageY + yDif + 'px';
        this.deletePopup.nativeElement.show = true;
      }
    } else {
      this.caseActionSelect.emit(event.detail.data);
    }
  }

  public getValue = (rowData, column): any => {
    return get(rowData, column);
  }

  handleDeleteMenu(event: any) {
    if(event.action){
      this.caseActionSelect.emit(this.paToDelete);
    }
    this.deletePopup.nativeElement.show = false;

  }
  handleOptionClick(mEvent : MouseEvent) {
    this.latestMouseEvent = mEvent;
  }
}
