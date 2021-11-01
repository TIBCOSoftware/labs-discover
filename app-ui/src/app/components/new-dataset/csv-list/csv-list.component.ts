import {Location} from '@angular/common';
import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import {CatalogService} from 'src/app/backend/api/catalog.service';
import {CsvFile} from 'src/app/backend/model/csvFile';
import {Dataset} from 'src/app/backend/model/dataset';
import {DatasetListItem} from 'src/app/backend/model/datasetListItem';
import {RedisFileInfo} from 'src/app/backend/model/redisFileInfo';
import {DatasetService} from 'src/app/service/dataset.service';

export type CsvFile_UI = CsvFile & { fileSizeNumber?: number }

@Component({
  selector: 'csv-list',
  templateUrl: './csv-list.component.html',
  styleUrls: ['./csv-list.component.scss']
})
export class CsvListComponent implements OnInit, OnChanges {

  constructor(
    protected location: Location,
    protected datasetService: DatasetService,
    protected catalogService: CatalogService
  ) {
  }

  @Input() files: CsvFile[];
  @Input() file: File;
  @Input() dataset: Dataset;
  @Input() csvError: string;
  @Input() isStandAlone: boolean;
  @Output() fileSelected: EventEmitter<any> = new EventEmitter();
  @Output() fileDownload: EventEmitter<string> = new EventEmitter();
  @Output() uploadFile: EventEmitter<File> = new EventEmitter();
  @Output() updateFiles: EventEmitter<any> = new EventEmitter();

  @ViewChild('csvtable', {static: false}) csvtable;
  @ViewChild('deletePopup', {static: true}) deletePopup: ElementRef<UxplPopup>;

  searchTerm: string;
  filename: string = null;
  selectedFile: RedisFileInfo;
  popupY: number;
  showDeleteConfirm = false;
  fileOnAction: CsvFile;
  allDatasets: DatasetListItem[]
  myFiles: CsvFile_UI[]

  cols = [
    {sortField: 'redisFileInfo.OriginalFilename', field: 'redisFileInfo.OriginalFilename', header: 'Name'},
    {sortField: 'fileSizeNumber', field: 'fileSizeNumber', header: 'Size'},
    {sortField: 'redisFileInfo.LastModified', field: 'redisFileInfo.LastModified', header: 'Modified on'}
  ];
  scrollHeight = 'calc(90vh - 450px)';

  private dsFileTuple = {}

  ngOnInit(): void {
    if (!this.isStandAlone) {
      this.isStandAlone = false
    }
    if (this.isStandAlone) {
      this.scrollHeight = 'calc(100vh - 280px)'
    }

    if (this.dataset.csvMethod === 'upload') {
      this.filename = this.dataset?.Dataset_Source?.FileName;
    } else if (this.dataset.csvMethod === 'file') {
      this.selectedFile = this.dataset.CsvFile;
    }

    this.catalogService.getAllDatasets().subscribe(datasets => {
      this.allDatasets = datasets;
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.files && this.files.length > 0){
      this.myFiles = []
      for(const file of this.files) {
        this.myFiles.push(file)
        const id = this.myFiles.length - 1
        if(this.myFiles[id].redisFileInfo?.FileSize) {
          try {
            this.myFiles[id].fileSizeNumber = Number(this.myFiles[id].redisFileInfo?.FileSize)
          } catch (e) {} // Do nothing
        }
      }
    }
  }

  handleSearch = ($event): void => {
    this.searchTerm = $event.detail.value;
    this.csvtable.filterGlobal(this.searchTerm, 'contains');
  }

  selectFile(file: CsvFile) {
    this.fileSelected.emit(file.redisFileInfo);
    this.selectedFile = file.redisFileInfo;
    this.dataset.csvMethod = 'file';
    if(file?.redisFileInfo?.OriginalFilename) {
      this.dataset.Dataset_Source.FileName = file.redisFileInfo.OriginalFilename;
    }
  }

  deleteFile(file: CsvFile, event) {
    const target = event.target;
    const button = target.parentNode;
    const domRect = button.getBoundingClientRect();
    if(this.isStandAlone){
      this.popupY = domRect.y + 35;
    } else {
      this.popupY = domRect.y;
    }

    this.deletePopup.nativeElement.show = true;
    this.showDeleteConfirm = true;

    this.fileOnAction = file;
  }

  handleDeleteConfirmation($event) {
    const action = $event.action;
    if (action) {
      const file = this.fileOnAction;
      if (file) {
        this.catalogService.catalogFilesFilenameDelete(file.redisFileInfo.OriginalFilename).subscribe(resp => {
          this.updateFiles.emit();
        }, error => {
        });
      }
    }
    this.deletePopup.nativeElement.show = false;
    this.showDeleteConfirm = false;
  }

  getToolTip(file: CsvFile) {
    if (this.isStandAlone && file.beingUsed && file.redisFileInfo && file.redisFileInfo.FileLocation) {
      return this.getDatasetsForFile(file.redisFileInfo.FileLocation)
    }
    return ''
  }

  private getDatasetsForFile (fileLocation: string) {
    if(this.dsFileTuple[fileLocation]){
      return this.dsFileTuple[fileLocation]
    }
    if(this.allDatasets && this.allDatasets.length > 0){
      this.dsFileTuple[fileLocation] = ''
      let usedInDs = 0;
      for(const dsTemp of this.allDatasets){
        // @ts-ignore
        if(dsTemp.filePath === fileLocation) {
          this.dsFileTuple[fileLocation] += ' ' + dsTemp.name + ','
          usedInDs++
        }
      }
      if(this.dsFileTuple[fileLocation].length > 0) {
        let pre = 'Used by dataset: ';
        if(usedInDs > 1) {
          pre = 'Used by datasets: ';
        }
        this.dsFileTuple[fileLocation] = pre  + this.dsFileTuple[fileLocation].substring(0, this.dsFileTuple[fileLocation].length - 1)
        return this.dsFileTuple[fileLocation]
      } else {
        return ''
      }
    }
  }

  getPopUpLeft() {
    if(this.isStandAlone){
      return 'calc(100vw - 340px)'
    }
    return 'calc(80vw - 400px)'
  }

  fileClicked(fileInfo: RedisFileInfo) {
    // Use the part after the '/' in the file location
    // TODO: use this part directly from the backend
    const fileNameToUse =  /[^/]*$/.exec(fileInfo.FileLocation)[0];
    this.fileDownload.emit(fileNameToUse)
  }
}
