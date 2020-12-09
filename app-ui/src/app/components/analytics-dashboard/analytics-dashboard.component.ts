import {
  Component,
  ComponentFactory, ComponentFactoryResolver, ComponentRef,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild, ViewContainerRef
} from '@angular/core';
import {UxplLeftNav} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav';
import {MessageTopicService, TcCoreCommonFunctions} from "@tibco-tcstk/tc-core-lib";
import {FullSpotfireConfig, NewInvestigation, TCM_Message_discover_actions} from "../../models/discover";
import {Location} from '@angular/common';
import {Router} from "@angular/router";
import {SfContainerComponent} from "../sf-container/sf-container.component";
import {ObjectHeaderConfig} from "@tibco-tcstk/tc-web-components/dist/types/models/objectHeaderConfig";
import {UxplPopup} from "@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup";
import {MatDialog} from "@angular/material/dialog";
import {
  CaseType,
  FormConfig,
  LiveAppsService
} from "@tibco-tcstk/tc-liveapps-lib";
import {CustomFormDefs} from "@tibco-tcstk/tc-forms-lib";
import {delay, retryWhen, take} from "rxjs/operators";
import {ConfigurationService} from "../../service/configuration.service";
import {MessagingWrapperService} from "../../service/messaging-wrapper.service";
import {CaseCacheService} from "../../service/custom-case-cache.service";


@Component({
  selector: 'analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit, OnChanges {

  // Spotfire general configuration
  @Input() fullSpotfireConfig: FullSpotfireConfig;

  public objHeaderConfig: ObjectHeaderConfig;

  // Spotfire wrapper configuration
  public configuration: any;
  public analysisError: boolean;

  constructor(protected location: Location,
    protected router: Router,
    protected resolver: ComponentFactoryResolver,
    protected dialog: MatDialog,
    protected configService: ConfigurationService,
    protected liveApps: LiveAppsService,
    protected messageService: MessageTopicService,
    protected config: ConfigurationService,
    protected tcm: MessagingWrapperService,
    protected caseCache: CaseCacheService)
  {
    this.messageService.getMessage('analytic.can.be.refreshed').subscribe(
      async (message) => {
        if (message.text === 'OK') {
            this.refreshEnabled = true;
            this.refreshVisible = true;
        }
      });
  }

  public ngOnInit() {
    this.analysisError = false;

  }

  private createObjectHeader = (): void => {
    const formatDate = new Date(this.fullSpotfireConfig.dataSource.analysisCreatedOn).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.objHeaderConfig = {
      title: {
        value: this.fullSpotfireConfig.name,
        isEdit: false,
        editing: false
      },
      details: [
        {
          value: 'Created by ' + this.fullSpotfireConfig.dataSource.analysisCreatedBy,
          isEdit: false,
          editing: false
        },
        {
          value: 'Created on ' + formatDate,
          isEdit: false,
          editing: false
        },
        {
          value: this.fullSpotfireConfig.dataSource.analysisDescription,
          isEdit: false,
          editing: false
        }
      ],
      externalOptions: false,
      options: [],
      backIconLocation: TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, "assets/svg/ic-back.svg")
    };
  }

  @ViewChild('spotfireContainer', {read: ViewContainerRef, static: false}) container;
  componentRef: ComponentRef<SfContainerComponent>;

  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;

  @ViewChild('popup', {static: false}) popup: ElementRef<UxplPopup>;

  public leftNavTabs = [];

  public noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');
  public parameters: string;
  public sfReady = false;
  public application: CaseType;
  public variantMarkedOnTable = "";

  createInv(investigation: NewInvestigation) {
    if (investigation == null) {
      // this.popup.nativeElement.show = false;
      this.popup.nativeElement.show = true;
    } else {
      let appId = '';
      let actionId = '';
      if (this.variantMarkedOnTable && this.variantMarkedOnTable != null) {
        if (investigation.type == "Compliance") {
          // TODO: Get Nicely from config
          appId = this.configService.config.discover.investigations.applications[0].applicationId;
          actionId = this.configService.config.discover.investigations.applications[0].creatorId;

          this.INITIAL_CASE_DATA = {
            "Discovercompliance": {
              "ShortDescription": investigation.summary,
              "LongDescription": investigation.additionalDetails,
              "Context": {
                "ContextType": "Variants",
                "ContextID": this.variantMarkedOnTable
              },
              "DataSourceName": this.fullSpotfireConfig.dataSource.analysisName,
              "DataSourceId": this.fullSpotfireConfig.dataSource.datasourceId,
              "CommentsHistory": []
            }
          }
        }
        if (investigation.type == "Improvement") {
          // TODO: Get Nicely from config
          appId = this.configService.config.discover.investigations.applications[1].applicationId;
          actionId = this.configService.config.discover.investigations.applications[1].creatorId;
          this.INITIAL_CASE_DATA = {
            "Discoverimprovement": {
              "ShortDescription": investigation.summary,
              "LongDescription": investigation.additionalDetails,
              "Context": {
                "ContextType": "Variants",
                "ContextID": this.variantMarkedOnTable
              },
              "DataSourceName": this.fullSpotfireConfig.dataSource.analysisName,
              "DataSourceId": this.fullSpotfireConfig.dataSource.datasourceId,
              "CommentsHistory": []
            }
          }
        }

        this.liveApps.runProcess(this.configService.config.sandboxId, appId, actionId, null, this.INITIAL_CASE_DATA).pipe(
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
                //this.clickMenuTrigger.closeMenu();
                // Do a refresh on the cache cache.
                this.caseCache.hardRefresh(appId);
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
    }
  }

  private setUpSfServer = (): void => {
    this.sfClickReady = false;
    this.parameters = 'AnalysisId = "' + this.fullSpotfireConfig.dataSource.datasourceId + '";';
    if(this.configService.config.discover.analytics.edit){
      this.configuration = {
        showAbout: true,
        showAnalysisInformationTool: true,
        showAuthor: true,
        showClose: true,
        showCustomizableHeader: false,
        showDodPanel: true,
        showExportFile: true,
        showFilterPanel: true,
        showHelp: false,
        showLogout: false,
        showPageNavigation: false,
        showStatusBar: true,
        showToolBar: true,
        showUndoRedo: true
      };
    } else {
      this.configuration =  {
        showAbout: false,
        showAnalysisInformationTool: false,
        showAuthor: false,
        showClose: false,
        showCustomizableHeader: false,
        showDodPanel: false,
        showExportFile: false,
        showFilterPanel: true,
        showHelp: false,
        showLogout: false,
        showPageNavigation: false,
        showStatusBar: true,
        showToolBar: false,
        showUndoRedo: false
      };
    }
    this.upDateSFComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fullSpotfireConfig.currentValue?.dataSource?.datasourceId !== changes.fullSpotfireConfig.previousValue?.dataSource?.datasourceId){
      this.setUpSFTabs();
      this.createObjectHeader();
      if (this.fullSpotfireConfig.hasAnalytics) {
          this.setUpSfServer();
          this.sfReady = true;
      }
    }
  }

  setUpSFTabs() {
    if (this.fullSpotfireConfig.hasAnalytics) {
      this.leftNavTabs = this.configService.config.discover.analytics.menuConfig;

      // Set first tab as active
      setTimeout(() => {
        this.leftNav.nativeElement.setTab(this.leftNavTabs[0]);
      }, 0);
    } else {
      this.leftNavTabs = [];
    }
  }

  selectAnalytic() {
    this.router.navigate(['/discover/process-analysis']);
  }

  public createInvestigationEnabled = false;
  public createInvestigationVisible = false;

  public checkingEnabled = false;
  public checkingVisible = false;

  public referenceEnabled = false;
  public referenceVisible = false;

  public refreshEnabled = true;
  public refreshVisible = true;

  // public markedAsCheckedEnabled = false;

  sfClickReady = false;
  handleClick = (event: any): void => {
    if (this.sfClickReady) {
      //Open Page
      if (this.componentRef) {
        const page = event.detail.id;
        this.componentRef.instance.page = page;
        this.componentRef.instance.setPage(page);
        this.refreshVisible = true;
        this.createInvestigationVisible = true;
        this.referenceVisible = false;
        this.checkingVisible = false;

        if (page == 'Overview') {
          this.createInvestigationVisible = false;
        }
        if (page == 'Variants Overview') {
          this.createInvestigationVisible = false;
        }
        if (page == 'Reference Model') {
          this.referenceVisible = true;
          //this.refreshEnabled = true;
        }
        if (page == 'Compliance') {
          //this.refreshEnabled = true;
        }
        if (page == 'Compliance' || page == 'Activities Performance' || page == 'Resources' || page == 'Case Context') {
          this.checkingVisible = true;
        }
      }
    } else {
      this.sfClickReady = true;
    }
  };

  public casesMarkedOnTable = [];
  public uncompliantVariantsMarkedOnTable = [];
  public uncompliantVariantsMarkedOnTableNumber = [];

  // public variantsEnabled = false;

  public marking(data) {
    let enableInvestigationButton = false;
    this.checkingEnabled = false;
    this.referenceEnabled = false;

    this.uncompliantVariantsMarkedOnTable = this.getElementsFromMarking(data, 'variants', 'UncompliantVariants', 'variant_id');
    this.casesMarkedOnTable = this.getElementsFromMarking(data, 'variants', 'UncompliantVariants', 'variant_id');

    if (this.uncompliantVariantsMarkedOnTable && this.uncompliantVariantsMarkedOnTable.length > 0) {
      this.referenceEnabled = true;
      this.checkingEnabled = true;
      this.uncompliantVariantsMarkedOnTableNumber = [];
      for (let id of this.uncompliantVariantsMarkedOnTable) {
        let idN: number = Number(id);
        this.uncompliantVariantsMarkedOnTableNumber.push(idN);
      }
    }

    if (this.casesMarkedOnTable && this.casesMarkedOnTable.length > 0) {
      let tempVarId = this.casesMarkedOnTable[0];
      enableInvestigationButton = true;
      for (let variant of this.casesMarkedOnTable) {
        if (variant != tempVarId) {
          enableInvestigationButton = false;
        }
      }
      if (enableInvestigationButton) {
        this.variantMarkedOnTable = this.casesMarkedOnTable[0];
      }
    }
    this.createInvestigationEnabled = enableInvestigationButton;

  }

  // Function to get an array of elements from a SF marking
  // TODO: Move to library
  private getElementsFromMarking(markObject, tableName, markingName, elementName) {
    let re = [];
    if (markObject[markingName]) {
      if (markObject[markingName][tableName]) {
        if (markObject[markingName][tableName][elementName]) {
          re = markObject[markingName][tableName][elementName];
        }
      }
    }
    return re;
  }

  public INITIAL_CASE_DATA = {};
  //TODO: Get from config
  public customFormDefs: CustomFormDefs;
  public legacyCreators: boolean = false;
  public formsFramework: string = 'material-design';
  public formConfig: FormConfig = null;


  upDateSFComponent() {
    if (this.container) {
      this.container.clear();
    }
    const factory: ComponentFactory<SfContainerComponent> = this.resolver.resolveComponentFactory(SfContainerComponent);
    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.sfProps = this.configuration;
    this.componentRef.instance.sfServer = this.configService.config.discover.analytics.server;
    this.componentRef.instance.sfAnalysis = this.configService.config.discover.analytics.template;
    this.componentRef.instance.page = this.configService.config.discover.analytics.menuConfig[0].id;
    // TODO: Get from config
    // this.componentRef.instance.sfMarkingOn = this.markingOn;
    this.componentRef.instance.sfMarkingOn = '{"variants": ["*"]}';
    this.componentRef.instance.parameters = this.parameters;
    //TODO: Get from config
    this.componentRef.instance.sfMarkingMaxRows = 1000;
    this.componentRef.instance.markingEvent.subscribe(event => {
      this.marking(event);
    });
    this.componentRef.instance.handleErrorMessage.subscribe(_ => {
      this.analysisError = true;
    })
  }

  public ADD_REFERENCE = 'Reference added';
  public REMOVE_REFERENCE = 'Reference removed';
  public CHECK = 'Checked';
  public UNCHECK = 'Unchecked';

  handleTCMButton(event, mType: string) {
    let isReference = 0;
    let caseType = '';
    let label = '';

    if (mType == this.ADD_REFERENCE) {
      isReference = 1;
      caseType = 'reference';
      //label = 'checked';
    }

    if (mType == this.REMOVE_REFERENCE) {
      isReference = 0;
      caseType = 'reference';
      //label = 'unchecked';
    }

    if (mType == this.CHECK) {
      caseType = 'variants';
      label = 'checked';
    }

    if (mType == this.UNCHECK) {
      caseType = 'variants';
      label = 'unchecked';
    }

    // Data online items to mark as checked from selection
    //TODO: Get the state dynamically
    //TODO: Get state and ref from investigation
    const data: TCM_Message_discover_actions = {
      analysis_id: this.fullSpotfireConfig.dataSource.datasourceId,
      ids: this.uncompliantVariantsMarkedOnTableNumber,
      label: label,
      case_type: caseType,
      isReference: isReference,
      LAcase_state: 'None',
      LAcase_ref: 'None',
      timestamp: (new Date()).getTime() + ''
    };
    this.tcm.sendDiscoverActionsMessage(data, mType);
  }

  // Refreshing the screen
  refresh() {
    const d = new Date();
    const dformat = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
    this.componentRef.instance.setProp('refreshTS', dformat);
    // this.refreshEnabled = false;
  }

}
