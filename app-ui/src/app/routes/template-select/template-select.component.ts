import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {AnalyticTemplateUI} from '../../models_ui/analyticTemplate';
import { RepositoryService } from 'src/app/backend/api/repository.service';
import { Analysis } from 'src/app/backend/model/analysis';
import { VisualisationService } from 'src/app/backend/api/visualisation.service';
import {compareTemplates} from '../../functions/templates';
import {getShortMessage} from "../../functions/details";

@Component({
  selector: 'template-select',
  templateUrl: './template-select.component.html',
  styleUrls: ['./template-select.component.css']
})
export class TemplateSelectComponent implements OnInit {

  public templates: AnalyticTemplateUI[];
  public objHeaderConfig: any;
  public analysis: Analysis;
  showListTemplates = false;

  constructor(
    protected router: Router,
    protected location: Location,
    protected route: ActivatedRoute,
    protected repositoryService: RepositoryService,
    protected visualisationService: VisualisationService
  ) { }

  ngOnInit(): void {
    this.refresh();
  }

  public goProcessAnalysis = (): void => {
    this.router.navigate(['/discover/process-analysis']);
  }

  public refresh = (): void => {
    this.visualisationService.getTemplates().subscribe( (aTemplates) => {
      this.templates = aTemplates.sort(compareTemplates);
      const template$ = this.templates;
      const analysis$ = this.repositoryService.getAnalysisDetails(this.route.snapshot.paramMap.get('name'));
      forkJoin([template$, analysis$]).subscribe(async results => {
        this.analysis = results[1];
        const formatDate = new Date(this.analysis.metadata.createdOn).toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        let tempText = 'No template selected';
        if(this.analysis?.data?.templateId){
          try {
            const templateDetails = await this.visualisationService.getTemplate(this.analysis.data.templateId).toPromise();
            tempText = 'Template: ' + templateDetails.name
          } catch (e) {
            // TODO: Specifically check for a 404 when the backend is updated
            console.error('TEMPLATE ERROR ', e);
          }
        }
        this.objHeaderConfig = {
          title: {
            value: this.analysis.data.name,
          },
          details: [
            {
              value: 'Created by ' + this.analysis.metadata.createdBy
            },
            {
              value: 'Created on ' + formatDate,
            },
            {
              value: getShortMessage(this.analysis.data.description, 50),
            },
            {isEdit: true, editing: false, value: tempText, eventOnEdit: true, id: 'template'}
          ]
        };
        this.showListTemplates = true;
      });
    })
    // const template$ = this.templatesService.getTemplates();

  }

  public handleSelectTemplate = (event): void => {
    const template = event.template;
    this.repositoryService.setAnalysisTemplate(this.analysis.id, template.id).subscribe(
      res => {
        this.analysis.data.templateId = template.id;
        window.setTimeout(() => {
          this.router.navigate(['/discover/analytics/' + this.analysis.id] ,{ queryParams: { forceTemplate: template.id }});
          })
      }
    );
  }

  public goTemplate() {
    // Go back to templates
    this.location.back();
  }
}
