import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaseEvent} from '../../models_ui/configuration';
import {TButton} from '../../models_ui/buttons';
import {MatDialog} from '@angular/material/dialog';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {CustomFormDefs} from '@tibco-tcstk/tc-forms-lib';
import {ActionDialogComponent} from '../action-dialog/action-dialog.component';
import {Location} from '@angular/common';
import {InvestigationDetails} from 'src/app/backend/model/investigationDetails';
import {InvestigationApplication} from 'src/app/backend/model/investigationApplication';
import {InvestigationsService} from 'src/app/backend/api/investigations.service';
import {InvestigationActions} from 'src/app/backend/model/investigationActions';
import {intersectionBy} from 'lodash-es'

@Component({
  selector: 'custom-case-list',
  templateUrl: './custom-case-list.component.html',
  styleUrls: ['./custom-case-list.component.css']
})
export class CustomCaseListComponent implements OnInit {

  @Input() cConfig: InvestigationApplication;
  @Input() investigations: InvestigationDetails[];
  @Output() caseEvent: EventEmitter<CaseEvent> = new EventEmitter<CaseEvent>();
  @Output() refreshEvent: EventEmitter<string> = new EventEmitter<string>();

  public customFormDefs: CustomFormDefs;
  public legacyCreators = false;
  public formsFramework = 'material-design';
  public caseRefs: string[];
  public selectedCaseRefs: string[];
  public tableLoading = false;
  public toolBarNotification = '';
  public noDataIconLocation: string;
  public actionButtons: TButton[];
  public actionFilter = ['$'];
  public searchTerm: string;

  public selectedCases: InvestigationDetails[];

  constructor(private location: Location,
              private dialog: MatDialog,
              private messageService: MessageTopicService,
              private investigationService: InvestigationsService) {
  }

  public firstLoad = false;

  ngOnInit(): void {
    this.noDataIconLocation = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/images/png/no-data.png');
    (async () => {
      if (!this.firstLoad) {
        this.tableLoading = true;
        this.tableLoading = false;
        this.firstLoad = true;
      }
    })();
  }

  selectTableCaseRefs(caseRefs) {
    this.selectedCaseRefs = caseRefs;
  }

  // Function to handle a button clicked
  public handleTBut = (tBut: any): void => {
    switch (tBut.type) {
      case 'OTHER':
        if (tBut.id === 'refresh') {
          this.refreshEvent.emit(this.cConfig.applicationId);
        }
        break;
      case 'ACTION':
        if (this.selectedCaseRefs && this.selectedCaseRefs.length === 1) {
          this.oneCommonAction(tBut.id, this.selectedCases[0].id, tBut.formData);
        }
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
            if (cRef === sRef) {
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
  private oneCommonAction = (actionId: string, caseReference: string, formData: string): void => {
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      width: '70%',
      height: '70%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'tcs-style-dialog',
      data: {
        actionId,
        caseReference,
        appId: this.cConfig.applicationId,
        formData
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.detail.eventName === 'FORM_SUBMIT') {
          this.messageService.sendMessage('news-banner.topic.message', result.detail.actionName + ' successful...');
        }
        this.setActionButtons();
        // Refresh a little later till the case is updated
        setTimeout(() => {
          this.refreshEvent.emit(this.cConfig.applicationId)
        }, 500)
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
    if (!this.selectedCases) {
      this.actionButtons = [];
      this.toolBarNotification = '';
    } else {
      if (this.selectedCases.length > 1 && !this.cConfig.allowMultiple) {
        this.actionButtons = [];
        this.toolBarNotification = this.selectedCases.length + ' ' + this.cConfig.customTitle + ' cases selected...';
      } else {
        this.toolBarNotification = '';
        const actions = await Promise.all(this.selectedCases.map((investigation: InvestigationDetails) =>
          this.investigationService.getActionsForInvestigation(this.cConfig.applicationId, investigation.id, investigation.data.state).toPromise()
        ));

        const filteredActions = intersectionBy(...actions, 'id');
        const action2 = filteredActions.map((action: InvestigationActions) => {
          return {
            id: action.id,
            label: action.label,
            formData: action.formData,
            type: this.selectedCases.length > 1 ? 'MULTIPLE' : 'ACTION'
          } as TButton;
        });
        this.actionButtons = action2;
      }
    }
  }

  caseEventClicked(data: CaseEvent) {
    this.caseEvent.emit(data);
  }

  public handleSearch = ($event): void => {
    this.searchTerm = $event.detail.value;
  }

}
