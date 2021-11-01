import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CaseConfig} from '../../models_ui/configuration';
import {createReadableArrayString} from '../../functions/templates';
import {InvestigationCreateRequest} from 'src/app/backend/model/investigationCreateRequest';
import {InvestigationConfig} from "../../models_ui/investigations";

@Component({
  selector: 'create-case-menu',
  templateUrl: './create-case-menu.component.html',
  styleUrls: ['./create-case-menu.component.css']
})
export class CreateCaseMenuComponent implements OnInit, OnChanges {

  @Input() investigationConfig: CaseConfig[];
  @Input() caseMarking: string[];
  @Input() variantMarking: string[];
  @Output() createInvestigationEvent: EventEmitter<InvestigationConfig> = new EventEmitter();

  invInfo: InvestigationCreateRequest;
  caseAdditionalInfo: string;
  variantAdditionalInfo: string;
  investigationApplicationId: string;
  investigationType: string;
  private MAX_READ_LENGTH = 15;

  constructor() {
  }

  public invValues: { label: string, value: string }[];

  ngOnInit(): void {
    this.invValues = this.investigationConfig.map((con: any) => {
      return {label: con.customTitle, value: con.applicationId}
    })
    if (this.invValues && this.invValues.length > 0) {
      this.investigationApplicationId = this.invValues[0].value;
      this.investigationType = this.invValues[0].label;
      this.invInfo = {
        type: 'Case',
        ids: '',
        details: '',
        summary: ''
      }
      this.setupAdditionalInfo();
    }
  }

  public createInvestigation(): void {
    this.createInvestigationEvent.emit({
      investigationType: this.investigationType,
      investigationId: this.investigationApplicationId,
      data: this.invInfo
    });
  }

  public cancelCreateInvestigation(): void {
    this.createInvestigationEvent.emit(null);
  }

  public contextTypeRadioChange(event): void {
    if (this.invInfo) {
      this.invInfo.type = event.detail.value;
      this.setupAdditionalInfo();
    }
  }

  public updateField(value, field): void {
    if (this.invInfo) {
      this.invInfo[field] = value;
    }
  }

  public setupAdditionalInfo(): void {
    if (this.invInfo) {
      if (this.invInfo.type === 'Case') {
        if (this.caseMarking) {
          this.invInfo.ids = this.caseMarking.toString();
          this.caseAdditionalInfo = '(' + createReadableArrayString(this.caseMarking, this.MAX_READ_LENGTH) + ')';
          this.variantAdditionalInfo = '';
        } else {
          this.caseAdditionalInfo = 'There are no cases selected...';
          this.variantAdditionalInfo = '';
        }
      } else {
        if (this.variantMarking) {
          this.invInfo.ids = this.variantMarking.toString();
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
    if (changes?.caseMarking || changes?.variantMarking) {
      this.setupAdditionalInfo();
    }
  }

  public setInvestigationApp(event: any): void {
    if (event?.detail?.value && event?.detail?.label) {
      this.investigationApplicationId = event.detail.value;
      this.investigationType = event.detail.label
    }
  }
}
