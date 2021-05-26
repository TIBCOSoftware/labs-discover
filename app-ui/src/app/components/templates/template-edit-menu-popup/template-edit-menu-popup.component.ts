import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {NewInvestigation} from '../../../models/discover';
import {AnalyticsMenuConfigUI} from '../../../models/configuration';

@Component({
  selector: 'template-edit-menu-popup',
  templateUrl: './template-edit-menu-popup.component.html',
  styleUrls: ['./template-edit-menu-popup.component.css']
})
export class TemplateEditMenuPopupComponent implements OnInit, OnChanges {

  @Input() menuNodeItem: AnalyticsMenuConfigUI;

  @Input() analyticTabs: string[];

  @Output() menuItem: EventEmitter<AnalyticsMenuConfigUI> = new EventEmitter();

  public originalNode: AnalyticsMenuConfigUI;

  public analyticTabLabels: any;
  public showLabel = true;
  public menuLabel = '';

  public menuId: string;

  public iconGrid = [
    ['NO_ICON','pl-icon-home','pl-icon-community','pl-icon-document','pl-icon-documentation','pl-icon-explore'],
    ['pl-icon-license-agreements','pl-icon-filter','pl-icon-settings','pl-icon-image','pl-icon-privacy-policy','pl-icon-region'],
    ['pl-icon-maintenance','pl-icon-name','pl-icon-notifications','pl-icon-organization','pl-icon-download','pl-icon-calendar']
  ];
  public iconColor = '#AECFF6';


  constructor() {
  }

  ngOnInit(): void {
    // Set the values for the labels
    this.setPageLabels();
  }

  updateValue(newLabel, value) {
    const newLab = newLabel?.detail?.value;
    if (newLab && newLab !== '') {
      if(newLab !== 'NO_PAGE'){
        this.menuNodeItem[value] = newLab;
      }
      // If we set the id and the label is empty make the label the name of the Spotfire tab
      if (value === 'id' && (!this.menuNodeItem.label || this.menuNodeItem.label === '')) {
        this.showLabel = false;
        this.menuLabel = this.menuNodeItem.label = newLabel.detail.description;
        // Trigger a reset to update the value
        window.setTimeout(() => {
          this.showLabel = true;
        })
      }
      if(value === 'id' && newLabel?.detail?.description === 'EMPTY_PAGE'){
        this.menuNodeItem.id = '';
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.menuNodeItem?.currentValue) {
      this.originalNode = {...changes.menuNodeItem.currentValue};
      if (this.menuNodeItem?.label && this.menuNodeItem?.label !== '') {
        this.menuLabel = this.menuNodeItem.label;
      }
      if(this.menuNodeItem?.id){
        this.menuId = this.menuNodeItem.id;
      }
    }
    if (changes?.analyticTabs?.currentValue) {
      this.setPageLabels();
    }
  }

  private setPageLabels() {
    if (this.analyticTabs) {
      this.analyticTabLabels = [{label: '[No Page]', value: 'NO_PAGE', description: 'EMPTY_PAGE'}];
      this.analyticTabLabels = this.analyticTabLabels.concat(this.analyticTabs.map(tab => ({label: tab, value: tab, description: tab})));
    }
  }

  selectIcon(icon) {
    if (icon === 'NO_ICON') {
      this.menuNodeItem.icon = '';
    } else {
      this.menuNodeItem.icon = icon;
    }
  }

  checkDefault(ev) {
    // console.log('cd ' , ev.detail.checked);
    this.menuNodeItem.isDefault = ev.detail.checked;
  }

}
