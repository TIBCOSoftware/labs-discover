import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {UxplLeftNav} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav';
import {NewInvestigation} from '../../models/discover';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ObjectHeaderConfig} from '@tibco-tcstk/tc-web-components/dist/types/models/objectHeaderConfig';
import {ConfigurationService} from '../../service/configuration.service';
import {NavMenu} from '@tibco-tcstk/tc-web-components/dist/types/models/leftNav';
import {SpotfireDocument, SpotfireViewerComponent} from '@tibco/spotfire-wrapper';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {escapeCharsForJSON, getSFLink, stripDisabledMenuItems} from '../../functions/templates';
import {OauthService} from '../../service/oauth.service';
import {delay, last, retryWhen, take} from 'rxjs/operators';
import {AnalyticsMenuConfigUI, CaseConfig} from '../../models/configuration';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import {LiveAppsService} from '@tibco-tcstk/tc-liveapps-lib';
import _ from 'lodash';
import {CreateCaseMenuComponent} from '../create-case-menu/create-case-menu.component';
import {RepositoryService} from 'src/app/api/repository.service';
import {VisualisationService} from 'src/app/api/visualisation.service';
import {notifyUser} from '../../functions/message';
import { Analysis } from 'src/app/models_generated/analysis';

@Component({
  selector: 'analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit, OnChanges {

  @Input() analysis: string;

  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;
  @ViewChild('analysis', {static: false}) analysisRef: SpotfireViewerComponent;
  @ViewChild('popup', {static: false}) popup: ElementRef<UxplPopup>;
  @ViewChild('createcase', {static: false}) createCaseMenu: CreateCaseMenuComponent;

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

  public investigationConfig: CaseConfig[];
  public document: any;
  private templateNameToUse: string;
  private analysisIdToUse: string;
  public defaultTab: AnalyticsMenuConfigUI;

  // private gotDoc = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigurationService,
    private messageService: MessageTopicService,
    private oService: OauthService,
    private liveApps: LiveAppsService,
    private repositoryService: RepositoryService,
    protected visualisationService: VisualisationService
  ) {
    this.messageService.getMessage('clear-analytic.topic.message').subscribe(
      (message) => {
        console.log('Clearing Analytic: ' + message.text);
        this.spotfireDXP = null;
      });
  }

  ngOnInit(): void {
    this.investigationConfig = this.configService?.config?.discover?.investigations?.caseConfig;
    this.spotfireServer = getSFLink(this.configService.config?.discover?.analyticsSF);
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if (changes.analysis.previousValue !== changes.analysis.currentValue) {
      if (changes.analysis.currentValue !== '') {
        this.templateNameToUse = null;
        this.route.queryParams.pipe(take(1)).subscribe(params => {
          this.templateNameToUse = params.forceTemplate;
          this.analysisIdToUse = changes.analysis.currentValue.slice(0, changes.analysis.currentValue.lastIndexOf('-'));
          this.repositoryService.getAnalysisDetails(this.analysis).subscribe(
            async (analysis) => {
              if (this.templateNameToUse == null) {
                this.templateNameToUse = analysis.data.templateId;
              }
              analysis.data.templateId = this.templateNameToUse;
              this.createObjectHeader(analysis);
              const templateToUse = await this.visualisationService.getTemplate(this.templateNameToUse).toPromise();
              if (templateToUse) {
                this.hideSelectProcess = true;
                this.leftNavTabs = stripDisabledMenuItems(templateToUse.menuConfig);
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
                if (templateToUse.marking) {
                  this.markingOn = templateToUse.marking.listenOnMarking;
                  this.casesSelector = templateToUse.marking.casesSelector;
                  this.variantSelector = templateToUse.marking.variantSelector;
                } else {
                  this.markingOn = '*';
                }
                // Only re-load the DXP if it is different or the analysis parameters change
                if (doAnalysisParametersChange || (this.spotfireDXP !== templateToUse.spotfireLocation)) {
                  this.spotfireServer = getSFLink(this.configService.config?.discover?.analyticsSF);

                  // Trick to force reloading of dxp
                  this.spotfireDXP = null;
                  setTimeout(() => {
                    this.leftNav?.nativeElement?.setTab(this.defaultTab, true);
                    this.spotfireDXP = templateToUse.spotfireLocation;
                  }, 0);
                  // Sometime the left tab is not selected, this code ensures it is
                  setTimeout(() => {
                    this.leftNav.nativeElement.setTab(this.defaultTab, true);
                  }, 100);
                }
              } else {
                this.hideSelectProcess = false;
                notifyUser('ERROR', 'Can\'t find template: ' + this.templateNameToUse, this.messageService);
              }
            }
          );
        });
      }
    }
  }

  private createObjectHeader = async (analysis: Analysis): Promise<void> => {
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

  createInv(investigation: NewInvestigation) {
    let createInvestigation = true;
    if (investigation == null) {
      this.popup.nativeElement.show = true;
    } else {
      if (!investigation.analysisId) {
        investigation.analysisId = this.analysisIdToUse;
      }
      if (!investigation.templateName) {
        investigation.templateName = this.templateNameToUse;
      }
      let appId;
      let actionId;
      let CASE_TEMPLATE;
      for (const inConf of this.investigationConfig) {
        if (inConf.customTitle === investigation.type) {
          appId = inConf.appId;
          actionId = inConf.creatorId;
          CASE_TEMPLATE = inConf.creatorConfig;
        }
      }
      if (appId && actionId && CASE_TEMPLATE) {
        let CASE_DATA_OBJECT = {};
        let CASE_DATA = JSON.stringify(CASE_TEMPLATE);
        // JSON Escape the characters
        CASE_DATA = CASE_DATA.replace('@@SUMMARY@@', escapeCharsForJSON(investigation.summary));
        CASE_DATA = CASE_DATA.replace('@@DETAILS@@', escapeCharsForJSON(investigation.additionalDetails));
        CASE_DATA = CASE_DATA.replace('@@CONTEXT_TYPE@@', escapeCharsForJSON(investigation.contextType));
        CASE_DATA = CASE_DATA.replace('@@CONTEXT_IDS@@', escapeCharsForJSON(investigation.contextIds.toString()));
        CASE_DATA = CASE_DATA.replace('@@TEMPLATE_NAME@@', escapeCharsForJSON(investigation.templateName));
        CASE_DATA = CASE_DATA.replace('@@ANALYSIS_ID@@', escapeCharsForJSON(investigation.analysisId));
        try {
          CASE_DATA_OBJECT = JSON.parse(CASE_DATA);
        } catch (e) {
          createInvestigation = false;
          console.error('Error Parsing initial case data ', e);
          this.reportError('ERROR Creating Investigation: Unsupported Characters');
        }
        if (createInvestigation) {
          // Get the APP Id and the Action ID
          this.liveApps.runProcess(this.configService.config.sandboxId, appId, actionId, null, CASE_DATA_OBJECT).pipe(
            // retry(3),
            retryWhen(errors => {
              return errors.pipe(
                delay(2000),
                take(3)
              );
            }),
            take(1)
          ).subscribe(response => {
              if (response) {
                if (!response.data.errorMsg) {
                  this.messageService.sendMessage('news-banner.topic.message', investigation.type + ' investigation created successfully...');

                  this.popup.nativeElement.show = false;
                } else {
                  console.error('Unable to run the action');
                  console.error(response.data.errorMsg);
                }
              }
            }, error => {
              console.error('Unable to run the action');
              console.error(error);
            }
          );
        }
      } else {
        this.reportError('ERROR Creating Investigation: Config Not Found');
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

  public disableAddToReferenceButton = (): boolean => {
    return this.markedCases === undefined;
  }

  public disableRemoveFromReferenceButton = (): boolean => {
    return this.markedVariants === undefined;
  }

  public disableCheckUncheckButtons = (): boolean => {
    return this.markedCases === undefined;
  }

  public disableInvestigation = (): boolean => {
    return false;
  }

  public addToReference = (): void => {
    console.log('***** addToReference');
  }

  public removeFromReference = (): void => {
    console.log('***** removeFromReference');
  }

  public check = (): void => {
    console.log('***** check');
  }

  public uncheck = (): void => {
    console.log('***** cheuncheckck');
  }

  public editTemplate() {
    console.log('this.analysis ', this.analysis);

    this.router.navigate(['/discover/select-template', this.analysis]);

    // /discover/select-template/analytics
  }

  public setDocument = (event): void => {
    this.enableMenu = true;
    this.document = event;
  }

  selectAnalytic() {
    this.router.navigate(['/discover/process-analysis']);
  }

  showCreateCaseMenu() {
    this.popup.nativeElement.show = !this.popup.nativeElement.show;
    this.createCaseMenu.setupAdditionalInfo();
  }

  // TODO: Finish the research
  openConnectedPage() {
    console.log('     Server: ', this.spotfireServer);
    console.log('        DXP: ', this.spotfireDXP);
    console.log('Active Page: ', this.analysisRef.page);

    // https://eu.spotfire-next.cloud.tibco.com/spotfire/wp/analysis?file=Teams/01DDN0HS3RNGPZ5PJRMVAKC2M4/Sales%20and%20Marketing&waid=bvgTE8jUjkKZ-S3fKPi3w-2914000b5cQprx&wavid=0
    const sfURL = this.spotfireServer + '/spotfire/wp/analysis?file=' + this.spotfireDXP;
    window.open(sfURL);
    /// list.getElementsByTagName("LI")[0].innerHTML = "Milk";
    const sfHost = document.getElementById('mySFViewer');
    const iFrame = sfHost.getElementsByTagName('iFrame')[0] as HTMLIFrameElement;
    console.log('iFrame: ', iFrame.contentWindow);
    console.log('iFrame URL: ', iFrame.contentWindow.location.href)

    // https://eu.spotfire-next.cloud.tibco.com/spotfire/wp/OpenAnalysis?file=fb071c82-2127-45ee-aafe-c6ebd9433dc6&waid=sXHQCNLuD0CG3ogwa4tZC-2914000b5cQprx&wavid=0

    // The opened page:
    // https://eu.spotfire-next.cloud.tibco.com/spotfire/wp/analysis?file=Teams/01DZBGCE4XGN899ZQ7NS238VK3/Discover/main/project_discover_latest_nicolas_v2&waid=nQ0t0-0odke-nhaXr_kkA-2913585d62gYK0&wavid=1

    // The iframe page
    //  https://eu.spotfire-next.cloud.tibco.com/spotfire/wp/OpenAnalysis?file=8e6b6a38-95f5-447f-9068-2cb8b43ec216&waid=nQ0t0-0odke-nhaXr_kkA-2913585d62gYK0&wavid=0

  }

}
