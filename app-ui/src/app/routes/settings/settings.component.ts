import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationMenuEntry, TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { Location } from '@angular/common';
import { UxplLeftNavMulti } from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav-multi/uxpl-left-nav-multi';
import { TcAppDefinitionService } from '@tibco-tcstk/tc-liveapps-lib';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, AfterViewInit  {

  @ViewChild('leftNav', { static: false }) nav: ElementRef<UxplLeftNavMulti>;
  leftNavTabs = [];

  constructor(protected configService: TcAppDefinitionService, protected router: Router, protected location: Location) { }

  ngOnInit() {
    const settingsMenu = this.configService.appConfig.config.settingsMenu;
    this.leftNavTabs = settingsMenu.map((element: ConfigurationMenuEntry) => {
      let newEntry = {
        id: element.entry.toLowerCase().split(' ').join('-'),
        label: element.entry,
        icon: TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, element.icon),
        child: []
      };

      if (element.options){
        let newChildren = element.options.map((child: string) => {
          let newChild = {
            id: newEntry.id + '-' + child.toLowerCase().split(' ').join('-'),
            label: child,
          };
          return newChild;
        });
        newEntry.child = newChildren;
      }

      return newEntry;
    });

    if (this.configService.isAdmin) {
      let newEntry = {
        id: 'reset',
        label: 'Reset',
        icon: TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, '/assets/images/settings/tcs-starters-icon.svg'),
        child: []
      };
      this.leftNavTabs.push(newEntry);
    }
  }

  ngAfterViewInit() {
    const entryId = this.router.url.split('/')[3];
    const tab = this.nav.nativeElement.tabs.filter((entry) => {
      return entry.id === entryId;
    })[0];
    this.nav.nativeElement.setTab(tab, true);
  }

  public handleClick(event) {
    if (event.detail.child === undefined || event.detail.child.length === 0){
      this.router.navigate(['/discover/settings/' + event.detail.id]);
    }
  }
}
