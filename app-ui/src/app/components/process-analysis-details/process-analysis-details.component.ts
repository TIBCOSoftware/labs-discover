import {Component, Input, OnInit} from '@angular/core';
import {ProcessAnalysis} from "../../models/ProcessAnalysisModel";

@Component({
  selector: 'process-analysis-details',
  templateUrl: './process-analysis-details.component.html',
  styleUrls: ['./process-analysis-details.component.css']
})
export class ProcessAnalysisDetailsComponent implements OnInit {

  @Input() processAnalysis: ProcessAnalysis;

  constructor() { }

  ngOnInit() {
  }
}
