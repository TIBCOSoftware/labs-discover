import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {getSFLink} from '../../../functions/templates';
import {SpotfireDocument, SpotfireViewerComponent} from '@tibco/spotfire-wrapper';
import {OauthService} from '../../../service/oauth.service';
import {ConfigurationService} from '../../../service/configuration.service';
import {TemplateMenuConfig} from 'src/app/backend/model/templateMenuConfig';
import {UxplLeftNav} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav';

@Component({
  selector: 'template-analytic-preview',
  templateUrl: './template-analytic-preview.component.html',
  styleUrls: ['./template-analytic-preview.component.scss']
})
export class TemplateAnalyticPreviewComponent implements OnInit, OnChanges {

  @Input() location: string;
  @Input() previewParameters: string;
  @Input() previewMenu: TemplateMenuConfig[];
  @Input() isFilterPreview: boolean;

  @Output() pageOptions: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() markingOptions: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() dataOptions: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('analysis', {static: false}) analysisRef: SpotfireViewerComponent;
  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;

  markingOn = '*';
  spotfireServer;
  document: SpotfireDocument;
  analysisParameters: string;

  private defaultSet = false;

  constructor(
    private oService: OauthService,
    private configService: ConfigurationService
  ) {
  }

  ngOnInit(): void {
    this.spotfireServer = getSFLink(this.configService.config?.discover?.analytics);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.previewParameters && this.previewParameters) {
      this.analysisParameters = this.previewParameters.replace('@@OAUTH_TOKEN@@', this.oService.token);
    }
  }

  setDocument = (event): void => {
    this.document = event;
    this.document.onDocumentReady$().subscribe( _val => {
      // console.log('val: ' , _val);
      if (this.previewMenu && this.previewMenu.length > 0 && !this.defaultSet) {
        this.previewMenu.forEach(mItem => {
          if(mItem.isDefault){
            this.analysisRef.page = mItem.id;
            this.analysisRef.openPage(mItem.id);
            setTimeout(() => {
              this.leftNav?.nativeElement?.setTab(mItem, true);
            }, 0);
            // Sometime the left tab is not selected, this code ensures it is
            setTimeout(() => {
              this.leftNav?.nativeElement?.setTab(mItem, true);
            }, 100);
          }
        })
        this.defaultSet = true;
      }
    });
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
