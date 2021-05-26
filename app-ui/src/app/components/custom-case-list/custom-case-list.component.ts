import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaseConfig, CaseEvent} from "../../models/configuration";
import {bType, CIDState, TButton} from "../../models/buttons";
import {
  CaseAction,
  CaseCreatorSelectionContext, CaseInfo,
  CaseType,
  FormConfig, LiveAppsConfig, LiveAppsCreatorDialogComponent,
  LiveAppsService,
  TcCaseDataService,
  TcCaseProcessesService
} from "@tibco-tcstk/tc-liveapps-lib";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageTopicService, TcCoreCommonFunctions} from "@tibco-tcstk/tc-core-lib";
import {LaWrapperService} from "../../service/la-wrapper.service";
import {CaseService} from "../../service/custom-case.service";
import {CustomFormDefs} from "@tibco-tcstk/tc-forms-lib";
import {delay, retryWhen, take} from "rxjs/operators";
import {ActionDialogComponent} from "../action-dialog/action-dialog.component";
import {Location} from '@angular/common';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {notifyUser} from '../../functions/message';

@Component({
  selector: 'custom-case-list',
  templateUrl: './custom-case-list.component.html',
  styleUrls: ['./custom-case-list.component.css']
})
export class CustomCaseListComponent implements OnInit {

  @Input() cConfig: CaseConfig;

  @Output() caseEvent: EventEmitter<CaseEvent> = new EventEmitter<CaseEvent>();

  public sandboxId: number;
  //public appId: string;
  public application: CaseType;
  public formConfig: FormConfig;
  public customFormDefs: CustomFormDefs;
  public legacyCreators: boolean = false;
  public formsFramework: string = 'material-design';
  public caseRefs: string[];
  public selectedCaseRefs: string[];
  public tableLoading = false;
  public toolBarNotification = '';
  public noDataIconLocation: string;
  public actionButtons: TButton[];
  public actionFilter = ['$'];
  public typeId = '1';
  protected REFRESH_DELAY = 3000;
  public searchTerm: string;

  public NEW_CASE = 'New case';

  public selectedCases: CaseInfo[];

  constructor(private location: Location,
              protected liveApps: LiveAppsService,
              protected dialog: MatDialog,
              protected router: Router,
              protected route: ActivatedRoute,
              protected messageService: MessageTopicService,
              protected caseDataService: TcCaseDataService,
              protected caseService: CaseService,
              protected lawService: LaWrapperService,
              protected configService: ConfigurationService) {
  }

  public firstLoad = false;

  ngOnInit(): void {
    this.NEW_CASE = this.cConfig.customTitle;
    this.messageService.getMessage('case.cache.loaded.' + this.cConfig.appId).subscribe(
      async (message) => {
        if (message.text === 'OK') {
          this.caseRefs = [...await this.caseService.loadCaseRefsAsync(this.cConfig.appId)];
        }
      }
    );
    this.noDataIconLocation = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/images/png/no-data.png');
    this.sandboxId = this.configService.config.sandboxId;
    this.liveApps.getApplications(this.sandboxId, [this.cConfig.appId], 10, false)
      .pipe(
        take(1),
      )
      .subscribe(applicationList => {
        for (const cType of applicationList.casetypes) {
          if (cType.applicationId == this.cConfig.appId) {
            this.application = cType;
          }
        }
      }, error => {
        console.error('Error retrieving applications: ' + error.error.errorMsg);
      });
    (async () => {
      if (!this.firstLoad) {
        this.tableLoading = true;
        this.caseRefs = await this.caseService.loadCaseRefsAsync(this.cConfig.appId);
        this.caseRefs = [...this.caseRefs];
        this.tableLoading = false;
        this.firstLoad = true;
      }
    })();
  }

  selectTableCaseRefs(caseRefs) {
    this.selectedCaseRefs = caseRefs;
    this.actionButtons = [];
  }

  // Function to handle a button clicked
  handleTBut(tBut: TButton) {
    switch (tBut.type) {
      case 'OTHER':
        if (tBut.id == 'refresh') {
          this.refreshCases();
        }
        break;
      case 'CREATE':
        if (tBut.id == this.NEW_CASE) {
          this.createNew();
        }
        break;
      case 'MULTIPLE':
        this.multipleActions(tBut);
        break;
      case 'ACTION':
        if (this.selectedCaseRefs && this.selectedCaseRefs.length == 1) {
          this.oneCommonAction(tBut.caseAction, this.selectedCaseRefs[0]);
        }
        break;
      case 'MESSAGE':
        const mes = {
          type: tBut.messageType,
          message: tBut.message
        };
        this.messageService.sendMessage('news-banner.topic.message', 'MESSAGE:' + JSON.stringify(mes));
        break;
      default:
        console.error('Toolbar Button Not Recognized: ', tBut);
    }
  }

  // Check if the selection is still part of the table
  checkSelectionValid() {
    // Check if the selected caserefs are still part of the new table
    if (this.caseRefs && this.selectedCaseRefs) {
      if (this.caseRefs.length > 0 && this.selectedCaseRefs.length > 0) {
        const arrayToRemove = [];
        for (const sRef of this.selectedCaseRefs) {
          let refFound = false;
          for (const cRef of this.caseRefs) {
            if (cRef == sRef) {
              refFound = true;
            }
          }
          if (!refFound) {
            arrayToRemove.push(sRef);
          }
        }
        for (const rRem of arrayToRemove) {
          this.selectedCaseRefs.splice(this.selectedCaseRefs.indexOf(rRem), 1);
        }
        this.selectedCaseRefs = [...this.selectedCaseRefs];
      }
    }
  }

  // Method for one action
  public oneCommonAction(action: CaseAction, caseReference: string) {
    const processID = action.id;
    if (processID != '') {
      if (!action.noData) {
        const dialogRef = this.dialog.open(ActionDialogComponent, {
          width: '70%',
          height: '70%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          panelClass: 'tcs-style-dialog',
          data: {
            actionId: processID,
            label: action.label,
            caseReference,
            appId: this.cConfig.appId,
            sandboxId: this.sandboxId
          }
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.messageService.sendMessage('news-banner.topic.message', action.label + ' successful...');
            this.refreshCasesAfterSubmit(caseReference);
          }
        });
      } else {
        this.liveApps.runProcess(this.sandboxId, this.cConfig.appId, action.id, caseReference, {}).pipe(
          // retry(3),
          retryWhen(errors => {
            return errors.pipe(
              delay(2000),
              take(3)
            );
          }),
          take(1)
        ).subscribe(response => {
            if (response) {
              if (!response.data.errorMsg) {
                response.data = JSON.parse(response.data);
                this.messageService.sendMessage('news-banner.topic.message', action.label + ' successful...');
                this.refreshCasesAfterSubmit(caseReference);
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

  // Method for multiple actions
  public async multipleActionsCommon(data, mDialog) {
    return new Promise((resolve) => {
      const dialogRefMA = this.dialog.open(mDialog, {
        width: '80%',
        height: '60%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        panelClass: 'tcs-style-dialog',
        data
      });
      dialogRefMA.afterClosed().subscribe((data) => {
        if (data) {
          if (data.result == 'OK') {
            if (data.action.label) {
              this.messageService.sendMessage('news-banner.topic.message', data.action.label + ' Successful...');
              resolve(undefined);
            }
          }
        }
      });
    });
  }

  // Create case in LiveApps based on marking
  createNew() {
    const INITIAL_DATA = {};

    const dialogRef = this.dialog.open(LiveAppsCreatorDialogComponent, {
      width: '60%',
      height: '80%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'tcs-style-dialog',
      data: new CaseCreatorSelectionContext(this.application, INITIAL_DATA, this.sandboxId, this.customFormDefs, this.legacyCreators, this.formsFramework, this.formConfig, true, 'New ' + this.cConfig.customTitle + ' case')
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.messageService.sendMessage('news-banner.topic.message', 'New ' + this.cConfig.customTitle + ' case created...');
        this.refreshCases();
      }
    });
  }

  public selectCaseInfo(event) {
    this.selectedCases = event;
    (async () => {
      await this.setActionButtons();
    })();
  }

  async setActionButtons() {
    this.actionButtons = [];
    this.toolBarNotification = '';
    let butType: bType = 'ACTION';
    if (this.selectedCases) {
      if (this.selectedCases.length > 1) {
        this.toolBarNotification = this.selectedCases.length + ' ' + this.cConfig.customTitle + ' cases selected...';
        butType = 'MULTIPLE';
      } else {
        this.toolBarNotification = '';
      }
      const ciStates = new Array<CIDState>();
      for (const sp of this.selectedCases) {
        const temp: CIDState = {
          caseRef: sp.caseReference,
          state: sp.untaggedCasedataObj.state
        };
        ciStates.push(temp);
      }
      const exceptionList = new Array<TButton>();
      this.actionButtons = [...await this.lawService.getPossibleTButtonsForStates(ciStates, this.cConfig.appId, this.actionFilter, exceptionList)];
    }
  }

  refreshCases() {
    this.actionButtons = [];
    (async () => {
      if (!this.tableLoading) {
        this.tableLoading = true;
        const caseRefs = await this.caseService.loadCaseRefsAsync(this.cConfig.appId);
        if (caseRefs && caseRefs.length > 0) {
          await this.caseService.loadCasesAsync(this.cConfig.appId, caseRefs);
        }
        this.caseRefs = [...caseRefs];
        // Check if the selected caserefs are still part of the new table
        this.checkSelectionValid();
        if (this.selectedCaseRefs && this.selectedCaseRefs.length > 0) {
          this.selectedCases = await this.caseService.loadCasesAsync(this.cConfig.appId, this.selectedCaseRefs);
        } else {
          this.selectedCases = [];
        }
        this.tableLoading = false;
        await this.setActionButtons();
      } else {
        notifyUser('WARNING', 'Still refreshing...', this.messageService);
      }
    })();
  }

  public multipleActions(action: TButton) {
    (async () => {

      // TODO: Get the Multi Action Component in.
      //await this.multipleActionsCommon(data, MultipleActionDialogComponent);
      this.refreshCasesAfterSubmit();
    })();
  }

  refreshCasesAfterSubmit(caseRef?: string) {
    this.setActionButtons();
  }

  caseEventClicked(data: CaseEvent) {
    this.caseEvent.emit(data);
  }

  public handleSearch = ($event): void => {
    this.searchTerm = $event.detail.value;
  }

}
