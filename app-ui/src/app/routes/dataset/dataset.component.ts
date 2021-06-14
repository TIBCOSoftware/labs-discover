import { Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageTopicService, TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { UxplPopup } from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import { OptionsMenuConfig } from '@tibco-tcstk/tc-web-components/dist/types/models/optionsMenuConfig';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { RepositoryService } from 'src/app/api/repository.service';
import { NewDatasetWizardComponent } from 'src/app/components/new-dataset/wizard/wizard.component';
import { Dataset, DatasetListItem } from 'src/app/models/dataset';
import { DiscoverBackendService } from 'src/app/service/discover-backend.service';
import { getRelativeTime } from '../../functions/analysis';
import { DatasetService } from '../../service/dataset.service';
import {notifyUser} from '../../functions/message';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css', '../../components/process-analysis-table/process-analysis-table.component.scss']
})

export class DatasetComponent implements OnInit, OnDestroy {

  protected _destroyed$ = new Subject();
  public datasets: DatasetListItem[];
  public loading: boolean;
  public fileOptions: OptionsMenuConfig =  { options: [
    { id: '1', label: 'Edit'},
    { id: '2', label: 'Refresh'},
    { id: '3', label: 'Delete'},

  ]};
  cols = [
    {field: 'name', header: 'Name'},
    {field: 'description', header: 'Description'},
    {field: 'lastPreviewDate', header: 'Last preview on'},
    {field: 'status', header: 'Status'}
  ];
  @ViewChild('datasetsTable', {static: false}) dt;
  public searchTerm: string;
  public dialogRef: MatDialogRef<NewDatasetWizardComponent, any>;

  public noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');
  public readyImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/states/Ready.svg');
  public notReadyImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/states/Not ready.svg');

  public getRelTime = getRelativeTime;
  public popupX:string;
  public popupY:string;
  public maxDeletePopupHeight = '162px';
  public showDeleteConfirm = false;
  @ViewChild('deletePopup', {static: true}) deletePopup: ElementRef<UxplPopup>;
  public datasetOnAction: DatasetListItem = null;

  public statusMap: {[key: string]: any} = {};

  constructor(
    protected dialog: MatDialog,
    protected location: Location,
    protected repositoryService: RepositoryService,
    protected messageService: MessageTopicService,
    protected backendService: DiscoverBackendService,
    protected datasetService: DatasetService) { }


  ngOnDestroy(): void {
    console.log('stop status polling when destroy the dataset component');
    this.stopPollingStatus();
  }


  ngOnInit(): void {
    this.refresh();
  }

  public refresh = () => {
    this.listDataset();
  }

  public newDatasetDialog = (): void => {
    this.openWizard();
  }

  public listDataset  = () => {
    this.loading = true;

    this.datasetService.getDatasets().subscribe(
      datasetListItems => {
        this.datasets = datasetListItems;
        this.loading = false;

        // start progress query for those who doesn't have status yet
        this.startPollingStatus();
      }, error => {
        console.log(error);
        this.loading = false;
      }
    );
  }

  private stopPollingStatus() {
    for(const datasetId in this.statusMap) {
      if (this.statusMap[datasetId]) {
        this.statusMap[datasetId].stop = true;
      }
    }
    this.statusMap = {};
  }

  private startPollingStatus() {
    this.stopPollingStatus();
    for (let i = 0; i < this.datasets.length; i ++) {
      const dataset = this.datasets[i];
      if (!dataset.status) {
        const progress = {
          message: 'Data preview'
        };
        this.datasetService.pollPreviewStatus(dataset.datasetid, progress).subscribe(
          resp => {
            // the status of dataset arrives final status or the polling is stopped
            if (resp.status) {
              // update the row
              // this.datasets.filter(el => el.datasetid === dataset.datasetid)[0].status = resp.status;
              if (resp.status && resp.lastPreviewDate) {
                dataset.status = resp.status;
                dataset.lastPreviewDate = resp.lastPreviewDate;
              }
              this.statusMap[dataset.datasetid] = null;
            } else {
              // stopped by setting progress.stop = true
              progress.message = 'Stopped';
            }
          }
        );
        this.statusMap[dataset.datasetid] = progress;
      }
    }
  }

  public handleSearch = ($event): void => {
    this.searchTerm = $event.detail.value;
    this.dt.filterGlobal(this.searchTerm, 'contains');
  }

  public getOptions = (rowData: Dataset): OptionsMenuConfig => {
    const options = this.fileOptions.options.slice(0);
    if (!rowData.status) {
      options.splice(1, 1);
    }
    return {options};
  }

  public optionSelect = ($event, datasetListItem: DatasetListItem): void => {
    const label = $event.detail.label
    if (label == 'Edit') {
      this.openWizard(datasetListItem);
    } else if (label == 'Delete') {
      this.deleteDataset(datasetListItem, $event);
    } else if (label == 'Refresh') {
      this.refrewshPreview(datasetListItem);
    }
  }

  private refrewshPreview(dataset: DatasetListItem) {
    const datasetId = dataset.datasetid;
    const progress = {
      message: 'Data preview'
    };
    // this.datasets.filter(el => el.datasetid == datasetId)[0].status = undefined;
    dataset.status = undefined;
    this.statusMap[datasetId] = progress;
    this.datasetService.refresh(datasetId, progress).subscribe(resp => {
      if (resp.status && resp.lastPreviewDate) {
        dataset.status = resp.status;
        dataset.lastPreviewDate = resp.lastPreviewDate;
      }
    });
  }

  private deleteDataset(dataset: DatasetListItem, event) {
    const target = event.target;
    const button = target.parentNode;
    const domRect = button.getBoundingClientRect();
    const windowX = window.screenX;
    const windowY = window.screenY;

    this.popupX = domRect.x - 328 + 'px';
    this.popupY = domRect.y + windowY  + 'px';
    this.deletePopup.nativeElement.show = true;
    this.showDeleteConfirm = true;

    this.datasetOnAction = dataset;
  }

  public handleDeleteConfirmation($event) {
    console.log($event);
    const action = $event.action;
    if (action) {
      console.log('delete confirmed');
      const dataset = this.datasetOnAction;
      if (dataset) {
        const datasetId = dataset.datasetid;
        if (this.statusMap[datasetId]) {
          this.statusMap[datasetId].stop = true;
          this.statusMap[datasetId] = null;
        }
        this.datasetService.deleteDataset(datasetId).subscribe(resp => {
          this.refresh();
        }, error => {
          if (error.status == 409) {
            // the analysis linked with it is archived. 
            const mes = {
              type: "ERROR",
              message: "The analysis created from '" + dataset.name + "' is archived"
            };
            this.messageService.sendMessage("news-banner.topic.message", 'MESSAGE:' + JSON.stringify(mes));
          } else {
            this.refresh();
            const mes = {
              type: "ERROR",
              message: "Failed to delete dataset"
            };
            this.messageService.sendMessage("news-banner.topic.message", 'MESSAGE:' + JSON.stringify(mes));
          }
        });
      }
    }
    this.deletePopup.nativeElement.show = false;
    this.showDeleteConfirm = false;
  }

  private openWizard(dataset: DatasetListItem | undefined = undefined) {
    this.dialogRef = this.dialog.open(NewDatasetWizardComponent, {
      width: '100%',
      height: '90%',
      data: {
        dataset
      }
    });
    this.refreshListAfterDatasetSaved();
  }

  private refreshListAfterDatasetSaved() {
    this.dialogRef.componentInstance.datasetSaved.subscribe(data => {
      this.refresh();
    });
  }

  private displayStatus(status: string) {
    if (status == 'COMPLETED') {
      return 'Ready';
    } else {
      return 'Not ready';
    }
  }

  private getStateIcon(status: string) {
    if (status == 'COMPLETED') {
      return this.readyImage;
    } else {
      return this.notReadyImage;
    }
  }

  private getStateColor(status: string) {
    if (status == 'COMPLETED') {
      return '#E1F7EB';
    } else {
      return '#F9E1E4';
    }
  }

  private getStateTooltip(status: string, message: string) {
    if (status == 'COMPLETED') {
      return '';
    } else {
      return message || '';
    }
  }

}
