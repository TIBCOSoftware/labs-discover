import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { SelectOption } from '@tibco-tcstk/tc-web-components/dist/types/models/selectInputConfig';
import { Analysis } from 'src/app/backend/model/analysis';

@Component({
  selector: 'process-analysis-compare',
  templateUrl: './process-analysis-compare.component.html',
  styleUrls: ['./process-analysis-compare.component.css']
})
export class ProcessAnalysisCompareComponent implements OnChanges {

  @Input() display: boolean;
  @Input() selectedAnalysis: Analysis[];
  @Input() analysisOptions: Analysis[];
  @Output() onHide: EventEmitter<null> = new EventEmitter();

  constructor() { }

  metricToggle = 'all';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.display) {
      this.showIncrease = true;
      this.showDecrease = true;
      this.metricToggle = 'all';
    }
  }

  showIncrease = true;
  showDecrease = true;

  toggleDisplay() {
   this.onHide.emit();
  }

  handleDialogClose() {
    this.display = false;
  }

  get options(): SelectOption[] {
    const selectOptions: SelectOption[] = [];
    this.analysisOptions.forEach(analysis => {
      {
        selectOptions.push({
          label: analysis.data.name,
          value: analysis.id,
          id: analysis.id,
          disabled: (!analysis.metrics || this.isSelected(analysis))? true : false
        } as SelectOption)
      };
    })
    return selectOptions;
  }

  public getAnalysis(idx: number): Analysis {
    return this.selectedAnalysis[idx];
  }

  addCompare() {
    if (this.selectedAnalysis.length < 3) {
      this.selectedAnalysis = [ ...this.selectedAnalysis, null];
    }
  }

  removeCompare(idx: number) {
    this.selectedAnalysis.splice(idx, 1);
  }

  handleSelectedAnalysis(idx: number, event: CustomEvent) {
    const selectedAnalysis = this.analysisOptions.find(opt => { return opt.id === event.detail.id});
    this.selectedAnalysis[idx] = {...selectedAnalysis};
  }

  handleMetricOptionSelection(event: CustomEvent) {
    this.metricToggle = event?.detail?.value;
    switch (event?.detail?.value) {
      case 'increases': {
        this.showIncrease = true;
        this.showDecrease = false;
        break;
      }
      case 'decreases': {
        this.showIncrease = false;
        this.showDecrease = true;
        break;
      }
      case 'all': {
        this.showIncrease = true;
        this.showDecrease = true;
        break;
      }
      default: {
        console.warn('Invalid selection for metric display: ', event.detail.value);
        this.showIncrease = false;
        this.showDecrease = false;
      }
    }
  }

  isSelected(analysis: Analysis): boolean {
    const found = this.selectedAnalysis?.find(rec => {
      if (rec) {
        return rec.id === analysis?.id
      } else {
        return false;
      }
    });
    return !!found;
  }

  calcTimespan(analysis: Analysis): number {
    if (analysis?.metrics) {
      return analysis.metrics.maxTime - analysis.metrics.minTime;
    } else {
      return undefined;
    }

  }
}
