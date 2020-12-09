import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CasesConfig} from "../../models/configuration";
import {TcCoreCommonFunctions} from "@tibco-tcstk/tc-core-lib";
import {Location} from "@angular/common";
import {UxplLeftNav} from "@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav";

@Component({
  selector: 'custom-case-view',
  templateUrl: './custom-case-view.component.html',
  styleUrls: ['./custom-case-view.component.css']
})
export class CustomCaseViewComponent implements OnInit, AfterViewInit {

  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;

  @Input() casesConfig: CasesConfig;

  public noDataIconLocation: string;
  public hasCaseConfig: boolean;
  public leftNavTabs = [];
  public hideTable = new Array<boolean>();

  constructor(protected location: Location) {
  }

  ngOnInit(): void {
    this.noDataIconLocation = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');
    this.hasCaseConfig = false;
    if (this.casesConfig) {
      if (this.casesConfig.caseconfigs) {
        if (this.casesConfig.caseconfigs.length > 0) {
          this.hasCaseConfig = true;
          this.leftNavTabs = [];
          for (let conf of this.casesConfig.caseconfigs) {
            const lTab = {
              "id": conf.appId,
              "label": conf.customTitle,
              "icon": conf.iconLocation,
              "child": []
            }
            this.hideTable.push(true);
            this.leftNavTabs.push(lTab);
          }
        }
        this.hideTable[0] = false;
      }
    }
  }

  handleClick = (event: any): void => {
    // Show table of selected appId
    if (event.detail) {
      for (let i = 0; i < this.casesConfig.caseconfigs.length; i++) {
        if (event.detail.id === this.casesConfig.caseconfigs[i].appId) {
          this.hideTable[i] = false;
        } else {
          this.hideTable[i] = true;
        }
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.leftNavTabs.length > 0) {
      this.leftNav.nativeElement.setTab(this.leftNavTabs[0]);
    }
  }

}
