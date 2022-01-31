import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {get} from 'lodash-es';
import {Analysis} from 'src/app/backend/model/models';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import { DateTime } from 'luxon';
import {getShortMessage} from '../../functions/details';

@Component({
  selector: 'process-analysis-table',
  templateUrl: './process-analysis-table.component.html',
  styleUrls: ['./process-analysis-table.component.scss']
})

export class ProcessAnalysisTableComponent implements OnInit, OnChanges {

  constructor() {
  }

  @Input() processAnalyses: Analysis[];
  @Input() searchTerm: string;
  @Input() statusMap: { [key: string]: any };
  @Input() loading;

  @Output() caseActionSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() openAnalysis: EventEmitter<string> = new EventEmitter<string>();
  @Output() forceRefresh: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('dt', {static: true}) dt;
  @ViewChild('deletePopup', {static: true}) deletePopup: ElementRef<UxplPopup>;

  readonly NUMBER_OF_ITEMS_BEFORE_PAGINATION = 50;
  showPagination = false;
  cols: any[];
  popupX: string;
  popupY: string;

  expandedRows = {};

  showCompare = false;
  selectedAnalysis: Analysis[] = [undefined];


  private paToDelete: { action: string, analysisId: string, name: string };
  paToDeleteName = '';

  latestMouseEvent: MouseEvent;

  readonly MAX_TOOLTIP_LENGTH = 250;

  // public callCounter = 0;

  public actions = {}

  // callCounter = 0

  ngOnInit() {
    this.cols = [
      {field: 'data.name', header: 'Name'},
      {field: 'data.description', header: 'Description'},
      {field: 'metadata.modifiedBy', header: 'Last updated by'},
      {field: 'metadata.modifiedOn', header: 'Last updated'},
      /*{field: 'data.templateLabel', header: 'Template'},*/
      {field: 'metadata.state', header: 'Status'},
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.searchTerm?.firstChange) {
      this.dt.filterGlobal(changes.searchTerm?.currentValue, 'contains');
    }
    if (this.processAnalyses) {
      this.calculateActions()
      if (this.processAnalyses.length > this.NUMBER_OF_ITEMS_BEFORE_PAGINATION) {
        this.showPagination = true;
      }
    }
  }

  public buttonClicked(rowData) {
    if (rowData.data.templateId === undefined || rowData.data.templateId === '') {
      this.caseActionSelect.emit({analysisId: rowData.id, name: 'change-template'});
    } else {
      if (rowData.metadata.state === 'Ready' || rowData.metadata.state === 'Archived') {
        this.openAnalysis.emit(rowData.id);
      }
    }
  }

  // TODO: put the data in a data matrix
  // callCounter = 0
  public obtainData(rowData: any, col: any): string {
    // console.log('Get data('+col+') .... ', this.callCounter)
    // this.callCounter++;
    return getShortMessage(get(rowData, col), 50);
  }

  public getToolTip(field: any, data: any) {
    let re = '';
    if (field === 'metadata.state') {
      const cellData = get(data, field);
      if (cellData.trim() === 'Not ready') {
        if (data.metadata.message) {
          re = data.metadata.message;
          if (re.length > this.MAX_TOOLTIP_LENGTH) {
            re = re.substr(0, this.MAX_TOOLTIP_LENGTH) + '... (see details for full error message)';
          }
        }
      }
    }
    return re;
  }

  public getNgClass(field, data) {
    let re = null;
    if (field === 'metadata.state') {
      const cellData = get(data, field).trim();
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

  public calculateActions() {
    if (this.processAnalyses && this.processAnalyses.length > 0) {
      for (const rowData of this.processAnalyses) {
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
        if (rowData.data.templateId && rowData.data.templateId !== '' && rowData.metadata.state === 'Ready') {
          actionButtons.splice(0, 0, {
            id: 'Change template',
            label: 'Change template',
            data: {
              analysisId: rowData.id,
              name: 'change-template',
              action: 'change-template'
            }
          })
        }
        this.actions[rowData.id] = {options: actionButtons}
      }
    }
  }


  public async handleCaseActionSelect(event: any, rowNumber: number) {
    if (event?.detail?.data.name === 'Delete') {
      const paToDeleteTemp = this.processAnalyses.find(pa => pa.id === event?.detail?.data.analysisId)
      if (paToDeleteTemp) {
        this.paToDelete = event.detail.data;
        this.paToDeleteName = paToDeleteTemp.data.name;
        this.popupX = this.latestMouseEvent.pageX - 160 + 'px';
        let yDif = 20;
        if (rowNumber < 5) {
          yDif += 150
        }
        this.popupY = this.latestMouseEvent.pageY + yDif + 'px';
        this.deletePopup.nativeElement.show = true;
      }
    } else {
      const paTemp = this.processAnalyses.find(pa => pa.id === event?.detail?.data.analysisId)
      if (paTemp && event?.detail?.data) {
        event.detail.data.paName = paTemp.data.name
      }
      this.caseActionSelect.emit(event.detail.data);
    }
  }

  public getValue(rowData, column) {
    return get(rowData, column);
  }

  public expandRow(name: string, value: boolean) {
    const paT = this.processAnalyses.find(v => v.data?.name === name)
    if (paT && paT.id) {
      this.expandedRows[paT.id] = value;
    }
  }

  handleDeleteMenu(event: any) {
    if (event.action) {
      this.caseActionSelect.emit(this.paToDelete);
    }
    this.deletePopup.nativeElement.show = false;

  }

  handleOptionClick(mEvent: MouseEvent) {
    this.latestMouseEvent = mEvent;
  }

  handleDoCompare(analysis: Analysis) {
    this.selectedAnalysis = [ analysis, undefined ];
    this.toggleCompare();
  }

  toggleCompare() {
    this.showCompare = !this.showCompare;
  }

}
