import { Location } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Dataset, RedisFileInfo } from '../../../models/dataset';

@Component({
  selector: 'csv-list',
  templateUrl: './csv-list.component.html',
  styleUrls: ['./csv-list.component.scss']
})
export class CsvListComponent implements OnInit {

  @Input() files: RedisFileInfo[];
  // @Input() selectedFile: RedisFileInfo;
  @Input() file: File;
  @Input() dataset: Dataset;
  @Output() fileSelected: EventEmitter<any> = new EventEmitter();
  @Output() uploadFile: EventEmitter<File> = new EventEmitter();

  @ViewChild('csvTable', {static: false}) dt;
  public searchTerm: string;
  public isOpen: boolean = false;

  // public csvMethod: string = null;
  public filename: string = null;
  public selectedFile: RedisFileInfo;

  cols = [
    {field: 'OriginalFilename', header: 'Name'},
    {field: 'FileSize', header: 'Size'},
    {field: 'LastModified', header: 'Modified on'}
  ];

  constructor(
    protected location: Location
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

  public selectFile(file: RedisFileInfo) {
    this.fileSelected.emit(file);
    this.selectedFile = file;
    this.dataset.csvMethod = 'file';
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