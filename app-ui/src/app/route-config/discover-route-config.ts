import { ProcessAnalysisComponent } from '../routes/process-analysis/process-analysis.component';
import { AnalyticsComponent } from '../routes/analytics/analytics.component';
import { SettingsComponent } from '../routes/settings/settings.component';
import { CasesComponent } from '../routes/cases/cases.component';
import { DataComponent } from '../routes/data/data.component';
import { CONFIGURATION_ROUTE_CONFIG, CONFIGURATION_PROVIDERS } from './configuration-route-config';
import { AccessGuard } from '../guards/access.guard';

export const DISCOVER_ROUTE_CONFIG = [
  {
    path: "process-analysis",
    component: ProcessAnalysisComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: "analytics",
    component: AnalyticsComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: "cases",
    component: CasesComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: "data",
    component: DataComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [
      AccessGuard
    ],
    children: CONFIGURATION_ROUTE_CONFIG
  }
];

export const DISCOVER_PROVIDERS = [
  CONFIGURATION_PROVIDERS
]
