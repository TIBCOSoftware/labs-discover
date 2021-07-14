import {AfterViewInit, Component, OnInit} from '@angular/core';
import {GeneralConfig, NavBarConfig, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {Title} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {ConfigurationService} from './service/configuration.service';
import {OauthService} from './service/oauth.service';
import {Location} from '@angular/common';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  disableTimeout = false;
  isLogin = false;
  afterInit = false;
  navBarConfg: NavBarConfig;
  logoUrl: string;

  constructor(private location: Location, private http: HttpClient, private titleService: Title, private router: Router, private configService: ConfigurationService, protected oauthService: OauthService) {
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
    this.afterInit = false;
    this.logoUrl = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/images/svg/tibco-cloud.svg');
    if (this.oauthService.isCloud()) {
      this.disableTimeout = false;
    } else {
      this.disableTimeout = true;
    }
    if (this.config) {
      this.titleService.setTitle(this.config.applicationTitle);
    }
    this.navBarConfg = {
      container: '#navbar',
      textAfterLogo: this.config.applicationTitle,
      idle: {
        disabled: this.disableTimeout
      },
      iconMenus: {
        search: {
          visible: false
        },
        download: {
          visible: false
        },
        help: {
          visible: true,
          publishEvent: true
        },
        notifications: {
          visible: false
        },
        products: {
          visible: true
        },
        region: {
          visible: true
        },
        accountswitcher: {
          visible: true
        }
      },
      customProfilePanel: {
        account: {
          visible: true,
          disabled: false
        },
        subscriptions: {
          visible: true,
          disabled: false
        },
        organization: {
          visible: true
        },
        tenants: {
          visible: true
        }
      },
      customizedComponents: [
        {
          name: 'help',
          template: '#help-template'
        }
      ],
      accountChange: {
        disabled: false,                    // optional. If provided and the value eques to true, then account change popup won't show.
        secureHomeURL: '/webresource/apps/discover-app/welcome'    // optional. if provided, the web UI will lands on this URL of product domain
      }
    };
  }

  get config(): GeneralConfig {
    return this.configService?.config?.discover?.general;
  }

  ngAfterViewInit(): void {
    window.setTimeout( () => {
      this.afterInit = true;
    },100)
  }

}
