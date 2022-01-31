import { Location } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MessageTopicService, TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { DocumentationsService } from 'src/app/backend/api/documentations.service';
import { NimbusDocument } from 'src/app/models_ui/nimbus';
import { DiscoverBackendService } from 'src/app/service/discover-backend.service';
import { NewAnalysisStepStatus } from '../../../models_ui/discover';


@Component({
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class NewProcessDocumentWizardComponent implements OnInit {

  @Output() nimbusDocumentCreated: EventEmitter<any> = new EventEmitter();

  missingSubscriptionImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/missing-subscription.svg');
  successDocumentImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/success-process-document.svg');
  errorDocumentImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/error-process-document.svg');

  config: any;
  // saveEnabled = false;

  progress: any = {};
  showResult = false;

  success = false;
  errorMsg;

  isNewDataSet: boolean;

  private statuses: NewAnalysisStepStatus[];

  private newMapId: string;

  readonly steps = [
    {
      name: 'nimbus-doc-basic-info',
      label: 'Name and location'
    },
    {
      name: 'nimbus-doc-confirmation',
      label: 'Confirmation'
    }
  ]

  noNimbusSubscription = true;

  document: NimbusDocument;
  graphJson: any;

  constructor(
    public dialogRef: MatDialogRef<NewProcessDocumentWizardComponent>,
    private messageService: MessageTopicService,
    private backendService: DiscoverBackendService,
    private documentationService: DocumentationsService,
    private location: Location,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // don't close dialog when the outside is clicked
    dialogRef.disableClose = true;
    console.log('data in new document dialog', data);
    this.graphJson = data?.graphJson;
    this.noNimbusSubscription = !data?.hasValidSubscription;
  }

  ngOnInit(): void {

    this.messageService.sendMessage('integratedHelp', 'discover/process-analysis/wizard');
    this.getStepperConfiguration();

    this.document = {
      name: ''
    }
  }

  private getStepperConfiguration = (): void => {

    const steps = this.steps.map((step, index) => {
      return {
        slot: step.name,
        name: '' + (index+1),
        label: step.label,
        available: index == 0 ? true : undefined
      }
    })

    const stepConfig = {
      steps,
      currentStepIdx: 0
    };
    if (this.data.dataset?.datasetid) {
      // make all steps available
      stepConfig.steps.forEach(step => step.available = true);
    }
    this.config = {...stepConfig};
    this.initStatuses();
    if (this.data.dataset?.datasetid) {
      // make all steps complete
      this.statuses.forEach(status => status.completed = true);
    }
  }

  public stopEdit($event) {
    const name = $event;
    let start = false;
    let i = 0;
    while (i < this.config.steps.length) {
      if (start) {
        this.config.steps[i].available = false;
      } else {
        start = this.config.steps[i].slot === name;
      }
      i++;
    }

    start = false;
    i = 0;
    while (i < this.statuses.length) {
      if (start) {
        this.statuses[i].completed = false;
      } else {
        start = this.statuses[i].step === name;
      }
      i++;
    }

  }

  private initStatuses = (): void => {
    this.statuses = this.steps.map(step => {
      return {
        step: step.name,
        completed: false
      }
    });
  }

  public onCancel = (): void => {
    this.dialogRef.close();
    if (this.progress.enabled) {
      this.nimbusDocumentCreated.emit();
    }
  }

  public changeTab = (delta: number): void => {
    const newSteptStep = this.config.currentStepIdx + delta;
    this.config.steps[newSteptStep].available = true;
    this.config = {...this.config, currentStepIdx: newSteptStep};
  }

  public hide = (element: string): boolean => {
    if (element === 'prev') {
      return this.config.currentStepIdx === 0;
    }
    if (element === 'next') {
      return this.config.currentStepIdx === this.steps.length-1;
    }
    if (element === 'finish') {
      return this.config.currentStepIdx !== this.steps.length-1;
    }
  }

  public display = (element: string): boolean => {
    for (let i = 0; i < this.steps.length; i++) {
      if (element === this.steps[i].name) {
        return this.config.currentStepIdx === i;
      }
    }
  }

  public handleStepClick = (step): void => {
    this.config.currentStepIdx = step.detail;
  }

  public handleStatus = ($event: NewAnalysisStepStatus): void => {
    const stepStatus = this.statuses.filter(status => status.step === $event.step)[0];
    stepStatus.completed = $event.completed;
  }

  public allStepCompleted() {
    return this.statuses.filter(status => !status.completed).length === 0;
  }

  public handleDisableNextButton = (): boolean => {
    return !this.statuses.filter(status => status.step === this.config.steps[this.config.currentStepIdx].slot)[0].completed;
  }

  public handleDisablePrevButton = (): boolean => {
    return false;
  }

  public handlePreviewData = (event): void => {
  }

  public createProcessDocument = () => {
    this.documentationService.postExport(this.document.folder.mapFolderId, this.document.name, this.graphJson).subscribe(resp => {
      console.log(resp);
      // notifyUser('INFO', `Successfully created process document '${this.document.name}`, this.messageService);
      this.newMapId = resp['mapId'];
      this.nimbusDocumentCreated.emit();
      this.success = true;
      this.showResult = true;
    }, error => {
      this.success = false;
      this.showResult = true;
    });
    
  }

  public closeDialog() {
    this.dialogRef.close();
  }

  public viewProcessDocument() {
    this.backendService.login().subscribe(resp => {
      const orgId = resp.orgId.toUpperCase();
      const url = `https://eu.nimbus.cloud.tibco.com/${orgId}/CtrlWebIsapi.dll/app/diagram/${this.newMapId}`
      this.openLinkInTab(url);
    });
  }

  private openLinkInTab(url: string) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  public goToSubscriptions() {
    // get region
    const url = 'https://eu.account.cloud.tibco.com/manage/subscription';
    this.openLinkInTab(url);
  }

}
