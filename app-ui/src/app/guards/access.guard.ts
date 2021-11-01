import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { ConfigurationService } from '../service/configuration.service';

@Injectable({
  providedIn: 'root'
})

export class AccessGuard implements CanActivate {

  constructor(
    protected configService: ConfigurationService,
    private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if (this.configService.config.user.isUser) {
        const isAnalyst = this.configService.config.user.isAnalyst; 
        const isResolver = this.configService.config.user.isResolver;
        const isAdmin = this.configService.config.user.isAdmin;
        let requiredRole: string;
        let output: boolean;
        switch (state.url.split('/')[2]){
          case 'process-analysis':
          case 'analytics':
            requiredRole = 'Discover Analysts';
            output = isAnalyst;
            break;
          case 'cases':
            requiredRole = 'Discover Analyists or Discover Case Resolvers';
            output = isAnalyst || isResolver;
            break;
          case 'data':
            requiredRole = 'Discover Analysts';
            output = isAnalyst
            break;
          case 'dataset':
            requiredRole = 'Discover Analysts';
            output = isAnalyst
            break;
          case 'settings':
            requiredRole = 'Discover Admins';
            output = isAdmin;
            break;
          default:
            output = true;
        }

        if (!output){
          console.error('Logged in user is NOT a member of the required Live Apps group ', requiredRole);
          const errCode = 'NO_ACCESS';
          const errMessage = 'You must be a member of ' + requiredRole + ' to access this application';
          this.router.navigate(['/errorHandler/' + errCode + '/' + errMessage]);
        }

        return output;
      } else {
        console.error('Logged in user does NOT have the required role Discover User');
        const errCode = 'NO_ACCESS';
        const errMessage = 'You must have the Discover User role to access this application';
        this.router.navigate(['/errorHandler/' + errCode + '/' + errMessage]);
        return false;
      }
  }

}
