import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
<<<<<<< HEAD
import {NewAnalysisStepStatus} from '../../../models/discover';
import {get} from 'lodash';
import {DatasetService} from 'src/app/service/dataset.service';
import {forkJoin} from 'rxjs';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {DiscoverBackendService} from 'src/app/service/discover-backend.service';
import {Mapping} from 'src/app/model/mapping';
=======
import {NewAnalysisDatasource, NewAnalysisParse, NewAnalysisMapping, NewAnalysisStepStatus} from '../../../models/discover';
import {get} from 'lodash';
import {ParsingService} from '../../../service/parsing.service';
import {StringSimilarityService} from '../../../service/string-similarity.service';
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css', '../../process-analysis-table/process-analysis-table.component.scss']
})
export class MapComponent implements OnInit {

<<<<<<< HEAD
  @Input() data: Mapping;
  @Input() selectedDataset: string;
  @Input() advancedMode: boolean
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Output() advance: EventEmitter<boolean> = new EventEmitter();
=======
  @Input() datasource: NewAnalysisDatasource;
  @Input() parse: NewAnalysisParse;
  @Input() data: NewAnalysisMapping;
  @Input() columns: string[];
  @Input() previewColumns: any[];
  @Input() previewData: any[];
  @Input() firstRowAdded;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Output() hasAutoMapped: EventEmitter<Boolean> = new EventEmitter();
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771

  public previewColumns: string[];
  public previewData: any;
  public availableColumns: string[];
  public previewOptions = [
    {label: 'Full data', value: 'full-data'},
    {label: 'Mapped data', value: 'mapped-data'}
  ];
  public previewValue: string = this.previewOptions[0].value;
  public firstVisit: boolean;

<<<<<<< HEAD
  constructor(
    protected tcmdService: DatasetService,
    protected configService: ConfigurationService,
    protected backendService: DiscoverBackendService
  ) {
  }

  ngOnInit(): void {
    this.firstVisit = Object.keys(this.data).length === 0 ? true : false;
    const columns$ = this.backendService.getColumnsFromSpark(this.selectedDataset, this.configService.config.claims.globalSubcriptionId);
    const preview$ = this.backendService.getPreviewFromSpark(this.selectedDataset, this.configService.config.claims.globalSubcriptionId);

    forkJoin([columns$, preview$]).subscribe(results => {
      this.availableColumns = results[0].map(column => column.COLUMN_NAME);
      this.previewColumns = this.calculateColumns(this.availableColumns);
      this.previewData = JSON.parse(results[1]);
    });
  }

  public clearMap = (): void => {
    Object.keys(this.data).forEach(v => delete this.data[v]);
    this.previewColumns = this.calculateColumns(this.previewValue === 'full-data' ? this.availableColumns : this.filterMappedColumns());
  }

  private calculateColumns = (columns: string[]): any[] => {
    return columns.map(column => {
      const newColumn = {
        headerName: column,
        field: column,
        sortable: false,
        filter: false,
        resizable: false
      };
      return newColumn;
    })
=======

  constructor(protected parsingService: ParsingService, protected ssService: StringSimilarityService) {
  }

  ngOnInit(): void {
    this.updateStatus();
    this.availableColumns = this.columns.map(element => {
      return {label: element, value: element};
    });
  }

  public handleSelection = ($event, field): void => {
      if (field === 'other') {
        this.data[field] = $event.detail?.map(element => element.value);
      } else {
        this.data[field] = $event.detail?.value;
      }
      this.updateStatus();
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
  }

  public updateStatus = (event): void => {
    this.status.emit(event);
    this.previewColumns = this.calculateColumns(this.previewValue === 'full-data' ? this.availableColumns : this.filterMappedColumns());
  }

  public getObjectValue = (rowdata, column): string => {
    return get(rowdata, column.field);
  }

<<<<<<< HEAD
  public toggleAdvanced = (event): void => {
    if (this.advancedMode !== event.detail.checked) {
      this.advance.emit();
    }
  }

  public isDisabledChangeVisualization = (): boolean => {
    return false;
  }

  public handlePreviewColumns = (event): void => {
    this.previewValue = event.detail.value;
    this.previewColumns = this.calculateColumns(this.previewValue === 'full-data' ? this.availableColumns : this.filterMappedColumns());
  }

  private filterMappedColumns = (): string[] => {
    const mappedColumns = []
    Object.keys(this.data).forEach((element) => {
      if (typeof (this.data[element]) === 'string') {
        mappedColumns.push(this.data[element]);
      }
    });
    const columnsForTable = this.availableColumns.filter(el => {
      return mappedColumns.indexOf(el) >= 0;
    });
    return columnsForTable;
=======
  public handleUpdate = (event, fieldName) => {
    this.parse[fieldName] = event.detail.value;
  }

  public calculateOption = (field: string): any[] => {
    const values = Object.values(this.data);
    const options = this.availableColumns.filter(column => {
      return !values.includes(column.value) || this.data[field]?.includes(column.value);
    });
    options.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
    return options;
>>>>>>> 6258e5103bef12a5116d59672d50ed2824e6f771
  }


  public autoMap() {
    const pHeaders = [];
    for (const col of this.availableColumns) {
      pHeaders.push(col.value);
    }
    const autoMapResult = this.ssService.autoMap(pHeaders);
    const columsToMatch = ['caseId', 'resource', 'activity', 'start', 'end'];
    for (const colM of columsToMatch) {
      if (autoMapResult[colM + 'Column'] !== 'none') {
        window.setTimeout(() => {
          this.data[colM] = autoMapResult[colM + 'Column'];
        })
      }
    }

    // Display results on first row
    const fistRow = {};
    for (const col of this.availableColumns) {
      fistRow[col.value] = '';
      for (const colM of columsToMatch) {
        if (autoMapResult[colM + 'Column'] === col.value) {
          let showType = colM.toUpperCase();
          if (colM === 'caseId') {
            showType = 'CASE ID';
          }
          fistRow[col.value] = showType + ' (' + autoMapResult[colM + 'Rating'].toFixed(2) * 100 + '%)';
        }
      }
    }
    if (!this.firstRowAdded) {
      this.previewData.unshift(fistRow);
    } else {
      this.previewData[0] = fistRow;
    }

    // Find Other Fields (select all not selected)
    // map others based on config
    if (autoMapResult.otherFields?.length > 0) {
      window.setTimeout(() => {
        this.data.other = [...autoMapResult.otherFields];
      });
    }
    this.hasAutoMapped.emit(true);
    this.updateStatus();
  }


}
