import {Component, Input, OnInit} from '@angular/core';
import {checkIfDXPExists, checkIfTemplateNameExists, DXP_EXISTS_MESSAGE, getSFLink, TEMPLATE_EXISTS_MESSAGE} from '../../../functions/templates';
import {ConfigurationService} from '../../../service/configuration.service';
import {VisualisationService} from 'src/app/api/visualisation.service';
import {Visualisation} from 'src/app/model/visualisation';
import {map} from 'rxjs/operators';
import { Template } from 'src/app/model/models';

@Component({
  selector: 'template-confirmation',
  templateUrl: './template-confirmation.component.html',
  styleUrls: ['./template-confirmation.component.css']
})
export class TemplateConfirmationComponent implements OnInit {

  @Input() template: Template;
  @Input() isNewTemplate: boolean;
  @Input() analyticsChoice: string; // COPY | EXISTING | CUSTOM

  // DXP_EXISTS = DXP_EXISTS_MESSAGE;
  // TEMPLATE_EXISTS = TEMPLATE_EXISTS_MESSAGE;

  public doCopyDXP = true;

  // DXPName: string;
  // JustDXPName: string;
  // newDXPLocation: string;
  // newDXPName: string;
  // showDXPSection = false;
  // showDXPExist = false;
  // showNameExist = false;

  // SF_LINK: string;
  // paTEXT: string;

  // DXP_FOLDER: string;

  constructor(
    protected visualisationService: VisualisationService,
    private configService: ConfigurationService
  ) {
  }

  async ngOnInit() {
    // if (this.template?.spotfireLocation) {
    //   this.DXPName = this.template.spotfireLocation;
    //   if (this.template.spotfireLocation.split('/').length > 0) {
    //     this.JustDXPName = this.template.spotfireLocation.split('/').pop();
    //   }
    //   if (this.template.newDXPName) {
    //     this.newDXPName = this.template.newDXPName.split('/').pop();
    //     this.DXP_FOLDER = this.template.newDXPName.substring(0, this.template.newDXPName.lastIndexOf('/') + 1);

    //   }
    //   this.updateLocation();
    //   this.updateSFLink();
    // }
    // this.showNameExist = await checkIfTemplateNameExists(this.template.name, this.template.id, this.visualisationService);
    // if (this.isNewTemplate && this.template.doCopyDXP) {
    //   this.showDXPExist = await checkIfDXPExists(this.template.newDXPName, this.visualisationService);
    // }
    // this.showDXPSection = this.isNewTemplate;
  }

  private updateLocation() {
    // if (this.template.spotfireLocation.split('/').length > 0) {
    //   this.newDXPLocation = this.template.spotfireLocation.substring(0, this.template.spotfireLocation.lastIndexOf('/')) + '/' + this.template.newDXPName;
    // } else {
    //   this.newDXPLocation = this.template.newDXPName;
    // }
  }

  public openSFReport = (): void => {
    window.open(getSFLink(this.configService.config?.discover?.analyticsSF) + '/spotfire/wp/analysis?file=' + this.template.spotfireLocation);
  }

  public getName = (): string => {
    return this.template.spotfireLocation.substring(this.template.spotfireLocation.lastIndexOf('/')+1);
  }

  public isCopy = (): boolean => {
    return this.analyticsChoice === 'COPY';
  }
}
