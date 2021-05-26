import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageTopicService } from '@tibco-tcstk/tc-core-lib';
import { of } from 'rxjs';
import { concatMap, delay, filter, map, repeatWhen, take } from 'rxjs/operators';
import { RepositoryService } from 'src/app/api/repository.service';
import { AnalysisData } from 'src/app/model/analysisData';
import { AnalysisRequest } from 'src/app/model/analysisRequest';
import { DatasetListItem } from 'src/app/models/dataset';
import { NewAnalysisStepStatus } from 'src/app/models/discover';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { DatasetService } from 'src/app/service/dataset.service';
import { DataPreviewComponent } from '../../components/new-analysis/data-preview/data-preview.component';

@Component({
  selector: 'new-analysis',
  templateUrl: './new-analysis.component.html',
  styleUrls: ['./new-analysis.component.css']
})
export class NewAnalysisComponent implements OnInit {

  @ViewChild('dataPreview', {static: false}) dataPreview: DataPreviewComponent;

  objHeaderConfig;
  config: any;
  advancedMode: boolean;
  newAnalysis: AnalysisRequest;
  mode: 'edit' | 'create'
  disableSave = false;
  datasetName: string;
  showDataPreview: boolean;
  progress: any = {};

  private previousStep = 0;
  readonly ADVANCED_STEP_NUMBER = 3;

  constructor(
    private configService: ConfigurationService,
    private messageService: MessageTopicService,
    private datasetService: DatasetService,
    private router: Router,
    private route: ActivatedRoute,
    private repositoryService: RepositoryService
  ) {
  }

  ngOnInit(): void {
    this.messageService.sendMessage('integratedHelp', 'discover/new-analysis');
    if (this.route.snapshot.paramMap.get('id') !== null) {
      this.mode = 'edit';
    } else {
      this.mode = 'create';
    }
    this.initializeForm();
    this.advancedMode = false;
    this.showDataPreview = false;
    this.getStepperConfiguration(this.advancedMode);
    this.disableSave = false;
  }


  public createAnalysis = (): void => {
    // Disable the save button
    this.disableSave = true;

    this.progress = {
      message1: 'Your analysis will take a few minutes to be created. ',
      message2: 'You can stick around and wait or come back later to see it in the Process analysis table.',
      percentage: 0,
      status: '',
      enabled: false 
    }

    let method = this.repositoryService.createAnalysis(this.newAnalysis);
    if (this.mode === 'edit') {
      method = this.repositoryService.updateAnalysis(this.route.snapshot.paramMap.get('id'), this.newAnalysis);
    }
    method.pipe(
      concatMap(resp => {
        const id = resp.id;
        if (id) {
          this.progress.enabled = true;
          return this.repositoryService.repositoryAnalysisIdStatusGet(id).pipe(
            repeatWhen(obs => obs.pipe(delay(2000))),
            filter(data => {
              this.progress.percentage = data.progression;
              this.progress.status = data.message;
              return data.progression === 100
            }),
            take(1)
          );
        } else {
          console.error('Error creating the analysis.');
          return of({});
        }
      })
    ).pipe(
      // purposely delay 2 secs to show the final result before redirect to the list
      delay(2000)
    ).subscribe(
      success => {
        this.progress.enabled = false;
        const action = this.mode !== 'edit' ? 'created' : 'updated'
        const message = 'Analysis ' + this.newAnalysis.name + ' has been ' + action + ' successfully.'
        this.messageService.sendMessage('news-banner.topic.message', message);
        this.goProcessAnalsysis();
      },
      error => {
        console.error('Error creating the analysis.', error);
      }
    );
  }

  private initializeForm = (): void => {
    this.newAnalysis = {
      mappings: {},
      filters: [],
      groups: []
    } as unknown as AnalysisData;
    if (this.mode === 'edit') {
      this.repositoryService.getAnalysisDetails(this.route.snapshot.paramMap.get('id')).subscribe(
        res => {
          this.newAnalysis = res.data;
          this.createObjectHeader();
          this.datasetService.getDatasets().pipe(
            map((datasets: DatasetListItem[]) => {
              this.datasetName = datasets.filter(element => element.datasetid == this.newAnalysis.datasetId)[0].name;
            })
          ).subscribe();
        }
      )
    } else {
      this.createObjectHeader();
    }
  }

  private createObjectHeader = (): void => {
    this.objHeaderConfig = {
      title: {
        value: this.mode === 'create' ? 'Create a new analysis' : 'Edit ' + this.newAnalysis.name,
        isEdit: false,
        editing: false
      }
    };
  }

  public display = (element: string): boolean => {
    // Use for test data
    // return 'dataPreview' === element;
    return this.config.steps[this.config.currentStepIdx].slot === element;
  }

  private getStepperConfiguration = (advancedMode: boolean): void => {
    const isAvailable = this.mode === 'edit' ? true : false;
    const basicSteps = [
      {name: '1', available: true, completed: false, label: 'Basic info', slot: 'basic-info'},
      {name: '2', available: isAvailable, completed: false, label: 'Dataset', slot: 'dataset'},
      {name: '3', available: isAvailable, completed: false, label: 'Mapping', slot: 'map'},
      /*{name: '4', available: isAvailable, completed: true, label: 'Scheduling', slot: 'scheduling'},*/
      {name: '4', available: isAvailable, completed: false, label: 'Confirmation', slot: 'confirmation'}
    ];

    const advancedSteps = [
      {name: '5', available: isAvailable, completed: true, label: 'Advanced preparation', slot: 'dataPreview'},
    ];

    const steps = this.config ? this.config.steps.filter(obj => obj.slot !== 'dataPreview') : basicSteps;
    // For testdata
    // if (advancedMode || true) {
    if (advancedMode) {
      steps.splice(this.ADVANCED_STEP_NUMBER, 0, ...advancedSteps);
    }
    steps[steps.length - 2].name = (steps.length - 1) + '';
    steps[steps.length - 1].name = steps.length + '';

    const stepConfig = {
      steps,
      currentStepIdx: this.config ? this.config.currentStepIdx : 0
    };
    this.config = {...stepConfig};
  }

  public goProcessAnalsysis = (): void => {
    this.router.navigate(['/discover/process-analysis']);
  }

  public handleData = (event: string[]): void => {
    this.newAnalysis[event[0]] = event[1];
    if ( event[0]=== 'name') { this.createObjectHeader(); }
  }

  public handleStatus = ($event: NewAnalysisStepStatus): void => {
    const stepStatus = this.config.steps.filter(step => step.slot === $event.step)[0];
    stepStatus.completed = $event.completed;
  }

  public async changeTab(delta: number) {
    await this.checkClickedAwayFromAdvanced(this.config.currentStepIdx);
    const newSteptStep = this.config.currentStepIdx + delta;
    this.checkClickedIntoAdvanced(newSteptStep);
    this.config.steps[newSteptStep].available = true;
    this.config = {...this.config, currentStepIdx: newSteptStep};
  }

  public async handleStepClick(step) {
    await this.checkClickedAwayFromAdvanced(this.previousStep);
    this.checkClickedIntoAdvanced(step.detail);
    this.previousStep = step.detail;
    // this.config.currentStepIdx = step.detail;
  }

  // Check if the user clicked into advanced so we can send data to SF
  private checkClickedIntoAdvanced(stepNumber) {
    if (stepNumber === this.ADVANCED_STEP_NUMBER && this.advancedMode) {
      this.dataPreview?.ngOnInit();
      this.dataPreview?.updateStatus(null);
    }
  }

  // Check if the user clicked away from advanced so we need to read the spotfire data.
  private async checkClickedAwayFromAdvanced(oldStepNumber) {
    if (oldStepNumber === this.ADVANCED_STEP_NUMBER && this.advancedMode) {
      // console.log('Clicked away from advanced...');
      if (this.dataPreview) {
        await this.dataPreview.extractSpotfireFilterData();
        // Trigger a change on the analysis
        this.newAnalysis = {...this.newAnalysis};
      }
    }
  }

  public handleSelectedDataset = (event): void => {
    this.newAnalysis.datasetId = event.value;
    this.datasetName = event.label;
  }

  public hide = (element: string): boolean => {
    if (element === 'prev') {
      return this.config.currentStepIdx === 0;
    }
    if (element === 'next') {
      return this.config.currentStepIdx === this.config.steps.length - 1; // this.config.currentStepIdx === 4 && !this.advancedMode;
    }
    if (element === 'finish') {
      return this.config.currentStepIdx !== this.config.steps.length - 1;
    }
  }

  public toggleAdvanced = (): void => {
    this.advancedMode = !this.advancedMode;
    if (this.advancedMode) {
      this.showDataPreview = true;
    }
    this.getStepperConfiguration(this.advancedMode);
  }

  public getEndButtonText = (): string => {
    return this.mode === 'edit' ? 'Save' : 'Finish'
  }

  public handleDisableNextButton = (): boolean => {
    return !this.config.steps[this.config.currentStepIdx].completed; //  !this.config.steps.filter(status => status.step === this.config.steps[this.config.currentStepIdx].slot)[0].completed;
  }
}
