import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {CredentialsService} from '@tibco-tcstk/tc-liveapps-lib';

@Injectable({
  providedIn: 'root'
})
export class OfflineGuard implements CanActivate {

  constructor(protected credentialsService: CredentialsService, private router: Router) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if (this.credentialsService.isCloud()) {
        this.router.navigate(['/']);
      }
      return !this.credentialsService.isCloud();
  }

}
