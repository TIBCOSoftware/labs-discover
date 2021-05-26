import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { OauthService } from '../service/oauth.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineGuard implements CanActivate {

  constructor(protected oauthService: OauthService, private router: Router) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if (this.oauthService.isCloud()) {
        this.router.navigate(['/']);
      }
      return !this.oauthService.isCloud();
  }

}
