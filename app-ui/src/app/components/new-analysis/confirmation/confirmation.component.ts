import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {NewAnalysisStepStatus} from 'src/app/models/discover';
import {AnalysisData} from 'src/app/models_generated/analysisData';
import {START_NAME, STOP_NAME} from '../../../functions/analysis';
import {createReadableArrayString} from '../../../functions/templates';
import {DatasetService} from '../../../service/dataset.service';
import {Observable} from 'rxjs';
import {Dataset} from '../../../models/dataset';

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

  constructor(private datasetService: DatasetService) {
  }

  ngOnInit(): void {
    this.parseStartStop();
    this.dataSet$ = this.datasetService.getDataset(this.data.datasetId);

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
      if (startA && startA.value && startA.value.length > 0) {
        this.startActivities = startA?.value;
        this.hasStart = true;
      }
      const stopA = this.data.filters.find(val => val.name === STOP_NAME);
      if (stopA && stopA.value && stopA.value.length > 0) {
        this.stopActivities = stopA?.value;
        this.hasStop = true;
      }
      this.hasFilter = this.data.filters.filter(v => v.name !== START_NAME && v.name !== STOP_NAME).length > 0;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.parseStartStop();
  }

}
