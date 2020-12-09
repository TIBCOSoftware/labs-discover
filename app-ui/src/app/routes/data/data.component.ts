import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { Document, TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/service/configuration.service';
import {OptionsMenuConfig} from '@tibco-tcstk/tc-web-components/dist/types/models/optionsMenuConfig';
import {FileUploadService} from "../../service/file-upload.service";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css', '../../components/process-analysis-table/process-analysis-table.component.scss']
})

export class DataComponent implements OnInit {
  @ViewChild('file', { static: false }) fileInput: any;

  protected _destroyed$ = new Subject();
  public documents: any[];
  public selectedDocument: Document;
  public loading: boolean;
  public fileOptions: OptionsMenuConfig =  { options: [
    { id: '1', label: 'Download'},
    { id: '2', label: 'Delete'}
  ]};
  @ViewChild('dt', {static: true}) dt;
  public searchTerm: string;

  constructor(
    protected configService: ConfigurationService,
    protected documentsService: TcDocumentService,
    protected datePipe: DatePipe,
    protected fileUploadService: FileUploadService) { }

  ngOnInit(): void {
    this.refresh();
  }

  public refresh = () => {
    this.listDocuments();
  }

  public listDocuments = () => {
    this.loading = true;
    this.documentsService.listDocuments('orgFolders', this.configService.config.discover.csv.folder, this.configService.config.sandboxId, '')
    .pipe(
      take(1),
      takeUntil(this._destroyed$)
    )
    .subscribe(documentslist => {
      this.documents = documentslist.documents.map(doc => {
        const value = {
          name: doc.name,
          fileSize: doc.fileSize,
          authorDetails: doc.authorDetails ? doc.authorDetails.firstName + ' ' + doc.authorDetails.lastName : '',
          creationDate: this.datePipe.transform(doc.creationDate , 'fullDate')
        }
        return value;
      });
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  public handleUpload = (files: File[]): void => {
    if (files.length > 0) {
      const file = files[0];
      const fileExist = this.documents.filter(element => element.name === file.name).length > 0;
      this.fileUploadService.uploadFile('orgFolders', this.configService.config.discover.csv.folder, file, file.name, 'description', fileExist);
      this.fileInput.nativeElement.value = '';
    }
  }

  public optionSelect = (event, doc): void => {
    const action = event.detail.label;
    switch (action) {
      case 'Download':
        this.documentsService.downloadDocument('orgFolders', this.configService.config.discover.csv.folder, doc.name, '', this.configService.config.sandboxId).subscribe(
          data => {
            const downloadURL = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = downloadURL;
            link.download = doc.name;
            link.click();
          },
          error => {
            console.error('Error downloading document: ', error);
          }
        );

        break;
      case 'Delete':
        this.documentsService.deleteDocument('orgFolders', this.configService.config.discover.csv.folder, doc.name, this.configService.config.sandboxId).subscribe(
          _ => {
            this.refresh();
          }
        )
        break;
      default:
        break;
    }
  }

  public handleSearch = ($event): void => {
    this.searchTerm = $event.detail.value;
    this.dt.filterGlobal(this.searchTerm, 'contains');
  }
}
