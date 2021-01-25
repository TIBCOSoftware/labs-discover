import { LoginPrefillResolver, TibcoCloudErrorComponent } from '@tibco-tcstk/tc-core-lib';
import { AuthGuard } from '@tibco-tcstk/tc-liveapps-lib';
import { LoginComponent } from '../routes/login/login.component';
import { WelcomeComponent } from '../routes/welcome/welcome.component';
import { DiscoverComponent } from '../routes/discover/discover.component';
import { LoginOauthComponent } from '../routes/login-oauth/login-oauth.component';
import { AccessGuard } from '../guards/access.guard';
import { OfflineGuard } from '../guards/offline.guard';
/*import { DiscSpotfireAuthResolver } from '../resolvers/disc-spotfire-auth.resolver';*/
import { DISCOVER_ROUTE_CONFIG, DISCOVER_PROVIDERS } from './discover-route-config';

export const CORE_ROUTES = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [
      OfflineGuard
    ],
    resolve: {
      loginPrefill: LoginPrefillResolver
    }
  },
  {
    path: 'login-oauth',
    component: LoginOauthComponent,
    canActivate: [
      OfflineGuard
    ]
  },
  {
    path: 'errorHandler/:errorCode/:errorData',
    component: TibcoCloudErrorComponent
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [
      AuthGuard,
      AccessGuard
    ]
  },
  {
    path: 'discover',
    component: DiscoverComponent,
    canActivate: [
      AuthGuard,
      AccessGuard
    ],
    resolve: {
      /*sfAuth: DiscSpotfireAuthResolver*/
    },
    children: DISCOVER_ROUTE_CONFIG
  },
  {
    path: '', redirectTo: '/welcome', pathMatch: 'full'
  },
  {
    path: '**', redirectTo: '/welcome'
  }
];

export const CORE_PROVIDERS = [
  [
    LoginPrefillResolver,
    /*DiscSpotfireAuthResolver*/
  ],
  DISCOVER_PROVIDERS
];
