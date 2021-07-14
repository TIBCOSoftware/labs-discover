import {Component, Input, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges} from '@angular/core';
import {VisualisationService} from 'src/app/api/visualisation.service';
import {Analysis} from 'src/app/model/models';
import {notifyUser} from '../../functions/message';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {Location} from '@angular/common';

@Component({
  selector: 'process-analysis-details',
  templateUrl: './process-analysis-details.component.html',
  styleUrls: ['./process-analysis-details.component.css']
})
export class ProcessAnalysisDetailsComponent implements OnInit, OnChanges {

  @Input() processAnalysis: Analysis;

  @Input() progress: any;

  templateName: string;
  showError = false;
  errorIcon: string;

  progressSet = false;

  constructor(
    private location: Location,
    private visualisationService: VisualisationService,
    private msService: MessageTopicService
  ) {
  }

  ngOnInit() {
    this.progressSet = false;
    if(this.progress){
      this.progressSet = true;
    }
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

  copyToClipBoard(type: string, value: any) {
    navigator.clipboard.writeText(value).then(() => {
      notifyUser('INFO', type + ' copied to clipboard...', this.msService);
    }, (err) => {
      console.error('Async: Could not copy text: ', err);
    });
  }

  getShortMessage(message: string) {
    if (message.length > 25) {
      return message.substring(0, 25) + '...';
    } else {
      return message;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.progress){
      this.progressSet = true;
    }
  }

}
