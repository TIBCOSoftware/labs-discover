import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {getSFLink} from '../../../functions/templates';
import {AnalyticTemplateUI, StepStatus} from 'src/app/models_ui/analyticTemplate';
import {ConfigurationService} from '../../../service/configuration.service';
import {VisualisationService} from 'src/app/api/visualisation.service';
import {map} from 'rxjs/operators';
import {Visualisation} from 'src/app/model/visualisation';
import {stripOrgFolder} from '../../../functions/analysis';


@Component({
  selector: 'template-analytics',
  templateUrl: './template-analytics.component.html',
  styleUrls: ['./template-analytics.component.css']
})
export class TemplateAnalyticsComponent implements OnInit {

  @Input() initialLocation: string;
  @Input() newLocation: string;
  @Input() isNewTemplate: boolean;
  @Input() analyticsChoice: 'COPY' | 'EXISTING' | 'CUSTOM' | 'CURRENT';
  @Input() doAdvancedTab: boolean;

  @Output() doAdvancedE: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() updateAnalytics: EventEmitter<any> = new EventEmitter<any>();
  @Output() status: EventEmitter<StepStatus> = new EventEmitter<StepStatus>();

  stripOrgF = stripOrgFolder;
  availableDXPs = [];
  nameHint: string;
  originalDXP: Visualisation;
  showSFLink = false;

  private existingDXPs: Visualisation[];

  constructor(
    private visualisationService: VisualisationService,
    private configService: ConfigurationService
  ) {
  }

  ngOnInit() {
    if (!this.newLocation) {
      if (this.analyticsChoice === 'COPY') {
        this.newLocation = this.initialLocation + '_user_defined';
      } else if (this.analyticsChoice === 'CUSTOM') {
        this.newLocation = this.initialLocation;
      }
    }
    (async () => {
      await this.loadExistingDXPs();
      this.dxpRadioChange({event: {detail: {value: 'COPY'}}});
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
    this.visualisationService.getItems('dxp').pipe(
      map((items: Visualisation[]) => {
        this.existingDXPs = items.filter(item => item.ItemType === 'spotfire.dxp');
        this.originalDXP = this.existingDXPs.filter(item => item.Path === this.initialLocation)[0];
        this.availableDXPs = items.map((item: Visualisation) => {
          return {label: stripOrgFolder(item.DisplayPath), value: item.Path}
        })
      })
    ).subscribe(() => {
      if (this.analyticsChoice === 'COPY') {
        let addition = 0;
        let findMore = true;
        while(addition < 100 && findMore) {
          addition++;
          const valid = this.isDXPNameValid(this.newLocation.substr(this.newLocation.lastIndexOf('/') + 1));
          if (!valid) {
            const nbRegEx = new RegExp(/\(([^)]+)\)/ig);
            if(nbRegEx.test(this.newLocation)){
              this.newLocation = this.newLocation.replace(nbRegEx, '(' + addition + ')');
            } else {
              this.newLocation += '(' + addition + ')';
            }
             } else {
            findMore = false;
          }
        }
        this.updateAnalytics.emit({option: 'COPY', analytics: this.newLocation, folderId: this.originalDXP?.ParentId, id: this.originalDXP?.Id});
        this.updateStatus(this.newLocation !== '');
      }
    });
  }

  public dxpRadioChange = (event) => {
    if(event?.detail?.value) {
      const ev = event?.detail?.value;
      if (ev === 'EXISTING' || ev === 'CUSTOM' || ev === 'COPY' || ev === 'CURRENT') {
        this.analyticsChoice = ev;
        this.showSFLink = true;
        if (this.analyticsChoice === 'CURRENT') {
          this.updateAnalytics.emit({option: this.analyticsChoice});
          this.updateStatus(true);
        }
        if (this.analyticsChoice === 'EXISTING' || this.analyticsChoice === 'CUSTOM') {
          this.updateAnalytics.emit({option: this.analyticsChoice, analytics: this.newLocation});
          this.updateStatus(this.newLocation !== '');
        }
        if (this.analyticsChoice === 'COPY') {
          // Add the target folder to the newLocation
          if(this.configService.config?.discover?.analyticsSF?.customUserDXPFolder) {
            const folder = this.configService.config?.discover?.analyticsSF?.customUserDXPFolder;
            if(this.newLocation.lastIndexOf('/') > -1) {
              this.newLocation = folder + this.newLocation.substring(this.newLocation.lastIndexOf('/'), this.newLocation.length);
            } else {
              this.newLocation = folder + '/' + this.newLocation;
            }

          }
          this.updateAnalytics.emit({option: this.analyticsChoice, analytics: this.newLocation, folderId: this.originalDXP?.ParentId, id: this.originalDXP?.Id});
          this.showSFLink = false;
          this.updateStatus(this.isCopyValid());
        }
      }
    }
  }

  private isCopyValid() {
    return false;
  }

  public setName = (event) => {
    if (event.detail?.value) {
      const newName = event.detail.value;
      const valid = this.isDXPNameValid(newName);
      this.updateAnalytics.emit({option: 'COPY', analytics: this.newLocation, folderId: this.originalDXP?.ParentId, id: this.originalDXP?.Id});
      this.updateStatus(valid);
    }
  }

  private isDXPNameValid(newName: string) {
    if(!this.existingDXPs || this.existingDXPs.length === 0){
      return false;
    }
    const prefixPath = this.newLocation.substring(0, this.newLocation.lastIndexOf('/') + 1);
    const valid = this.existingDXPs.filter(temp => {
      return newName === '' || temp.Path === prefixPath + newName;
    }).length === 0;
    if (!valid) {
      this.nameHint = newName === '' ? 'Path can\'t be empty.' : 'This DXP exists already...';
    } else {
      this.nameHint = '';
      this.newLocation = prefixPath + newName;
    }
    return valid;
  }

  public setSelectDXP = (event) => {
    if(event?.detail?.value) {
      this.newLocation = event?.detail?.value;
      this.updateAnalytics.emit({option: 'EXISTING', analytics: this.newLocation});
      this.updateStatus(true);
    } else {
      this.updateStatus(false);
    }
  }

  public setCustomDXP = (event) => {
    this.newLocation = event?.detail?.value;
    if (this.newLocation === '') {
      this.nameHint = 'Path can\'t be empty.'
    }
    this.updateAnalytics.emit({option: 'CUSTOM', analytics: this.newLocation});
    this.updateStatus(this.newLocation !== '');
  }

  public isValid = (field: string): boolean => {
    return this.nameHint && this.nameHint !== '';
  }

  public getFolder = (location: string): string => {
    const partialPath = stripOrgFolder(location);
    return partialPath.slice(0, partialPath.lastIndexOf('/'));
    ;
  }

  public getName = (location: string): string => {
    return location.slice(location.lastIndexOf('/') + 1);
  }

  public openSFReport = (): void => {
    window.open(getSFLink(this.configService.config?.discover?.analyticsSF) + '/spotfire/wp/analysis?file=' + this.newLocation);
  }

  public toggleAdvanced = (event): void => {
    this.doAdvancedTab = event.detail.checked;
    this.doAdvancedE.emit(this.doAdvancedTab);
    // this.updateStatus();
  }

  private updateStatus = (valid: boolean): void => {
    const stepStatus = {
      step: 'analytics',
      completed: valid
    };
    this.status.emit(stepStatus);
  }
}
