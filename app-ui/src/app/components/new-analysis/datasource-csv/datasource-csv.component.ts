import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocumentList, TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { NewAnalysisDatasourceFile, NewAnalysisParse, NewAnalysisStepStatus } from 'src/app/models/discover';
import { CsvService } from '../../../service/csv.service';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { map } from 'rxjs/operators';
import { emit } from 'process';

@Component({
  selector: 'datasource-csv',
  templateUrl: './datasource-csv.component.html',
  styleUrls: ['./datasource-csv.component.css']
})
export class DatasourceCsvComponent implements OnInit {

  @Input() data: NewAnalysisDatasourceFile;
  @Input() parse: NewAnalysisParse;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleStatus: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  public documents;

  constructor(
    protected documentService: TcDocumentService, 
    protected csvService: CsvService,
    protected configService: ConfigurationService){
  }
   
  ngOnInit() {
    this.handlePreviewData.emit(undefined);
    this.documentService.listDocuments('orgFolders', this.configService.config.discover.csv.folder, this.configService.config.sandboxId, 'csv').pipe(
      map((documents: DocumentList) => {
        this.documents = documents.documents.map(doc => { return {label: doc.name + ' (' + doc.fileSize + ')', value: doc.name }});
      })
    ).subscribe();
    
    if (this.data.filename) {
      this.refreshPreview();
      this.updateStatus();
    }
  }

  public handleSelection = ($event): void => {
    this.data.filename = $event.detail.value;
    this.data.location = '/webresource/orgFolders/' + this.configService.config.discover.csv.folder + '/' + this.data.filename
    this.refreshPreview();
    this.updateStatus();
  }

  public refreshPreview = (): void => {
    const response = this.csvService.refreshPreview(this.data.location, this.parse.numberRowsForPreview).subscribe(
      element => {
        this.handlePreviewData.emit(element);
      }
    );
  }
  
  private updateStatus = (): void => {
    const status = this.data.filename && this.data.filename !== '';
    const stepStatus = {
      step: 'datasource',
      completed: status
    } as NewAnalysisStepStatus;

    this.handleStatus.emit(stepStatus);
  }

}
