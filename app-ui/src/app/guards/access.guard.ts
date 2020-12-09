import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Group, TcAppDefinitionService} from '@tibco-tcstk/tc-liveapps-lib';

@Injectable({
  providedIn: 'root'
})

export class AccessGuard implements CanActivate {

  REQUIRED_GROUP = 'Discover Users';

  constructor(protected appDefinitionService: TcAppDefinitionService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      const index = this.appDefinitionService.usersGroups.findIndex((grp: Group) => {
          return this.REQUIRED_GROUP.toLowerCase() === grp.name.toLowerCase();
        }
      );
      if (index && index !== -1) {
        return true;
      } else {
        console.error('Logged in user is NOT a member of the required Live Apps group ', this.REQUIRED_GROUP);
        const errCode = 'NO_ACCESS';
        const errMessage = 'You must be a member of ' + this.REQUIRED_GROUP + ' to access this application';
        this.router.navigate(['/errorHandler/' + errCode + '/' + errMessage]);
        return false;
      }
  }

}
