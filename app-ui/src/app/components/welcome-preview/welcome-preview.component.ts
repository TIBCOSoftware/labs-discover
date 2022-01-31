import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { ActionButtonConfig, LandingPageConfig } from '@tibco-tcstk/tc-liveapps-lib';
import { cloneDeep } from 'lodash-es';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { OauthService } from 'src/app/service/oauth.service';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './welcome-preview.component.html',
  styleUrls: ['./welcome-preview.component.css']
})
export class WelcomePreviewComponent implements OnInit {

  public landingPage: LandingPageConfig;

  constructor(
    public dialogRef: MatDialogRef<WelcomePreviewComponent>,
    protected configService: ConfigurationService,
    protected oauthService: OauthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  private async fetchWithAuthentication(url, authToken) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ` + authToken);
    const file = await fetch(url, { headers });
    const blob = await file.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  }

  async ngOnInit(): Promise<void> {
    this.landingPage = cloneDeep(this.data);

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


  }

}
