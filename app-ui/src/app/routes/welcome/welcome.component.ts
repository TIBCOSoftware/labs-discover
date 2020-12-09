import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import { TcCoreCommonFunctions, ActionButtonConfig } from '@tibco-tcstk/tc-core-lib';
import { Location } from '@angular/common';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { LandingPageConfig } from '@tibco-tcstk/tc-liveapps-lib';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  landingPage: LandingPageConfig;

  constructor(private router: Router, protected configService: ConfigurationService) { }

  ngOnInit(): void {
    this.landingPage = cloneDeep(this.configService.config.discover.landingPage);
    this.landingPage.backgroundURL =  '/webresource/orgFolders/' + this.configService.config.uiAppId + '_assets/' +  this.landingPage.backgroundURL;
    this.landingPage.highlights = this.landingPage.highlights.map(highlight => {
      highlight.iconURL = '/webresource/orgFolders/' + this.configService.config.uiAppId + '_assets/' +  highlight.iconURL;
      return highlight;
    });
    this.landingPage.actionButton = [
      new ActionButtonConfig().deserialize({
        "text": "Get started", 
        "route": this.landingPage.homeRoute
      }
      )
    ];
  }

  getStarted(){
    this.router.navigate(['/discover']);
  }

}
