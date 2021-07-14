import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {AnalyticTemplateUI} from '../../models_ui/analyticTemplate';
import {CardMode} from '../../models_ui/configuration';
import {MatDialogRef} from '@angular/material/dialog';
import {YesnoConfirmationComponent} from 'src/app/components/yesno-confirmation/yesno-confirmation.component';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import {RepositoryService} from 'src/app/api/repository.service';
import {VisualisationService} from 'src/app/api/visualisation.service';
import {Template} from 'src/app/model/template';
import {compareTemplates} from '../../functions/templates';

@Component({
  selector: 'template-manage',
  templateUrl: './template-manage.component.html',
  styleUrls: ['./template-manage.component.css']
})
export class TemplateManageComponent implements AfterViewInit {

  @ViewChild('deletePopup', {static: true}) deletePopup: ElementRef<UxplPopup>;

  templates: Template[];
  confirmDialogRef: MatDialogRef<YesnoConfirmationComponent, any>;
  objHeaderConfig = {
    title: {
      value: 'Templates',
      isEdit: false,
      editing: false
    }
  };
  popupX: string;
  popupY: string;
  templateToDelete: string;
  templateToDeleteName: string;
  usedByAnalysis: string[] = [];
  maxDeletePopupHeight = '162px';

  constructor(
    private router: Router,
    private visualisationService: VisualisationService,
    private repositoryService: RepositoryService
  ) {
  }

  ngAfterViewInit(): void {
    this.refresh();
  }

  public goProcessAnalysis = (): void => {
    this.router.navigate(['/discover/process-analysis']);
  }

  public refresh() {
    this.visualisationService.getTemplates().pipe(
      map(temp => {
        this.templates = temp.sort(compareTemplates);
      })
    ).subscribe();
  }


  public goTemplate = (): void => {
    this.router.navigate(['/discover/new-template']);
  }

  public templateAction(action) {
    const mouseEv: MouseEvent = action.event;
    const template: AnalyticTemplateUI = action.template;
    const mode: CardMode = action.mode;
    if (mode === 'copy') {
      this.router.navigate(['/discover/new-template'], {queryParams: {templateToCreateFrom: template.id}});
    }
    if (mode === 'edit') {
      this.router.navigate(['/discover/edit-template/' + template.id]);
    }
    if (mode === 'delete') {
      // See if the template is used
      const subscription = this.repositoryService.getAnalysis().pipe(
        map(analysisList => {
          this.usedByAnalysis = [];
          let pHeight = 162;
          this.usedByAnalysis = analysisList.filter(analysis => analysis.data.templateId === String(template.id)).map(analysis => analysis.data.name);
          pHeight = pHeight + (20 * this.usedByAnalysis.length);
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

  public reallyDeleteTemplate() {
    this.visualisationService.deleteTemplate(this.templateToDelete).subscribe(
      _ => {
        this.deletePopup.nativeElement.show = false;
        this.refresh();
      }
    )
  }

  public cancelDelete() {
    this.deletePopup.nativeElement.show = false;
  }
}
