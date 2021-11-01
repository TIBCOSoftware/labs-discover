import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { concatMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CatalogService } from 'src/app/backend/api/catalog.service';
import { CheckExist } from 'src/app/backend/model/checkExist';
import { Dataset } from 'src/app/backend/model/dataset';
import { NewAnalysisStepStatus } from '../../../models_ui/discover';
@Component({
  selector: 'dataset-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.css']
})
export class NewDatasetBasicInfoComponent implements OnInit {

  @Input() data: Dataset;
  // TODO: replace the NewAnalysisStepStatus with a general wizard step status
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter<NewAnalysisStepStatus>();
  @Output() enableSave: EventEmitter<boolean> = new EventEmitter<boolean>();

  nameError = false;

  public nameChanged: Subject<any> = new Subject<any>();

  constructor(
    protected catalogService: CatalogService
  ) { }

  ngOnInit(): void {
    this.updateStatus();

    this.nameChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .pipe(
        concatMap(model => {
          const requestBody = {
            Dataset_Id: model.datasetId,
            Dataset_Name: model.value
          } as CheckExist;
          return this.catalogService.isSameNameDatasetExist(requestBody);
        })
      ).subscribe(re => {
        if (re && re.exist === true) {
          this.nameError = true;
        } else {
          this.nameError = false;
        }
        this.updateStatus();
        // this.updateSaveStatus(!this.nameError);
      });
  }

  handleUpdate = (event, fieldName) => {
    const value = event.detail.value;
    this.data[fieldName] = value;
    this.updateStatus();

    if (fieldName === 'Dataset_Name' && value && value.trim() !== '') {
      this.nameChanged.next({
        value,
        datasetId: this.data.Dataset_Id
      });
    }
  }

  private updateSaveStatus(enabled: boolean) {
    this.enableSave.emit(enabled);
  }

  private updateStatus = (): void => {
    const status = !!(this.data && this.data.Dataset_Name && this.data.Dataset_Description && !this.nameError);
    const stepStatus = {
      step: 'dataset-basic-info',
      completed: status
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }

}
