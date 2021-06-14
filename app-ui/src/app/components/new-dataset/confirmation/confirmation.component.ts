import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Dataset } from '../../../models/dataset';
import { NewAnalysisStepStatus } from '../../../models/discover';

@Component({
  selector: 'dataset-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class NewDatasetConfirmationComponent implements OnInit {

  @Input() data: Dataset;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    this.updateStatus();
  }

  public updateStatus = (): void => {
    const stepStatus = {
      step: 'dataset-confirmation',
      completed: true
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }
}
