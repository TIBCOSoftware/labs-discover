import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {VisualisationService} from 'src/app/backend/api/visualisation.service';
import {DiscoverConfiguration, Template, TemplateMenuConfig, TemplateRequest, Visualisation} from 'src/app/backend/model/models';
import {ConfigurationService} from '../../service/configuration.service';
import {cloneDeep} from 'lodash-es';
import {notifyUser} from '../../functions/message';
import {stripUiIdFromTemplate} from '../../functions/templates';
import {StepStatus} from '../../models_ui/analyticTemplate';

@Component({
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.css']
})
export class TemplateEditorComponent implements OnInit {

  constructor(
    private messageService: MessageTopicService,
    private router: Router,
    private route: ActivatedRoute,
    private visualisationService: VisualisationService,
    protected configService: ConfigurationService
  ) {
  }

  private mode: 'edit' | 'create';
  private discover: DiscoverConfiguration;

  objHeaderConfig;
  config: any;
  request: TemplateRequest;
  doAdvanced: boolean;
  pageOptions: string[];
  markingOptions: string[];
  dataOptions: any;
  previewMenu: TemplateMenuConfig[];
  previewFilterMenu: TemplateMenuConfig[];
  baseTemplateId: string;
  analyticsOption: 'COPY' | 'EXISTING' | 'CUSTOM' | 'CURRENT';
  newAnalytics: string;
  selectedAnalytics: string;

  folders: Visualisation[];


  ngOnInit(): void {
    this.discover = cloneDeep(this.configService.config.discover);
    this.doAdvanced = false;
    this.messageService.sendMessage('integratedHelp', 'discover/new-template');
    if (this.route.snapshot.paramMap.get('name') !== null) {
      this.mode = 'edit';
      this.analyticsOption = 'CUSTOM';
    } else {
      this.mode = 'create';
      this.analyticsOption = 'COPY';
    }
    this.initializeForm();
    this.getStepperConfiguration(false);
    this.visualisationService.getItems('folder')
      .subscribe((folders) => {
        this.folders = folders
      })
  }

  private initializeForm = (): void => {
    if (this.mode === 'create') {
      this.route.queryParams.subscribe(
        params => {
          // Converted to string to fix comparison
          this.baseTemplateId = params?.templateToCreateFrom + '';
          this.request = {} as TemplateRequest;
          this.request.template = {} as Template;
          this.createObjectHeader();
        }
      )
    }

    if (this.mode === 'edit') {
      // Trick to update the screen
      this.request = null;
      // window.setTimeout(() => {
      this.visualisationService.getTemplate(this.route.snapshot.paramMap.get('name')).subscribe(
        (template: Template) => {
          this.request = {} as TemplateRequest;
          this.request.template = template;
          if(!this.request.template.filters) {
            this.request.template.filters = [];
          }
          this.selectedAnalytics = this.request.template.spotfireLocation;
          this.createObjectHeader();
        }
      );
    }
  }

  private createObjectHeader = (): void => {
    let tempS = '';
    if (this.request.template?.name) {
      tempS = ': ' + this.request.template?.name
    }
    this.objHeaderConfig = {
      title: {
        value: this.mode === 'create' ? 'Create a template' + tempS : 'Edit template' + tempS,
        isEdit: false,
        editing: false
      }
    };
  }

  public isMode = (mode: string): boolean => {
    return this.mode === mode;
  }

  public display = (element: string): boolean => {
    return this.config.steps[this.config.currentStepIdx].slot === element;
  }

  private getStepperConfiguration = (advancedAvailable: boolean): void => {
    let confirmLabel = 'Confirmation';
    if (this.mode === 'edit') {
      this.doAdvanced = true;
      advancedAvailable = true;
      confirmLabel = 'Summary';
    }
    this.config = {
      steps: [
        {available: true, completed: false, label: 'Basic info', slot: 'basic-info'},
        {available: this.mode === 'edit', completed: false, label: 'Analysis source', slot: 'analytics'},
        {available: this.mode === 'edit', completed: false, label: 'Analytics menu configuration', slot: 'analytics-menu-configuration'},
        {available: this.mode === 'edit', completed: false, label: 'Analytics filters panel', slot: 'analytics-filter-panel'},
        {available: this.mode === 'edit', completed: false, label: confirmLabel, slot: 'confirmation'}
      ],
      currentStepIdx: this.config ? this.config.currentStepIdx : 0
    };

    if (this.doAdvanced) {
      const advancedStep = {available: advancedAvailable, completed: false, label: 'Additional options', slot: 'additional-options'};
      this.config.steps.splice(4, 0, advancedStep);
    }
    for (let i = 1; i <= this.config.steps.length; i++) {
      this.config.steps[i - 1].name = i + '';
    }
  }

  public goTemplates = (): void => {
    this.router.navigate(['/discover/templates']);
  }

  public handleAdvanced = ($event): void => {
    this.doAdvanced = $event;
    this.getStepperConfiguration(this.mode === 'edit');
  }

  public updateTemplate = (data: any) => {
    this.request.template = data;
  }

  public updateAnalytics = (event: any): void => {
    this.analyticsOption = event.option;
    switch (this.analyticsOption) {
      case 'CUSTOM':
        this.selectedAnalytics = event.analytics;
        delete this.request.visualisation;
        break;
      case 'EXISTING':
        this.selectedAnalytics = event.analytics;
        delete this.request.visualisation;
        break;
      case 'CURRENT':
        this.visualisationService.getTemplates().subscribe(
          (templates: Template[]) => {
            this.selectedAnalytics = templates.find(t => t.id + '' === this.baseTemplateId + '').spotfireLocation;
          })
        delete this.request.visualisation;
        break;
      case 'COPY':
        this.selectedAnalytics = event.analytics;
        // When destination can't be found use the current folder
        this.request.visualisation = {
          sourceId: event.id,
          destinationFolderId: event.folderId
        }
        if (this.folders) {
          this.setFDestinationId(event.id)
        } else {
          this.visualisationService.getItems('folder')
            .subscribe((folders) => {
              this.folders = folders;
              this.setFDestinationId(event.id);
            })
        }
        break;
      default:
        break;
    }
  }

  private setFDestinationId(sourceId) {
    if (sourceId) {
      for (const fol of this.folders) {
        if (fol.Path === this.discover.analytics.customUserFolder) {
          this.request.visualisation = {
            sourceId,
            destinationFolderId: fol.Id
          }
        }
      }
    }
  }

  public handleStatus = (sStatus:StepStatus): void => {
    const stepStatus = this.config.steps.filter(step => step.slot === sStatus.step)[0];
    stepStatus.completed = sStatus.completed;
  }

  public changeTab = (delta: number): void => {
    const newSteptStep = this.config.currentStepIdx + delta;
    this.config.steps[newSteptStep].available = true;
    this.config = {...this.config, currentStepIdx: newSteptStep};
  }

  public handleStepClick = (step): void => {
    this.config.currentStepIdx = step.detail;
  }

  public handlePageOptions = (event): void => {
    this.pageOptions = event;
  }

  public handleMarkingOptions = (event): void => {
    this.markingOptions = event;
  }

  public handleDataOptions = (event): void => {
    this.dataOptions = event;
  }

  public hide = (element: string): boolean => {
    const lastIdx = this.config.steps.length - 1;
    if (element === 'prev') {
      return this.config.currentStepIdx === 0 || this.mode === 'edit';
    }
    if (element === 'next') {
      return this.config.currentStepIdx === lastIdx || this.mode === 'edit';
    }
    if (element === 'create') {
      return this.config.currentStepIdx !== lastIdx || this.mode !== 'create';
    }
    if (element === 'save') {
      return this.mode !== 'edit';
    }
  }

  public handleDisableNextButton = (): boolean => {
    return !this.config.steps[this.config.currentStepIdx].completed; //  !this.config.steps.filter(status => status.step === this.config.steps[this.config.currentStepIdx].slot)[0].completed;
  }

  public getPreviewLocation = (): string => {
    if (this.analyticsOption === 'COPY') {
      return this.request.template.spotfireLocation;
    } else {
      return this.selectedAnalytics;
    }
  }

  public handleCreateUpdateClicked = (): void => {
    this.request.template = stripUiIdFromTemplate(this.request.template);
    let method = this.visualisationService.createTemplate(this.request);
    if (this.mode === 'edit') {
      method = this.visualisationService.updateTemplate(this.request.template.id, this.request.template);
    }
    this.request.template.spotfireLocation = this.selectedAnalytics;
    method.subscribe(
      success => {
        const action = this.mode !== 'edit' ? 'created' : 'updated'
        const message = 'Template ' + this.request.template.name + ' has been ' + action + ' successfully.'
        this.messageService.sendMessage('news-banner.topic.message', message);
        this.router.navigate(['/discover/templates']);
      },
      error => {
        let message = 'Error creating the template...';
        if (this.mode === 'edit') {
          message = 'Error updating the template...';
        }
        console.error(message, error);
        notifyUser('ERROR', message, this.messageService);
      }
    );
  }
}
