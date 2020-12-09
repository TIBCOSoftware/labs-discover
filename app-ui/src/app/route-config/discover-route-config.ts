import { ProcessAnalysisComponent } from '../routes/process-analysis/process-analysis.component';
import { AnalyticsComponent } from '../routes/analytics/analytics.component';
import { SettingsComponent } from '../routes/settings/settings.component';
import { CasesComponent } from '../routes/cases/cases.component';
import { DataComponent } from '../routes/data/data.component';
import { CONFIGURATION_ROUTE_CONFIG, CONFIGURATION_PROVIDERS } from './configuration-route-config';

export const DISCOVER_ROUTE_CONFIG = [
  {
    path: "process-analysis",
    component: ProcessAnalysisComponent
    // canActivate: [SelectedRoleGuard],
  },
  {
    path: "analytics",
    component: AnalyticsComponent
    // canActivate: [SelectedRoleGuard],
  },
  {
    path: "cases",
    component: CasesComponent
    // canActivate: [SelectedRoleGuard],
  },
  {
    path: "data",
    component: DataComponent
    // canActivate: [SelectedRoleGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    // canActivate: [
    //   AuthGuard
    //   // RoleGuard
    // ],
    children: CONFIGURATION_ROUTE_CONFIG
  },
  {
    path: '**',
    redirectTo: '/discover/process-analysis'
  }
];

export const DISCOVER_PROVIDERS = [
  CONFIGURATION_PROVIDERS
]
