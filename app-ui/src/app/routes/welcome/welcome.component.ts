import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ActionButtonConfig, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {LandingPageConfig} from '@tibco-tcstk/tc-liveapps-lib';
import {cloneDeep} from 'lodash-es';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  landingPage: LandingPageConfig;
  private CLOUD_STARTER_DESCRIPTOR = 'assets/cloudstarter.json';
  public version: string;

  constructor(private router: Router, private configService: ConfigurationService, private http: HttpClient, private location: Location) {
  }

  ngOnInit(): void {
    this.http.get(TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, this.CLOUD_STARTER_DESCRIPTOR)).subscribe((csDescriptor: any) => {
      this.version = 'Version: ' + csDescriptor.cloudstarter.version + ' Build Date: ' + csDescriptor.cloudstarter.build_date;
    });
    this.landingPage = cloneDeep(this.configService.config.discover.landingPage);
    this.landingPage.backgroundURL = '/webresource/orgFolders/' + this.configService.config.uiAppId + '_assets/' + this.landingPage.backgroundURL;
    this.landingPage.highlights = this.landingPage.highlights.map(highlight => {
      highlight.iconURL = '/webresource/orgFolders/' + this.configService.config.uiAppId + '_assets/' + highlight.iconURL;
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

  getStarted() {
    this.router.navigate(['/discover/process-analysis']);
  }

}
