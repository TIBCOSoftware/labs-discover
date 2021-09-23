import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {CaseConfig, CaseEvent, CaseField} from '../../models_ui/configuration';
import {CaseInfo} from '@tibco-tcstk/tc-liveapps-lib';
import {CaseService} from '../../service/custom-case.service';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {ActivatedRoute} from '@angular/router';
import _ from 'lodash';
import { InvestigationDetails } from 'src/app/model/investigationDetails';
import { InvestigationMetadata } from 'src/app/model/investigationMetadata';
import { InvestigationApplication } from 'src/app/model/investigationApplication';

@Component({
  selector: 'custom-case-table',
  templateUrl: './custom-case-table.component.html',
  styleUrls: ['./custom-case-table.component.scss']
})
export class CustomCaseTableComponent implements OnInit, OnChanges {

  @Input() loading: boolean;
  @Input() cConfig: InvestigationApplication;
  @Input() searchTerm: string;
  @Input() investigations: InvestigationDetails[];

  /**
   * Array of selected case references
   */
  @Output() selection: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() selectionCases: EventEmitter<InvestigationDetails[]> = new EventEmitter<InvestigationDetails[]>();
  @Output() caseEvent: EventEmitter<any> = new EventEmitter<any>();

  public selectedCases: InvestigationDetails[];
  public selectedCasesTable = new Array<any>();
  public cols: any[];
  public first = 0;

  public showPagination = false;
  public NUMBER_OF_ITEMS_BEFORE_PAGINATION = 5;

  public showAdditionalSpinner: boolean;
  @ViewChild('dt', {static: true}) dt;

  // TODO: Move this to config
  protected DATE_OPTIONS = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

  constructor() {
  }

  ngOnInit() {
    this.cols = this.cConfig.headerFields.map((el:CaseField) => {return {field: el.field, header: el.label}});
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.first = 0;
    // this.loadCases();
    if (changes.searchTem && !changes.searchTem?.firstChange) {
      this.dt.filterGlobal(changes.searchTerm.currentValue, 'contains');
    }
    if (changes.investigations && !changes.investigations?.firstChange) {
      this.selectedCases = [];
      this.selectedCasesTable = [];
    }
  }

  public handleSelection() {
    this.selectedCases = [];
    for(const casS of this.selectedCasesTable){
      // TODO: look at map array
      for(const casA of this.investigations){
        if(casS.id === casA.id){
          this.selectedCases.push(casA);
        }
      }
    }

    const spSArray = this.selectedCases.map((element: InvestigationDetails) => element.id)
    this.selection.emit(spSArray);
    this.selectionCases.emit(this.selectedCases);
  }

  public onRowClick(rowData, $event) {
    let itemIsNotYetSelected = true;
    for (let i = 0; i < this.selectedCasesTable.length; i++) {
      if (rowData.id === this.selectedCases[i].id) {
        // Row was already selected
        this.selectedCases.splice(i, 1);
        itemIsNotYetSelected = false;
      }
    }
    if (itemIsNotYetSelected) {
      this.selectedCasesTable.push(rowData);
    }
    this.selectedCasesTable = [...this.selectedCasesTable];
    this.handleSelection();
  }

  public getNgClass(field, data) {
    let re = null;
    if (field === 'state') {
      const cellData = data[field];
      if (cellData) {
        if (cellData.trim() === 'Not cleared') {
          re = 'neutral';
        }
        if (cellData.trim() === 'Cleared') {
          re = 'good';
        }
      }
    }
    return re;
  }

  public getStateColor(state) {
    const color =  this.cConfig.states.filter(el => el.name === state)[0].color;
    return color ? color : '#f4f4f4';
  }

  public getStateIcon(state){
    const icon = this.cConfig.states.filter(el => el.name === state)[0].icon;
    return icon ? icon : 'assets/images/states' + state + '.svg';
  }

  public obtainData = (rowData: InvestigationDetails, col: string): string => {
    if (col.indexOf('META:') == -1) {
      return _.get(rowData.data, col);
    } else {
      col =  col.substring(col.indexOf(':') + 1);
      return rowData.metadata.filter((el: InvestigationMetadata) => el.name === col)[0].value;
    }
  }

  caseEventClicked(data:CaseEvent){
    this.caseEvent.emit(data);
  }

}
