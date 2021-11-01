import { ProcessAnalysisComponent } from '../routes/process-analysis/process-analysis.component';
import { AnalyticsComponent } from '../routes/analytics/analytics.component';
import { CasesComponent } from '../routes/cases/cases.component';
import { ADMIN_ROUTE_CONFIG, ADMIN_PROVIDERS } from './admin-route-config';
import { AccessGuard } from '../guards/access.guard';
import { DatasetComponent } from '../routes/dataset/dataset.component';
import { AnalyticsTemplatesComponent } from '../components/analytics-templates/analytics-templates.component';
import { NewAnalysisComponent } from '../routes/new-analysis/new-analysis.component';
import { TemplateManageComponent } from '../routes/template-manage/template-manage.component';
import { TemplateSelectComponent } from '../routes/template-select/template-select.component';
import { AdminComponent } from '../routes/admin/admin.component';
import { TemplateEditorComponent } from '../routes/template-editor/template-editor.component';
import { FileManageComponent } from "../routes/file-manage/file-manage.component";

export const DISCOVER_ROUTE_CONFIG = [
  {
    path: 'process-analysis',
    component: ProcessAnalysisComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'new-analysis',
    component: NewAnalysisComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'edit-analysis/:id',
    component: NewAnalysisComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'templates',
    component: TemplateManageComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'files',
    component: FileManageComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'select-template/:name',
    component: TemplateSelectComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'new-template',
    component: TemplateEditorComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'edit-template/:name',
    component: TemplateEditorComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'analytic-templates',
    component: AnalyticsTemplatesComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'analytics/:id',
    component: AnalyticsComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'cases',
    component: CasesComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'dataset',
    component: DatasetComponent,
    canActivate: [
      AccessGuard
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [
      AccessGuard
    ],
    children: ADMIN_ROUTE_CONFIG
  }
];

export const DISCOVER_PROVIDERS = [
  ADMIN_PROVIDERS
]
