import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges} from '@angular/core';
import {NewAnalysisStepStatus} from '../../../models_ui/discover';
import {Mapping} from 'src/app/backend/model/mapping';
import {calculateColumns} from '../../../functions/analysis';
import {ColumnUI, PreviewUI} from '../../../models_ui/analysis';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss', '../../process-analysis-table/process-analysis-table.component.scss']
})
export class MapComponent implements OnInit, OnChanges {

  constructor() {}

  @Input() mapping: Mapping;
  @Input() selectedDataset: string;
  @Input() advancedMode: boolean;
  @Input() doAutoMap: boolean;
  @Input() hideAdvanced: boolean;
  @Input() preview: PreviewUI;

  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();
  @Output() advance: EventEmitter<boolean> = new EventEmitter();

  previewColumns: ColumnUI[];

  previewOptions = [
    {label: 'Full data', value: 'full-data'},
    {label: 'Mapped data', value: 'mapped-data'}
  ];
  previewValue: string = this.previewOptions[0].value;
  hasAutoMapped: boolean;
  styleContext = this;
  mappedColumns = []

  ngOnInit(): void {
    this.hasAutoMapped = Object.keys(this.mapping).length === 0 ? true : false;
  }

  public clearMap = (): void => {
    Object.keys(this.mapping).forEach(v => delete this.mapping[v]);
    this.mapping = {} as unknown as Mapping;
    this.previewColumns = calculateColumns(this.previewValue === 'full-data' ? this.preview?.availableColumns : this.filterMappedColumns());
    // this.updateStatus()
  }

  public updateStatus = (event): void => {
    if (event) {
      this.hasAutoMapped = event.isAutoMapped;
    }
    this.setMappedColumns();
    this.previewColumns = calculateColumns(this.previewValue === 'full-data' ? this.preview?.availableColumns : this.filterMappedColumns());
    // FIX for "Expression has changed after it was checked" (https://blog.angular-university.io/angular-debugging/)
    // Only send status update in the next JavaScript Cycle
    window.setTimeout(() => {
      this.status.emit(event);
    })
  }

  public toggleAdvanced = (event): void => {
    if (this.advancedMode !== event.detail.checked) {
      this.advance.emit();
    }
  }

  public handlePreviewColumns = (event): void => {
    this.previewValue = event.detail.value;
    this.previewColumns = calculateColumns(this.previewValue === 'full-data' ? this.preview?.availableColumns : this.filterMappedColumns());
  }

  private setMappedColumns() {
    this.mappedColumns = [];
    Object.keys(this.mapping).forEach((element) => {
      if (typeof (this.mapping[element]) === 'string') {
        this.mappedColumns.push(this.mapping[element]);
      }
    });
  }

  private filterMappedColumns = (): string[] => {
    // const mappedColumns = []
    const columnsForTable = this.preview?.availableColumns.filter(el => {
      return this.mappedColumns.indexOf(el) >= 0;
    });
    return columnsForTable;
  }

  public setTableStyle(rowData, col, context) {
    // console.log('Setting style: Row Data: ' , rowData, ' Column: ', col)
    let re = {};
    if (context.mappedColumns && context.mappedColumns.length > 0) {
      if (context.mappedColumns.indexOf(col.headerName) > -1) {
        re = {'background-color': '#f3f4fb'}
      }
    }
    return re;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.preview) {
      this.previewColumns = [...this.preview.columns]
    }
  }
}
