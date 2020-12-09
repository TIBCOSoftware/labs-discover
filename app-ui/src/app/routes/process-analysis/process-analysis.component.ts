import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ConfigurationService } from '../../service/configuration.service';
import { LiveAppsService, CaseInfoList, CaseInfo, TcCaseProcessesService, CaseActionsList } from '@tibco-tcstk/tc-liveapps-lib';
import {delay, flatMap, map, retryWhen, take} from 'rxjs/operators';
import { Datasource, NewAnalysis } from '../../models/discover';
import { DatasourceService } from '../../service/datasource.service';
import { Router } from '@angular/router';
import { WizardComponent } from 'src/app/components/new-analysis/wizard/wizard.component';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { MessageTopicService } from '@tibco-tcstk/tc-core-lib';
import { ActionDialogComponent } from '../../components/action-dialog/action-dialog.component';
import {CaseCacheService} from "../../service/custom-case-cache.service";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-process-analysis',
  templateUrl: './process-analysis.component.html',
  styleUrls: ['./process-analysis.component.css']
})
export class ProcessAnalysisComponent implements OnInit, AfterViewInit {

  private REFRESH_DELAY_MS = 1000;
  private actionFilter = ['$'];

  public cases: any[];
  public search: string = '';
  public caseActions: Map<string, any>;
  public showTable = false;
  //cases && cases.length === 0
  // cases && cases.length > 0

  constructor(
    protected configService: ConfigurationService,
    protected liveapps: LiveAppsService,
    protected datasource: DatasourceService,
    protected router: Router,
    protected caseProcessesService: TcCaseProcessesService,
    protected messageService: MessageTopicService,
    protected dialog: MatDialog,
    protected datePipe: DatePipe,
    /* TODO: Use Case Cache and ActionCache protected caseCache: CaseCacheService*/) { }

  ngOnInit(): void {
    this.caseActions = new Map<string, any>();
  }

  ngAfterViewInit(): void {
    this.refresh();
  }

  public refresh = (): void => {
    this.showTable = false;
    this.cases = [];
    this.caseActions.clear();
    this.liveapps.getCasesWithUserInfo(this.configService.config.sandboxId, this.configService.config.discover.analysis.applicationId, '1', 0, 100).pipe(
      flatMap((caseList: CaseInfoList) => {
        const validCases = caseList.caseinfos.
          filter(el => el.untaggedCasedataObj.state !== 'Completed').
          sort((a, b) => (a.untaggedCasedataObj.AnalysisID > b.untaggedCasedataObj.AnalysisID) ? 1 : ((b.untaggedCasedataObj.AnalysisID > a.untaggedCasedataObj.AnalysisID) ? -1 : 0));

        this.cases = validCases.map(element => {
          let newElement = element.untaggedCasedataObj
          newElement.caseReference = element.caseReference;
          newElement.CreatedBy = element.metadata.createdByDetails.firstName + ' ' + element.metadata.createdByDetails.lastName;
          newElement.CreatedOn = this.datePipe.transform(element.metadata.creationTimestamp, 'fullDate');
          newElement.ModifiedBy = element.metadata.modifiedByDetails.firstName + ' ' + element.metadata.modifiedByDetails.lastName;
          newElement.ModifiedOn = this.datePipe.transform(element.metadata.modificationTimestamp, 'fullDate');
          return newElement;
        });
        this.showTable = true;
        const caseRefs$ = validCases.map(element => this.caseProcessesService.getCaseActionsForCaseRef(element.caseReference, this.configService.config.sandboxId, this.configService.config.discover.analysis.applicationId, '1'));
        return forkJoin(caseRefs$).pipe(
          map( caseactionsResponse => {
            caseactionsResponse.forEach((caseActions, index) => {
              const caseReference = validCases[index].caseReference;
              let filteredCaseActions = [];
              if (this.actionFilter) {
                caseActions.actions = caseActions.actions.filter(act => {
                  // check if it matches any of the actionFilters
                  let test = true;
                  this.actionFilter.forEach(actfilter => {
                    if (test && act.label.substr(0, actfilter.length) === actfilter) {
                      test = false;
                    }
                  });
                  return test;
                });
              }
              filteredCaseActions = caseActions.actions;
              this.caseActions.set(caseReference, filteredCaseActions);
            })
          })
        );
      })
    ).subscribe(
      null,
      error => {
        console.log("***** error " + error.error.errorMsg);
      }
    );
  }

  public handleClick = (caseReference): void => {
    const selectedCase = this.cases.filter(c => c.caseReference === caseReference)[0];
    var datasource: Datasource = {
      datasourceId: selectedCase.ID,
      description: selectedCase.Description,
      caseRef: selectedCase.caseReference,
      idDefinition: '',
      addSuffix: (selectedCase.Spotfire && selectedCase.Spotfire.AddSuffix_1 === 'Yes' ? true : false),
      analysisName: selectedCase.Name,
      analysisDescription: selectedCase.Description,
      analysisCreatedBy: selectedCase.CreatedBy,
      analysisCreatedOn: selectedCase.CreatedOn
    };
    this.datasource.setDatasource(datasource);

    this.datasource.setCurrentDatasource(datasource).pipe(
      map(_ => {
        this.router.navigate(['/discover/analytics']);
      })
    ).subscribe();
  }

  public newAnalysisDialog = (analysisData?: NewAnalysis, caseReference?: string, actionId?: string): void => {
    const dialogRef = this.dialog.open(WizardComponent, {
      width: '100%',
      height: '90%',
      data: {
        analysisData: analysisData,
        actionId: actionId,
        caseReference: caseReference
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.messageService.sendMessage('integratedHelp', 'discover/process-analysis');
    });
  }

  public handleSearch = ($event): void => {
    this.search = $event.detail.value;
  }

  public handleActionSelected = (event): void => {
    if (event.label === 'Edit') {
      this.liveapps.getCaseByRef(this.configService.config.sandboxId, event.caseReference).pipe(
        map(data => {
            console.log("***** Case: ", data);
            this.newAnalysisDialog(data.untaggedCasedataObj, event.caseReference, event.actionId);
          }
        )
      ).subscribe()
    } else {
      const processID = event.actionId;
      console.log('Process ID: ', processID);
      if (processID != '') {
        if (!event.noData) {
          console.log('Opening Dialog');
          const dialogRef = this.dialog.open(ActionDialogComponent, {
            width: '70%',
            height: '70%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'tcs-style-dialog',
            data: {
              ...event,
              appId: this.configService.config.discover.analysis.applicationId,
              sandboxId: this.configService.config.sandboxId,
            }
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.messageService.sendMessage('news-banner.topic.message', event.label + ' successful...');
              window.setTimeout(() => {
                this.refresh();
                }, this.REFRESH_DELAY_MS);
              /*this.refreshCasesAfterSubmit(caseRef);*/
            } else {
              console.log('Dialog Single Action Cancelled...');
            }
          });
        } else {
          console.log('Running Process... ');
          this.liveapps.runProcess(this.configService.config.sandboxId, this.configService.config.discover.analysis.applicationId, processID, event.caseReference, {}).pipe(
            // retry(3),
            retryWhen(errors => {
              return errors.pipe(
                delay(2000),
                take(3)
              );
            }),
            take(1)
          ).subscribe(response => {
              console.log('Got Response: ', response);
              if (response) {
                if (!response.data.errorMsg) {
                  response.data = JSON.parse(response.data);
                  this.messageService.sendMessage('news-banner.topic.message', event.label + ' successful...');
                  window.setTimeout(() => {
                    this.refresh();
                  }, this.REFRESH_DELAY_MS);
                  //this.refreshCasesAfterSubmit(caseRef);
                } else {
                  console.error('Unable to run the action');
                  console.error(response.data.errorMsg);
                }
              }
            }, error => {
              console.error('Unable to run the action');
              console.error(error);
            }
          );
        }
      }
    }
  }
}
