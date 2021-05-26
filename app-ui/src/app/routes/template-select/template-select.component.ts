import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {AnalyticTemplateUI} from '../../models/analyticTemplate';
import { RepositoryService } from 'src/app/api/repository.service';
import { Analysis } from 'src/app/model/analysis';
import { VisualisationService } from 'src/app/api/visualisation.service';

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
      const template$ = this.templates = aTemplates;
      const analysis$ = this.repositoryService.getAnalysisDetails(this.route.snapshot.paramMap.get('name'));
      forkJoin([template$, analysis$]).subscribe(async results => {
        /*
        if (!this.templates){
          this.templates = results[0];
        }*/
        this.analysis = results[1];
        const formatDate = new Date(this.analysis.metadata.createdOn).toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        let tempText = 'No template selected';
        if(this.analysis?.data?.templateId){
          const templateDetails = await this.visualisationService.getTemplate(Number(this.analysis.data.templateId)).toPromise();
          tempText = 'Template: ' + templateDetails.name
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
              value: this.analysis.data.description,
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
