import {Location} from '@angular/common';
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import {OptionsMenuConfig} from '@tibco-tcstk/tc-web-components/dist/types/models/optionsMenuConfig';
import {RepositoryService} from 'src/app/backend/api/repository.service';
import {NewDatasetWizardComponent} from 'src/app/components/new-dataset/wizard/wizard.component';
import {DatasetService} from '../../service/dataset.service';
import {MatDrawer} from '@angular/material/sidenav';
import { CatalogService } from 'src/app/backend/api/catalog.service';
import { DatasetListItem } from 'src/app/backend/model/datasetListItem';
import { Dataset } from 'src/app/backend/model/dataset';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css', '../../components/process-analysis-table/process-analysis-table.component.scss']
})

export class DatasetComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private location: Location,
    private repositoryService: RepositoryService,
    private messageService: MessageTopicService,
    protected catalogService: CatalogService,
    private datasetService: DatasetService) {
    this.messageLength = this.MAX_MESSAGE_SIZE;
  }

  @ViewChild('datasetsTable', {static: false}) dt;
  @ViewChild('drawer', {static: true}) drawer!: MatDrawer;
  @ViewChild('deletePopup', {static: true}) deletePopup: ElementRef<UxplPopup>;

  // protected _destroyed$ = new Subject();

  readonly MIN_MESSAGE_SIZE = 30;
  readonly MAX_MESSAGE_SIZE = 90;

  datasets: DatasetListItem[];
  loading: boolean;
  fileOptions: OptionsMenuConfig = {
    options: [
      {id: '2', label: 'Refresh'},
      {id: '3', label: 'Delete'},
    ]
  };

  allFileOptions: OptionsMenuConfig = {
    options: [
      {id: '1', label: 'Edit'}, ...this.fileOptions.options
    ]
  };

  cols = [
    {field: 'name', header: 'Name'},
    {field: 'description', header: 'Description'},
    {field: 'lastPreviewDate', header: 'Last preview on'},
    {field: 'status', header: 'Status'}
  ];
  searchTerm: string;
  dialogRef: MatDialogRef<NewDatasetWizardComponent, any>;
  noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');
  readyImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/states/Ready.svg');
  notReadyImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/states/Not ready.svg');
  popupX: string;
  popupY: string;
  maxDeletePopupHeight = '162px';
  showDeleteConfirm = false;
  datasetOnAction: DatasetListItem = null;
  statusMap: { [key: string]: any } = {};
  showSide = false;
  messageLength: number;

  // availableColumns = [];
  currentDSId;

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    // stop status polling when destroy the dataset component
    this.stopPollingStatus();
  }

  refresh = () => {
    this.listDataset();
  }

  newDatasetDialog = (): void => {
    this.openWizard();
  }

  listDataset = () => {
    this.loading = true;
    this.catalogService.getAllDatasets().subscribe(
    // )
    // this.datasetService.getDatasets().subscribe(
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
    for (const datasetId in this.statusMap) {
      if (this.statusMap[datasetId]) {
        this.statusMap[datasetId].stop = true;
      }
    }
    this.statusMap = {};
  }

  private startPollingStatus() {
    this.stopPollingStatus();
    for (let i = 0; i < this.datasets.length; i++) {
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

  handleSearch = ($event): void => {
    this.searchTerm = $event.detail.value;
    this.dt.filterGlobal(this.searchTerm, 'contains');
  }

  getOptions (rowData: Dataset): OptionsMenuConfig  {
    // NOTE: Make sure this function does not return a new object (only send back object created on this class),
    // otherwise the UXPL component goes in an endless loop !!!
    if (!rowData.status) {
      return this.fileOptions
    } else {
      return this.allFileOptions
    }
  }

  optionSelect = ($event, datasetListItem: DatasetListItem): void => {
    const label = $event.detail.label
    if (label === 'Edit') {
      this.openWizard(datasetListItem);
    } else if (label === 'Delete') {
      this.deleteDataset(datasetListItem, $event);
    } else if (label === 'Refresh') {
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
    this.popupY = domRect.y + windowY + 'px';
    this.deletePopup.nativeElement.show = true;
    this.showDeleteConfirm = true;

    this.datasetOnAction = dataset;
  }

  handleDeleteConfirmation($event) {
    // console.log($event);
    const action = $event.action;
    if (action) {
      // console.log('delete confirmed');
      const dataset = this.datasetOnAction;
      if (dataset) {
        const datasetId = dataset.datasetid;
        if (this.statusMap[datasetId]) {
          this.statusMap[datasetId].stop = true;
          this.statusMap[datasetId] = null;
        }
        this.catalogService.deleteDataset(datasetId).subscribe(resp => {
          this.refresh();
        }, error => {
          if (error.status === 409) {
            // the analysis linked with it is archived.
            const mes = {
              type: 'ERROR',
              message: 'The analysis created from \'' + dataset.name + '\' is archived'
            };
            this.messageService.sendMessage('news-banner.topic.message', 'MESSAGE:' + JSON.stringify(mes));
          } else {
            this.refresh();
            const mes = {
              type: 'ERROR',
              message: 'Failed to delete dataset'
            };
            this.messageService.sendMessage('news-banner.topic.message', 'MESSAGE:' + JSON.stringify(mes));
          }
        });
      }
    }
    this.deletePopup.nativeElement.show = false;
    this.showDeleteConfirm = false;
  }

  private openWizard(dataset?: DatasetListItem) {
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
    if (status === 'COMPLETED') {
      return 'Ready';
    } else {
      return 'Not ready';
    }
  }

  private getStateIcon(status: string) {
    if (status === 'COMPLETED') {
      return this.readyImage;
    } else {
      return this.notReadyImage;
    }
  }

  private getStateColor(status: string) {
    if (status === 'COMPLETED') {
      return '#E1F7EB';
    } else {
      return '#F9E1E4';
    }
  }

  private getStateTooltip(status: string, message: string) {
    if (status === 'COMPLETED') {
      return '';
    } else {
      return message || '';
    }
  }

  showFiles() {
    this.router.navigate(['/discover/files']);
  }

  previewButtonClicked(dataset: any) {
    // console.log('ID: ', dataset.datasetid)
    let dsChanged = true;
    if (dataset.datasetid === this.currentDSId) {
      dsChanged = false;
    }
    this.currentDSId = dataset.datasetid;
    this.showSide = !this.showSide || dsChanged;
    if (this.showSide) {
      this.drawer.open();
      this.messageLength = this.MIN_MESSAGE_SIZE;
    } else {
      this.drawer.close();
      this.currentDSId = '';
      this.messageLength = this.MAX_MESSAGE_SIZE;
    }
  }

}
