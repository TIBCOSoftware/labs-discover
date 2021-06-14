import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {NewAnalysisStepStatus} from '../../../models/discover';
import {get} from 'lodash';
import {DatasetService} from 'src/app/service/dataset.service';
import {forkJoin} from 'rxjs';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {DiscoverBackendService} from 'src/app/service/discover-backend.service';
import {Mapping} from 'src/app/models_generated/mapping';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css', '../../process-analysis-table/process-analysis-table.component.scss']
})
export class MapComponent implements OnInit {

  @Input() data: Mapping;
  @Input() selectedDataset: string;
  @Input() advancedMode: boolean
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Output() advance: EventEmitter<boolean> = new EventEmitter();

  public previewColumns: string[];
  public previewData: any;
  public availableColumns: string[];
  public previewOptions = [
    {label: 'Full data', value: 'full-data'},
    {label: 'Mapped data', value: 'mapped-data'}
  ];
  public previewValue: string = this.previewOptions[0].value;
  public firstVisit: boolean;

  constructor(
    protected tcmdService: DatasetService,
    protected configService: ConfigurationService,
    protected backendService: DiscoverBackendService
  ) {
  }

  ngOnInit(): void {
    this.firstVisit = Object.keys(this.data).length === 0 ? true : false;
    const columns$ = this.backendService.getColumnsFromSpark(this.selectedDataset, this.configService.config.claims.globalSubcriptionId);
    const preview$ = this.backendService.getPreviewFromSpark(this.selectedDataset, this.configService.config.claims.globalSubcriptionId);

    forkJoin([columns$, preview$]).subscribe(results => {
      this.availableColumns = results[0].map(column => column.COLUMN_NAME);
      this.previewColumns = this.calculateColumns(this.availableColumns);
      this.previewData = JSON.parse(results[1]);
    });
  }

  public clearMap = (): void => {
    Object.keys(this.data).forEach(v => delete this.data[v]);
    this.previewColumns = this.calculateColumns(this.previewValue === 'full-data' ? this.availableColumns : this.filterMappedColumns());
  }

  private calculateColumns = (columns: string[]): any[] => {
    return columns.map(column => {
      const newColumn = {
        headerName: column,
        field: column,
        sortable: false,
        filter: false,
        resizable: false
      };
      return newColumn;
    })
  }

  public updateStatus = (event): void => {
    this.status.emit(event);
    this.previewColumns = this.calculateColumns(this.previewValue === 'full-data' ? this.availableColumns : this.filterMappedColumns());
  }

  public getObjectValue = (rowdata, column): string => {
    return get(rowdata, column.field);
  }

  public toggleAdvanced = (event): void => {
    if (this.advancedMode !== event.detail.checked) {
      this.advance.emit();
    }
  }

  public isDisabledChangeVisualization = (): boolean => {
    return false;
  }

  public handlePreviewColumns = (event): void => {
    this.previewValue = event.detail.value;
    this.previewColumns = this.calculateColumns(this.previewValue === 'full-data' ? this.availableColumns : this.filterMappedColumns());
  }

  private filterMappedColumns = (): string[] => {
    const mappedColumns = []
    Object.keys(this.data).forEach((element) => {
      if (typeof (this.data[element]) === 'string') {
        mappedColumns.push(this.data[element]);
      }
    });
    const columnsForTable = this.availableColumns.filter(el => {
      return mappedColumns.indexOf(el) >= 0;
    });
    return columnsForTable;
  }
}
