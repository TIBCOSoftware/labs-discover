import { Location } from "@angular/common";
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { TcCoreCommonFunctions } from "@tibco-tcstk/tc-core-lib";
import { CaseInfoList, LiveAppsService } from "@tibco-tcstk/tc-liveapps-lib";
import { UxplLeftNav } from "@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav";
import { map } from "rxjs/operators";
import { InvestigationsService } from "src/app/api/investigations.service";
import { InvestigationApplication, InvestigationDetails } from "src/app/model/models";
import { CaseConfig, CaseEvent } from "../../models_ui/configuration";
import { Datasource } from "../../models_ui/discover";
import { ConfigurationService } from "../../service/configuration.service";
import { DatasourceService } from "../../service/datasource.service";

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit, AfterViewInit {

  public caseConfig: InvestigationApplication[];
  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;

  public noDataIconLocation: string;
  public hasCaseConfig: boolean;
  public leftNavTabs = [];
  public hideTable = new Array<boolean>();
  public investigations: InvestigationDetails[][];

  constructor(
    protected investigationService: InvestigationsService,
    protected configService: ConfigurationService,
    protected location: Location,
    protected liveapps: LiveAppsService,
    protected datasource: DatasourceService,
    protected router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.caseConfig = this.configService.config.discover.investigations.applications;

    this.noDataIconLocation = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');
    this.hasCaseConfig = false;
    if (this.caseConfig && this.caseConfig.length > 0) {
      // Create left menu
      this.hasCaseConfig = true;
      this.leftNavTabs = [];
      for (let conf of this.caseConfig) {
        const lTab = {
          "id": conf.applicationId,
          "label": conf.customTitle,
          // "icon": conf.iconLocation,
          "child": []
        }
        this.hideTable.push(true);
        this.leftNavTabs.push(lTab);
      }
      this.hideTable[0] = false;

      // Get investigations for each application
      this.investigations = await Promise.all(
        this.configService.config.discover.investigations.applications.map((element: InvestigationApplication) => 
          this.investigationService.getInvestigationDestilsForId(element.applicationId).toPromise()
        )  
      );
    }
  }

  handleClick = (event: any): void => {
    // Show table of selected appId
    if (event.detail) {
      for (let i = 0; i < this.caseConfig.length; i++) {
        if (event.detail.id === this.caseConfig[i].applicationId) {
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

  public refreshEvent = async (applicationId: string, index: number): Promise<void> => {
    console.log('ApplicationID: ', applicationId, ' Index: ', index);
    this.investigations[index] = await this.investigationService.getInvestigationDestilsForId(applicationId).toPromise()
  }
}
