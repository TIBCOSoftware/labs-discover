import { SettingsBrandingComponent } from '../routes/settings-branding/settings-branding.component';
import { SettingsInvestigationsComponent } from '../routes/settings-investigations/settings-investigations.component';
import { SettingsPlatformComponent } from '../routes/settings-platform/settings-platform.component';
import { SettingsAnalyticsComponent } from '../routes/settings-analytics/settings-analytics.component';
import { SettingsAddOnsComponent } from '../routes/settings-add-ons/settings-add-ons.component';
import { SettingsPlatformAnalyticsComponent } from '../routes/settings-platform-analytics/settings-platform-analytics.component';
import { SettingsPlatformEnvironmentComponent } from '../routes/settings-platform-environment/settings-platform-environment.component';
import { SettingsPlatformProcessMinerComponent } from '../routes/settings-platform-process-miner/settings-platform-process-miner.component';
import { SettingsPlatformDatabaseComponent } from '../routes/settings-platform-database/settings-platform-database.component';
import { ResetComponent } from '../routes/reset/reset.component';
import { SettingsPlatformDatetimeFormatComponent } from '../routes/settings-platform-datetime-format/settings-platform-datetime-format.component';
import {SettingsPlatformAutomapComponent} from '../routes/settings-platform-automap/settings-platform-automap.component';

export const CONFIGURATION_ROUTE_CONFIG = [
  {
    path: 'branding',
    component: SettingsBrandingComponent
  },
  {
    path: 'analytics',
    component: SettingsAnalyticsComponent
  },
  {
    path: 'investigations',
    component: SettingsInvestigationsComponent
  },
  {
    path: 'platform-general',
    component: SettingsPlatformComponent
  },
  {
    path: 'platform-analytics',
    component: SettingsPlatformAnalyticsComponent
  },
  {
    path: 'platform-orchestration',
    component: SettingsPlatformEnvironmentComponent
  },
  {
    path: 'platform-process-mining',
    component: SettingsPlatformProcessMinerComponent
  },
  {
    path: 'platform-dates-and-times',
    component: SettingsPlatformDatetimeFormatComponent
  },
  {
    path: 'platform-auto-map',
    component: SettingsPlatformAutomapComponent
  },
  {
    path: 'platform-database',
    component: SettingsPlatformDatabaseComponent
  },
  {
    path: 'add-ons',
    component: SettingsAddOnsComponent
  },
  {
    path: 'reset',
    component: ResetComponent
  },
  {
    path: '**',
    redirectTo: '/discover/settings/branding'
  }
];

export const CONFIGURATION_PROVIDERS = [
];
