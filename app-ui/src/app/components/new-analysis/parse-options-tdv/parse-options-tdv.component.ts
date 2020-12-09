import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NewAnalysisDatasourceTDV, NewAnalysisParse } from 'src/app/models/discover';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { TDVService } from 'src/app/service/tdv.service';

@Component({
  selector: 'parse-options-tdv',
  templateUrl: './parse-options-tdv.component.html',
  styleUrls: ['./parse-options-tdv.component.css']
})
export class ParseOptionsTdvComponent implements OnInit {

  @Input() data: NewAnalysisParse;
  @Input() datasource: NewAnalysisDatasourceTDV;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();

  public encodingOptions;

  constructor(
    protected configService: ConfigurationService,
    protected dvService: TDVService
  ) { }

  ngOnInit(): void {
    this.encodingOptions = [
      {label: 'UTF-8', value: 'UTF-8'},
      {label: 'UTF-16', value: 'UTF-16'}
    ];
  }

  public handleEncodingSelection = ($event): void => {
    this.data.encoding = $event.detail.value;
  }

  public clickedRefresh = (): void => {
    this.dvService.refreshPreview(
      this.configService.config.discover.tdv.bdsServer, this.configService.config.discover.tdv.bdsPort.toString(),
      this.configService.config.discover.tdv.username, this.configService.config.discover.tdv.password, this.datasource.tdvTable.id, this.datasource.tdvTable.parentPath + '/' + this.datasource.tdvTable.name, this.data.numberRowsForPreview
    ).subscribe(
      element => {
        this.handlePreviewData.emit(element);
      }
    );
  }

  handleUpdate = (event, fieldName) => {
    this.data[fieldName] = event.detail.value;;
  }
}
