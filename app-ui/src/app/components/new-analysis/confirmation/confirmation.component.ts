import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {NewAnalysisStepStatus} from 'src/app/models_ui/discover';
import {AnalysisData} from 'src/app/backend/model/analysisData';
import {START_NAME, STOP_NAME} from '../../../functions/analysis';
import {Observable} from 'rxjs';
import { CatalogService } from 'src/app/backend/api/catalog.service';
import { Dataset } from 'src/app/backend/model/dataset';

@Component({
  selector: 'confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit, OnChanges {

  createReadableArrayString = require('../../../functions/templates').createReadableArrayString;

  @Input() data: AnalysisData;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  hasStart = false;
  startActivities: string[] = [];
  hasStop = false;
  stopActivities: string[] = [];
  hasFilter = false;

  dataSet$: Observable<Dataset>;

  otherFields: string[]

  constructor(private catalogService: CatalogService) {
  }

  ngOnInit(): void {
    this.parseStartStop();
    this.dataSet$ = this.catalogService.getDataset(this.data.datasetId);

    this.dataSet$.subscribe(dataset => {
      this.otherFields = [];
      dataset?.schema?.forEach(s => {
        let doPush = true;
        Object.keys(this.data.mappings).forEach(key => {
          if (typeof key === 'string' && s.key === this.data.mappings[key]) {
            doPush = false;
          }
        })
        if(doPush){
          this.otherFields.push(s.key);
        }
      })
    });
  }

  public updateStatus = (): void => {
    const status = true;
    const stepStatus = {
      step: 'confirmation',
      completed: status
    } as NewAnalysisStepStatus;
    this.status.emit(stepStatus);
  }

  public parseStartStop() {
    if (this.data?.filters && this.data.filters.length > 0) {
      const startA = this.data.filters.find(val => val.name === START_NAME);
      if (startA && startA.values && startA.values.length > 0) {
        this.startActivities = startA?.values;
        this.hasStart = true;
      }
      const stopA = this.data.filters.find(val => val.name === STOP_NAME);
      if (stopA && stopA.values && stopA.values.length > 0) {
        this.stopActivities = stopA?.values;
        this.hasStop = true;
      }
      this.hasFilter = this.data.filters.filter(v => v.name !== START_NAME && v.name !== STOP_NAME).length > 0;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.parseStartStop();
  }

}
