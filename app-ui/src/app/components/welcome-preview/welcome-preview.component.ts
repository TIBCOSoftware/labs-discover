import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { ActionButtonConfig, LandingPageConfig } from '@tibco-tcstk/tc-liveapps-lib';
import { cloneDeep } from 'lodash-es';
import { ConfigurationService } from 'src/app/service/configuration.service';

@Component({
  templateUrl: './welcome-preview.component.html',
  styleUrls: ['./welcome-preview.component.css']
})
export class WelcomePreviewComponent implements OnInit {

  public landingPage: LandingPageConfig;

  constructor(
    public dialogRef: MatDialogRef<WelcomePreviewComponent>,
    protected configService: ConfigurationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.landingPage = cloneDeep(this.data);
    this.landingPage.backgroundURL =  '/webresource/orgFolders/' + this.configService.config.uiAppId + '_assets/' +  this.landingPage.backgroundURL;
    this.landingPage.highlights = this.landingPage.highlights.map(highlight => {
      highlight.iconURL = '/webresource/orgFolders/' + this.configService.config.uiAppId + '_assets/' +  highlight.iconURL;
      return highlight;
    });
    this.landingPage.actionButton = [
      new ActionButtonConfig().deserialize({
        text: 'Get started',
        route: this.landingPage.homeRoute
      }
      )
    ];


  }

}
