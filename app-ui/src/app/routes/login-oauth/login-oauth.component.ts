import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoginContext} from '@tibco-tcstk/tc-liveapps-lib';
import {ConfigurationService} from "../../service/configuration.service";
import {CaseCacheService} from "../../service/custom-case-cache.service";

@Component({
  selector: 'laapp-login-oauth',
  templateUrl: './login-oauth.component.html',
  styleUrls: ['./login-oauth.component.css']
})
export class LoginOauthComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, protected config: ConfigurationService, protected cCache: CaseCacheService) { }

  ngOnInit(): void {
  }

  handleCreate() {
    // tslint:disable-next-line:no-unused-expression
    window.open('https://account.cloud.tibco.com/manage/settings/oAuthTokens') || window.open('https://account.cloud.tibco.com/manage/settings/oAuthTokens');
  }

  handleSignUp() {
    // tslint:disable-next-line:no-unused-expression
    window.open('https://cloud.tibco.com/cloud-services') || window.open('https://cloud.tibco.com/cloud-services');
  }

  // handle login
  async handleLogin() {
    await this.config.refresh().then(
      () => {
        const appIds = this.config.config.discover.investigations.applications.map(
          el => {
            return el.applicationId;
          });
        this.cCache.init(this.config.config.sandboxId, appIds);
      }
    );
    // these session variables aren't used anywhere by the libraries but might be useful in an application
    sessionStorage.setItem('csdkAppLoggedIn', Date.now().toString());
    const returnUrl = this.route.snapshot.queryParams.returnUrl || '/splash';
    // redirect
    this.router.navigate([returnUrl], {queryParams: {}});
  }

  handleChangeLogin() {
    const returnUrl = this.route.snapshot.queryParams.returnUrl || '/splash';
    this.router.navigate(['/login'], {queryParams: { returnUrl }});
  }

}
