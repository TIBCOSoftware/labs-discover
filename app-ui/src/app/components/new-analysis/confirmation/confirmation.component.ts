import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewAnalysis, NewAnalysisStepStatus } from 'src/app/models/discover';

@Component({
  selector: 'confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {

  @Input() data: NewAnalysis;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  public updateStatus = (): void => {
    const status = true;
    const stepStatus = {
      step: 'confirmation',
      completed: status
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }
}
