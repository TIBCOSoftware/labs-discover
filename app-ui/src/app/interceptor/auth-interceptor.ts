/**
 * @ngdoc component
 * @name AuthInterceptor
 *
 * @description
 *
 * This interceptor will intercept http calls and add the TSC oauth header
 * Token comes from the oauth config service
 *
 */

import {Inject, Injectable} from '@angular/core';
import {HttpRequest, HttpInterceptor, HttpHandler, HttpErrorResponse} from '@angular/common/http';
import {OauthService} from '../service/oauth.service';
import { catchError, filter, switchAll, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, from, throwError } from 'rxjs';
import { exit } from 'process';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private oauthService: OauthService) {
  }

  private isInterceptedUrl(url: string): boolean {
    url = url.toLowerCase();
    if (url.includes('/idm/v1/oauth2/token')) { return false};
    if (url.includes('/tsc-ws/v2/whoami')) { return false};
    if (url.startsWith('/')) { return true };
    if (url.startsWith('https://account.cloud.tibco.com')) { return true };
    if (url.startsWith('https://eu.account.cloud.tibco.com')) { return true };
    if (url.startsWith('https://au.account.cloud.tibco.com')) { return true };
    if (url.startsWith('https://metadata.cloud.tibco.com')) { return true };
    if (url.startsWith('https://eu.metadata.cloud.tibco.com')) { return true };
    if (url.startsWith('https://au.metadata.cloud.tibco.com')) { return true };
    if (url.startsWith('https://spotfire-next.cloud.tibco.com')) { return true };
    if (url.startsWith('https://eu.spotfire-next.cloud.tibco.com')) { return true };
    if (url.startsWith('https://au.spotfire-next.cloud.tibco.com')) { return true };
    if (url.startsWith('https://eu-west-1.integration.cloud.tibcoapps.com')) { return true };
    if (url.startsWith('https://api.labs.tibcocloud.com')) { return true };
    if (url.startsWith('https://discover.labs.tibcocloud.com')) { return true };
    if (url.startsWith('https://discover.cloud.tibco.com')) { return true };
  };

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let request: HttpRequest<any>;

    if (!req.headers.has('Authorization') && this.oauthService && this.oauthService.token !== undefined && this.isInterceptedUrl(req.url)) {
      // add auth header with bearer token
      const header = { Authorization: 'Bearer ' + this.oauthService.token };
      request = req.clone(
        { setHeaders: header }
      );
    } else {
      // don't add auth header
      request = req.clone();
    }
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.oauthService.getToken(this.oauthService.authkeys.refreshToken).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && (error.status === 400 || error.status === 401)) {
            // can't refresh token - redirect auth
            this.isRefreshing = false;
            console.error("can't refresh token - redirect to login");
            this.oauthService.setKey(undefined);
            return from(this.oauthService.redirectLogin()).pipe(
              done => {
                exit();
              }
            )
          } else {
            return throwError(error);
          }
        }),
        switchMap((token) => {
          this.isRefreshing = false;
          if (this.oauthService && this.oauthService.token !== undefined && this.isInterceptedUrl(request.url)) {
            // replace auth header with bearer token
            const header = { Authorization: 'Bearer ' + this.oauthService.token };
            request = request.clone(
              { setHeaders: header }
            );
          }
          this.refreshTokenSubject.next(token);
          return next.handle(request);
        }));
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(request);
        })
      );
    }
  }
}
