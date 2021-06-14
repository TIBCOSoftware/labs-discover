import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {CaseConfig, CaseEvent, CaseField} from '../../models/configuration';
import {CaseInfo} from '@tibco-tcstk/tc-liveapps-lib';
import {FilterUtils} from 'primeng/utils';
import {CaseService} from '../../service/custom-case.service';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {ActivatedRoute} from '@angular/router';
import get = Reflect.get;
import _ from 'lodash';

@Component({
  selector: 'custom-case-table',
  templateUrl: './custom-case-table.component.html',
  styleUrls: ['./custom-case-table.component.scss']
})
export class CustomCaseTableComponent implements OnInit, OnChanges {

  constructor(private caseService: CaseService,
              private messageService: MessageTopicService,
              private route: ActivatedRoute,
              private datePipe: DatePipe) {
  }

  /**
   * sandboxId - this comes from claims resolver
   */
  @Input() sandboxId: number;

  /**
   * Case references to display in the list
   */
  @Input() caseRefs: string[];

  @Input() loading: boolean;

  @Input() cConfig: CaseConfig;
  @Input() searchTerm: string;

  /**
   * Array of selected case references
   */
  @Output() selection: EventEmitter<string[]> = new EventEmitter<string[]>();

  @Output() selectionCases: EventEmitter<CaseInfo[]> = new EventEmitter<CaseInfo[]>();

  @Output() caseEvent: EventEmitter<CaseEvent> = new EventEmitter<CaseEvent>();

  public selectedCases: CaseInfo[];
  public cases: CaseInfo[];
  public casesTable = new Array<any>();
  public selectedCasesTable = new Array<any>();
  public cols: any[];
  public first = 0;

  public showPagination = false;
  public NUMBER_OF_ITEMS_BEFORE_PAGINATION = 50;


  public personnelTypeFilter = [];

  public showAdditionalSpinner: boolean;
  @ViewChild('dt', {static: true}) dt;

  // TODO: Move this to config
  protected DATE_OPTIONS = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

  ngOnInit() {
    this.cols = [
      /*{field: 'state', header: 'Status'},
      {field: 'caseReference', header: 'Name'}*/
    ];
    // Getting column definitions from config
    for (const hed of this.cConfig.headerFields) {
      this.cols.push({field: hed.label, header: hed.label});
    }
    (async () => {
      await this.loadCases();
    })();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.first = 0;
    this.loadCases();
    if (!changes.searchTem?.firstChange) {
      this.dt.filterGlobal(changes.searchTerm.currentValue, 'contains');
    }
  }

  async loadCases() {
    this.cases = await this.caseService.getCasesP(this.cConfig.appId);
    this.casesTable = new Array<any>();
    if(this.cases.length > this.NUMBER_OF_ITEMS_BEFORE_PAGINATION){
      this.showPagination = true;
    }
    for (const cas of this.cases) {
      const newCase:any = {};
      // Always get case Reference and State
      newCase.caseReference = cas.caseReference;
      if (cas.untaggedCasedataObj) {
        newCase.state = cas.untaggedCasedataObj.state;
        // TODO: MAKE RE-Usable function for details as well.
        for (const hed of this.cConfig.headerFields) {
          let field = 'untaggedCasedataObj.' + hed.field;
          if (hed.field.startsWith('META:')) {
            field = 'metadata.' + hed.field.substring(hed.field.lastIndexOf('META:') + 5);
          }
          if (hed.field.startsWith('CUSTOM:')) {
            field = hed.field.substring(hed.field.lastIndexOf('CUSTOM:') + 7);
          }
          newCase[hed.label] = _.get(cas, field);
          if(hed.format){
            if(hed.format === 'DATE'){
              newCase[hed.label] = this.datePipe.transform(newCase[hed.label], 'fullDate');
            }
          }
        }
      }
      this.casesTable.push(newCase);
    }
  }

  public getCaseInfo(tableInfo: any):CaseInfo{
    for(const casA of this.cases){
      if(tableInfo.caseReference === casA.caseReference){
         return casA;
      }
    }
    return null;
  }

  public handleSelection() {
    this.selectedCases = [];
    for(const casS of this.selectedCasesTable){
      // TODO: look at map array
      for(const casA of this.cases){
        if(casS.caseReference === casA.caseReference){
          this.selectedCases.push(casA);
        }
      }
    }

    const spSArray = new Array();
    for (const prS of this.selectedCases) {
      spSArray.push(prS.caseReference);
    }
    this.selection.emit(spSArray);
    this.selectionCases.emit(this.selectedCases);
  }

  public onRowClick(rowData, $event) {
    let itemIsNotYetSelected = true;
    for (let i = 0; i < this.selectedCasesTable.length; i++) {
      if (rowData.caseReference === this.selectedCases[i].caseReference) {
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
    // console.log('Get Color for state: ' + state);
    // TODO: optimize with lookup table
    if(this.cConfig.states){
      for(const st of this.cConfig.states){
        if(st.name === state){
          return st.color;
        }
      }
    }
    return '#f4f4f4';
  }

  public getStateIcon(state){
    if(this.cConfig.states){
      for(const st of this.cConfig.states){
        if(st.name === state){
          if(st.icon){
            return st.icon;
          }
        }
      }
    }
    return 'assets/images/states' + state + '.svg';
  }

  public obtainData = (rowData: any, col: any): string => {
    return get(rowData, col);
  }

  caseEventClicked(data:CaseEvent){
    this.caseEvent.emit(data);
  }

}
