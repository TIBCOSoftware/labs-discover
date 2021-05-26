import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {getSFLink} from '../../../functions/templates';
import {AnalyticTemplateUI} from 'src/app/models/analyticTemplate';
import {ConfigurationService} from '../../../service/configuration.service';
import { VisualisationService } from 'src/app/api/visualisation.service';
import { map } from 'rxjs/operators';
import { Visualisation } from 'src/app/model/visualisation';


@Component({
  selector: 'template-analytics',
  templateUrl: './template-analytics.component.html',
  styleUrls: ['./template-analytics.component.css']
})
export class TemplateAnalyticsComponent implements OnInit {

  @Input() initialLocation: string;
  @Input() newLocation: string;
  @Input() isNewTemplate: boolean;
  @Input() analyticsChoice: string; // COPY | EXISTING | CUSTOM
  @Output() updateAnalytics: EventEmitter<any> = new EventEmitter<any>();
  @Output() status: EventEmitter<any> = new EventEmitter<any>();

  private existingDXPs: Visualisation[];

  public availableDXPs = [];
  public nameHint: string;
  public originalDXP: Visualisation;

  constructor(
    private visualisationService: VisualisationService,
    private configService: ConfigurationService
  ) {}

  ngOnInit() {
    if (!this.newLocation){
      if (this.analyticsChoice === 'COPY') {
        this.newLocation = this.initialLocation + '_user_defined';
      } else if (this.analyticsChoice === 'CUSTOM') {
        this.newLocation = this.initialLocation;
      }
    }

    (async () => {
      await this.loadExistingDXPs();
      this.dxpRadioChange({ event: { detail: {value: 'COPY'}}});
    })();
  }

  public showForm = (field: string): boolean => {
    switch (this.analyticsChoice) {
      case 'COPY':
        return this.isNewTemplate && this.analyticsChoice === field
      default:
          return this.analyticsChoice === field
    }
  }

  private loadExistingDXPs = async () => {
    this.availableDXPs = [];
    this.existingDXPs = [];
    this.visualisationService.getItems().pipe(
      map((items: Visualisation[]) => {
        this.existingDXPs = items.filter(item => item.ItemType === 'spotfire.dxp');
        this.originalDXP = this.existingDXPs.filter(item => item.Path === this.initialLocation)[0];
        this.availableDXPs = items.map((item: Visualisation) => {
          return { label: this.stripOrgFolder(item.DisplayPath), value: item.Path }
        })
      })
    ).subscribe();
  }

  public dxpRadioChange = (event) => {
    if (event?.detail?.value === 'EXISTING' || event?.detail?.value === 'CUSTOM' || event?.detail?.value === 'COPY') {
      this.analyticsChoice = event?.detail?.value;
      if (this.analyticsChoice === 'EXISTING' || this.analyticsChoice === 'CUSTOM') {
        this.updateAnalytics.emit( { option: this.analyticsChoice, analytics: this.newLocation });
      }
      if (this.analyticsChoice === 'COPY') {
        this.updateAnalytics.emit( { option: this.analyticsChoice, analytics: this.newLocation, folderId: this.originalDXP?.ParentId, id: this.originalDXP?.Id });
      }
    }
  }

  public setName = (event) => {
    const newName = event.detail.value;
    const prefixPath = this.newLocation.substring(0, this.newLocation.lastIndexOf('/')+1);
    const valid = this.existingDXPs.filter(temp => {
      return newName === '' || temp.Path === prefixPath + newName;
    }).length == 0;
    if (!valid) {
      this.nameHint = newName === '' ? 'Path can\'t be empty.' : 'This DXP exists already...';
    } else {
      this.nameHint = '';
      this.newLocation = prefixPath + newName;
    }
    this.updateAnalytics.emit({ option: 'COPY', analytics: this.newLocation, folderId: this.originalDXP.ParentId, id: this.originalDXP.Id });
    this.updateStatus(valid);
  }

  public setSelectDXP = (event) => {
    this.newLocation = event?.detail?.value;
    this.updateAnalytics.emit({ option: 'EXISTING', analytics: this.newLocation });
    this.updateStatus(true);
  }

  public setCustomDXP = (event) => {
    this.newLocation = event?.detail?.value;
    if (this.newLocation === ''){
      this.nameHint = 'Path can\'t be empty.'
    }
    this.updateAnalytics.emit({ option: 'CUSTOM', analytics: this.newLocation });
    this.updateStatus(this.newLocation != '');
  }

  public isValid = (field: string): boolean => {
    return this.nameHint && this.nameHint != '';
  }

  public stripOrgFolder(dxpLocation, saveOrgF?: boolean): string {
    const fpArr = dxpLocation.split('/');
    let re;
    if (fpArr.length > 2) {
      let folder = '';
      for (let i = 3; i < fpArr.length; i++) {
        folder += '/' + fpArr[i];
      }
      re = folder;
    } else {
      re = dxpLocation;
    }
    return re;
  }

  public getFolder = (location: string): string => {
    const partialPath = this.stripOrgFolder(location);
    return partialPath.slice(0,partialPath.lastIndexOf('/'));;
  }

  public getName = (location: string): string => {
    return location.slice(location.lastIndexOf('/') + 1);
  }

  public openSFReport = (): void => {
    window.open(getSFLink(this.configService.config?.discover?.analyticsSF) + '/spotfire/wp/analysis?file=' + this.newLocation);
  }

  private updateStatus = (valid: boolean): void => {
    const status = valid;
    const stepStatus = {
      step: 'analytics',
      completed: status
    };
    this.status.emit(stepStatus);
  }
}
