import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewAnalysisParse, NewAnalysisDatasource, NewAnalysisStepStatus } from '../../../models/discover';

@Component({
  selector: 'parse',
  templateUrl: './parse.component.html',
  styleUrls: ['./parse.component.css']
})
export class ParseComponent implements OnInit {
  @Input() data: NewAnalysisParse;
  @Input() datasource: NewAnalysisDatasource;
  @Input() previewColumns: any[];
  @Input() previewData: any[];
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();



  constructor() { }

  ngOnInit(): void {
    this.updateStatus();
  }

  public refreshCSVPreview = (event): void => {
    this.handlePreviewData.emit(event);
  }

  public refreshTDVPreview = (): void => {
  }

  private updateStatus = (): void => {
    const status = true;
    const stepStatus = {
      step: 'parse',
      completed: status
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }
}
