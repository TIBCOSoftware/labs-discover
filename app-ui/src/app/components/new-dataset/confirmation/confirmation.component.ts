import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Dataset } from '../../../backend/model/dataset';
import { NewAnalysisStepStatus } from '../../../models_ui/discover';

@Component({
  selector: 'dataset-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
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
