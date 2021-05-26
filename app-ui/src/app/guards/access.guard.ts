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
        const isAnalyst = this.appDefinitionService.usersGroups.findIndex(element => element.name === 'Discover Analysts') > 0;
        const isResolver = this.appDefinitionService.usersGroups.findIndex(element => element.name === 'Discover Case Resolvers') > 0;
        const isAdmin = this.appDefinitionService.usersGroups.findIndex(element => element.name === 'Discover Administrators') > 0;
        console.log('***** ActivatedRoute: ', state.url);
        let requiredGroup: string;
        let output: boolean;
        switch (state.url.split('/')[2]){
          case 'process-analysis':
          case 'analytics':
            requiredGroup = 'Discover Analysts';
            output = isAnalyst;
            break;
          case 'cases':
            requiredGroup = 'Discover Analyists or Discover Case Resolvers';
            output = isAnalyst || isResolver;
            break;
          case 'data':
            requiredGroup = 'Discover Analysts';
            output = isAnalyst
            break;
          case 'dataset':
            requiredGroup = 'Discover Analysts';
            output = isAnalyst
            break;
          case 'settings':
            requiredGroup = 'Discover Admins';
            output = isAdmin;
            break;
          default:
            output = true;
        }

        if (!output){
          console.error('Logged in user is NOT a member of the required Live Apps group ', requiredGroup);
          const errCode = 'NO_ACCESS';
          const errMessage = 'You must be a member of ' + requiredGroup + ' to access this application';
          this.router.navigate(['/errorHandler/' + errCode + '/' + errMessage]);
        }

        return output;
      } else {
        console.error('Logged in user is NOT a member of the required Live Apps group ', this.REQUIRED_GROUP);
        const errCode = 'NO_ACCESS';
        const errMessage = 'You must be a member of ' + this.REQUIRED_GROUP + ' to access this application';
        this.router.navigate(['/errorHandler/' + errCode + '/' + errMessage]);
        return false;
      }
  }

}
