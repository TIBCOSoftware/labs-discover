import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { CsvService } from 'src/app/service/csv.service';
import { DatasetService } from 'src/app/service/dataset.service';
import { ParsingService } from 'src/app/service/parsing.service';
import { Dataset, DatasetDataSource, DatasetSchema, DatasetWizard } from '../../../models/dataset';
import { NewAnalysisStepStatus } from '../../../models/discover';
@Component({
  selector: 'dataset-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class NewDatasetAttributesComponent implements OnInit {

  valid = false;

  readonly datatypeValue: string[] = ['string', 'int', 'numeric', 'timestamp'];
  datatypeOptions: SelectItem[];
  schema: DatasetSchema[];
  dataSource: DatasetDataSource;

  @Input() data: Dataset;
  @Input() backupDataset: Dataset;
  @Input() previewData: any[];
  @Input() wizard: DatasetWizard;
  @Output() handlePreviewData: EventEmitter<any> = new EventEmitter<any>();
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter();

  constructor(
    protected csvService: CsvService,
    protected parsingService: ParsingService,
    protected datasetService: DatasetService
  ) { }

  ngOnInit(): void {
    this.schema = this.data.schema;
    this.datatypeOptions = this.datatypeValue.map(v => {
      return {
        label: v.charAt(0).toUpperCase() + v.substr(1),
        value: v
      } as SelectItem;
    });

    if (this.previewData) {
      if (!this.data.createdDate || this.wizard.dataSourceChanged) {
        this.predictSchemaType();
      }
    } else {
      this.datasetService.pullPreviewData(this.data).subscribe(data => {
        if(data.columns) {
          this.handlePreviewData.emit(data);
          this.predictSchemaType();
        }
        this.updateStatus();
      });
    }

    this.updateStatus();
  }

  private predictSchemaType() {
    const firstRow = this.previewData[0];
    if (firstRow) {
      this.schema.forEach((schema) => {
        const value = firstRow[schema.key];
        if (value != null) {
          let type;
          if (/^\s*[\d]*\.{0,1}\d*\s*$/.test(value)) {
            // could be numeric or integer
            const f = parseFloat(value);
            if (!isNaN(f)) {
              if (f.toString().indexOf('.') !== -1) {
                type = 'numeric';
              } else {
                type = 'int';
              }
            }
          }
          if (!type) {
            // new Date('Case 1') will get a valid date, so now only the predefined dates format to guess date
            if (this.parsingService.validateDateAgainstDateFormats(value)) {
              type = 'timestamp';
            } else {
              type = 'string';
            }
          }
          if (type) {
            schema.type = type;
          }
        }
      });
    }
  }

  public onSelectDatatype(event: any, column: DatasetSchema) {
    if (event) {
      column.type = event.detail.value;
      this.updateStatus();
    }
  }

  public onSelectImportance(event: string, column: DatasetSchema) {
    if (event) {
      column.importance = event;
    }
  }

  private updateStatus = (): void => {
    this.valid = this.validateDatatype();
    const stepStatus = {
      step: 'dataset-attributes',
      completed: this.valid
    } as NewAnalysisStepStatus;

    this.status.emit(stepStatus);
  }

  private validateDatatype(): boolean {
    let findDatetime = false;
    const datetimeTypes = 'timestamp';
    for (const {type: datatype} of this.schema) {
      if (datatype) {
        if (datetimeTypes === datatype) {
          findDatetime = true;
        }
      } else {
        return false;
      }
    }
    return findDatetime;
  }

  getPosition(location: number) {
    if(location > 5){
      return 'above';
    } else {
      return 'below';
    }
  }

}
