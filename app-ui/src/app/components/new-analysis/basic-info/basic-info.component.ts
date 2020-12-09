import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewAnalysisBasicInfo, NewAnalysisStepStatus } from 'src/app/models/discover';

@Component({
  selector: 'basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.css']
})
export class BasicInfoComponent implements OnInit {

  @Input() data: NewAnalysisBasicInfo;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter<NewAnalysisStepStatus>();

  constructor() { }

  ngOnInit(): void {
    this.updateStatus();
  }

  handleUpdate = (event, fieldName) => {
    this.data[fieldName] = event.detail.value;
    this.updateStatus();
  }

  private updateStatus = (): void => {
    const status = !(this.data.analysisName === undefined || this.data.analysisDescription === undefined || this.data.analysisName === '' || this.data.analysisDescription === '');
    const stepStatus = {
      step: 'basic-info',
      completed: status
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }

}
