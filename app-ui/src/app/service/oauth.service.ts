import { Inject, Injectable } from '@angular/core';
import { AuthInfo, TcCoreConfigService } from '@tibco-tcstk/tc-core-lib';
import { AuthKeys, TokenResponse } from '../models_ui/oauth';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_BASE_HREF } from '@angular/common';
import { exit } from 'process';
import * as CryptoES from 'crypto-es';
import { concatMap, map } from 'rxjs/operators';
const CryptoJS = CryptoES.default;

@Injectable({
  providedIn: 'root'
})
export class OauthService {

  private TIBCO_CLOUD_DOMAIN = 'cloud.tibco.com';
  private TIBCO_TEST_DOMAIN = 'tenant-integration.tcie.pro';
  private TIBCO_DEV_DOMAIN = 'emea.tibco.com';
  private ACCOUNT_DOMAIN = '';
  private APP_URL = '';
  private DOMAIN = '';
  private CLIENTID = '';
  private SCOPE = 'securitycontext+internal.refresh-session+offline+openid+profile+email+openid+BPM+tsc+nimbus+spotfire+offline_access';
  // private SCOPE = 'securitycontext+internal.refresh-session+offline+openid+profile+email+openid+BPM+spotfire+offline_access';
  private VERIFIER;
  private MAX_TOKEN_EXPIRY_SECONDS = 1080;

  private _AUTHKEYS: AuthKeys;
  private _MODE: string;
  private _REGION: string;

  constructor(@Inject(APP_BASE_HREF) baseHref: string, private http: HttpClient, @Inject(TcCoreConfigService) protected tcCoreConfig: TcCoreConfigService) {
    const auth = this.getKey();
    this.VERIFIER = auth?.verifier;
    const host = window.location.hostname.split('.');
    if (window.location.hostname === '127.0.0.1' || (host && host.length === 1 && (host[0].toLowerCase() === 'localhost'))) {
      this._MODE = 'dev';
      if (window.location.hostname === '127.0.0.1') {
        this.APP_URL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + baseHref + 'index.html';
      } else {
        this.APP_URL = window.location.protocol + '//' + host[0] + ':' + window.location.port + baseHref + 'index.html';
      }
      this._REGION = 'eu';
    } else {
      this._MODE = 'cloud';
      this.ACCOUNT_DOMAIN = 'account.cloud.tibco.com';
      this.APP_URL = window.location.protocol + '//' + window.location.host;
      if (window.location.port) {
        this.APP_URL = this.APP_URL + ':' + window.location.port;
      }
      this.APP_URL = this.APP_URL + baseHref + 'index.html';
      if (host[0].toLowerCase() === 'eu' || host[0].toLowerCase() === 'au') {
        this._REGION = host[0].toLowerCase();
        this.ACCOUNT_DOMAIN = 'https://' + this._REGION + '.' + this.ACCOUNT_DOMAIN;
      } else {
        this._REGION = 'us';
        this.ACCOUNT_DOMAIN = 'https://' + this.ACCOUNT_DOMAIN;
      }
    }
  }

  private tokenExpiresIn(authKeys: AuthKeys): number {
    const nowEpoch: number = Math.floor(new Date().getTime() / 1000);
    return authKeys.expiry - nowEpoch;
  }

  public async initialize() {
    const headers = new HttpHeaders()
      .set('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
    return this.http.get('assets/config/clientConfig.json', {headers}).toPromise().then(
      (config: any) => {
        this.CLIENTID = config.client_id;
        if (!this.CLIENTID) {
          console.error('No client_id');
          exit();
        }
        /*
        * Check for ac params. If have one get new token
        * Check for token/refresh token, check expiry - if on cloud we have to get new one (TBC)
        * If token and it will expire soon, refresh -> done
        * If token and it is valid for > MAX -> done
        * If no token, or error call auth endpoint
        *           if cookies will redirect with ac
        *           if no cookies will redirect to login
        */
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const ac = urlParams.get('code');
        const state = urlParams.get('state');

        if (ac) {
          // get new token - save and continue
          return this.getToken(ac).toPromise().then(
            res => {
              return
            },
            error => {
              console.error('Unable to retrieve token using access code. Redirect to login', error);
              return this.redirectLogin().then(res => exit());;
            }
          );
        } else {
          // get existing token
          const authKeys = this.getKey();
          if (authKeys?.token) {
            if (this.isCloud()) {
              // if we are on cloud we could have a different oauth key so best to get a new one
              // TODO: JS confirm if there is a better way to do this by detecting if we are on same sub/userId
              return this.getTscHash().toPromise().then(
                tscHash => {
                  if (tscHash === authKeys.tscHash) {
                    // same org so we can keep using this token
                    if (this.tokenExpiresIn(authKeys) < this.MAX_TOKEN_EXPIRY_SECONDS) {
                      // get a new token
                      return this.getToken(authKeys.refreshToken).toPromise().then(
                        res => { return },
                        error => {
                          console.error('Unable to refresh token. Redirect to login', error);
                          return this.redirectLogin().then(res => exit());;
                        }
                      );
                    } else {
                      // just continue and use existing token
                      return;
                    }
                  } else {
                    // org switch
                    console.warn('token is for a different org - getting new token');
                    return this.redirectLogin().then(res => exit());
                  }
                }
              )
            } else {
              // dev mode
              // is token still valid (and expiry > MAX_TOKEN_EXPIRY_SECONDS)
              if (this.tokenExpiresIn(authKeys) < this.MAX_TOKEN_EXPIRY_SECONDS) {
                // get a new token
                return this.getToken(authKeys.refreshToken).toPromise().then(
                  res => { return },
                  error => {
                    console.error('Unable to refresh token. Redirect to login', error);
                    return this.redirectLogin().then(res => exit());;
                  }
                );
              } else {
                // just continue and use existing token
                return;
              }
            }
          } else {
            // no token try and get one. Will redirect to login if no cookies
            return this.redirectLogin().then(res => exit());;
          }
        }
      });

  }

  private strRandom(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public async redirectLogin() {
    const codeVerifier = this.strRandom(32);
    const verifierHash = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64);
    const codeChallenge =  verifierHash
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    this.setKey({verifier: codeVerifier});
    // const codeChallenge = '<TIBCO Discover codeChallenge sample string: vvx...>';
    window.location.href = this.ACCOUNT_DOMAIN + '/idm/v1/oauth2/auth?response_type=code&scope='
      + this.SCOPE + '&redirect_uri='
      + this.APP_URL + '&client_id='
      + this.CLIENTID
      + '&code_challenge=' + codeChallenge + '&code_challenge_method=S256';
  }

  getTscHash(tokenOverride?: string): Observable<string> {
    const url = '/tsc-ws/v2/whoami';
    let headers: HttpHeaders;
    if (tokenOverride) {
      // add auth header with bearer token
      headers = new HttpHeaders().set('Authorization', 'Bearer ' + tokenOverride);
    }
    return this.http.get(url, {headers: headers ? headers : undefined, withCredentials: tokenOverride ? undefined : true }).pipe(
      map((res: any) => {
        return res.hid + '-' + res.hacct + '-' + res.regn;
      })
    )
  }

  getTscWhoami(): Observable<any> {
    const url = `/tsc-ws/v2/whoami`;
    // const url = `https://${this._REGION === 'us' ? '' : (this._REGION + '.')}account.cloud.tibco.com/tsc-ws/v2/whoami`;
    return this.http.get(url);
  }

  public getToken(code: string): Observable<TokenResponse> {
    const url = this.ACCOUNT_DOMAIN + '/idm/v1/oauth2/token';
    const isAc = code.startsWith('ac.');
    const body = new HttpParams()
      .set('code', isAc ? code : undefined)
      .set('refresh_token', isAc ? undefined : code)
      .set('redirect_uri', this.APP_URL)
      .set('client_id', this.CLIENTID)
      .set('code_verifier', this.VERIFIER)
      .set('grant_type', code.startsWith('ac.') ? 'authorization_code' : 'refresh_token');

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(url, body.toString(), { headers }).pipe(
      concatMap(
        (res: TokenResponse) => {
          // use just retrieved token to get the tsc info (only dev mode) - cloud will have tsc cookie
          return this.getTscHash(res.access_token).pipe(
            map(
              hash => {
                // save token and calculate expiry
                const expiresIn: number = res.expires_in;
                const expiryEpoch = Math.floor(new Date().getTime() / 1000) + expiresIn;
                const authKeys: AuthKeys = {
                  token: res.access_token,
                  refreshToken: res.refresh_token,
                  expiry: expiryEpoch,
                  verifier: this.VERIFIER,
                  tscHash: hash
                }
                this.setKey(authKeys);
                return res;
              }
            )
          )
        }
      )
    )
  }

  public setMode(mode) {
    this._MODE = mode;
  }

  public isCloud(): boolean {
    if (this._MODE) {
      if (this._MODE.toLowerCase() === 'cloud') {
        return true;
      } else {
        return false;
      }
    } else {
      return undefined;
    }
  }

  get region(): string {
    return this._REGION;
  }

  get authkeys(): AuthKeys {
    return this._AUTHKEYS;
  }

  get mode(): string {
    return this._MODE;
  }

  get token(): string {
    return this._AUTHKEYS?.token;
  }

  getKey(): AuthKeys {
    if (this._AUTHKEYS) {
      return this._AUTHKEYS;
    } else {
      const oauthKey = localStorage.getItem(this.tcCoreConfig.getConfig().oAuthLocalStorageKey);
      this._AUTHKEYS = JSON.parse(oauthKey);
      if (!this._AUTHKEYS) {
        console.warn('No auth key in local storage');
      }
      return this._AUTHKEYS;
    }
  }

  createCookie(keys: AuthKeys) {
    // only used in dev mode with nginx proxy (to ensure TCLA calls to static resources work)
    // create a secure cookie with oauth key so a proxy can convert this to oauth token when accessing static resources
    let expires = '';
    const date = new Date();
    date.setTime(date.getTime() + (180 * 24 * 60 * 60 * 1000));
    expires = ';expires=' + date.toUTCString();
    const cookie = 'TCSTKSESSION' + '=' + (keys.token || '') + expires + ';path=/;secure;';
    document.cookie = cookie;
  }

  removeCookie() {
    document.cookie = 'TCSTKSESSION' + '=' + '; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';
  }

  setKey(keys: AuthKeys) {
    this._AUTHKEYS = keys;
    if (keys) {
      localStorage.setItem(this.tcCoreConfig.getConfig().oAuthLocalStorageKey, JSON.stringify(keys));
      if (this.mode === 'dev') {
        this.createCookie(keys);
      }
    } else {
      localStorage.removeItem(this.tcCoreConfig.getConfig().oAuthLocalStorageKey);
      if (this.mode === 'dev') {
        this.removeCookie();
      }
    }
  }
}
