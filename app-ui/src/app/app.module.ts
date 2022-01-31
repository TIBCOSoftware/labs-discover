import {CommonModule, DecimalPipe} from '@angular/common';
import {BrowserModule, DomSanitizer} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER} from '@angular/core';
import {
  TcCoreLibModule,
  TcCoreConfig,
  SessionRefreshService,
  TcCoreConfigService,
  BytesPipe
} from '@tibco-tcstk/tc-core-lib';
import {TcLiveappsLibModule, TcLiveappsConfig, TcAppDefinitionService} from '@tibco-tcstk/tc-liveapps-lib';
import {TcFormsLibModule} from '@tibco-tcstk/tc-forms-lib';
import {TcSpotfireLibModule} from '@tibco-tcstk/tc-spotfire-lib';
import {TcPrimengLibModule} from '@tibco-tcstk/tc-primeng-lib';
import {OauthService} from './service/oauth.service';


// openapi-generator-cli autogenerated code
import {Configuration, ConfigurationParameters} from './backend/configuration';
import {ApiModule} from './backend/api.module';

// PrimeNG
import {TableModule} from 'primeng/table';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressBarModule} from 'primeng/progressbar';

// Material components
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {FlexModule} from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatExpansionModule} from '@angular/material/expansion';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatSidenavModule} from '@angular/material/sidenav';
import {OverlayModule} from '@angular/cdk/overlay'

// AppComponents
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './routes/login/login.component';
import {WelcomeComponent} from './routes/welcome/welcome.component';
import {DiscoverComponent} from './routes/discover/discover.component';
import {ProcessAnalysisComponent} from './routes/process-analysis/process-analysis.component';
import {AnalyticsComponent} from './routes/analytics/analytics.component';
import {CasesComponent} from './routes/cases/cases.component';
import {DatasetComponent} from './routes/dataset/dataset.component';
import {APP_BASE_HREF, DatePipe, PlatformLocation} from '@angular/common';
import {AnalyticsDashboardComponent} from './components/analytics-dashboard/analytics-dashboard.component';
import {BasicInfoComponent} from './components/new-analysis/basic-info/basic-info.component';
import {MapComponent} from './components/new-analysis/map/map.component';
import {ConfirmationComponent} from './components/new-analysis/confirmation/confirmation.component';
import {ProcessAnalysisTableComponent} from './components/process-analysis-table/process-analysis-table.component';
import {ToolBarComponent} from './components/tool-bar/tool-bar.component';
import {IconButtonComponent} from './components/icon-button/icon-button.component';
import {NewsBannerComponent} from './components/news-banner/news-banner.component';
import {ActionButtonBarComponent} from './components/action-button-bar/action-button-bar.component';
import {ActionDialogComponent} from './components/action-dialog/action-dialog.component';
import {SfContainerComponent} from './components/sf-container/sf-container.component';
import {ProcessAnalysisDetailsComponent} from './components/process-analysis-details/process-analysis-details.component';
import {CustomCaseTableComponent} from './components/custom-case-table/custom-case-table.component';
import {CustomCaseListComponent} from './components/custom-case-list/custom-case-list.component';
import {CustomCaseDetailsComponent} from './components/custom-case-details/custom-case-details.component';
import {ConfigurationService} from './service/configuration.service';
import {SettingsBrandingComponent} from './routes/settings-branding/settings-branding.component';
import {SettingsInvestigationsComponent} from './routes/settings-investigations/settings-investigations.component';
import {CreateCaseMenuComponent} from './components/create-case-menu/create-case-menu.component';
import {FormsModule} from '@angular/forms';
import {WelcomePreviewComponent} from './components/welcome-preview/welcome-preview.component';
import {HightlighEditComponent} from './components/hightligh-edit/hightligh-edit.component';
import {SplashScreenComponent} from './components/splash-screen/splash-screen.component';
import {LoginOauthComponent} from './routes/login-oauth/login-oauth.component';
import {AccessGuard} from './guards/access.guard';
import {OfflineGuard} from './guards/offline.guard';
import {FileUploadService} from './service/file-upload.service';
import {UploadStatusComponent} from './components/upload-status/upload-status.component';
import {Router} from '@angular/router';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {NewDatasetWizardComponent} from './components/new-dataset/wizard/wizard.component';
import {NewDatasetBasicInfoComponent} from './components/new-dataset/basic-info/basic-info.component';
import {NewDatasetDatasourceComponent} from './components/new-dataset/datasource/datasource.component';
import {NewDatasetParseComponent} from './components/new-dataset/parse/parse.component';
import {CsvUploadComponent} from './components/new-dataset/csv-upload/csv-upload.component';
import {TdvListComponent} from './components/new-dataset/tdv-list/tdv-list.component';
import {DatasetParseCsvComponent} from './components/new-dataset/parse-csv/parse-csv.component';
import {NewDatasetAttributesComponent} from './components/new-dataset/attributes/attributes.component';
import {NewDatesetDateParserComponent} from './components/new-dataset/date-parser/date-parser.component';
import {NewDatasetConfirmationComponent} from './components/new-dataset/confirmation/confirmation.component';
import {CaseStateEditComponent} from './components/case-state-edit/case-state-edit.component'
import {YesnoConfirmationComponent} from './components/yesno-confirmation/yesno-confirmation.component';

import {AutoMappingService} from './service/auto-mapping.service';
import {SettingsAutomapComponent} from './routes/settings-automap/settings-automap.component';
import {AnalyticsTemplatesComponent} from './components/analytics-templates/analytics-templates.component';
import {AnalyticCardComponent} from './components/analytic-card/analytic-card.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './interceptor/auth-interceptor';
import {SelectDatasetComponent} from './components/new-analysis/select-dataset/select-dataset.component';
import {DataPreviewComponent} from './components/new-analysis/data-preview/data-preview.component';
import {SchedulerComponent} from './components/new-analysis/scheduler/scheduler.component';
import {MapPanelComponent} from './components/new-analysis/map-panel/map-panel.component';
import {NewAnalysisComponent} from './routes/new-analysis/new-analysis.component';
import {TemplateCardComponent} from './components/templates/template-card/template-card.component';
import {TemplateManageComponent} from './routes/template-manage/template-manage.component';
import {ListTemplatesComponent} from './components/templates/list-templates/list-templates.component';
import {TemplateSelectComponent} from './routes/template-select/template-select.component';
import {NoFormComponent} from './components/forms/no-form/no-form.component';
import {AdminComponent} from './routes/admin/admin.component';
import {TemplateEditorComponent} from './routes/template-editor/template-editor.component';
import {TemplateBasicInfoComponent} from './components/templates/template-basic-info/template-basic-info.component';
import {TemplateAnalyticsMenuConfigurationComponent} from './components/templates/template-analytics-menu-configuration/template-analytics-menu-configuration.component';
import {SpotfireViewerModule} from '@tibco/spotfire-wrapper';
import {TemplateAnalyticsMenuDragdropComponent} from './components/templates/template-analytics-menu-dragdrop/template-analytics-menu-dragdrop.component';
import {TemplateEditMenuPopupComponent} from './components/templates/template-edit-menu-popup/template-edit-menu-popup.component';
import {TemplateConfirmationComponent} from './components/templates/template-confirmation/template-confirmation.component';
import {IconGridComponent} from './components/icon-grid/icon-grid.component';
import {TemplateAdvancedComponent} from './components/templates/template-advanced/template-advanced.component';
import {TemplateAnalyticsComponent} from './components/templates/template-analytics/template-analytics.component';
import {TemplateAnalyticPreviewComponent} from './components/templates/template-analytic-preview/template-analytic-preview.component';
import {TemplateMarkingSelectorComponent} from './components/templates/template-marking-selector/template-marking-selector.component';
import {ActivitiesPipe} from './pipes/activities.pipe';
import {RelativeTimePipe} from './pipes/relative-time.pipe';
import {environment} from 'src/environments/environment';
import {ProgressScreenComponent} from './components/progress-screen/progress-screen.component';
import {MiniProgressBarComponent} from './components/mini-progress-bar/mini-progress-bar.component';
import {CsvListComponent} from './components/new-dataset/csv-list/csv-list.component';

import {CsvFilesizePipe} from './components/new-dataset/csv-list/csvfilesize.pipe';
import {DragDropFieldsListComponent} from './routes/settings-investigations/drag-drop-fields-list/drag-drop-fields-list.component';
import {EditFieldComponent} from './routes/settings-investigations/edit-field/edit-field.component';
import {ResizableDraggableComponent} from './components/resizable-draggable/resizable-draggable.component';
import {SfFilterPanelComponent} from './components/sf-filter-panel/sf-filter-panel.component';
import {TemplateAnalyticsFiltersComponent} from './components/templates/template-analytics-filters/template-analytics-filters.component';
import {ErrorDetailsComponent} from './components/error-details/error-details.component';
import {FileManageComponent} from './routes/file-manage/file-manage.component';
import { DatasetDetailsComponent } from './components/dataset-details/dataset-details.component';
import { CsvUploadButtonComponent } from './components/new-dataset/csv-upload-button/csv-upload-button.component';
import { HelpContainerComponent } from './components/help-container/help-container.component';
import { ProcessAnalysisCompareComponent } from './components/process-analysis-compare/process-analysis-compare.component';
import { MetricComparisonComponent } from './components/metric-comparison/metric-comparison.component';

import { NgChartsModule} from 'ng2-charts';
import { DialogModule } from 'primeng/dialog';
import { AuthGuard } from './guards/auth.guard';
import { UploadFileDialogComponent } from './components/upload-file-dialog/upload-file-dialog.component';
import { ProcessAnalysisMoreinfoComponent } from './components/process-analysis-moreinfo/process-analysis-moreinfo.component';
import { DataPreviewTableComponent } from './components/data-preview-table/data-preview-table.component';

import {NewProcessDocumentWizardComponent} from './components/new-process-document/wizard/wizard.component';
import {NewProcessDocumentBasicInfoComponent} from './components/new-process-document/basic-info/basic-info.component';
import {NewProcessDocumentLocationComponent} from './components/new-process-document/document-location/document-location.component';
import {NewProcessDocumentConfirmationComponent} from './components/new-process-document/confirmation/confirmation.component';

/** This is the tc core configuration object
 * To use oauth you must also add the OAuthInterceptor to providers
 *  Note: Only HTTP calls that start with / will have oAuth token attached
 * To use proxy you must also add the ProxyInterceptor to providers
 *  Note: Only HTTP calls that start with / will be proxied
 *  Note: Enable TCE will request cookie for TCE API calls. This will only work if using the proxy
 */
const tcCoreConfig: TcCoreConfig = {
  disableFormLibs: false,
  oAuthLocalStorageKey: 'TSC_DISCOVERUI_KEY',
  proxy_url: '',
  proxy_liveapps_path: '',
  proxy_tce_path: '',
  api_key: '',
  api_key_param: 'api_key',
  enable_tce: false
}


// can be used to defer initialization of TcAppDefService
const tcLiveappsConfig: TcLiveappsConfig = {
  defer: true
}

export function servicesOnRun(oauthService: OauthService, config: ConfigurationService, appDefinitionService) {
  return () => oauthService.initialize().then(
      () => config.refresh().then(
        () => appDefinitionService.loadFormResources()
      )
  );
}

const configurationProvider = () => {
  const configurationParams: ConfigurationParameters = {
    withCredentials: true,
    basePath: environment.apiURL
  };
  return new Configuration(configurationParams);
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginOauthComponent,
    WelcomeComponent,
    DiscoverComponent,
    ProcessAnalysisComponent,
    AnalyticsComponent,
    CasesComponent,
    DatasetComponent,
    NewDatasetWizardComponent,
    NewDatasetBasicInfoComponent,
    NewDatasetDatasourceComponent,
    NewDatasetParseComponent,
    NewDatesetDateParserComponent,
    CsvUploadComponent,
    TdvListComponent,
    DatasetParseCsvComponent,
    NewDatasetAttributesComponent,
    NewDatasetConfirmationComponent,
    AnalyticsDashboardComponent,
    BasicInfoComponent,
    MapComponent,
    ConfirmationComponent,
    ProcessAnalysisTableComponent,
    ToolBarComponent,
    IconButtonComponent,
    NewsBannerComponent,
    ActionButtonBarComponent,
    ActionDialogComponent,
    SfContainerComponent,
    ProcessAnalysisDetailsComponent,
    CustomCaseTableComponent,
    CustomCaseListComponent,
    CustomCaseDetailsComponent,
    SettingsBrandingComponent,
    SettingsInvestigationsComponent,
    CreateCaseMenuComponent,
    WelcomePreviewComponent,
    HightlighEditComponent,
    SplashScreenComponent,
    UploadStatusComponent,
    SettingsAutomapComponent,
    AnalyticsTemplatesComponent,
    AnalyticCardComponent,
    SelectDatasetComponent,
    DataPreviewComponent,
    SchedulerComponent,
    MapPanelComponent,
    NewAnalysisComponent,
    TemplateCardComponent,
    TemplateManageComponent,
    ListTemplatesComponent,
    TemplateSelectComponent,
    NoFormComponent,
    AdminComponent,
    TemplateEditorComponent,
    TemplateBasicInfoComponent,
    TemplateAnalyticsMenuConfigurationComponent,
    TemplateAnalyticsMenuDragdropComponent,
    TemplateEditMenuPopupComponent,
    TemplateConfirmationComponent,
    CaseStateEditComponent,
    YesnoConfirmationComponent,
    IconGridComponent,
    TemplateAdvancedComponent,
    TemplateAnalyticsComponent,
    TemplateAnalyticPreviewComponent,
    TemplateMarkingSelectorComponent,
    ActivitiesPipe,
    RelativeTimePipe,
    ProgressScreenComponent,
    MiniProgressBarComponent,
    CsvListComponent,
    CsvFilesizePipe,
    DragDropFieldsListComponent,
    ResizableDraggableComponent,
    SfFilterPanelComponent,
    TemplateAnalyticsFiltersComponent,
    DragDropFieldsListComponent,
    EditFieldComponent,
    ErrorDetailsComponent,
    FileManageComponent,
    DatasetDetailsComponent,
    CsvUploadButtonComponent,
    HelpContainerComponent,
    NewProcessDocumentWizardComponent,
    NewProcessDocumentBasicInfoComponent,
    NewProcessDocumentLocationComponent,
    NewProcessDocumentConfirmationComponent,
    ProcessAnalysisCompareComponent,
    MetricComparisonComponent,
    UploadFileDialogComponent,
    ProcessAnalysisMoreinfoComponent,
    DataPreviewTableComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    ApiModule,
    TcCoreLibModule.forRoot(tcCoreConfig),
    TcFormsLibModule,
    TcLiveappsLibModule.forRoot(tcLiveappsConfig),
    BrowserModule,
    BrowserAnimationsModule,
    MatIconModule, MatMenuModule, MatDialogModule, FlexModule, MatCardModule, MatTooltipModule, MatExpansionModule, DragDropModule, MatSidenavModule, OverlayModule,
    TableModule, DropdownModule, ProgressBarModule, SpotfireViewerModule,
    TcSpotfireLibModule,
    TcPrimengLibModule,
    FormsModule,
    MatProgressSpinnerModule, MatToolbarModule,
    ScrollingModule,
    NgChartsModule,
    DialogModule
  ],
  entryComponents: [ActionDialogComponent],
  providers: [
    BytesPipe,
    DatePipe,
    RelativeTimePipe,
    // for using oAuth
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    ConfigurationService,
    FileUploadService,
    DecimalPipe,
    {
      provide: APP_INITIALIZER,
      useFactory: servicesOnRun,
      multi: true,
      deps: [OauthService, ConfigurationService, TcAppDefinitionService]
    },
    AccessGuard,
    AuthGuard,
    OfflineGuard,
    AutoMappingService,
    {
      provide: APP_BASE_HREF,
      useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
      deps: [PlatformLocation]
    },
    {provide: Configuration, useFactory: configurationProvider, deps: []},
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(public sessionRefreshService: SessionRefreshService,
              public tcConfigService: TcCoreConfigService,
              private oauthService: OauthService,
              public router: Router,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) {

    // register icons
    this.matIconRegistry.addSvgIconLiteral(
      'tcs-plus-icon',
      this.domSanitizer.bypassSecurityTrustHtml('<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
        '    <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n' +
        '        <g id="Foundations/system-icon/ic_add" transform="translate(-2.000000, -2.000000)" fill="#727272">\n' +
        '            <path class="tcs-plus-icon" d="M20.6845201,13.3154056 L13.3156532,13.3154056 L13.3156532,20.6842724 C13.3156532,21.0211304 13.1872509,21.3579884 12.9304463,21.614793 C12.4168369,22.1284023 11.5830144,22.1284023 11.0694051,21.614793 C10.8129968,21.3583847 10.6841981,21.0211304 10.6845944,20.6838761 L10.6845944,13.3158019 L3.31612385,13.3154056 C2.97886959,13.3158019 2.64201164,13.1873995 2.38520698,12.9305949 C1.87159767,12.4169856 1.87159767,11.5831631 2.38520698,11.0695537 C2.64201164,10.8127491 2.97886959,10.6843468 3.31572755,10.6843468 L10.6845944,10.6843468 L10.6845944,3.31547987 C10.6845944,2.97862192 10.8126005,2.64216026 11.0694051,2.38535561 C11.5834107,1.87135 12.4168369,1.8717463 12.9304463,2.38535561 C13.1872509,2.64216026 13.3156532,2.97901822 13.3156532,3.31587618 L13.3160495,10.6843468 L20.6841238,10.6843468 C21.0209818,10.6843468 21.358236,10.8131454 21.6146444,11.0695537 C22.1282537,11.5831631 22.12865,12.4165893 21.6146444,12.9305949 C21.3578397,13.1873995 21.0213781,13.3154056 20.6845201,13.3154056 Z" ></path>\n' +
        '        </g>\n' +
        '    </g>\n' +
        '</svg>')
    );

    // note: if oauth in use then no need since key will be refreshed in local storage by session manager app
    /*if (!oauthService.isOauth()) {
      // setup cookie refresh for every 10 minutes
      const usingProxy = (this.tcConfigService.getConfig().proxy_url && this.tcConfigService.getConfig().proxy_url !== '') ? true : false;
      this.sessionRefreshService.scheduleCookieRefresh(600000, usingProxy);
    }*/
  }
}
