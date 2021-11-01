import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MConfig, StepStatus} from '../../../models_ui/analyticTemplate';
import { createMConfig } from '../../../functions/templates';
import { Template } from 'src/app/backend/model/models';

@Component({
  selector: 'template-advanced',
  templateUrl: './template-advanced.component.html',
  styleUrls: ['./template-advanced.component.css']
})
export class TemplateAdvancedComponent implements OnInit {

  @Input() template: Template;

  @Input() markingOptions: string[];
  @Input() dataOptions: any;
  @Output() status: EventEmitter<StepStatus> = new EventEmitter<StepStatus>();

  public showAdvanced = false;
  public casesMConfig: MConfig;
  public variantMConfig: MConfig;

  constructor() {
  }

  ngOnInit(): void {
    this.casesMConfig = createMConfig(this.template.marking.casesSelector);
    this.variantMConfig = createMConfig(this.template.marking.variantSelector);
    this.updateStatus(true);
  }

  public handleUpdate = (event, fieldName) => {
    if (this.template) {
      this.template[fieldName] = event.detail.value;
    }
  }

  public handleUpdateMarking = (event, fieldName) => {
    if (this.template) {
      if (!this.template.marking) {
        this.template.marking = {
          listenOnMarking: '',
          casesSelector: '',
          variantSelector: ''
        }
      }
      this.template.marking[fieldName] = event.detail.value;
    }
  }

  public updateMarkingListener() {
    if (this.casesMConfig.dataTable !== this.variantMConfig.dataTable) {
      this.template.marking.listenOnMarking = JSON.stringify(JSON.parse('{"' + this.casesMConfig.dataTable + '": ["' + this.casesMConfig.columnName + '"], "' + this.variantMConfig.dataTable + '": ["' + this.variantMConfig.columnName + '"]}'))
    } else {
      this.template.marking.listenOnMarking = JSON.stringify(JSON.parse('{"' + this.casesMConfig.dataTable + '": ["' + this.casesMConfig.columnName + '", "' + this.variantMConfig.columnName + '"]}'))
    }
  }

  private updateStatus = (valid: boolean): void => {
    const status = valid;
    const stepStatus = {
      step: 'additional-options',
      completed: status
    };
    this.status.emit(stepStatus);
  }


}
