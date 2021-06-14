import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {getSFLink} from '../../../functions/templates';
import {SpotfireDocument, SpotfireViewerComponent} from '@tibco/spotfire-wrapper';
import {OauthService} from '../../../service/oauth.service';
import {ConfigurationService} from '../../../service/configuration.service';
import { TemplateMenuConfig } from 'src/app/models_generated/templateMenuConfig';

@Component({
  selector: 'template-analytic-preview',
  templateUrl: './template-analytic-preview.component.html',
  styleUrls: ['./template-analytic-preview.component.css']
})
export class TemplateAnalyticPreviewComponent implements OnInit, OnChanges {

  @Input() location: string;
  @Input() previewParameters: string;
  @Input() previewMenu: TemplateMenuConfig[];

  @Output() pageOptions: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() markingOptions: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() dataOptions: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('analysis', {static: false}) analysisRef: SpotfireViewerComponent;

  markingOn = '*';

  spotfireServer;
  document: SpotfireDocument;
  analysisParameters: string;

  constructor(
    private oService: OauthService,
    private configService: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.spotfireServer = getSFLink(this.configService.config?.discover?.analyticsSF);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.previewParameters && this.previewParameters) {
      this.analysisParameters = this.previewParameters.replace('@@OAUTH_TOKEN@@', this.oService.token);
    }
  }

  setDocument = (event): void => {
    this.document = event;
    this.document.getPages$().subscribe((pageOptions) => {
      this.pageOptions.emit(pageOptions);
    })
    this.document.getMarking().getMarkingNames$().subscribe((markingOptions) => {
      this.markingOptions.emit(markingOptions);
    });
    this.document.getData().getTables$().subscribe((data) => {
      this.dataOptions.emit(data);
    })
    this.document.getDocumentMetadata$().subscribe((ob) => {
    })
  }

  handleClick = (event: any): void => {
    if (event?.detail?.id) {
      this.analysisRef.page = event.detail.id;
      this.analysisRef.openPage(event.detail.id);
    }
  };
}
