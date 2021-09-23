import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Mapping} from 'src/app/model/mapping';
import {MapDef, MappingUI} from 'src/app/models_ui/analysis';
import {NewAnalysisStepStatus} from 'src/app/models_ui/discover';
import {AutoMappingService} from 'src/app/service/auto-mapping.service';
import {DatasetService} from '../../../service/dataset.service';
import {AutoMapResult} from '../../../models_ui/configuration';
import {TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {Location} from '@angular/common';

type Options = { label: string, value: string, id: string }[];


@Component({
  selector: 'map-panel',
  templateUrl: './map-panel.component.html',
  styleUrls: ['./map-panel.component.css']
})
export class MapPanelComponent implements OnInit, OnChanges {

  constructor(
    private location: Location,
    private autoMapService: AutoMappingService,
    private datasetService: DatasetService
  ) {
  }

  @Input() mapping: Mapping;
  @Input() availableColumns: string[];
  @Input() datasetId: string;
  @Input() doAutoMap: boolean;
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

  autoMapResults = {}
  bulbLocation: string;

  ngOnInit() {
    this.findMappings();
    // this.findLockedMappings();
    this.bulbLocation = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/images/settings/tcs-spotfire-icon.svg');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.availableColumns?.currentValue) {
      this.findMappings();
      // this.findLockedMappings();
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
      const values = Object.values(this.mapping);
      const options = optionSelector.filter(column => {
        return !values.includes(column.value) || this.mapping[field]?.includes(column.value);
      });
      return options.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
    }
  }

  public handleSelection = (event, field): void => {
    this.mapping[field] = event.detail?.value;
    this.setAutoMapped(field, false);
    this.updateStatus();
  }

  public handleOtherAttributes = (event): void => {
    this.mapping.otherAttributes = event.detail.checked;
    this.updateStatus();
  }

  public updateStatus = (): void => {
    const status = this.mapping.caseId !== undefined && this.mapping.activity !== undefined && this.mapping.startTime !== undefined;
    const stepStatus = {
      step: 'map',
      completed: status,
      isAutoMapped: this.isAnythingAutoMapped()
    } as NewAnalysisStepStatus;
    this.status.emit(stepStatus);
  }

  findLockedMappings() {
    // Go over all the columns
    this.availableColumns.forEach(column => {
      this.requiredMappings.mappings.forEach(rMap => {
        if(column) {
          if (rMap.lockFieldName === column.toLowerCase()) {
            this.mapping[rMap.fieldName] = column;
            rMap.isLocked = true;
          }
        }
      })
      this.optionalMappings.mappings.forEach(oMap => {
        if(column) {
          if (oMap.lockFieldName === column.toLowerCase()) {
            this.mapping[oMap.fieldName] = column;
            oMap.isLocked = true;
          }
        }
      })
    })
  }

  public autoMap = (): void => {
    const availableColumns = [...this.availableColumns];
    const autoMapping = this.autoMapService.autoMapAll(MapDef.PROP_NAMES, availableColumns);
    MapDef.PROP_NAMES.forEach(field => this.setAutoMap(field, autoMapping[field]))
    const availableTimeColumns = [...this.availableTimeColumns];
    const autoMappingTime = this.autoMapService.autoMapAll(MapDef.PROP_NAMES_TIME, availableTimeColumns);
    let timeMapped = false;
    MapDef.PROP_NAMES_TIME.forEach(field => {
      if(autoMappingTime[field]){
        timeMapped = true;
      }
      this.setAutoMap(field, autoMappingTime[field])
    })
    // Special case if there is only one time field
    if(availableTimeColumns.length === 1 && !timeMapped){
      this.mapping.startTime = availableTimeColumns[0];
      // tslint:disable-next-line:no-string-literal
      this.autoMapResults['startTime'] = {message: 'Automapped) Only option for start time...'};
      this.setAutoMapped('startTime', true);
    }


    this.updateStatus();
  }

  private setAutoMap(field:string, aMapResult:AutoMapResult ){
    if(!this.isFieldLocked(field)) {
      if (aMapResult) {
        this.mapping[field] = aMapResult.columnName;
        this.autoMapResults[field] = aMapResult;
        const percent = Math.round(this.autoMapResults[field].likelihood * 100)
        this.autoMapResults[field].message = 'Automapped) Likelihood: ' +  percent  + '% Occurrences: ' + this.autoMapResults[field].occurrences;
        this.setAutoMapped(field, true);
      }
    }
  }

  public getAutoMapToolTip(field) {
    const re = '';
    if(this.autoMapResults[field]){
      return this.autoMapResults[field].message;
    }
    return re;
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

  private isAnythingAutoMapped(){
    return this.requiredMappings.mappings.concat(this.optionalMappings.mappings).filter( v => v.isAutomapped).length > 0
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
          return {label: v.key, value: v.key, id: v.key}
        })
        this.columns = dataset.schema.filter(v => v.type !== 'timestamp').map(v => {
          this.availableNonTimeColumns.push(v.key);
          return {label: v.key, value: v.key, id: v.key}
        })
        if (this.doAutoMap) {
          this.autoMap();
        }
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
