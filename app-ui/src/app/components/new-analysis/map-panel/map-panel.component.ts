import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Mapping } from 'src/app/model/mapping';
import { MapDef } from 'src/app/models/analysis';
import { NewAnalysisStepStatus } from 'src/app/models/discover';
import { StringSimilarityService } from 'src/app/service/string-similarity.service';
import { DatasetService } from '../../../service/dataset.service';

type Options = { label: string, value: string }[];


@Component({
  selector: 'map-panel',
  templateUrl: './map-panel.component.html',
  styleUrls: ['./map-panel.component.css']
})
export class MapPanelComponent implements OnInit, OnChanges {

  @Input() data: Mapping;
  @Input() availableColumns: string[];
  @Input() datasetId: string;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  availableNonTimeColumns: string[];
  columns: Options;
  availableTimeColumns: string[];
  timeColumns: Options;

  constructor(
    private ssService: StringSimilarityService,
    private datasetService: DatasetService
  ) {
  }

  ngOnInit() {
    this.findMappings();
    if (Object.keys(this.data).length === 0) {
      this.autoMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.availableColumns?.currentValue) {
      this.findMappings();
      this.updateStatus();
    }
  }

  calculateOption = (field: string): Options => {
    return this.calculateOptionHelper(field, this.columns);
  }

  calculateTimeOption = (field: string): Options => {
    return this.calculateOptionHelper(field, this.timeColumns);
  }

  private calculateOptionHelper = (field: string, optionSelector: Options): Options => {
    if (optionSelector) {
      const values = Object.values(this.data);
      const options = optionSelector.filter(column => {
        return !values.includes(column.value) || this.data[field]?.includes(column.value);
      });
      return options.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
    }
  }

  public handleSelection = (event, field): void => {
    this.data[field] = event.detail?.value;
    this.updateStatus();
  }

  public handleOtherAttributes = (event): void => {
    this.data.otherAttributes = event.detail.checked;
    this.updateStatus();
  }

  private updateStatus = (): void => {
    const status = this.data.caseId !== undefined && this.data.activity !== undefined && this.data.startTime !== undefined;
    const stepStatus = {
      step: 'map',
      completed: status
    } as NewAnalysisStepStatus;
    this.status.emit(stepStatus);
  }

  public autoMap = (): void => {
    const availableColumns = [...this.availableColumns];
    MapDef.PROP_NAMES.forEach(field => {
      const mappedColumn = this.ssService.autoMap(field, availableColumns);
      if (mappedColumn) {
        this.data[field] = mappedColumn;
        availableColumns.splice(availableColumns.indexOf(mappedColumn), 1)
      }
    });
    const availableTimeColumns = [...this.availableTimeColumns];
    MapDef.PROP_NAMES_TIME.forEach(field => {
      const mappedTimeColumn = this.ssService.autoMap(field, availableTimeColumns);
      if (mappedTimeColumn) {
        this.data[field] = mappedTimeColumn;
        availableTimeColumns.splice(availableTimeColumns.indexOf(mappedTimeColumn), 1)
      }
    });
    this.updateStatus();
  }

  findMappings() {
    if (this.datasetId) {
      this.availableTimeColumns = [];
      this.availableNonTimeColumns = [];
      this.datasetService.getDataset(this.datasetId).subscribe(dataset => {
        this.timeColumns = dataset.schema.filter(v => v.type === 'timestamp').map(v => {
          this.availableTimeColumns.push(v.key);
          this.availableColumns = this.availableColumns.filter((value) => {
            return value !== v.key;
          });
          return { label: v.key, value: v.key }
        })
        this.columns = dataset.schema.filter(v => v.type !== 'timestamp').map(v => {
          this.availableNonTimeColumns.push(v.key);
          return { label: v.key, value: v.key }
        })
      })
    }
  }
}
