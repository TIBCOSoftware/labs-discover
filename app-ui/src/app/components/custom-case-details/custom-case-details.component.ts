import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CaseConfig, CaseEvent, CaseField} from '../../models_ui/configuration';
import { CaseInfo } from '@tibco-tcstk/tc-liveapps-lib';
import _ from 'lodash';
import { InvestigationDetails } from 'src/app/model/investigationDetails';
import { InvestigationMetadata } from 'src/app/model/investigationMetadata';

@Component({
  selector: 'custom-case-details',
  templateUrl: './custom-case-details.component.html',
  styleUrls: ['./custom-case-details.component.css']
})
export class CustomCaseDetailsComponent implements OnInit, OnChanges {

  constructor() {
  }
  @Input() cConfig: CaseConfig;
  @Input() caseDetail: InvestigationDetails;
  @Output() caseEvent: EventEmitter<CaseEvent> = new EventEmitter<CaseEvent>();

  public transpose: any[][];

  public milestone: any;

  protected MAX_FIELD_LENGTH = 35;

  ngOnInit(): void {
    this.milestone = {
        milestones: this.cConfig.states.map(state => { return { name: state.name, label: state.name, status: 'Pending'}})
    };
    this.milestone.milestones[this.milestone.milestones.length - 1].isTerminal = true;
    this.transpose = _.cloneDeep(this.cConfig.detailFields[0].map((_, colIndex) => this.cConfig.detailFields.map(row => row[colIndex])));
    this.milestone.milestones.filter(state => state.name === this.caseDetail.data.state)[0].status = 'InProgress';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cConfig && !changes.cConfig.firstChange) {
      if (!_.isEqual(changes.cConfig.currentValue, changes.cConfig.previousValue)){
        this.transpose = _.cloneDeep(changes.cConfig.currentValue.detailFields[0].map((_, colIndex) => changes.cConfig.currentValue.detailFields.map(row => row[colIndex])));
      }
    }
  }

  private getField(fieldV) {
    if (fieldV.indexOf('META:') == -1) {
      return _.get(this.caseDetail.data, fieldV);
    } else {
      fieldV =  fieldV.substring(fieldV.indexOf(':') + 1);
      return this.caseDetail.metadata?.filter((el: InvestigationMetadata) => el.name === fieldV)[0].value;
    }
  }

  getFieldValue(fieldV, format?) {
    let re = this.getField(fieldV);
    if (format === 'ARRAY') {
      let newRe = '';
      if (Symbol.iterator in Object(re)) {
        for (const val of re) {
          newRe += val + '<br>';
        }
      }
      re = newRe;
      // re.replace(',', )
    }
    if (re && re.length > this.MAX_FIELD_LENGTH) {
      re = re.substr(0, this.MAX_FIELD_LENGTH) + '...';
    }
    return re;
  }

  eventClicked(data: CaseField) {
    const caseEvent: CaseEvent = {
      caseInfo: {} as CaseInfo, // this.caseDetail,
      caseFieldEvent: data
    }
    this.caseEvent.emit(caseEvent);
  }

  getToolTip(fieldV, format?) {
    let re = this.getField(fieldV);
    if (format === 'ARRAY') {
      let newRe = '';
      if (Symbol.iterator in Object(re)) {
        for (const val of re) {
          newRe += val + '\n';
        }
      }
      if (newRe.length < this.MAX_FIELD_LENGTH) {
        newRe = '';
      }
      re = newRe;
    } else {
      if (re && re.length < this.MAX_FIELD_LENGTH) {
        re = '';
      }
    }
    return re;
  }
}
