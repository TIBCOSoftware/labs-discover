import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaseConfig, CaseEvent, CaseField} from '../../models_ui/configuration';
import {CaseInfo, TcAppDefinitionService} from '@tibco-tcstk/tc-liveapps-lib';
import _ from 'lodash';

@Component({
  selector: 'custom-case-details',
  templateUrl: './custom-case-details.component.html',
  styleUrls: ['./custom-case-details.component.css']
})
export class CustomCaseDetailsComponent implements OnInit {

  constructor(protected appDefinitionService: TcAppDefinitionService) {
  }

  @Input() cConfig: CaseConfig;
  @Input() caseDetail: CaseInfo;
  @Output() caseEvent: EventEmitter<CaseEvent> = new EventEmitter<CaseEvent>();

  protected MAX_FIELD_LENGTH = 35;

  ngOnInit(): void {
  }

  private getField(fieldV) {
    const cas = this.caseDetail;
    if (cas.untaggedCasedataObj) {
      let field = 'untaggedCasedataObj.' + fieldV;
      if (fieldV.startsWith('META:')) {
        field = 'metadata.' + fieldV.substring(fieldV.lastIndexOf('META:') + 5);
      }
      if (fieldV.startsWith('CUSTOM:')) {
        field = fieldV.substring(fieldV.lastIndexOf('CUSTOM:') + 7);
      }
      return _.get(cas, field);
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
      caseInfo: this.caseDetail,
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


  // Process updates from the souce pane
  updateConfigJSON(newJson) {
    console.log('Update JSON ', newJson);
  }
}
