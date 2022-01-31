import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapFolderModel } from 'src/app/backend/model/mapFolderModel';
import { NimbusDocument } from 'src/app/models_ui/nimbus';
import { NewAnalysisStepStatus } from '../../../models_ui/discover';

@Component({
  selector: 'nimbus-doc-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class NewProcessDocumentConfirmationComponent implements OnInit {

  @Input() document: NimbusDocument;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Input() step: string;

  constructor() { }

  ngOnInit(): void {
    this.updateStatus();
  }

  public updateStatus = (): void => {
    const stepStatus = {
      step: this.step,
      completed: true
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }
}
