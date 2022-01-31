import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MessageTopicService } from '@tibco-tcstk/tc-core-lib';
import { Analysis } from 'src/app/backend/model/analysis';
import { copyToClipBoard } from 'src/app/functions/details';

export class AdditionalAttr {
  label: string;
  value: string;
  type: string;
  copy?: boolean;
}

@Component({
  selector: 'process-analysis-moreinfo',
  templateUrl: './process-analysis-moreinfo.component.html',
  styleUrls: ['./process-analysis-moreinfo.component.css']
})
export class ProcessAnalysisMoreinfoComponent implements OnChanges {

  @Input() display: boolean;
  @Input() selectedAnalysis: Analysis;
  @Output() onHide: EventEmitter<null> = new EventEmitter();

  constructor(public msService: MessageTopicService,) { }

  displayAttributes: AdditionalAttr[];

  copyToClipBoard = copyToClipBoard;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.selectedAnalysis) {
      this.displayAttributes = [
        { label: 'Id', value: this.selectedAnalysis.id?.substring(0, this.selectedAnalysis.id.lastIndexOf('-')), type: 'string', copy: true },
        { label: 'Version', value: this.selectedAnalysis.id?.substring(this.selectedAnalysis.id.lastIndexOf('-') + 1), type: 'string', copy: true },
        { label: 'Case Id', value: this.selectedAnalysis.data.mappings.caseId, type: 'string' },
        { label: 'Start time', value: this.selectedAnalysis.data.mappings.startTime, type: 'string' },
        { label: 'Activity', value: this.selectedAnalysis.data.mappings.activity, type: 'string' },
        { label: 'End time', value: this.selectedAnalysis.data.mappings.endTime, type: 'string' },
        { label: 'Resource', value: this.selectedAnalysis.data.mappings.resource, type: 'string' },
        { label: 'Scheduled start time', value: this.selectedAnalysis.data.mappings.scheduledStart, type: 'string' },
        { label: 'Department', value: this.selectedAnalysis.data.mappings.resourceGroup, type: 'string' },
        { label: 'Scheduled end time', value: this.selectedAnalysis.data.mappings.scheduledEnd, type: 'string' },
        { label: 'Requestor', value: this.selectedAnalysis.data.mappings.requester, type: 'string' },
        { label: 'Other attributes', value: this.selectedAnalysis.data.mappings.otherAttributes?.toString(), type: 'string' },
        { label: 'Description', value: this.selectedAnalysis.data.description, type: 'string' }
      ];
    }
  }

  toggleDisplay() {
    this.onHide.emit();
   }

   handleDialogClose() {
     this.display = false;
   }


}
