import {Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {VisualisationService} from 'src/app/backend/api/visualisation.service';
import {Analysis} from 'src/app/backend/model/models';
import {copyToClipBoard} from '../../functions/details';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {DatePipe, Location} from '@angular/common';
import {AttributeDef} from '@tibco-tcstk/tc-web-components/dist/types/models/attributeDef';
import {ChartService, SummaryConfig} from '../../service/chart.service';
import {DateTime} from 'luxon';

@Component({
  selector: 'process-analysis-details',
  templateUrl: './process-analysis-details.component.html',
  styleUrls: ['./process-analysis-details.component.css']
})
export class ProcessAnalysisDetailsComponent implements OnInit, OnChanges {

  constructor(
    private location: Location,
    private visualisationService: VisualisationService,
    public msService: MessageTopicService,
    private datePipe: DatePipe,
    protected chartService: ChartService
  ) {
  }

  @Input() processAnalysis: Analysis;

  @Input() progress: any;

  @Output() doCompare: EventEmitter<Analysis> = new EventEmitter<Analysis>();

  templateName: string;
  showError = false;
  errorIcon: string;
  moreInfo = false;

  activitiesChartConfig: any;
  durationChartConfig: any;
  summaryConfig: SummaryConfig;

  paId: string;
  paVersion: string;
  chartData: any;
  display = false;

  ngOnInit() {
    this.errorIcon = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/svg/error-image-2.svg');
    // If template label is not part of the response
    if (this.processAnalysis.data.templateId && !this.processAnalysis.data.templateLabel ) {
      this.visualisationService.getTemplate(this.processAnalysis.data.templateId).subscribe(
        result => {
          this.processAnalysis.data.templateLabel = result.name;
        }
      )
    }
    if (!this.processAnalysis.data.templateId) {
      this.processAnalysis.data.templateLabel = 'Not assigned';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.processAnalysis && this.processAnalysis.id) {
      const idT = this.processAnalysis.id;
      this.paId = idT.substring(0, idT.lastIndexOf('-'))
      this.paVersion = idT.substring(idT.lastIndexOf('-') + 1)
      if (!this.processAnalysis.data.templateId) {
        this.processAnalysis.data.templateLabel = 'Not assigned';
      }
      if (this.processAnalysis?.metrics) {
        this.chartData = this.chartService.buildChartConfig(this.processAnalysis.metrics);
        this.summaryConfig = this.chartData.summaryConfig;
        this.activitiesChartConfig = this.chartData.activitiesChartConfig;
        this.durationChartConfig = this.chartData.durationChartConfig;
      }
    }
  }

  get attributeDefs(): AttributeDef[] {
    if (this.processAnalysis) {
      const defs: AttributeDef[] = [
        {label: 'Created by', value: this.processAnalysis.metadata.createdBy},
        // { label: 'Case ID', value: this.processAnalysis.data.mappings.caseId },
        // { label: 'Start time', value: this.processAnalysis.data.mappings.startTime },
        {label: 'Created on', value: this.datePipe.transform(this.processAnalysis.metadata.createdOn, 'short')},
        // { label: 'Activity', value: this.processAnalysis.data.mappings.activity },
        // { label: 'End time', value: this.processAnalysis.data.mappings.endTime },
        {label: 'Template', value: this.processAnalysis.data.templateLabel},
        // { label: 'Resource', value: this.processAnalysis.data.mappings.resource },
        // { label: 'Scheduled start time', value: this.processAnalysis.data.mappings.scheduledStart },
        {label: 'Id', value: this.paId, copyable: true},
        // { label: 'Description', value: this.processAnalysis.data.description },
        // { label: 'Department', value: this.processAnalysis.data.mappings.resourceGroup },
        // { label: 'Secheduled end time', value: this.processAnalysis.data.mappings.scheduledEnd },
        // { label: 'Version', value: this.paVersion, copyable: true },
        // { label: 'Requester', value: this.processAnalysis.data.mappings.requester },
        // { label: 'Other attributes', value: this.processAnalysis.data.mappings.otherAttributes ? 'true' : 'false' }
      ]
      if (this.processAnalysis.metadata.message) {
        defs.push({label: 'Error', value: this.processAnalysis.metadata.message, copyable: true});
      }
      return defs;
    } else {
      return [];
    }

  }

  get label(): string {
    return 'Additional Info';
  }

  handleMoreInfoToggle() {
    this.moreInfo = !this.moreInfo;
  }

  handleCompareClick() {
    if (this.processAnalysis?.metrics) {
      this.doCompare.emit(this.processAnalysis);
    }
  }

  handleDetailAttributeCopy(attribute: AttributeDef) {
    copyToClipBoard(attribute.label, attribute.value, this.msService)
  }

  get timespan(): string {
    const start: DateTime = DateTime.fromISO(this.processAnalysis.metrics.minTimestamp);
    const end: DateTime = DateTime.fromISO(this.processAnalysis.metrics.maxTimestamp);
    if (start.isValid && end.isValid) {
      return start.toLocaleString() + ' -> ' + end.toLocaleString();
    } else {
      return 'invalid start/end timestamps';
    }
  }

}
