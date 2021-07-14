import { Location } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UxplPopup } from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import { DatasetService } from 'src/app/service/dataset.service';
import { CsvFile, Dataset, RedisFileInfo } from '../../../models_ui/dataset';

@Component({
  selector: 'csv-list',
  templateUrl: './csv-list.component.html',
  styleUrls: ['./csv-list.component.scss']
})
export class CsvListComponent implements OnInit {

  @Input() files: CsvFile[];
  // @Input() selectedFile: RedisFileInfo;
  @Input() file: File;
  @Input() dataset: Dataset;
  @Input() csvError: string;
  @Output() fileSelected: EventEmitter<any> = new EventEmitter();
  @Output() uploadFile: EventEmitter<File> = new EventEmitter();
  @Output() updateFiles: EventEmitter<any> = new EventEmitter();

  @ViewChild('csvTable', {static: false}) dt;
  public searchTerm: string;
  public isOpen = false;

  // public csvMethod: string = null;
  public filename: string = null;
  public selectedFile: RedisFileInfo;

  // public popupX:number;
  public popupY:number;
  public showDeleteConfirm = false;
  @ViewChild('deletePopup', {static: true}) deletePopup: ElementRef<UxplPopup>;
  public fileOnAction: CsvFile;

  cols = [
    {field: 'redisFileInfo.OriginalFilename', header: 'Name'},
    {field: 'redisFileInfo.FileSize', header: 'Size'},
    {field: 'redisFileInfo.LastModified', header: 'Modified on'}
  ];

  constructor(
    protected location: Location,
    protected datasetService: DatasetService
  ) {
  }

  ngOnInit(): void {
    this.selectedFile = this.dataset.CsvFile;
    this.filename = this.dataset.Dataset_Source.FileName;
    if (this.selectedFile) {
      this.dataset.csvMethod = 'file';
    } else {
      this.dataset.csvMethod = 'upload';
    }
  }

  public handleSearch = ($event): void => {
    this.searchTerm = $event.detail.value;
    this.dt.filterGlobal(this.searchTerm, 'contains');
  }

  public selectFile(file: CsvFile) {
    this.fileSelected.emit(file.redisFileInfo);
    this.selectedFile = file.redisFileInfo;
    this.dataset.csvMethod = 'file';
  }

  public deleteFile(file: CsvFile, event) {
    const target = event.target;
    const button = target.parentNode;
    const domRect = button.getBoundingClientRect();

    this.popupY = domRect.y ;
    this.deletePopup.nativeElement.show = true;
    this.showDeleteConfirm = true;

    this.fileOnAction = file;
  }

  public handleDeleteConfirmation($event) {
    const action = $event.action;
    if (action) {
      const file = this.fileOnAction;
      if (file) {
        this.datasetService.deleteCsvFile(file.redisFileInfo.OriginalFilename).subscribe(resp => {
          this.updateFiles.emit();
        }, error => {
        });
      }
    }
    this.deletePopup.nativeElement.show = false;
    this.showDeleteConfirm = false;
  }

  public toggleUpload() {
    this.isOpen = !this.isOpen;
  }

  public clickOutside($event) {
    setTimeout(() => {
      this.isOpen = false;
    }, 0);
  }

  public onUploadFile(file: File) {
    // this.file = file;
    this.filename = file.name;
    this.dataset.csvMethod = 'upload';
    this.uploadFile.emit(file);
  }

}
