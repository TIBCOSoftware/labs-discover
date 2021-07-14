import { Location } from "@angular/common";
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { TcCoreCommonFunctions } from "@tibco-tcstk/tc-core-lib";
import { CaseInfoList, LiveAppsService } from "@tibco-tcstk/tc-liveapps-lib";
import { UxplLeftNav } from "@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav";
import { map } from "rxjs/operators";
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

  public caseConfig: CaseConfig[];
  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;

  public noDataIconLocation: string;
  public hasCaseConfig: boolean;
  public leftNavTabs = [];
  public hideTable = new Array<boolean>();

  constructor(protected configService: ConfigurationService,
    protected location: Location,
    protected liveapps: LiveAppsService,
    protected datasource: DatasourceService,
    protected router: Router) {
    }

    ngOnInit(): void {

      this.caseConfig = this.configService.config.discover.investigations.caseConfig;

      this.noDataIconLocation = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');
      this.hasCaseConfig = false;
      if (this.caseConfig && this.caseConfig.length > 0) {
        this.hasCaseConfig = true;
        this.leftNavTabs = [];
        for (let conf of this.caseConfig) {
          const lTab = {
            "id": conf.appId,
            "label": conf.customTitle,
            "icon": conf.iconLocation,
            "child": []
          }
          this.hideTable.push(true);
          this.leftNavTabs.push(lTab);
        }
        this.hideTable[0] = false;
      }
    }

    handleClick = (event: any): void => {
      // Show table of selected appId
      if (event.detail) {
        for (let i = 0; i < this.caseConfig.length; i++) {
          if (event.detail.id === this.caseConfig[i].appId) {
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

    caseEventClicked(data: CaseEvent) {
      console.log('Picked up Case Event: ', data);
      if (data.caseFieldEvent.field == 'DataSourceName') {
        this.liveapps.getCasesWithUserInfo(this.configService.config.sandboxId, this.configService.config.discover.analysis.applicationId, '1', 0, 100).subscribe(
          (caseList: CaseInfoList) => {
            let paCases = caseList.caseinfos.map(element => {
              let newElement = element.untaggedCasedataObj
              newElement.caseReference = element.caseReference;
              newElement.CreatedBy = element.metadata.createdByDetails.firstName + ' ' + element.metadata.createdByDetails.lastName;
              newElement.CreatedOn = element.metadata.creationTimestamp;
              return newElement;
            })
            for (let paCase of paCases) {
              if (paCase.ID == data.caseInfo.untaggedCasedataObj.DataSourceId) {
                // We found the case for the data source
                var datasource: Datasource = {
                  datasourceId: paCase.ID,
                  description: paCase.Description,
                  caseRef: paCase.caseReference,
                  idDefinition: '',
                  addSuffix: (paCase.Spotfire && paCase.Spotfire.AddSuffix_1 === 'Yes' ? true : false),
                  analysisName: paCase.Name,
                  analysisDescription: paCase.Description,
                  analysisCreatedBy: paCase.CreatedBy,
                  analysisCreatedOn: paCase.CreatedOn
                };
                this.datasource.setDatasource(datasource);
                this.datasource.setCurrentDatasource(datasource).pipe(
                  map(_ => {
                    this.router.navigate(['/discover/analytics']);
                  })
                  ).subscribe();

                }
              }
            });
          }
        }
      }
