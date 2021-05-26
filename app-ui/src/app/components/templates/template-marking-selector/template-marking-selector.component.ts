import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AnalyticTemplateUI, MConfig} from '../../../models/analyticTemplate';
import {createMConfig, stringifyMConfig} from '../../../functions/templates';

@Component({
  selector: 'template-marking-selector',
  templateUrl: './template-marking-selector.component.html',
  styleUrls: ['./template-marking-selector.component.css']
})
export class TemplateMarkingSelectorComponent implements OnInit, OnChanges {

  @Input() template: AnalyticTemplateUI;
  @Input() type: 'cases' | 'variant';
  @Input() markingOptions: string[];
  @Input() dataOptions: any;

  @Output() updateMConfig: EventEmitter<MConfig> = new EventEmitter<MConfig>();

  public markingDropDownOptions: { label: string, value: string }[];
  public dataTableDropDownOptions: { label: string, value: string }[];
  public columnDropDownOptions: { label: string, value: string }[];

  public showDropDowns = false;

  private mConfig: MConfig;

  constructor() {
  }

  ngOnInit(): void {
    this.updateScreen();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateScreen();
  }

  private updateScreen() {
    this.showDropDowns = false;
    this.mConfig = createMConfig(this.template.marking[this.type + 'Selector']);
    this.setDropDowns();
    this.setColumnDropDown();
    if (this.markingDropDownOptions && this.dataTableDropDownOptions && this.columnDropDownOptions) {
      this.showDropDowns = true;
    }
  }

  updateValue(event, type) {
    if (!this.mConfig) {
      this.mConfig = {
        markingName: '',
        columnName: '',
        dataTable: ''
      }
    }
    // Only update values if they have changed (to prevent ExpressionChangedAfterItHasBeenCheckedError)
    let changed = false;
    if (this.mConfig && event?.detail?.value) {
      if (type === 'marking') {
        if (this.mConfig.markingName !== event.detail.value) {
          this.mConfig.markingName = event.detail.value;
          changed = true;
        }
      }
      if (type === 'dataTable') {
        if (this.mConfig.dataTable !== event.detail.value) {
          this.mConfig.dataTable = event.detail.value;
          changed = true;
          this.setColumnDropDown();
        }
      }
      if (type === 'column') {
        if (this.mConfig.columnName !== event.detail.value) {
          this.mConfig.columnName = event.detail.value;
          changed = true;
        }
      }
      if (changed) {
        this.template.marking[this.type + 'Selector'] = stringifyMConfig(this.mConfig);
        this.updateMConfig.emit(this.mConfig);
      }
    }
  }

  private setDropDowns() {
    if (this.markingOptions?.length > 0) {
      this.markingDropDownOptions = [];
      this.markingOptions.forEach((mar) => {
        this.markingDropDownOptions.push({label: mar, value: mar});
      })
    }
    if (this.dataOptions) {
      this.dataTableDropDownOptions = [];
      for (const dt of Object.keys(this.dataOptions)) {
        this.dataTableDropDownOptions.push({label: dt, value: dt});
      }
    }
  }

  private setColumnDropDown() {
    if (this.mConfig?.dataTable && this.dataOptions) {
      // this.mConfig.columnName = null;
      for (const dt of Object.keys(this.dataOptions)) {
        if (dt === this.mConfig.dataTable) {
          this.columnDropDownOptions = [];
          for (const field of this.dataOptions[dt]) {
            this.columnDropDownOptions.push({label: field, value: field});
          }
        }
      }
    }
  }
}
