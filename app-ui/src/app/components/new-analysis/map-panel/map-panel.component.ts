import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Mapping} from 'src/app/models_generated/mapping';
import {MapDef, MappingUI} from 'src/app/models/analysis';
import {NewAnalysisStepStatus} from 'src/app/models/discover';
import {StringSimilarityService} from 'src/app/service/string-similarity.service';
import {DatasetService} from '../../../service/dataset.service';

type Options = { label: string, value: string }[];


@Component({
  selector: 'map-panel',
  templateUrl: './map-panel.component.html',
  styleUrls: ['./map-panel.component.css']
})
export class MapPanelComponent implements OnInit, OnChanges {

  constructor(
    private ssService: StringSimilarityService,
    private datasetService: DatasetService
  ) {
  }

  @Input() data: Mapping;
  @Input() availableColumns: string[];
  @Input() datasetId: string;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  requiredMappings: MappingUI = {
    mappings: [
      {fieldName: 'caseId', fieldDescription: 'Case Id', lockFieldName: 'input_case_id', type: 'STRING',isLocked: false, isAutomapped: false},
      {fieldName: 'activity', fieldDescription: 'Activity', lockFieldName: 'input_activity_id', type: 'STRING', isLocked: false, isAutomapped: false},
      {fieldName: 'startTime', fieldDescription: 'Start time', lockFieldName: 'input_activity_start_timestamp', type: 'TIME', isLocked: false, isAutomapped: false},
    ]
  }
  optionalMappings: MappingUI = {
    mappings: [
      {fieldName: 'endTime', fieldDescription: 'End time', lockFieldName: 'input_activity_end_timestamp', type: 'TIME', isLocked: false, isAutomapped: false},
      {fieldName: 'scheduledStart', fieldDescription: 'Scheduled start', lockFieldName: 'input_scheduled_start', type: 'TIME', isLocked: false, isAutomapped: false},
      {fieldName: 'scheduledEnd', fieldDescription: 'Scheduled end', lockFieldName: 'input_scheduled_end', type: 'TIME', isLocked: false, isAutomapped: false},
      {fieldName: 'requester', fieldDescription: 'Requester', lockFieldName: 'input_requester', type: 'STRING', isLocked: false, isAutomapped: false},
      {fieldName: 'resourceGroup', fieldDescription: 'Organization', lockFieldName: 'input_resource_group', type: 'STRING', isLocked: false, isAutomapped: false},
      {fieldName: 'resource', fieldDescription: 'Resource', lockFieldName: 'input_resource_id', type: 'STRING', isLocked: false, isAutomapped: false}
    ]
  }

  availableNonTimeColumns: string[];
  columns: Options;
  availableTimeColumns: string[];
  timeColumns: Options;

  CUT_LENGTH = 16;

  ngOnInit() {
    this.findMappings();
    this.findLockedMappings();
    if (Object.keys(this.data).length === 0) {
      this.autoMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.availableColumns?.currentValue) {
      this.findMappings();
      this.findLockedMappings();
      this.updateStatus();
    }
  }

  calculateOption = (field: string, type: 'TIME' | 'STRING'): Options => {
    if(type === 'STRING') {
      return this.calculateOptionHelper(field, this.columns);
    } else {
      return this.calculateOptionHelper(field, this.timeColumns);
    }
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
    this.setAutoMapped(field, false);
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

  findLockedMappings() {
    // Go over all the columns
    this.availableColumns.forEach(column => {
      this.requiredMappings.mappings.forEach(rMap => {
        if(column) {
          if (rMap.lockFieldName === column.toLowerCase()) {
            this.data[rMap.fieldName] = column;
            rMap.isLocked = true;
          }
        }
      })
      this.optionalMappings.mappings.forEach(oMap => {
        if(column) {
          if (oMap.lockFieldName === column.toLowerCase()) {
            this.data[oMap.fieldName] = column;
            oMap.isLocked = true;
          }
        }
      })
    })
  }

  public autoMap = (): void => {
    const availableColumns = [...this.availableColumns];
    MapDef.PROP_NAMES.forEach(field => this.setAutoMap(field, availableColumns));
    const availableTimeColumns = [...this.availableTimeColumns];
    MapDef.PROP_NAMES_TIME.forEach( field => this.setAutoMap(field, availableTimeColumns));
    this.updateStatus();
  }

  private setAutoMap(field,availableColumns ){
    if(!this.isFieldLocked(field)) {
      const mappedTimeColumn = this.ssService.autoMap(field, availableColumns);
      if (mappedTimeColumn) {
        this.data[field] = mappedTimeColumn;
        this.setAutoMapped(field, true);
        availableColumns.splice(availableColumns.indexOf(mappedTimeColumn), 1)
      }
    }
  }

  private isFieldLocked(field){
    let re = false;
    this.requiredMappings.mappings.forEach(rMap => {
      if(rMap.fieldName === field && rMap.isLocked){
        re = true;
      }
    })
    this.optionalMappings.mappings.forEach(oMap => {
      if(oMap.fieldName === field && oMap.isLocked){
        re = true;
      }
    })
    return re;
  }

  private setAutoMapped(field, value){
    this.requiredMappings.mappings.forEach(rMap => {
      if(rMap.fieldName === field){
        rMap.isAutomapped = value;
      }
    })
    this.optionalMappings.mappings.forEach(oMap => {
      if(oMap.fieldName === field){
        oMap.isAutomapped = value;
      }
    })
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
          return {label: v.key, value: v.key}
        })
        this.columns = dataset.schema.filter(v => v.type !== 'timestamp').map(v => {
          this.availableNonTimeColumns.push(v.key);
          return {label: v.key, value: v.key}
        })
      })
    }
  }

  getPosition(location: number) {
    if (location > 3) {
      return 'above';
    } else {
      return 'below';
    }
  }

  getCut(value){
    if(value.length > this.CUT_LENGTH){
      return value.substring(0,this.CUT_LENGTH) + '...';
    } else {
      return value;
    }
  }

  getCutToolTip(value) {
    if(value.length > this.CUT_LENGTH){
      return value;
    } else {
      return null;
    }
  }
}
