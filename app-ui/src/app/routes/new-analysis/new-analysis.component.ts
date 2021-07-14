import {Location} from '@angular/common';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {forkJoin, Observable, of} from 'rxjs';
import {concatMap, delay, filter, map, repeatWhen, take, tap} from 'rxjs/operators';
import {RepositoryService} from 'src/app/api/repository.service';
import {AnalysisData} from 'src/app/model/analysisData';
import {AnalysisRequest} from 'src/app/model/analysisRequest';
import {DatasetListItem} from 'src/app/models_ui/dataset';
import {NewAnalysisStepStatus} from 'src/app/models_ui/discover';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {DatasetService} from 'src/app/service/dataset.service';
import {DataPreviewComponent} from '../../components/new-analysis/data-preview/data-preview.component';
import {AutoMappingService} from '../../service/auto-mapping.service';
import {Mapping} from '../../model/mapping';
import {MapDef, Option, PreviewUI} from '../../models_ui/analysis';
import {DiscoverBackendService} from '../../service/discover-backend.service';
import {calculateColumns} from '../../functions/analysis';

@Component({
  selector: 'new-analysis',
  templateUrl: './new-analysis.component.html',
  styleUrls: ['./new-analysis.component.scss']
})
export class NewAnalysisComponent implements OnInit {

  constructor(
    private messageService: MessageTopicService,
    private datasetService: DatasetService,
    private backendService: DiscoverBackendService,
    private configService: ConfigurationService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private repositoryService: RepositoryService,
    private autoMapService: AutoMappingService
  ) {
  }

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
  originalName = '';

  private previousStep = 0;
  readonly ADVANCED_STEP_NUMBER = 3;

  successImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/success-image.svg');
  errorImage: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/error-image.svg');
  showResult = false;
  newAnalysisId: string;
  success = true;
  errorMsg;
  doAutoMap = true;

  datasetOption$: Observable<Option[]>

  previewD: PreviewUI;
  isDataPreviewError = false;

  ngOnInit(): void {
    this.messageService.sendMessage('integratedHelp', 'discover/new-analysis');
    this.advancedMode = false;
    this.showDataPreview = false;
    if (this.route.snapshot.paramMap.get('id') !== null) {
      this.mode = 'edit';
      this.showDataPreview = true;
      this.advancedMode = true;
      this.doAutoMap = false;
    } else {
      this.mode = 'create';
    }
    this.initializeForm();
    this.getStepperConfiguration(this.advancedMode);
    this.disableSave = false;

    this.datasetOption$ = this.datasetService.getDatasets().pipe(
      map((datasets: DatasetListItem[]) => {
        return datasets
          .filter(dataset => dataset.status === 'COMPLETED')
          .map(dataset => ({label: dataset.name, value: String(dataset.datasetid)}))
          .sort((a, b) => (a.label > b.label) ? 1 : -1);
      })
    )
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
          this.originalName = this.newAnalysis.name;
          this.createObjectHeader();
          this.datasetOption$.pipe(
            map((datasets: Option[]) => {
              const dsT = datasets.filter(element => element.value === this.newAnalysis.datasetId)[0]
              this.datasetName = dsT.label;
              this.getPreviewData(dsT.value)
            })
          ).subscribe()
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

  private getPreviewData(datasetId: string) {
    const columns$ = this.backendService.getColumnsFromSpark(datasetId, this.configService.config.claims.globalSubcriptionId);
    const preview$ = this.backendService.getPreviewFromSpark(datasetId, this.configService.config.claims.globalSubcriptionId);
    forkJoin([columns$, preview$]).subscribe(results => {
        const avCol = results[0].map(column => column.COLUMN_NAME);
        const col = calculateColumns(results[0]);
        this.previewD = {
          availableColumns: avCol,
          columns: col,
          data: JSON.parse(results[1])
        }
        this.isDataPreviewError = false;
      },
      error => {
        console.log('Error: ', error);
        this.isDataPreviewError = true;
      });
  }


  public display = (element: string): boolean => {
    return this.config.steps[this.config.currentStepIdx].slot === element;
  }

  private getStepperConfiguration = (advancedMode: boolean): void => {
    let isAvailable = false;
    let confirmLabel = 'Confirmation';
    let advLabel = 'Advanced preparation';
    if (this.mode === 'edit') {
      isAvailable = true;
      confirmLabel = 'Summary';
      advLabel = 'Advanced';
      this.advancedMode = true;
    }
    const basicSteps = [
      {name: '1', available: true, completed: false, label: 'Basic info', slot: 'basic-info'},
      {name: '2', available: isAvailable, completed: false, label: 'Dataset', slot: 'dataset'},
      {name: '3', available: isAvailable, completed: false, label: 'Mapping', slot: 'map'},
      /*{name: '4', available: isAvailable, completed: true, label: 'Scheduling', slot: 'scheduling'},*/
      {name: '4', available: isAvailable, completed: false, label: confirmLabel, slot: 'confirmation'}
    ];
    const advancedSteps = [
      {name: '5', available: isAvailable, completed: true, label: advLabel, slot: 'dataPreview'},
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
    if (event[0] === 'name') {
      this.createObjectHeader();
    }
  }

  public handleStatus = (newStatus: NewAnalysisStepStatus): void => {
    const stepStatus = this.config.steps.filter(step => step.slot === newStatus.step)[0];
    stepStatus.completed = newStatus.completed;
    if (newStatus.step === 'map' && stepStatus.completed) {
      this.doAutoMap = false
    }
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
    if (this.newAnalysis.datasetId !== event.value) {
      this.doAutoMap = true;
      if (this.newAnalysis.mappings) {
        this.newAnalysis.mappings = {} as unknown as Mapping;
      }
    }
    this.newAnalysis.datasetId = event.value;
    this.datasetName = event.label;
    this.getPreviewData(this.newAnalysis.datasetId)
  }

  public hide = (element: string): boolean => {
    if (element === 'prev') {
      return this.config.currentStepIdx === 0 || this.mode === 'edit';
    }
    if (element === 'next') {
      return this.config.currentStepIdx === this.config.steps.length - 1 || this.mode === 'edit'; // this.config.currentStepIdx === 4 && !this.advancedMode;
    }
    if (element === 'finish') {
      return this.config.currentStepIdx !== this.config.steps.length - 1 || this.mode === 'edit';
    }
    if (element === 'save') {
      return this.mode !== 'edit';
    }
  }

  public toggleAdvanced = (): void => {
    this.advancedMode = !this.advancedMode;
    if (this.advancedMode) {
      this.showDataPreview = true;
    }
    this.getStepperConfiguration(this.advancedMode);
  }

  public handleDisableNextButton() {
    return !this.config.steps[this.config.currentStepIdx].completed;
  }

  public goToAnalysis() {
    this.router.navigate(['/discover/process-analysis']);
  }

  public goToTemplate() {
    if (this.newAnalysisId) {
      this.router.navigate([`/discover/select-template/${this.newAnalysisId}`]);
    }
  }

  createAnalysis = (): void => {
    // Disable the save button
    this.disableSave = true;
    this.progress = {
      message1: 'We need a few minutes to create your analysis.',
      message2: 'You can stick around or come back later to see it in the Process analysis table.',
      percentage: 0,
      status: '',
      enabled: false
    }
    // Store the mappings
    this.autoMapService.storeMappings(this.newAnalysis.mappings);
    // Create the analysis
    this.repositoryService.createAnalysis(this.newAnalysis).pipe(
      concatMap(resp => {
        const id = resp.id;
        this.newAnalysisId = id;
        this.progress.enabled = true;
        return this.repositoryService.repositoryAnalysisIdStatusGet(id).pipe(
          repeatWhen(obs => obs.pipe(delay(2000))),
          filter(data => {
            this.progress.percentage = data.progression;
            this.progress.status = data.message;
            return (data.progression === 100 || (data.progression === 0 && data.message !== 'Starting ...'))
          }),
          take(1)
        );
      })
    ).pipe(
      // purposely delay 2 secs to show the final result before redirect to the list
      delay(2000)
    ).subscribe(
      analysisStatus => {
        this.progress.enabled = false;
        this.showResult = true;
        this.success = analysisStatus.progression === 100;
        if (!this.success && analysisStatus.message) {
          this.errorMsg = analysisStatus.message;
        }
        const action = this.mode !== 'edit' ? 'created' : 'updated';
        const message = `Analysis ${this.newAnalysis.name} has been ${action} successfully.`
        window.setTimeout(() => {
          this.messageService.sendMessage('news-banner.topic.message', message);
        }, 3000);

      },
      error => {
        // todo: show the error result page
        console.error('Error creating the analysis.', error);
        this.showResult = true;
        this.success = false;
        this.errorMsg = 'Failed to create the analysis';
      }
    );
  }

  async updateAnalysis(doRerun: boolean) {
    // Get the latest spotfire filters
    if (this.showDataPreview) {
      await this.dataPreview.extractSpotfireFilterData();
    }
    // Check if mappings have changed
    this.repositoryService.getAnalysisDetails(this.route.snapshot.paramMap.get('id')).subscribe(anal => {
      // analysis.data.mappings.
      let mappingChanged = false;
      const FIELD_NAMES = MapDef.PROP_NAMES.concat(MapDef.PROP_NAMES_TIME);
      FIELD_NAMES.forEach(field => {
        if (anal.data.mappings[field] !== this.newAnalysis.mappings[field]) {
          mappingChanged = true;
        }
      });
      if (mappingChanged) {
        // Store the mappings
        this.autoMapService.storeMappings(this.newAnalysis.mappings);
      }
      this.repositoryService.updateAnalysis(this.route.snapshot.paramMap.get('id'), this.newAnalysis).subscribe(
        analysis => {
          const message = `Analysis ${this.newAnalysis.name} has been updated successfully.`
          this.messageService.sendMessage('news-banner.topic.message', message);
          window.setTimeout(() => {
            if (doRerun) {
              this.repositoryService.runAnalysisAction(analysis.id, 'Rerun').subscribe(response => {
                this.goToAnalysis();
              })
            } else {
              this.goToAnalysis();
            }
          }, 1000);
        },
        error => {
          console.error('Error updating the analysis.', error);
          this.showResult = true;
          this.success = false;
          this.errorMsg = 'Failed to update the analysis';
        });
    });
  }
}
