import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ActionButtonConfig, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {LandingPageConfig} from '@tibco-tcstk/tc-liveapps-lib';
import {cloneDeep} from 'lodash-es';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { OauthService } from 'src/app/service/oauth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  landingPage: LandingPageConfig;
  public ready: boolean = false;

  constructor(
    private router: Router, 
    private configService: ConfigurationService, 
    protected oauthService: OauthService
  ) {
  }

  private async fetchWithAuthentication(url, authToken) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ` + authToken);
    const file = await fetch(url, { headers });
    const blob = await file.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
    // return fetch(url, { headers });
  }

  async ngOnInit(): Promise<void> {
    this.landingPage = cloneDeep(this.configService.config.discover.landingPage);

    const imageUrl = environment.apiURL + '/configuration/assets/' + this.landingPage.backgroundURL;
    this.landingPage.backgroundURL = await this.fetchWithAuthentication(imageUrl, this.oauthService.token);
    this.landingPage.highlights = await Promise.all(this.landingPage.highlights.map(async highlight => {
      highlight.iconURL = await this.fetchWithAuthentication(environment.apiURL + '/configuration/assets/' + highlight.iconURL, this.oauthService.token);
      return highlight;
    }));
    this.landingPage.actionButton = [
      new ActionButtonConfig().deserialize({
          text: 'Get started',
          route: this.landingPage.homeRoute
        }
      )
    ];
    this.ready = true;
  }

  getStarted() {
    this.router.navigate(['/discover/process-analysis']);
  }

}
