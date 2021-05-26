import { Component, Input, OnInit } from '@angular/core';
import { VisualisationService } from 'src/app/api/visualisation.service';
import { Analysis } from 'src/app/model/models';

@Component({
  selector: 'process-analysis-details',
  templateUrl: './process-analysis-details.component.html',
  styleUrls: ['./process-analysis-details.component.css']
})
export class ProcessAnalysisDetailsComponent implements OnInit {

  @Input() processAnalysis: Analysis;
  public templateName: string;

  constructor(
    protected visualisationService: VisualisationService
  ) { }

  ngOnInit() {
    if (this.processAnalysis.data.templateId && this.processAnalysis.data.templateId !== ''){
      this.visualisationService.getTemplate(Number(this.processAnalysis.data.templateId)).subscribe(
        result => {
          this.templateName = result.name;
        }
      )  
    } else {
      this.templateName = 'Not assigned';
    }
  }
}
