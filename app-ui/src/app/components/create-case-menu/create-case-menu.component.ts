import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NewInvestigation} from '../../models/discover';
import {UxplSelectInput} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-select-input/uxpl-select-input';
import {CaseConfig} from '../../models/configuration';
import {createReadableArrayString} from '../../functions/templates';

@Component({
  selector: 'create-case-menu',
  templateUrl: './create-case-menu.component.html',
  styleUrls: ['./create-case-menu.component.css']
})
export class CreateCaseMenuComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() investigationConfig: CaseConfig[];

  @Input() caseMarking: string[];

  @Input() variantMarking: string[];

  @Output() createInvestigation: EventEmitter<NewInvestigation> = new EventEmitter();

  @ViewChild('selectInput', {static: false}) caseTypeInput: ElementRef<UxplSelectInput>;

  public invInfo: NewInvestigation;
  public caseAdditionalInfo: string;
  public variantAdditionalInfo: string;
  private MAX_READ_LENGTH = 15;

  constructor() {}

  private invValues:{label:string, value:string}[];

  ngOnInit(): void {
    this.invValues = this.investigationConfig.map( con => { return {label: con.customTitle, value: con.customTitle}} )
    if(this.invValues && this.invValues.length > 0){
      this.invInfo = {
        type: this.invValues[0].value,
        contextType: 'Case',
        contextIds: [],
        additionalDetails : '',
        summary: ''
      }
      this.setupAdditionalInfo();
    }
  }

  createInvestiagation(){
    this.createInvestigation.emit(this.invInfo);
  }

  ngAfterViewInit(): void {
    if(this.invValues && this.invValues.length > 0) {
      this.caseTypeInput.nativeElement.options = this.invValues;
      this.caseTypeInput.nativeElement.value = this.invValues[0].value;
    }
  }

  contextTypeRadioChange(event){
    if(this.invInfo){
      this.invInfo.contextType = event.detail.value;
      this.setupAdditionalInfo();
    }
  }

  updateField(value, field) {
    if(this.invInfo){
      this.invInfo[field] = value;
    }
  }

  public setupAdditionalInfo() {
    if (this.invInfo) {
      if (this.invInfo.contextType === 'Case') {
        if (this.caseMarking) {
          this.invInfo.contextIds = this.caseMarking;
          this.caseAdditionalInfo = '(' + createReadableArrayString(this.caseMarking, this.MAX_READ_LENGTH) + ')';
          this.variantAdditionalInfo = '';
        } else {
          this.caseAdditionalInfo = 'There are no cases selected...';
          this.variantAdditionalInfo = '';
        }
      } else {
        if (this.variantMarking) {
          this.invInfo.contextIds = this.variantMarking;
          this.caseAdditionalInfo = '';
          this.variantAdditionalInfo = '(' + createReadableArrayString(this.variantMarking, this.MAX_READ_LENGTH) + ')';
        } else {
          this.caseAdditionalInfo = '';
          this.variantAdditionalInfo = 'There are no variants selected...';
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.caseMarking || changes?.variantMarking){
      this.setupAdditionalInfo();
    }
  }
}
