import {Component, OnInit} from '@angular/core';
import { GeneralConfig } from '@tibco-tcstk/tc-core-lib';
import { Title } from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { ConfigurationService } from './service/configuration.service';
import {CredentialsService, TcAppDefinitionService} from '@tibco-tcstk/tc-liveapps-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public disableTimeout = false;
  public isLogin = false;

  constructor(private titleService: Title, private router: Router, private configService: ConfigurationService, protected credentialsService: CredentialsService) {
    router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        if (evt?.url.startsWith('/login') || evt?.url.startsWith('/login-oauth')) {
          this.isLogin = true;
        } else {
          this.isLogin = false;
        }
      }
    })
  }

  ngOnInit() {
    if (this.credentialsService.isCloud()) {
      this.disableTimeout = false;
    } else {
      this.disableTimeout = true;
    }
    if (this.config){
      this.titleService.setTitle(this.config.applicationTitle);
    }
  }

  get config(): GeneralConfig {
    return this.configService?.config?.discover?.general;
  }

}
