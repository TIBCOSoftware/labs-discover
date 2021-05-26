import {Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageTopicService } from '@tibco-tcstk/tc-core-lib';
import {VisualisationService} from 'src/app/api/visualisation.service';
import { Template, TemplateMenuConfig, TemplateRequest } from 'src/app/model/models';

@Component({
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.css']
})
export class TemplateEditorComponent implements OnInit {

  constructor(
    private messageService: MessageTopicService,
    private router: Router,
    private route: ActivatedRoute,
    private visualisationService: VisualisationService
  ) {}

  public objHeaderConfig;
  public config: any;
  public request: TemplateRequest;
  private mode: 'edit' | 'create';
  public doAdvanced: boolean;
  public pageOptions: string[];
  public markingOptions: string[];
  public dataOptions: any;
  public previewMenu: TemplateMenuConfig[];
  public baseTemplate: number;
  public analyticsOption: 'EXISTING' | 'COPY' | 'CUSTOM';
  public newAnalytics: string;

  public selectedAnalytics: string;

  ngOnInit(): void {
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
    this.getStepperConfiguration();
  }

  private initializeForm = (): void => {
    if (this.mode === 'create') {
      this.route.queryParams.subscribe(
        params => {
          this.baseTemplate = Number(params?.templateToCreateFrom);
          this.request = { } as TemplateRequest;
          this.request.template = {} as Template;
          this.createObjectHeader();
        }
      )
    }

    if (this.mode === 'edit') {
      // Trick to update the screen
      this.request = null;
      // window.setTimeout(() => {
      this.visualisationService.getTemplate(Number(this.route.snapshot.paramMap.get('name'))).subscribe(
        (template: Template) => {
          this.request = { } as TemplateRequest;
          this.request.template = template;
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

  private getStepperConfiguration = (): void => {
    this.config = {
      steps: [
        {available: true, completed: false, label: 'Basic info', slot: 'basic-info'},
        {available: this.mode === 'edit', completed: false, label: 'Analytics', slot: 'analytics'},
        {available: this.mode === 'edit', completed: false, label: 'Analytics menu configuration', slot: 'analytics-menu-configuration'},
        {available: this.mode === 'edit', completed: false, label: 'Confirmation', slot: 'confirmation'}
      ],
      currentStepIdx: this.config ? this.config.currentStepIdx : 0
    };

    if (this.doAdvanced) {
      const advancedStep = {available: false, completed: false, label: 'Additional options', slot: 'additional-options'};
      this.config.steps.splice(3, 0, advancedStep);
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
    this.getStepperConfiguration();
  }

  public updateTemplate = (data: any) => {
    this.request.template = data;
  }
  public updateAnalytics = (event: any): void => {
    this.selectedAnalytics = event.analytics;
    this.analyticsOption = event.option;
    switch (this.analyticsOption) {
      case 'CUSTOM':
        // this.selectedAnalytics = event.analytics;
        delete this.request.visualisation;
        break;

      case 'EXISTING':
        // this.selectedAnalytics = event.analytics;
        delete this.request.visualisation;
        break;

      case 'COPY':
        this.request.visualisation = {
          sourceId: event.id,
          destinationFolderId: event.folderId
        }
        break;
      default:
        break;
    }
  }

  public handleStatus = ($event): void => {
    const stepStatus = this.config.steps.filter(step => step.slot === $event.step)[0];
    stepStatus.completed = $event.completed;
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
    if (this.analyticsOption === 'COPY'){
      return this.request.template.spotfireLocation;
    } else {
      return this.selectedAnalytics;
    }
  }

  public handleCreateUpdateClicked = (): void => {

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
      },
      error => {
        console.error('Error creating the template.', error);
      }
    );
  }
}
