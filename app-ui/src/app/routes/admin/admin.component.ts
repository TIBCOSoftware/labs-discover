import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationMenuEntry, TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { Location } from '@angular/common';
import { UxplLeftNavMulti } from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav-multi/uxpl-left-nav-multi';
import { TcAppDefinitionService } from '@tibco-tcstk/tc-liveapps-lib';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, AfterViewInit  {

  @ViewChild('leftNav', { static: false }) nav: ElementRef<UxplLeftNavMulti>;
  leftNavTabs = [];

  constructor(protected configService: TcAppDefinitionService, protected router: Router, protected location: Location) { }

  ngOnInit() {
    const adminMenu = this.configService.appConfig.config.adminMenu;
    this.leftNavTabs = adminMenu.map((element: ConfigurationMenuEntry) => {
      const newEntry = {
        id: element.entry.toLowerCase().split(' ').join('-'),
        label: element.entry,
        icon: TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, element.icon),
        child: []
      };

      if (element.options){
        const newChildren = element.options.map((child: string) => {
          const newChild = {
            id: newEntry.id + '-' + child.toLowerCase().split(' ').join('-'),
            label: child,
          };
          return newChild;
        });
        newEntry.child = newChildren;
      }

      return newEntry;
    });
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
      this.router.navigate(['/discover/admin/' + event.detail.id]);
    }
  }
}

