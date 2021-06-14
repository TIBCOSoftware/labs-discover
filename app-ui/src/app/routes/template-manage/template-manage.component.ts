import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AnalyticTemplateUI } from '../../models/analyticTemplate';
import { CardMode } from '../../models/configuration';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YesnoConfirmationComponent } from 'src/app/components/yesno-confirmation/yesno-confirmation.component';
import { UxplPopup } from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import { RepositoryService } from 'src/app/api/repository.service';
import { VisualisationService } from 'src/app/api/visualisation.service';
import { Template } from 'src/app/models_generated/template';

@Component({
  selector: 'template-manage',
  templateUrl: './template-manage.component.html',
  styleUrls: ['./template-manage.component.css']
})
export class TemplateManageComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private visualisationService: VisualisationService,
    private repositoryService: RepositoryService
  ) {
  }

  @ViewChild('deletePopup', {static: true}) deletePopup: ElementRef<UxplPopup>;

  public templates: Template[];
  public confirmDialogRef: MatDialogRef<YesnoConfirmationComponent, any>;
  public objHeaderConfig = {
    title: {
      value: 'Templates',
      isEdit: false,
      editing: false
    }
  };

  public popupX:string;
  public popupY:string;
  public templateToDelete: string;
  public templateToDeleteName: string;

  public usedByAnalysis:string[] = [];

  public maxDeletePopupHeight = '162px';

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.refresh();
  }

  public goProcessAnalysis = (): void => {
    this.router.navigate(['/discover/process-analysis']);
  }

  public async refresh() {
    const templates = this.visualisationService.getTemplates().pipe(
      map(temp => {
        this.templates = temp;
      })
    ).subscribe();
  }

  public goTemplate = (): void => {
    this.router.navigate(['/discover/new-template']);
  }

  public templateAction(action) {
    const mouseEv: MouseEvent  = action.event;
    const template:AnalyticTemplateUI = action.template;
    const mode: CardMode = action.mode;
    if (mode === 'copy') {
      this.router.navigate(['/discover/new-template'], {queryParams: {templateToCreateFrom: template.id}});
    }
    if (mode === 'edit') {
      this.router.navigate(['/discover/edit-template/' + template.id]);
    }
    if (mode === 'delete') {
      // console.error('TO Implement: Delete');
      // this.router.navigate(['/discover/new-template'] ,{ queryParams: { idToCreateFrom: template.id }});

      // See if the template is used
      const subscription = this.repositoryService.getAnalysis().pipe(
        map(analysisList => {
          this.usedByAnalysis = [];
          let pHeight = 162;
          this.usedByAnalysis = analysisList.filter(analysis => analysis.data.templateId === String(template.id)).map(analysis => analysis.data.name);
          pHeight = pHeight + (20* this.usedByAnalysis.length);
          this.templateToDelete = template.id;
          this.templateToDeleteName = template.name;
          this.maxDeletePopupHeight = pHeight + 'px';
          this.deletePopup.nativeElement.show = true;
          this.popupX = mouseEv.pageX - 160 + 'px';
          this.popupY = mouseEv.pageY + 20 + 'px';
          subscription.unsubscribe();
        })
      ).subscribe();
    }
  }

  public async reallyDeleteTemplate(){
    this.visualisationService.deleteTemplate(this.templateToDelete).subscribe(
      (result) => {
        this.deletePopup.nativeElement.show = false;
        this.refresh();
      }
    )
  }

  public cancelDelete(){
    this.deletePopup.nativeElement.show = false;
  }
}
