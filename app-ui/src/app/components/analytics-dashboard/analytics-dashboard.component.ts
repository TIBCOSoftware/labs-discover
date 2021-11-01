import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {UxplLeftNav} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav';
// import {NewInvestigation} from '../../models_ui/discover';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ObjectHeaderConfig} from '@tibco-tcstk/tc-web-components/dist/types/models/objectHeaderConfig';
import {ConfigurationService} from '../../service/configuration.service';
import {NavMenu} from '@tibco-tcstk/tc-web-components/dist/types/models/leftNav';
import {SpotfireDocument, SpotfireViewerComponent} from '@tibco/spotfire-wrapper';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {escapeCharsForJSON, getSFLink, stripDisabledMenuItems} from '../../functions/templates';
import {OauthService} from '../../service/oauth.service';
import {debounceTime, delay, last, retryWhen, take} from 'rxjs/operators';
import {AnalyticsMenuConfigUI, CaseConfig} from '../../models_ui/configuration';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import _ from 'lodash';
import {CreateCaseMenuComponent} from '../create-case-menu/create-case-menu.component';
import {RepositoryService} from 'src/app/backend/api/repository.service';
import {VisualisationService} from 'src/app/backend/api/visualisation.service';
import {notifyUser} from '../../functions/message';
import { Analysis } from 'src/app/backend/model/analysis';
import { InvestigationApplication } from 'src/app/backend/model/investigationApplication';
import {Template} from '../../backend/model/template';
import {SfFilterPanelComponent} from '../sf-filter-panel/sf-filter-panel.component';
import {TemplateFilterConfigUI} from '../../models_ui/analyticTemplate';
import {Subject} from 'rxjs';
import { InvestigationsService } from 'src/app/backend/api/investigations.service';
import { InvestigationCreateRequest } from 'src/app/backend/model/investigationCreateRequest';
import { InvestigationCreateResponse } from 'src/app/backend/model/investigationCreateResponse';
import {InvestigationConfig} from '../../models_ui/investigations';

@Component({
  selector: 'analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit, OnChanges {

  @Input() analysis: string;

  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;
  @ViewChild('analysis', {static: false}) analysisRef: SpotfireViewerComponent;
  @ViewChild('popup', {static: false}) popup: ElementRef<UxplPopup>;
  @ViewChild('createcase', {static: false}) createCaseMenu: CreateCaseMenuComponent;
  @ViewChild('analysisContainer', {static: false}) analysisContainer: ElementRef;
  @ViewChild('spotfireFilterPanel', {static: false}) spotfireFilterPanel: SfFilterPanelComponent;


  public objHeaderConfig: ObjectHeaderConfig;
  public leftNavTabs: NavMenu[];
  public spotfireDXP: string;
  public analysisParameters: string;
  public spotfireServer;
  public markingOn: string;
  public casesSelector: string;
  public variantSelector: string;

  private enableMenu: boolean;
  public markedVariants: string[];
  public markedCases: string[];
  public noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');
  public hideSelectProcess = false;

  public investigationConfig: InvestigationApplication[];
  public document: SpotfireDocument;
  private templateIdToUse: string;
  private analysisIdToUse: string;
  private analysisNameToUse: string;
  public defaultTab: AnalyticsMenuConfigUI;

  templateToUse: Template;
  filterIds = [];
  filterConfig: TemplateFilterConfigUI[] = [];
  showFilterButton = false;
  showFilterPanel = false;
  filterPanelSize = {x: 578, y: 629};
  filterPanelLeft: number;
  filterPanelTop: number;
  public windowResized: Subject<any> = new Subject<any>();
  public hoverOnFilterButton = false;
  readonly FILTER_DIV = 'FILTERDIV'

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigurationService,
    private messageService: MessageTopicService,
    private oService: OauthService,
    private repositoryService: RepositoryService,
    private visualisationService: VisualisationService,
    private investigationService: InvestigationsService
  ) {
    this.messageService.getMessage('clear-analytic.topic.message').subscribe(
      _D => {
        this.spotfireDXP = null;
      });
  }


  ngOnInit(): void {
    this.investigationConfig = this.configService?.config?.discover?.investigations.applications;
    this.spotfireServer = getSFLink(this.configService.config?.discover?.analytics);

    this.windowResized
      .pipe(debounceTime(500))
      .subscribe(model => {
        this.setFilterPanelScope();
      });
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if (changes.analysis.previousValue !== changes.analysis.currentValue) {
      if (changes.analysis.currentValue !== '') {
        this.templateIdToUse = null;
        this.route.queryParams.pipe(take(1)).subscribe(params => {
          this.templateIdToUse = params.forceTemplate;
          this.analysisIdToUse = changes.analysis.currentValue.slice(0, changes.analysis.currentValue.lastIndexOf('-'));
          if (this.analysis) {
            this.repositoryService.getAnalysisDetails(this.analysis).subscribe(
              async (analysis) => {
                if (analysis) {
                  if (this.templateIdToUse == null && analysis.data) {
                    this.templateIdToUse = analysis.data.templateId;
                  }
                  if (analysis.data) {
                    analysis.data.templateId = this.templateIdToUse;
                  }
                  this.analysisNameToUse = analysis.data.name;
                  this.createObjectHeader(analysis);
                  try {
                    this.templateToUse = await this.visualisationService.getTemplate(this.templateIdToUse).toPromise();
                  } catch (e) {
                    // TODO: Specifically check for a 404 when the backend is updated
                    console.error('TEMPLATE ERROR ', e);
                  }

                  if (this.templateToUse) {
                    let oldFilter;
                    if (this.filterConfig) {
                      oldFilter = [...this.filterConfig];
                    }
                    this.filterConfig = null;
                    if (this.templateToUse?.filters) {
                      this.filterConfig = [...this.templateToUse.filters];
                      this.filterConfig.forEach(fc => fc.uiId = fc.id.replace(/\s/g, ''))
                      this.templateToUse.filters = this.filterConfig;
                      this.filterIds = this.filterConfig.map(config => config.uiId);
                    }
                    this.hideSelectProcess = true;
                    this.leftNavTabs = stripDisabledMenuItems(this.templateToUse.menuConfig);
                    for (const tab of this.leftNavTabs) {
                      const myTab = tab as AnalyticsMenuConfigUI;
                      if (myTab.enabled && myTab.isDefault) {
                        this.defaultTab = myTab;
                      }
                    }
                    let defTabParameter = '';
                    if (this.defaultTab && this.defaultTab.id) {
                      defTabParameter = 'SetPage(pageTitle="' + this.defaultTab.id + '");';
                    }
                    const newAnalyisParameters = 'AnalysisId="' + this.analysisIdToUse + '";&Token="' + this.oService.token + '";' + defTabParameter;
                    let doAnalysisParametersChange = false;
                    if (newAnalyisParameters !== this.analysisParameters) {
                      this.analysisParameters = newAnalyisParameters;
                      doAnalysisParametersChange = true;
                    }
                    if (this.templateToUse.marking) {
                      this.markingOn = this.templateToUse.marking.listenOnMarking;
                      this.casesSelector = this.templateToUse.marking.casesSelector;
                      this.variantSelector = this.templateToUse.marking.variantSelector;
                    } else {
                      this.markingOn = '*';
                    }
                    let filterChanged = false;
                    if (oldFilter) {
                      filterChanged = true;
                      if (this.filterConfig) {
                        filterChanged = !(this.filterConfig.length === oldFilter.length && this.filterConfig.every((value, index) => value.uiId === oldFilter[index].uiId))
                      }
                    }
                    // Only re-load the DXP if it is different or the analysis parameters change or if there is a filter panel
                    if (doAnalysisParametersChange || (this.spotfireDXP !== this.templateToUse.spotfireLocation) || filterChanged) {
                      this.loadAnalytic();
                    }
                  } else {
                    this.hideSelectProcess = false;
                    notifyUser('ERROR', 'Can\'t find template with id: ' + this.templateIdToUse, this.messageService);
                    // We get an error getting the template, so we display the select template screen
                    this.editTemplate()
                  }
                }
              }
            );
          }
        });
      }
    }
  }

  private createObjectHeader = async (analysis: Analysis): Promise<void> => {
    if (analysis) {
      const templateDetails = await this.visualisationService.getTemplate(analysis.data.templateId).toPromise();
      const formatDate = new Date(analysis.metadata.createdOn).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      this.objHeaderConfig = {
        title: {
          value: analysis.data.name,
          isEdit: false,
          editing: false
        },
        details: [
          {isEdit: false, editing: false, value: 'Created by ' + analysis.metadata.createdBy},
          {isEdit: false, editing: false, value: 'Created on ' + formatDate},
          {isEdit: false, editing: false, value: analysis.data.description},
          {isEdit: true, editing: false, value: 'Template: ' + templateDetails.name, eventOnEdit: true, id: 'template'}
        ],
        externalOptions: false,
        options: []
      };
    }
  }

  public setSpotfireConfiguration = (): any => {
    const mode = false;
    return {
      showAbout: mode,
      showAnalysisInformationTool: mode,
      showAuthor: mode,
      showClose: mode,
      showCustomizableHeader: false,
      showDodPanel: mode,
      showExportFile: mode,
      showFilterPanel: true,
      showHelp: false,
      showLogout: false,
      showPageNavigation: false,
      showStatusBar: false,
      showToolBar: mode,
      showUndoRedo: mode
    };
  }

  public goProcessAnalysis = (): void => {
    this.router.navigate(['/discover/process-analysis']);
  }

  createInv(event: InvestigationConfig) {
    // console.log('Create inv: ', event)
    // const createInvestigation = true;
    if (event == null) {
      this.popup.nativeElement.show = true;
    } else {
      const investigation = event.data as InvestigationCreateRequest;
      investigation.analysisId = this.analysisIdToUse;
      investigation.analysisName = this.analysisNameToUse;
      investigation.templateId = this.templateToUse.id;
      investigation.templateName = this.templateToUse.name;
      const appId = event.investigationId;
      // console.log('this.investigationConfig: ', this.investigationConfig);
      const appConfig = this.investigationConfig.find((el: InvestigationApplication) => el.applicationId === appId)
      if(appConfig){
        const creatorId = appConfig.creatorId;
        this.investigationService.postStartCaseForInvestigation(appId, creatorId,investigation).subscribe(
          (response: InvestigationCreateResponse) => {
            if (response) {
              // console.log('Response: ' , response)
              this.messageService.sendMessage('news-banner.topic.message', event.investigationType + ' investigation created successfully ('+response.id+')...');
              this.popup.nativeElement.show = false;
            }
          }, error => {
            console.error('Unable to run the action');
            console.error(error);
          }
        );
      } else {
        console.error('Could not find the Configuration to create the investigation')
      }
    }
  }

  private reportError(error: string) {
    notifyUser('ERROR', error, this.messageService);
  }

  handleClick = (event: any): void => {
    if (this.enableMenu && event?.detail.id) {
      this.analysisRef.page = event.detail.id;
      this.analysisRef.openPage(event.detail.id);
    }
  };

  public marking(data) {
    this.markedCases = _.get(data, this.casesSelector);
    this.markedVariants = _.get(data, this.variantSelector);
  }

  public disableInvestigation = (): boolean => {
    return false;
  }

  public editTemplate() {
    this.router.navigate(['/discover/select-template', this.analysis]);
  }

  public setDocument = (event): void => {
    if(!this.document) {
      this.document = event;
      this.document.onDocumentReady$().subscribe(_val => {
        this.enableMenu = true;
        if (this.filterConfig) {
          this.showFilterButton = true;
          const {width, height, left, top} = this.setFilterPanelScope();
          this.filterPanelSize.y = height - 76;
          // this.containerHeight = height;
          // this.containerWidth = width;
          // this.containerLeft = left;
          // this.containerTop = top;
          // this.spotfireFilterPanel.setContainerScope({width, height, left, top});
        }
      })
    }
  }

  private setFilterPanelScope() {
    if (this.analysisContainer && this.analysisContainer.nativeElement) {
      const {width, height, left, top} = this.analysisContainer?.nativeElement?.getBoundingClientRect();
      this.spotfireFilterPanel?.setContainerScope({width, height, left, top});
      return {width, height, left, top};
    }
    return {width: null, height: null, left: null, top: null}
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowResized.next({});
  }

  selectAnalytic() {
    this.router.navigate(['/discover/process-analysis']);
  }

  showCreateCaseMenu() {
    this.popup.nativeElement.show = !this.popup.nativeElement.show;
    this.createCaseMenu.setupAdditionalInfo();
  }

  loadAnalytic() {
    this.spotfireServer = getSFLink(this.configService.config?.discover?.analytics);
    this.showFilterButton = false;
    this.showFilterPanel = false;
    this.document = null;
    // Trick to force reloading of dxp
    this.spotfireDXP = null;
    setTimeout(() => {
      this.leftNav?.nativeElement?.setTab(this.defaultTab, true);
      this.spotfireDXP = this.templateToUse.spotfireLocation;
    }, 0);
    // Sometime the left tab is not selected, this code ensures it is
    setTimeout(() => {
      this.leftNav.nativeElement.setTab(this.defaultTab, true);
    }, 100);
  }

  public toggleFilterPanel(event) {
    this.showFilterPanel = !this.showFilterPanel;
    const target = event.target;
    const {x, y, height, width} = target.getBoundingClientRect();
    // rtAnchorPos is the position of the right top point of the panel
    const rtAnchorPos = {
      x: x + width,
      y: y + height
    }
    this.filterPanelLeft = rtAnchorPos.x - this.filterPanelSize.x;
    this.filterPanelTop = rtAnchorPos.y + 10;
    this.spotfireFilterPanel.toggleShow(this.showFilterPanel);

  }

  public mouseUp() {
    console.log('mouse up in container');
  }

  public enableSFPointerEvents(enabled) {
    if (this.analysisContainer) {
      const iframe = this.analysisContainer.nativeElement.querySelector('iframe');
      if (iframe) {
        const style = 'border: 0px; margin: 0px; padding: 0px; width: 100%; height: 100%;';
        if (enabled) {
          iframe.setAttribute('style', style);
        } else {
          iframe.setAttribute('style', style + 'pointer-events: none;');
        }
      }
    }
  }

  public hoverFilterButton(hover: boolean) {
    this.hoverOnFilterButton = hover;
  }

  public getFilterButtonColor() {
    if (this.showFilterPanel) {
      return '#0E4F9E';
    } else {
      if (this.hoverOnFilterButton) {
        return '#FFFFFF'
      } else {
        return '#727272';
      }
    }
  }

  openFPage(page: string) {
    if (this.analysisRef) {
      this.analysisRef.openPage(page, this.FILTER_DIV);
    }
  }
}
