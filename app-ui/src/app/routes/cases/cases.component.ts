import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CaseEvent, CasesConfig} from "../../models/configuration";
import {ConfigurationService} from "../../service/configuration.service";
import {TcCoreCommonFunctions} from "@tibco-tcstk/tc-core-lib";
import {Location} from "@angular/common";
import {UxplLeftNav} from "@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav";
import {Datasource} from "../../models/discover";
import {flatMap, map} from "rxjs/operators";
import {CaseInfoList, LiveAppsService} from "@tibco-tcstk/tc-liveapps-lib";
import {DatasourceService} from "../../service/datasource.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit, AfterViewInit {

  public casesConfig: CasesConfig;
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
    //TODO: Get from config
    this.casesConfig = {
      caseconfigs: [
        {
          customTitle: 'Compliance',
          //TODO: move this entire config to shared state
          appId: this.configService.config.discover.investigations.applications[0].applicationId,
          allowMultiple: false,
          headerFields: [{label: 'ID', field: 'ComplianceID'}, {
            label: 'Created on',
            field: 'META:creationTimestamp',
            format: 'DATE'
          }, {label: 'Description', field: 'ShortDescription'}, {
            label: 'Type',
            field: 'Context.ContextType'
          }, {label: 'Analysis', field: 'DataSourceName'}/*, {
            label: 'Decision',
            field: 'ComplianceDecision'
          }*/, {label: 'State', field: 'state'}],
          detailTitle: {label: 'ID', field: 'ComplianceID'},
          showMilestones: true,
          detailFields: [[{label: 'Description', field: 'ShortDescription'}, {
            label: 'Full Description',
            field: 'LongDescription'
          }, {label: 'Decision', field: 'ComplianceDecision'}],
            [{label: 'Type', field: 'Context.ContextType'}, {
              label: 'Analysis Name',
              field: 'DataSourceName',
              format: 'EVENT-LINK'
            }, {label: 'Escalation', field: 'Escalation.Comment'}],
            [{label: 'ID', field: 'ComplianceID'}, {label: 'Analysis ID', field: 'DataSourceId'}, {
              label: 'Resolution',
              field: 'Resolution.Comment'
            }],
            [{label: 'Case Reference', field: 'CUSTOM:caseReference'}, {
              label: 'Variant ID',
              field: 'Context.ContextID'
            }, {label: 'Comments', field: 'CommentsHistory', format: 'ARRAY'}]],
          states: [{name: 'Created', color: '#E0F0F9', icon: 'assets/images/states/Added.svg'},
            {name: 'Investigation', color: '#E0F0F9', icon: 'assets/images/states/Added.svg'},
            {name: 'Escalated', color: '#FEF7EA', icon: 'assets/images/states/Process mining.svg'},
            {name: 'Compliant', color: '#E1F7EB', icon: 'assets/images/states/Ready.svg'},
            {name: 'Out of Compliance', color: '#F9E1E4', icon: 'assets/images/states/Not ready.svg'},
            {name: 'Cancelled', color: '#f4f4f4', icon: 'assets/images/states/Archived.svg'},
            {name: 'Resolved', color: '#E1F7EB', icon: 'assets/images/states/Ready.svg'}
          ]
        },
        {
          customTitle: 'Improvement',
          appId: this.configService.config.discover.investigations.applications[1].applicationId,
          allowMultiple: false,
          headerFields: [
            {
              label: 'ID',
              field: 'ImprovementID'
            },
            {
              label: 'Created on',
              field: 'META:creationTimestamp',
              format: 'DATE'
            }, {
              label: 'Description',
              field: 'ShortDescription'
            }, {
              label: 'Type',
              field: 'Context.ContextType'
            }, {label: 'Analysis', field: 'DataSourceName'}, /*{
              label: 'Decision',
              field: 'Decision'
            },*/
            {
              label: 'State',
              field: 'state'
            }],
          detailTitle: {label: 'Description', field: 'ShortDescription'},
          showMilestones: true,
          detailFields: [
            [{label: 'Description', field: 'ShortDescription'}, {
              label: 'Full Description',
              field: 'LongDescription'
            }, {label: '', field: ''}],
            [{label: 'Type', field: 'Context.ContextType'}, {
              label: 'Datasource Name',
              field: 'DataSourceName',
              format: 'EVENT-LINK'
            }, {label: 'Decision', field: 'Decision'}],
            [{label: 'ID', field: 'ImprovementID'}, {
              label: 'Datasource ID',
              field: 'DataSourceId'
            }, {label: 'Resolution', field: 'Resolution.Comment'}],
            [{label: 'Case Reference', field: 'CUSTOM:caseReference'}, {
              label: 'Variant ID',
              field: 'Context.ContextID'
            }, {label: 'Comments', field: 'CommentsHistory', format: 'ARRAY'}]],
          states: [{name: 'Created', color: '#E0F0F9', icon: 'assets/images/states/Added.svg'},
            {name: 'Investigation', color: '#E0F0F9', icon: 'assets/images/states/Added.svg'},
            {name: 'Escalated', color: '#FEF7EA', icon: 'assets/images/states/Process mining.svg'},
            {name: 'Already Exists', color: '#f9e1e4', icon: 'assets/images/states/Not ready.svg'},
            {name: 'Under consideration', color: '#E0F0F9', icon: 'assets/images/states/Added.svg'},
            {name: 'Implementation', color: '#fef7ea', icon: 'assets/images/states/Process mining.svg'},
            {name: 'Implemented', color: '#E1F7EB', icon: 'assets/images/states/Ready.svg'},
            {name: 'Rejected', color: '#f9e1e4', icon: 'assets/images/states/Not ready.svg'},
            {name: 'Cancelled', color: '#f4f4f4', icon: 'assets/images/states/Archived.svg'},
            {name: 'Resolved', color: '#E1F7EB', icon: 'assets/images/states/Ready.svg'}
          ]

        }
      ]
    }
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
