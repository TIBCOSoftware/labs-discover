import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'metric-comparison',
  templateUrl: './metric-comparison.component.html',
  styleUrls: ['./metric-comparison.component.css']
})
export class MetricComparisonComponent implements OnChanges {

  @Input() baseMetric: number;
  @Input() comparisonMetric: number;
  @Input() showIncrease: boolean;
  @Input() showDecrease: boolean;

  percentageIncrease: number;
  percentageDecrease: number;
  difference: number;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.percentageIncrease = undefined;
    this.percentageDecrease = undefined;
    this.difference = undefined;
    if ((this.showIncrease || this.showDecrease) && this.baseMetric !== undefined && this.baseMetric !== null && this.comparisonMetric !== undefined && this.comparisonMetric !== null) {
      const result = ((this.baseMetric - this.comparisonMetric) / this.baseMetric) * 100;
      this.difference = Math.abs(this.baseMetric - this.comparisonMetric);
      if (!isNaN(result)) {
        if (result < 0) {
          this.percentageIncrease = Math.abs(result);
        } else if (result > 0) {
          this.percentageDecrease = Math.abs(result);
        }
      }
    }
  }

}
