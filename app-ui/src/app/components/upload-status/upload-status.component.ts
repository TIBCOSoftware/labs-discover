import { Component, OnInit } from '@angular/core';
import {FileUploadService} from '../../service/file-upload.service';
import {Upload} from '../../models_ui/fileUpload';
import {BytesPipe} from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'upload-status',
  templateUrl: './upload-status.component.html',
  styleUrls: ['./upload-status.component.css']
})
export class UploadStatusComponent implements OnInit {

  constructor(protected fileUploadService: FileUploadService, protected bytesPipe: BytesPipe) { }

  ngOnInit(): void {
  }

  get uploads(): Upload[] {
    if (this.fileUploadService && this.fileUploadService.uploads) {
      return this.fileUploadService.uploads;
    } else {
      return [];
    }
  }

  public handleClose() {
    this.fileUploadService.clearUploads();
  }

  get uploadMessage(): string {
    const uploads = this.uploads.filter(upl => {
      return (upl.status === 'uploading' || upl.status === 'finalizing');
    });
    const failed = this.uploads.filter(upl => {
      return upl.status === 'failed';
    })
    if (uploads.length >= 1) {
      if (uploads.length === 1) {
        // return 'Uploading ' + uploads[0].name;
        return 'Uploading ' + this.bytesPipe.transform(uploads[0].uploaded) + ' of ' + this.bytesPipe.transform(uploads[0].fileSize);
      } else if (uploads.length > 1) {
        return 'Uploading ' + uploads.length + ' files...';
      }
    } else {
      return 'No uploads pending';
    }
  }
}
