import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VisualisationService } from 'src/app/api/visualisation.service';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { Location } from '@angular/common';
import { checkIfTemplateNameExists, TEMPLATE_EXISTS_MESSAGE } from '../../../functions/templates';
import { Template } from 'src/app/model/models';
import { cloneDeep } from 'lodash-es';
import {StepStatus} from '../../../models_ui/analyticTemplate';

@Component({
  selector: 'template-basic-info',
  templateUrl: './template-basic-info.component.html',
  styleUrls: ['./template-basic-info.component.css']
})
export class TemplateBasicInfoComponent implements OnInit {

  @Input() template: Template;
  /*@Input() doAdvancedTab: boolean;*/
  @Input() isNewTemplate: boolean;
  @Input() baseTemplateId: string;

  /*@Output() doAdvancedE: EventEmitter<boolean> = new EventEmitter<boolean>();*/
  @Output() updateTemplate: EventEmitter<Template> = new EventEmitter<Template>();
  @Output() status: EventEmitter<StepStatus> = new EventEmitter<StepStatus>();

  public templateLabels: { label: string, value: string }[];

  public iconCode: string;
  public nameHint: string;

  public ICON_GRID = [
    ['default.svg', 'webflow.svg',  'business.svg',         'construction.svg',       'customers.svg',      'healthcare.svg', 'manufacturing.svg', 'retail.svg'],
    ['science.svg', 'security.svg', 'shield-insurance.svg', 'telecommunications.svg', 'transportation.svg', 'warehouse.svg',  'banking.svg',       'building.svg']
  ];

  public templates: Template[];

  constructor(
    private location: Location,
    protected visualisationService: VisualisationService
  ) {
    this.ICON_GRID.map((row, i) => {
      this.ICON_GRID[i] = row.map(icon => {
        if (icon.indexOf('.svg') > 0) {
          return TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/svg/' + icon);
        } else {
          return icon;
        }
      })
    })
  }

  ngOnInit(): void {
    if (!this.isNewTemplate){
      this.iconCode = this.template.icon;
    }
    this.visualisationService.getTemplates().subscribe(
      (templates: Template[]) => {
        this.templates = templates;
        this.templateLabels = templates.map(template => ({label: template.name, value: String(template.id)})).sort((a, b) => (a.label > b.label) ? 1 : -1);
        if (this.template.name === undefined){
          this.handleTemplateSelection({detail: {value: this.baseTemplateId}});
        }
      }
    );
  }

  async handleUpdate(event, fieldName) {
    if (this.template) {
      this.template[fieldName] = event.detail.value;
      this.updateTemplate.emit(this.template);
      this.updateStatus();
    }
  }

  public handleTemplateSelection = (event: any): void => {
    const template = this.templates.filter(temp => temp.id + '' === event.detail.value + '')[0];
    if (template?.id && template) {
      this.template = cloneDeep(template);
      this.template.type = 'User defined';
      this.template.icon = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/svg/' + 'default.svg');
      this.template.splash = '';
      this.template.name = 'Copy of ' + this.template.name;
      this.updateTemplate.emit(this.template);
    }
  }

  /*
  public toggleAdvanced = (event): void => {
    this.doAdvancedTab = event.detail.checked;
    this.doAdvancedE.emit(this.doAdvancedTab);
    this.updateStatus();
  }*/

  public selectCardIcon(icon) {
    this.template.icon = icon;
  }

  public isValid = (field: string): boolean => {
    return this.nameHint && this.nameHint !== '';
  }

  private updateStatus = (): void => {
    if (this.templates){
      const valid = this.isFormValid();
      if (!valid) {
        this.nameHint = !this.template.name ? 'Template name can\'t be empty.' : TEMPLATE_EXISTS_MESSAGE;
      } else {
        this.nameHint = '';
      }
      const status = valid;
      const stepStatus: StepStatus = {
        step: 'basic-info',
        completed: status
      };
      this.status.emit(stepStatus);
    }
  }

  private isFormValid(): boolean {
    return this.templates.filter(temp => {
      return (this.isNewTemplate ? this.template.name === '' || temp.name === this.template.name : temp.id !== this.template.id && temp.name === this.template.name);
    }).length === 0;
  }

}
