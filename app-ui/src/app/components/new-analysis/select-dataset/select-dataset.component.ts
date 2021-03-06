import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map } from 'rxjs/operators';
import { NewAnalysisStepStatus } from 'src/app/models/discover';
import { DatasetService } from '../../../service/dataset.service'
import { DatasetListItem } from 'src/app/models/dataset';
import { forkJoin } from 'rxjs';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { DiscoverBackendService } from 'src/app/service/discover-backend.service';

@Component({
  selector: 'select-dataset',
  templateUrl: './select-dataset.component.html',
  styleUrls: ['./select-dataset.component.css', '../../process-analysis-table/process-analysis-table.component.scss']
})
export class SelectDatasetComponent implements OnInit {

  @Input() dataset: string;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter<NewAnalysisStepStatus>();
  @Output() selectedDataset: EventEmitter<string> = new EventEmitter<string>();

  public datasets;

  public previewColumns: string[];
  public previewData: any;
  public isError = false;

  public reservedMessage = '';

  public RESERVED_COLUMN_NAMES = [
    'input_duration_days',
    'input_duration_sec',
    'input_next_activity_id',
    'input_next_resource_id',
    'input_next_resource_group',
    'input_repeat_self_loop_flag',
    'input_redo_self_loop_flag',
    'input_start_flag',
    'input_end_flag',
    'input_analysis_id',
    'input_row_id'
  ]

  constructor(
    protected datasetService: DatasetService,
    protected backendService: DiscoverBackendService,
    protected configService: ConfigurationService
  ) { }

  ngOnInit(): void {
    this.datasetService.getDatasets().pipe(
      map((datasets: DatasetListItem[]) => {
        this.datasets = datasets
          .filter(dataset => dataset.status === 'COMPLETED')
          .map(dataset => ({label: dataset.name, value: String(dataset.datasetid)}))
          .sort((a, b) => (a.label > b.label) ? 1 : -1);
        if (this.dataset) {
          const event = { detail: { label: this.datasets.filter(dataset => dataset.value == this.dataset)[0].label, value: this.datasets.filter(dataset => dataset.value == this.dataset)[0].value }};
          this.handleSelection(event);
        }
      })
    ).subscribe();
  }

  public handleSelection = (event): void => {
    let status = true;
    this.reservedMessage = '';
    this.datasetService.getDataset(event.detail.value).subscribe(dataset => {
      dataset.schema.forEach( schema => {
        this.RESERVED_COLUMN_NAMES.forEach(word => {
          if(schema.key === word){
            status = false;
            if(this.reservedMessage === '') {
              this.reservedMessage = 'You can\'t use this dataset since the dataset uses reserved column name(s): ' + word
            } else {
              this.reservedMessage += ' and ' + word;
            }
          }
        })
      })
    });
    /* TODO: Use the new preview service when ready, for select dataset
    this.datasetService.getPreview(event.detail.value).subscribe(preview => {
      console.log('DS-Preview: ' , preview);
    }); */
    this.isError = false;
    const columns$ = this.backendService.getColumnsFromSpark(event.detail.value, this.configService.config.claims.globalSubcriptionId);
    const preview$ = this.backendService.getPreviewFromSpark(event.detail.value, this.configService.config.claims.globalSubcriptionId);
    forkJoin([columns$, preview$]).subscribe(results => {
      this.previewColumns = this.calculateColumns(results[0]);
      this.previewData = JSON.parse(results[1]);
      this.selectedDataset.emit(event.detail);
      this.updateStatus(status);
    },
    error => {
      console.log('Error: ', error);
      this.isError = true;
    });
  }

  private calculateColumns = (columns: any[]): any[] => {
    return columns.map(column => {
      const newColumn = {
        headerName: column.COLUMN_NAME,
        field: column.COLUMN_NAME,
        sortable: false,
        filter: false,
        resizable: false
      };
      return newColumn;
    })
  }

  private updateStatus = (status: boolean): void => {
    const stepStatus = {
      step: 'dataset',
      completed: status
    } as NewAnalysisStepStatus;
    this.status.emit(stepStatus);
  }
}
