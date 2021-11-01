import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Dataset} from '../../backend/model/dataset';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {notifyUser} from '../../functions/message';
import {CsvUploadButtonComponent} from '../../components/new-dataset/csv-upload-button/csv-upload-button.component';
import {FileUploadService} from '../../service/file-upload.service';
import { CatalogService } from 'src/app/backend/api/catalog.service';
import { CsvFile } from 'src/app/backend/model/csvFile';
import {DiscoverFileInfo} from '../../models_ui/dataset';

@Component({
  selector: 'file-manage',
  templateUrl: './file-manage.component.html',
  styleUrls: ['./file-manage.component.css']
})
export class FileManageComponent implements OnInit {

  objHeaderConfig = {
    title: {
      value: 'CSV Files',
      isEdit: false,
      editing: false
    }
  };

  dummyDataset: Dataset;
  files: CsvFile[];
  csvError: any;
  file: File;
  showUpload: boolean;
  displayUploadDialog = false;

  constructor(private catalogService: CatalogService,
              private fileUploadService: FileUploadService,
              private router: Router,
              private msService: MessageTopicService) {
    // console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }

  ngOnInit(): void {
    this.showUpload = true;
    this.dummyDataset = {
      Dataset_Source: {
        DatasourceType: 'File-Delimited',
        Encoding: 'UTF-8',
        FileEscapeChar: '\\',
        FileHeaders: true,
        FileQuoteChar: '"',
        FileSeparator: ','
      },
      Dataset_Description: '',
      Dataset_Id: '',
      Dataset_Name: '',
      type: '',
      csvMethod : 'upload'
    };
    this.refreshFiles()
  }

  goDatasets() {
    this.router.navigate(['/discover/dataset']);
  }

  refreshFiles() {
    this.files = []
    this.catalogService.getUnmanagedCsvFiles().subscribe(list => {
      this.files = list;
    });
  }

  async onUploadFile(fInfo: DiscoverFileInfo) {
    window.setTimeout(() => {
      this.showUpload = false;
      window.setTimeout(() => {
        this.showUpload = true;
      })
    })
    notifyUser('INFO', 'Uploading file: ' + fInfo.file.name + '...', this.msService);
    const result = await this.fileUploadService.uploadFile(fInfo.file, fInfo.dataSource)
    if(result){
      notifyUser('INFO',  result, this.msService);
      // Give the upload a bit of time to reflect
      window.setTimeout(() => this.refreshFiles(), 2000)
    } else {
      notifyUser('ERROR', 'Something went wrong uploading the file...', this.msService);
    }
  }

  downloadCsvFile(filename: string) {
    notifyUser('INFO',  'Preparing download: ' + filename, this.msService);
    this.catalogService.downloadCsvFile(filename).subscribe(data => {
      const blob = new Blob([data], { type: 'text/csv' });
      const url= window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

}
