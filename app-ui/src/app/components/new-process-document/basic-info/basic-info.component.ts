import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { MapFolderCollectionBreadcrumbs } from 'src/app/backend/model/mapFolderCollectionBreadcrumbs';
import { MapFolderModel } from 'src/app/backend/model/mapFolderModel';
import { NimbusDocument } from 'src/app/models_ui/nimbus';
import { NewAnalysisStepStatus } from '../../../models_ui/discover';
@Component({
  selector: 'nimbus-doc-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class NewProcessDocumentBasicInfoComponent implements OnInit {

  @Input() document: NimbusDocument;
  @Input() step: string;
  // // TODO: replace the NewAnalysisStepStatus with a general wizard step status
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter<NewAnalysisStepStatus>();
  // @Output() enableSave: EventEmitter<boolean> = new EventEmitter<boolean>();

  nameError = false;

  public nameChanged: Subject<any> = new Subject<any>();

  constructor(
  ) { }

  ngOnInit(): void {
    this.updateStatus();

    // this.nameChanged
    //   .pipe(debounceTime(500), distinctUntilChanged())
    //   .pipe(
    //     concatMap(model => {
    //       const requestBody = {
    //         Dataset_Id: model.datasetId,
    //         Dataset_Name: model.value
    //       } as CheckExist;
    //       return this.catalogService.isSameNameDatasetExist(requestBody);
    //     })
    //   ).subscribe(re => {
    //     if (re && re.exist === true) {
    //       this.nameError = true;
    //     } else {
    //       this.nameError = false;
    //     }
    //     this.updateStatus();
    //   });
  }

  locationSelected = (event) => {
    // if (event) {
      // this.document.folder = event.folder;
      // this.document.path = event.path;
      this.updateStatus();
    // }
  }

  handleUpdate = (event, fieldName) => {
    const value = event.detail.value;
    if (fieldName === 'name') {
      this.document.name = value;
    }
    this.updateStatus();
  }

  private updateStatus = (): void => {
    const status = !!(this.document.folder && this.document.name);
    const stepStatus = {
      step: this.step,
      completed: status
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }

}
