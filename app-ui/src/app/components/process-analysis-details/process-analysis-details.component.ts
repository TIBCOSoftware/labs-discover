import {Component, Input, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges} from '@angular/core';
import {VisualisationService} from 'src/app/api/visualisation.service';
import {Analysis} from 'src/app/model/models';
import {getShortMessage, copyToClipBoard} from '../../functions/details';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {Location} from '@angular/common';

@Component({
  selector: 'process-analysis-details',
  templateUrl: './process-analysis-details.component.html',
  styleUrls: ['./process-analysis-details.component.css']
})
export class ProcessAnalysisDetailsComponent implements OnInit, OnChanges {

  constructor(
    private location: Location,
    private visualisationService: VisualisationService,
    public msService: MessageTopicService
  ) {
  }

  @Input() processAnalysis: Analysis;

  @Input() progress: any;

  templateName: string;
  showError = false;
  errorIcon: string;

  getShortMessage = getShortMessage;
  copyToClipBoard = copyToClipBoard;

  paId: string;
  paVersion: string;

  ngOnInit() {
    this.errorIcon = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/svg/error-image-2.svg');
    if (this.processAnalysis.data.templateId && this.processAnalysis.data.templateId !== '') {
      this.visualisationService.getTemplate(this.processAnalysis.data.templateId).subscribe(
        result => {
          this.templateName = result.name;
        }
      )
    } else {
      this.templateName = 'Not assigned';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.processAnalysis && this.processAnalysis.id){
      const idT = this.processAnalysis.id;
      this.paId = idT.substring(0, idT.lastIndexOf('-'))
      this.paVersion = idT.substring(idT.lastIndexOf('-') + 1)
    }
  }



}
