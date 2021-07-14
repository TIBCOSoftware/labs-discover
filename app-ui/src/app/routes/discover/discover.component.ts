import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {UxplPrimaryNav} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-primary-nav/uxpl-primary-nav';
import {unionBy} from 'lodash-es';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements AfterViewInit {

  @ViewChild('primaryNav', {static: false}) nav: ElementRef<UxplPrimaryNav>;
  public tabs;

  public hideAnalytics: boolean;
  public analysisID: string;

  constructor(protected router: Router,
              protected route: ActivatedRoute,
              protected configService: ConfigurationService,
              protected messageService: MessageTopicService) {
    this.tabs = this.generateMenu();
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        // Set the right tab
        if (this.nav && this.nav.nativeElement) {
          for (const tab of this.nav.nativeElement.tabs) {
            if (val.url.includes(tab.id)) {
              this.nav.nativeElement.setTab(tab, true);
            }
          }
        }
        if (val.url.startsWith('/discover/analytics')) {
          this.hideAnalytics = false;
          this.analysisID = '';
          window.setTimeout(() => {
            // Check if there are no parameters specified
            if (val.url.indexOf('?') > 0) {
              this.analysisID = val.url.slice(val.url.lastIndexOf('/') + 1, val.url.lastIndexOf('?'));
            } else {
              this.analysisID = val.url.slice(val.url.lastIndexOf('/') + 1);
            }
            if(this.analysisID === 'analytics'){
              this.analysisID = '';
            }
          });
        } else {
          this.hideAnalytics = true;
        }
      }
    });
    if (this.router.url === '/discover') {
      this.router.navigate(['/discover/' + this.tabs[0].id]);
    }

    // console.log(this.configService.config.discover.navBarMessages);
    if(this.configService?.config?.discover?.navBarMessages && this.configService?.config?.discover?.navBarMessages.length > 0) {
      for (const not of this.configService?.config?.discover?.navBarMessages){
        this.messageService.sendMessage('navbar.message', JSON.stringify(not));
      }
    }
  }

  public generateMenu = (): any[] => {
    let tabs = [];
    if (this.configService.groups.filter(element => element.name === 'Discover Analysts').length > 0) {
      tabs = [
        {id: 'process-analysis', label: 'Process Analysis'},
        {id: 'analytics', label: 'Analytics'},
        {id: 'cases', label: 'Investigations'},
        {id: 'dataset', label: 'Datasets'}
      ];
    }
    if (this.configService.groups.filter(element => element.name === 'Discover Case Resolvers').length > 0) {
      tabs = unionBy(tabs, [{id: 'cases', label: 'Investigations'}], 'id');
    }
    if (this.configService.groups.filter(element => element.name === 'Discover Administrators').length > 0) {
      /*tabs.push({id: 'settings', label: 'Settings'});*/
      tabs.push({id: 'admin', label: 'Admin'});
    }
    return tabs;
  }

  ngAfterViewInit() {
    const entryId = this.router.url.split('/')[2];
    // Added this to prevent no ID found from /discover/new-template TODO: Set the process analysis tab
    if (entryId) {
      const tab = this.nav.nativeElement.tabs.filter((entry) => {
        return entry.id === entryId;
      })[0];
      if (tab) {
        this.nav.nativeElement.setTab(tab, true);
      }
    }
  }

  handleClick = (event): void => {
    if(event?.detail?.id){
      let endpoint = event.detail.id;
      if(endpoint === 'analytics' && this.analysisID && this.analysisID !== ''){
        endpoint += '/' + this.analysisID
      }
      this.router.navigate(['/discover/' + endpoint]);
    }
  }
}
