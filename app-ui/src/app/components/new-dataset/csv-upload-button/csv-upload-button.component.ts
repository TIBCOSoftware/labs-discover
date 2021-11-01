import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Dataset } from '../../../backend/model/dataset';

@Component({
  selector: 'csv-upload-button',
  templateUrl: './csv-upload-button.component.html',
  styleUrls: ['./csv-upload-button.component.scss']
})
export class CsvUploadButtonComponent {

  @Input() dataset: Dataset;
  @Input() file: File;
  @Input() csvError: string;
  @Input() filename: string;

  @Output() uploadFile: EventEmitter<File> = new EventEmitter();

  isOpen = false;

  constructor() {
  }

  toggleUpload() {
    this.isOpen = !this.isOpen;
  }

  onUploadFile(file: File) {
    this.filename = file.name;
    this.dataset.csvMethod = 'upload';
    this.uploadFile.emit(file);
  }

  clickOutside() {
    setTimeout(() => {
      this.isOpen = false;
    }, 0);
  }

}
