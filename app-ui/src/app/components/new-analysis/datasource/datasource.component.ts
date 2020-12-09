import { Location } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { NewAnalysisDatasource, NewAnalysisParse, NewAnalysisStepStatus } from '../../../models/discover';
import { ConfigurationService } from '../../../service/configuration.service';

@Component({
  selector: 'datasource',
  templateUrl: './datasource.component.html',
  styleUrls: ['./datasource.component.css']
})
export class DatasourceComponent implements OnInit {

  @Input() data: NewAnalysisDatasource;
  @Input() parse: NewAnalysisParse;
  @Input() previewColumns: any[];
  @Input() previewData: any[];
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  public options;
  public noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');

  public files: any[];

  public isError: boolean;
  public errorMessage: string;
  public errorDescription: string;

  constructor(protected configService: ConfigurationService, protected location: Location) { }

  ngOnInit(): void {
    this.isError = false;
    this.options = [
      { label: 'CSV', value: 'csv'}
    ];

    if (this.configService.config.discover.tdv.enable){
      this.options.push(
        { label: 'TIBCO Data Virtualization', value: 'tdv' }
      );
    }
  }

  public showDatasource = (type: string): boolean => {
    return this.data.inputType === type
  }

  public previewCSVData = (event): void => {
    if (this.parse && this.parse.dateTimeFormat) {
      this.parse.dateTimeFormat = undefined;
    }
    this.handlePreviewData.emit(event);
  }

  public previewTDVData = (event): void => {
    if (this.parse && this.parse.dateTimeFormat) {
      this.parse.dateTimeFormat = undefined;
    }
    this.handlePreviewData.emit(event);
  }

  public updateStatus = ($event): void => {
    this.status.emit($event);
  }

  public handleSelection = ($event): void => {
    this.isError = false;
    this.data.inputType = $event.detail.value
  }

  public handleError = ($event): void => {
    this.isError = true;
    this.errorMessage = $event.message;
    this.errorDescription = $event.description;
  }

  public multipleDataTypes = (): boolean => {
    return this.options.length !== 1;
  }
}
