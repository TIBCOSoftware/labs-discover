import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DatasetService} from '../../service/dataset.service';
import {CsvFile, Dataset} from '../../models_ui/dataset';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {notifyUser} from '../../functions/message';
import {CsvUploadButtonComponent} from '../../components/new-dataset/csv-upload-button/csv-upload-button.component';
import {FileUploadService} from '../../service/file-upload.service';

@Component({
  selector: 'file-manage',
  templateUrl: './file-manage.component.html',
  styleUrls: ['./file-manage.component.css']
})
export class FileManageComponent implements OnInit {

  @ViewChild('csvUpload', {static: false}) csvUpload : CsvUploadButtonComponent;

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

  constructor(private datasetService: DatasetService,
              private fileUploadService: FileUploadService,
              private router: Router,
              private msService: MessageTopicService) {
  }

  ngOnInit(): void {
    this.showUpload = true;
    this.dummyDataset = new Dataset().deserialize({
      Dataset_Source: {
        DatasourceType: 'File-Delimited',
        Encoding: 'UTF-8',
        FileEscapeChar: '\\',
        FileHeaders: 'true',
        FileQuoteChar: '"',
        FileSeparator: ','
      },
      Dataset_Description: '',
      Dataset_Id: '',
      Dataset_Name: '',
      type: '',
      csvMethod : 'upload'
    })
    this.refreshFiles()
  }

  goDatasets() {
    this.router.navigate(['/discover/dataset']);
  }

  refreshFiles() {
    this.files = []
    this.datasetService.getCsvFiles().subscribe(list => {
      this.files = list.map(file => {
        file.fileSize = parseInt(file.redisFileInfo.FileSize);
        return file;
      });
    });
  }

  async onUploadFile(fileUpload: File) {
    this.csvUpload.clickOutside();
    window.setTimeout(() => {
      this.showUpload = false;
      window.setTimeout(() => {
        this.showUpload = true;
      })
    })
    notifyUser('INFO', 'Uploading file: ' + fileUpload.name + '...', this.msService);

    const result = await this.fileUploadService.uploadFile('','', fileUpload, fileUpload.name, '', false)
    if(result){
      notifyUser('INFO',  result, this.msService);
      this.csvUpload.clickOutside();
      this.refreshFiles();
    } else {
      notifyUser('ERROR', 'Something went wrong uploading the file...', this.msService);
    }

    /*
    this.datasetService.uploadFile(this.dummyDataset, {}, fileUpload).subscribe( (response:any) => {
      const uploadResponse = response?.uploadFileResponse as UploadFileResponse;
      if(uploadResponse && uploadResponse.message && uploadResponse.code + '' === '0'){
        notifyUser('INFO', 'Upload Result: ' + uploadResponse.message, this.msService);
        this.csvUpload.clickOutside();
        this.refreshFiles();
      } else {
        notifyUser('ERROR', 'Something went wrong uploading the file...', this.msService);
      }
    })*/
  }

}
