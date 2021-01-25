import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import {
  TcCoreLibModule,
  TcCoreConfig,
  SessionRefreshService,
  TcCoreConfigService,
  BytesPipe
} from '@tibco-tcstk/tc-core-lib';
import {TcLiveappsLibModule, TcAppDefinitionService, CredentialsService} from '@tibco-tcstk/tc-liveapps-lib';
import { TcFormsLibModule } from '@tibco-tcstk/tc-forms-lib';
import { TcSpotfireLibModule } from '@tibco-tcstk/tc-spotfire-lib';
import { TcPrimengLibModule } from '@tibco-tcstk/tc-primeng-lib';

// PrimeNG
import { TableModule } from 'primeng/table';

// Material components
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

// AppComponents
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './routes/login/login.component';
import { WelcomeComponent } from './routes/welcome/welcome.component';
import { SettingsComponent } from './routes/settings/settings.component';
import { DiscoverComponent } from './routes/discover/discover.component';
import { ProcessAnalysisComponent } from './routes/process-analysis/process-analysis.component';
import { AnalyticsComponent } from './routes/analytics/analytics.component';
import { CasesComponent } from './routes/cases/cases.component';
import { DataComponent } from './routes/data/data.component';
import { DatePipe } from '@angular/common';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { BasicInfoComponent } from './components/new-analysis/basic-info/basic-info.component';
import { WizardComponent } from './components/new-analysis/wizard/wizard.component';
import { DatasourceComponent } from './components/new-analysis/datasource/datasource.component';
import { ParseComponent } from './components/new-analysis/parse/parse.component';
import { MapComponent } from './components/new-analysis/map/map.component';
import { DateParserComponent } from './components/new-analysis/date-parser/date-parser.component';
import { ConfirmationComponent } from './components/new-analysis/confirmation/confirmation.component';
import { DatasourceTdvComponent } from './components/new-analysis/datasource-tdv/datasource-tdv.component';
import { DatasourceCsvComponent } from './components/new-analysis/datasource-csv/datasource-csv.component';
import { ParseOptionsCsvComponent } from './components/new-analysis/parse-options-csv/parse-options-csv.component';
import { ParseOptionsTdvComponent } from './components/new-analysis/parse-options-tdv/parse-options-tdv.component';
import { ProcessAnalysisTableComponent } from './components/process-analysis-table/process-analysis-table.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { IconButtonComponent } from './components/icon-button/icon-button.component';
import { NewsBannerComponent } from './components/news-banner/news-banner.component';
import { ActionButtonBarComponent } from './components/action-button-bar/action-button-bar.component';
import { LaWrapperService } from './service/la-wrapper.service';
import { ActionDialogComponent } from './components/action-dialog/action-dialog.component';
import { SfContainerComponent } from './components/sf-container/sf-container.component';
import { ProcessAnalysisDetailsComponent } from './components/process-analysis-details/process-analysis-details.component';
import { CustomCaseTableComponent } from './components/custom-case-table/custom-case-table.component';
import { CustomCaseListComponent } from './components/custom-case-list/custom-case-list.component';
import { CustomCaseViewComponent } from './components/custom-case-view/custom-case-view.component';
import { CustomCaseDetailsComponent } from './components/custom-case-details/custom-case-details.component';
import { ConfigurationService } from './service/configuration.service';
import { CaseCacheService } from './service/custom-case-cache.service';
import { SettingsAddOnsComponent } from './routes/settings-add-ons/settings-add-ons.component';
import { SettingsAnalyticsComponent } from './routes/settings-analytics/settings-analytics.component';
import { SettingsBrandingComponent } from './routes/settings-branding/settings-branding.component';
import { SettingsInvestigationsComponent } from './routes/settings-investigations/settings-investigations.component';
import { SettingsPlatformComponent } from './routes/settings-platform/settings-platform.component';

import { CreateCaseMenuComponent } from './components/create-case-menu/create-case-menu.component';
import { FormsModule } from '@angular/forms';
import { WelcomePreviewComponent } from './components/welcome-preview/welcome-preview.component';
import { HightlighEditComponent } from './components/hightligh-edit/hightligh-edit.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { SettingsPlatformEnvironmentComponent } from './routes/settings-platform-environment/settings-platform-environment.component';
import { SettingsPlatformProcessMinerComponent } from './routes/settings-platform-process-miner/settings-platform-process-miner.component';
import { LoginOauthComponent } from './routes/login-oauth/login-oauth.component';
import { AccessGuard } from './guards/access.guard';
import { OfflineGuard } from './guards/offline.guard';
import { FileUploadService } from './service/file-upload.service';
import { UploadStatusComponent } from './components/upload-status/upload-status.component';
import { ResetComponent } from './routes/reset/reset.component';
import { SettingsPlatformAnalyticsComponent } from './routes/settings-platform-analytics/settings-platform-analytics.component';
import { SettingsPlatformDatabaseComponent } from './routes/settings-platform-database/settings-platform-database.component';
import { Router } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SettingsPlatformDatetimeFormatComponent } from './routes/settings-platform-datetime-format/settings-platform-datetime-format.component';
import {StringSimilarityService} from './service/string-similarity.service';
import { SettingsPlatformAutomapComponent } from './routes/settings-platform-automap/settings-platform-automap.component';

/** This is the tc core configuration object
 * To use oauth you must also add the OAuthInterceptor to providers
 *  Note: Only HTTP calls that start with / will have oAuth token attached
 * To use proxy you must also add the ProxyInterceptor to providers
 *  Note: Only HTTP calls that start with / will be proxied
 *  Note: Enable TCE will request cookie for TCE API calls. This will only work if using the proxy
 */
const tcCoreConfig: TcCoreConfig = {
  disableFormLibs: true,
  oAuthLocalStorageKey: 'TSC_DEV_KEY',
  proxy_url: '',
  proxy_liveapps_path: '',
  proxy_tce_path: '',
  api_key: '',
  api_key_param: 'api_key',
  enable_tce: false
}

export function servicesOnRun(config: ConfigurationService, appDefinitionService: TcAppDefinitionService, cCache: CaseCacheService) {
  return () => appDefinitionService.refresh().toPromise().then(
    () => config.refresh()
      .then(
      () => {
        if (config.config.discover){
          const appIds = config.config.discover.investigations.applications.map(
            el => {
              return el.applicationId;
            }).concat(config.config.discover.analysis.applicationId);
          if (appIds){
            cCache.init(config.config.sandboxId, appIds);
          }
        }
      }
    )
  );
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginOauthComponent,
    WelcomeComponent,
    SettingsComponent,
    DiscoverComponent,
    ProcessAnalysisComponent,
    AnalyticsComponent,
    CasesComponent,
    DataComponent,
    AnalyticsDashboardComponent,
    WizardComponent,
    BasicInfoComponent,
    DatasourceComponent,
    ParseComponent,
    MapComponent,
    DateParserComponent,
    ConfirmationComponent,
    DatasourceTdvComponent,
    DatasourceCsvComponent,
    ParseOptionsCsvComponent,
    ParseOptionsTdvComponent,
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
    CustomCaseViewComponent,
    CustomCaseDetailsComponent,
    SettingsAddOnsComponent,
    SettingsAnalyticsComponent,
    SettingsBrandingComponent,
    SettingsInvestigationsComponent,
    SettingsPlatformComponent,
    CreateCaseMenuComponent,
    WelcomePreviewComponent,
    HightlighEditComponent,
    SplashScreenComponent,
    SettingsPlatformEnvironmentComponent,
    SettingsPlatformProcessMinerComponent,
    UploadStatusComponent,
    ResetComponent,
    SettingsPlatformAnalyticsComponent,
    SettingsPlatformDatabaseComponent,
    SettingsPlatformDatetimeFormatComponent,
    SettingsPlatformAutomapComponent
  ],
    imports: [
        AppRoutingModule,
        TcCoreLibModule.forRoot(tcCoreConfig),
        TcFormsLibModule,
        TcLiveappsLibModule.forRoot(),
        BrowserModule,
        BrowserAnimationsModule,
        MatIconModule, MatMenuModule, MatDialogModule, FlexModule, MatCardModule, MatTooltipModule,
        TableModule,
        TcSpotfireLibModule,
        TcPrimengLibModule,
        FormsModule,
        MatProgressSpinnerModule, MatToolbarModule,
        ScrollingModule

    ],
  entryComponents: [ActionDialogComponent],
  providers: [
    BytesPipe,
    DatePipe,
    // for using oAuth
    /*{ provide: HTTP_INTERCEPTORS, useClass: OAuthInterceptor, multi: true },*/
    LaWrapperService,
    ConfigurationService,
    TcAppDefinitionService,
    FileUploadService,
    CaseCacheService,
    {
      provide: APP_INITIALIZER,
      useFactory: servicesOnRun,
      multi: true,
      deps: [ConfigurationService, TcAppDefinitionService, CaseCacheService]
    },
    AccessGuard,
    OfflineGuard,
    StringSimilarityService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(public sessionRefreshService: SessionRefreshService,
    public tcConfigService: TcCoreConfigService,
    private credentialsService: CredentialsService,
    public router: Router) {
    // note: if oauth in use then no need since key will be refreshed in local storage by session manager app
    if (!credentialsService.isOauth()) {
      // setup cookie refresh for every 10 minutes
      const usingProxy = (this.tcConfigService.getConfig().proxy_url && this.tcConfigService.getConfig().proxy_url !== '') ? true : false;
      this.sessionRefreshService.scheduleCookieRefresh(600000, usingProxy);
    }
  }
}
