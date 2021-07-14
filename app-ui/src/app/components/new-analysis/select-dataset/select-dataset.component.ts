import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NewAnalysisStepStatus} from 'src/app/models_ui/discover';
import {PreviewUI} from '../../../models_ui/analysis';
import {Router} from "@angular/router";

@Component({
  selector: 'select-dataset',
  templateUrl: './select-dataset.component.html',
  styleUrls: ['./select-dataset.component.css', '../../process-analysis-table/process-analysis-table.component.scss']
})
export class SelectDatasetComponent {

  @Input() dataset: string;
  @Input() availableDatasets: string[];
  @Input() preview: PreviewUI;
  @Input() isDataPreviewError;

  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter<NewAnalysisStepStatus>();
  @Output() selectedDataset: EventEmitter<string> = new EventEmitter<string>();

  constructor(private router: Router) {}

  public handleSelection = (event): void => {
    this.selectedDataset.emit(event.detail);
    this.updateStatus(true);
  }

  private updateStatus = (status: boolean): void => {
    const stepStatus = {
      step: 'dataset',
      completed: status
    } as NewAnalysisStepStatus;
    this.status.emit(stepStatus);
  }

  goDataSet() {
    this.router.navigate(['/discover/dataset']);
  }
}
