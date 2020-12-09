import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DataVirtualizationSite, DataVirtualizationDatabase, DataVirtualizationTable } from 'src/app/models/tdv';
import { ConfigurationService } from '../../../service/configuration.service';
import { TDVService } from '../../../service/tdv.service';
import { NewAnalysisDatasourceTDV, NewAnalysisParse, NewAnalysisStepStatus } from 'src/app/models/discover';

@Component({
  selector: 'datasource-tdv',
  templateUrl: './datasource-tdv.component.html',
  styleUrls: ['./datasource-tdv.component.css']
})
export class DatasourceTdvComponent implements OnInit {

  @Input() data: NewAnalysisDatasourceTDV;
  @Input() parse: NewAnalysisParse;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleStatus: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Output() handleError: EventEmitter<any> = new EventEmitter<any>();

  public optionSites;
  public selectedSite: DataVirtualizationSite;

  public optionDatabases;
  public selectedDatabase: DataVirtualizationDatabase;

  public optionTables;
  public selectedTable: DataVirtualizationTable;

  constructor(
    protected configService: ConfigurationService,
    protected dvService: TDVService
  ) { }

  ngOnInit (): void {
    this.handlePreviewData.emit(undefined);
    this.getSites();
    this.updateStatus();
  }

  private getSites = (): void => {
    this.dvService.getSites(
      this.configService.config.discover.tdv.bdsServer, this.configService.config.discover.tdv.bdsPort.toString(),
      this.configService.config.discover.tdv.username, this.configService.config.discover.tdv.password).subscribe(
        sites => {
          this.optionSites = sites.map(site => { return {label: site.name, value: site }});
          if (this.data.site != '') {
            this.selectedSite = sites.filter(site => site.host === this.data.site)[0];
            this.data.domain = this.selectedSite.domain;
            this.getDatabases(this.selectedSite);
          }
        },
        error => {
          this.sendTDVErrorMessage(error);
        }
      )
  }

  private getDatabases = (site: DataVirtualizationSite) : void => {
    this.dvService.getDatabases(
      this.configService.config.discover.tdv.bdsServer, this.configService.config.discover.tdv.bdsPort.toString(),
      this.configService.config.discover.tdv.username, this.configService.config.discover.tdv.password, site.name
    ).subscribe(
      databases => {
        this.optionDatabases = databases.map(database => { return {label: database.name, value: database }});
        if (this.data.database != '') {
          this.selectedDatabase = databases.filter(database => database.name === this.data.database)[0];
          this.getTables(this.selectedDatabase);
        }
      },
      error => {
        this.sendTDVErrorMessage(error);
      }
    )
  }

  private getTables = (database: DataVirtualizationDatabase): void => {
    this.dvService.getTables(
      this.configService.config.discover.tdv.bdsServer, this.configService.config.discover.tdv.bdsPort.toString(),
      this.configService.config.discover.tdv.username, this.configService.config.discover.tdv.password, database.id)
      .subscribe(tables => {
        this.optionTables = tables.map(table => { return {label: table.name, value: table }});
        if (this.data.table != '') {
          this.selectedTable = tables.filter(table => table.name === this.data.table)[0];
          this.data.tdvTable = this.selectedTable;
          this.refreshPreview();
        }
      },
      error => {
        this.sendTDVErrorMessage(error);
      }
    )
  }

  private refreshPreview = (): void => {
    this.dvService.refreshPreview(
      this.configService.config.discover.tdv.bdsServer, this.configService.config.discover.tdv.bdsPort.toString(),
      this.configService.config.discover.tdv.username, this.configService.config.discover.tdv.password, this.selectedTable.id, this.selectedTable.parentPath + '/' + this.selectedTable.name, 15
    ).subscribe(
      element => {
        this.handlePreviewData.emit(element);
      },
      error => {
        this.sendTDVErrorMessage(error);
      }
    );
  }

  private sendTDVErrorMessage = (error): void => {
    this.handleError.emit({ message: 'Data Virtualization server is not online. Please, contact your TIBCO DV Administrator', description: error.message })
  }

  private updateStatus = (): void => {
    const status = this.data.site !== undefined && this.data.database !== undefined && this.data.table !== undefined;
    const stepStatus = {
      step: 'datasource',
      completed: status
    } as NewAnalysisStepStatus;

    this.handleStatus.emit(stepStatus);
  }

  public handleSelection($event, option) {
    const value = $event.detail.value;
    switch (option) {
      case 'site':
        this.selectedSite = value;
        this.data.site = this.selectedSite.host;
        this.data.domain = this.selectedSite.domain;
        this.selectedDatabase = undefined;
        this.selectedTable = undefined;
        this.getDatabases(this.selectedSite);
        this.handlePreviewData.emit(undefined);
        break;
      case 'database':
        this.selectedDatabase = value;
        this.data.database = this.selectedDatabase.name;
        this.selectedTable = undefined;
        this.getTables(this.selectedDatabase);
         
        break;
      case 'table':
        this.selectedTable = value
        this.data.table = this.selectedTable.name;
        this.data.tdvTable = value;
        this.refreshPreview();
        break;
      default:
        break;
    }
    this.updateStatus();
  }
}
