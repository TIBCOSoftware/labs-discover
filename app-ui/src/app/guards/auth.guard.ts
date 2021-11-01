// This guard will redirect to login screen when not authenticated against TIBCO Discover.
// It is really just for dev as when on Tibco Cloud - Tibco cloud handles expiry/login redirection.
// Also when using oauth this isnt relevant as the oauth token obtained handled from outside the app.

// session is detected if API called in last 30 mins (checks local sessionTimestamp)
// alternative way to achieve this would be to make an API call - eg) live apps claims call

// NOTE: assumes the login route is /login

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CredentialsService } from '@tibco-tcstk/tc-liveapps-lib';
import { ConfigurationService } from '../service/configuration.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private TIBCO_CLOUD_DOMAIN = 'cloud.tibco.com';
  private TIBCO_TEST_DOMAIN = 'tenant-integration.tcie.pro';
  private TIBCO_DEV_DOMAIN = 'emea.tibco.com';

  constructor(
    private router: Router, 
    protected credentialsService: CredentialsService, 
    protected configurationService: ConfigurationService,
    protected discoverConfigService: ConfigurationService
  ) { }

  redirectLogin(state: RouterStateSnapshot): boolean {
    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
    return false;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // check if we are hosted on tibco.cloud.com
    if (this.credentialsService.isCloud()) {
      // delegate handling login/auth to Tibco Cloud since WRP resources are protected anyway
      return true;
    }
    if (this.credentialsService.isOauth()) {
      // oauth mode
      if (this.configurationService.config.user) {
        return true;
      } else {
        // something wrong - invalid oauth key?
        console.warn('Auth guard| Oauth configured but no user information is available in Discover Configuration service.');
        return this.redirectLogin(state);
      }
    }
    if (this.credentialsService.isCookies()) {
      // cookies mode
      if (this.configurationService.config.user) {
        return true;
      } else {
        // assume no cookies - redirect to login
        console.warn('Auth guard| cookies mode but no claims - redirecting to login');
        return this.redirectLogin(state);
      }
    }
    // fallback - refuse access
    console.warn('Auth guard| fallback - redirecting to login');
    return this.redirectLogin(state);
  }
}
