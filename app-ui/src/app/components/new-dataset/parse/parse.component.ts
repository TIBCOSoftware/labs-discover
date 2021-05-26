import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Schema } from 'src/app/models/backend';
import { CsvService } from 'src/app/service/csv.service';
import { DatasetService } from 'src/app/service/dataset.service';
import { DiscoverBackendService } from 'src/app/service/discover-backend.service';
import { Dataset, DatasetDataSource, DatasetWizard } from '../../../models/dataset';
import { NewAnalysisStepStatus } from '../../../models/discover';

@Component({
  selector: 'dataset-parse',
  templateUrl: './parse.component.html',
  styleUrls: ['./parse.component.scss', '../wizard/wizard.preview.table.scss']
})
export class NewDatasetParseComponent implements OnInit {
  @Input() data: Dataset;
  @Input() backupDataset: Dataset;
  @Input() wizard: DatasetWizard;
  @Input() previewColumns: any[];
  @Input() previewData: any[];
  @Input() file: File;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  constructor(
    protected csvService: CsvService,
    protected backendService: DiscoverBackendService,
    protected datasetService: DatasetService
  ) { }

  ngOnInit(): void {

    if ((!this.previewData || this.previewData.length == 0)) {
      this.datasetService.pullPreviewData(this.data).subscribe(data => {
        if(data.columns) {
          this.handlePreviewData.emit(data);
        }
        this.updateStatus();
      });
    } else {
      this.updateStatus();
    }
  }

  public refreshCSVPreview = (event): void => {
    this.handlePreviewData.emit(event);
  }

  public refreshTDVPreview = (): void => {
  }

  private updateStatus = (): void => {
    const status = true;
    const stepStatus = {
      step: 'dataset-parse',
      completed: status
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }
}
