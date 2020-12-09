import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UxplPrimaryNav } from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-primary-nav/uxpl-primary-nav';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DatasourceService } from "../../service/datasource.service";
import { FullSpotfireConfig } from "../../models/discover";
import { CaseCacheService } from "../../service/custom-case-cache.service";
import { ConfigurationService } from 'src/app/service/configuration.service';
import { unionBy } from 'lodash-es';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements AfterViewInit {

  @ViewChild('primaryNav', { static: false }) nav: ElementRef<UxplPrimaryNav>;
  public tabs;

  public hideAnalytics: boolean;
  public fullSpotfireConfig: FullSpotfireConfig;

  constructor(protected router: Router,
              protected route: ActivatedRoute,
              private dataSourceService: DatasourceService,
              protected cCache: CaseCacheService,
              protected configService: ConfigurationService) {
    this.fullSpotfireConfig = {
      hasAnalytics: false
    }

    this.tabs = this.generateMenu();

    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        // Set the right tab
        if(this.nav && this.nav.nativeElement){
          for(let tab of this.nav.nativeElement.tabs){
            if(val.url.includes(tab.id)){
              this.nav.nativeElement.setTab(tab, true);
            }
          }
        }
        if (val.url === '/discover/analytics') {
          this.hideAnalytics = false;
          if(this.dataSourceService.getDatasource()){
            this.fullSpotfireConfig = {
              name: this.dataSourceService.getDatasource().analysisName,
              hasAnalytics: true,
              dataSource: this.dataSourceService.getDatasource()
            }
          } else {
            this.fullSpotfireConfig.hasAnalytics = false;
          }
        } else {
          this.hideAnalytics = true;
        }
      }
    });
    if (this.router.url === '/discover'){
      this.router.navigate(['/discover/' + this.tabs[0].id]);
    }
  }

  public generateMenu = (): any[] => {
    let tabs = [];
    if (this.configService.groups.filter(element => element.name === 'Discover Analysts').length > 0){
      tabs = [
        { id: 'process-analysis', label: 'Process Analysis' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'cases', label: 'Investigations' },
        { id: 'data', label: 'Data' }
      ];
    }
    if (this.configService.groups.filter(element => element.name === 'Discover Case Resolvers').length > 0){
      tabs = unionBy(tabs, [{ id: 'cases', label: 'Investigations' }], 'id');
    }
    if (this.configService.groups.filter(element => element.name === 'Discover Administrators').length > 0){
      tabs.push({ id: 'settings', label: 'Settings' });
    }
    return tabs;
  }

  ngAfterViewInit() {

    const entryId = this.router.url.split('/')[2];
    const tab = this.nav.nativeElement.tabs.filter((entry) => {
      return entry.id === entryId;
    })[0];
    this.nav.nativeElement.setTab(tab, true);
  }

  handleClick = (event): void => {
    this.router.navigate(['/discover/' + event.detail.id]);
  }
}
