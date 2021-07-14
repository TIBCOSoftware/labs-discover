import {Component, Input, OnInit} from '@angular/core';
import {getSFLink} from '../../../functions/templates';
import {ConfigurationService} from '../../../service/configuration.service';
import {VisualisationService} from 'src/app/api/visualisation.service';
import { Template } from 'src/app/model/models';
import {stripOrgFolder} from '../../../functions/analysis';

@Component({
  selector: 'template-confirmation',
  templateUrl: './template-confirmation.component.html',
  styleUrls: ['./template-confirmation.component.css']
})
export class TemplateConfirmationComponent {

  @Input() template: Template;
  @Input() isNewTemplate: boolean;
  @Input() selectedAnalytics: string;
  @Input() analyticsChoice: 'COPY' | 'EXISTING' | 'CUSTOM';

  stripOrgF = stripOrgFolder;

  constructor(
    protected visualisationService: VisualisationService,
    private configService: ConfigurationService
  ) {
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
