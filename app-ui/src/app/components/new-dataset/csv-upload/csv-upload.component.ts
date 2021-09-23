import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'csv-upload',
  templateUrl: './csv-upload.component.html',
  styleUrls: ['./csv-upload.component.scss']
})
export class CsvUploadComponent implements OnInit {

  @Input() filename: string;
  @Input() filetypes: string;
  @Input() filesize: number;
  @Input() size: string;
  @Input() error: string;
  @Output() uploadFile: EventEmitter<any> = new EventEmitter();

  allowedTypes: string[];
  maxFileSize;

  fileover: boolean;
  // error: string | null;

  ngOnInit(): void {
    if (this.filetypes) {
      this.allowedTypes = this.filetypes.split(',').map(t => t.toLowerCase());
    }
    if (this.filesize) {
      this.maxFileSize = this.filesize * 1024 * 1024;
    }
  }

  fileBrowseHandler(files) {
    this.selectFile(files);
  }

  onFileDropped($event) {
    console.log();
  }

  onFileDrop($event: Event) {

    $event.preventDefault();
    $event.stopPropagation();
    this.fileover = false;
    console.log('onFileDrop', $event);
    // @ts-ignore
    this.selectFile($event.dataTransfer.files);
  }

  private selectFile(files) {
    if (files && files.length > 0) {
      const file = files[0];
      // if (this.allowedTypes && this.allowedTypes.indexOf(this.getSubFileType(file.type))) {
      // if (this.allowedTypes && this.allowedTypes.indexOf(file.name)) {
      const fType = file?.name?.substring(file?.name?.lastIndexOf('.') + 1, file?.name?.length);
      let fileOk = false;
      this.allowedTypes.forEach(fileType => {
        if (fType.indexOf(fileType) > -1) {
          fileOk = true;
        }
      })
      if (!fileOk) {
        this.error = 'Please upload a .csv file.';
        return;
      }

      if (this.maxFileSize && file.size >= this.maxFileSize) {
        this.error = `Please upload a file under ${this.filesize}MB.`;
        return;
      }

      this.error = undefined;

      this.filename = files[0].name;
      this.uploadFile.emit(files[0]);
    }
  }

  private getSubFileType(type: string): string {
    let sep = '/';
    if (navigator.appVersion.indexOf('Win') !== -1) sep = '\\';
    const pos = type.indexOf(sep);
    if (pos !== -1) {
      type = type.substr(pos + 1);
    }
    return type.toLowerCase();
  }



  onDragover($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.fileover = true;
  }

  onDragleave($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.fileover = false;
  }
}
