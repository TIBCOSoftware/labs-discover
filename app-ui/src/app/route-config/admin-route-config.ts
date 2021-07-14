import { SettingsBrandingComponent } from '../routes/settings-branding/settings-branding.component';
import { SettingsInvestigationsComponent } from '../routes/settings-investigations/settings-investigations.component';
import {SettingsAutomapComponent} from '../routes/settings-automap/settings-automap.component';

export const ADMIN_ROUTE_CONFIG = [
  {
    path: 'branding',
    component: SettingsBrandingComponent
  },
  {
    path: 'investigations',
    component: SettingsInvestigationsComponent
  },
  {
    path: 'automap',
    component: SettingsAutomapComponent
  },
  {
    path: '**',
    redirectTo: '/discover/admin/branding'
  }
];

export const ADMIN_PROVIDERS = [
];
