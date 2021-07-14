import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {StepStatus} from '../../../models_ui/analyticTemplate';
import {clearAllNodeFromDefault, stripDisabledMenuItems} from '../../../functions/templates';
import {cloneDeep} from 'lodash-es';
import {TemplateMenuConfig} from '../../../model/templateMenuConfig';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import {TemplateAnalyticsMenuDragdropComponent} from '../template-analytics-menu-dragdrop/template-analytics-menu-dragdrop.component';
import {TemplateFilterConfig} from '../../../model/templateFilterConfig';

@Component({
  selector: 'template-analytics-filters',
  templateUrl: './template-analytics-filters.component.html',
  styleUrls: ['./template-analytics-filters.component.css']
})
export class TemplateAnalyticsFiltersComponent implements OnInit {

  @Input() filterConfig: TemplateFilterConfig[];
  @Input() pageOptions: string[];
  @Output() previewFilterMenuEE: EventEmitter<TemplateFilterConfig[]> = new EventEmitter<TemplateFilterConfig[]>();
  @Output() status: EventEmitter<StepStatus> = new EventEmitter<StepStatus>();
  @Output() updateConfig: EventEmitter<TemplateFilterConfig[]> = new EventEmitter<TemplateFilterConfig[]>();

  @ViewChild('popup', {static: true}) popup: ElementRef<UxplPopup>;
  @ViewChild('dragdrop', {static: true}) dragdrop: TemplateAnalyticsMenuDragdropComponent;

  originalFilterNodes: TemplateFilterConfig[];
  previewMenu: TemplateFilterConfig[];
  newNode: TemplateFilterConfig;

  popupX = '0';
  popupY = '0';

  constructor() {
  }

  ngOnInit(): void {
    this.originalFilterNodes = cloneDeep(this.filterConfig);
    this.updateMenu();
    this.updateStatus();
  }

  receiveFilterUpdate(menu: TemplateMenuConfig[]) {
    this.filterConfig = menu;
    this.previewMenu = cloneDeep(stripDisabledMenuItems(this.filterConfig));
    this.previewFilterMenuEE.emit(this.previewMenu);
    this.updateConfig.emit(this.filterConfig);
    this.updateStatus();
  }

  closeAddPopup(): void {
    this.popup.nativeElement.show = false;
  }

  private updateMenu() {
    this.dragdrop.reloadMenu();
    this.previewMenu = cloneDeep(stripDisabledMenuItems(this.filterConfig));
    this.previewFilterMenuEE.emit(this.previewMenu);
    this.updateConfig.emit(this.filterConfig);
    this.updateStatus();
  }

  reset(): void {
    console.log()
    this.filterConfig = cloneDeep(this.originalFilterNodes);
    this.updateStatus();
  }

  clearAll() {
    this.filterConfig = [];
    this.receiveFilterUpdate(this.filterConfig);
  }

  private updateStatus = (): void => {
    // Filter can always move to next screen (also when none is configured)
    const stepStatus = {
      step: 'analytics-filter-panel',
      completed: true
    };
    setTimeout(() => {
      this.status.emit(stepStatus);
    });
  }

  add(ev: MouseEvent): void {
    this.popupX = (ev.pageX + 15) + 'px';
    this.popupY = (ev.pageY + 15) + 'px';
    this.newNode = {
      // uiId: getNewID(),
      label: '',
      id: '',
      enabled: true
    }
    this.dragdrop.closePopup();
    this.popup.nativeElement.show = true;
  }

  addMenuItem(newMenuItem: TemplateFilterConfig): void {
    if (!(newMenuItem.label === '')) {
      if (newMenuItem.isDefault) {
        clearAllNodeFromDefault(this.filterConfig)
      }
      if (this.filterConfig) {
        this.filterConfig.push(newMenuItem);
      } else {
        this.filterConfig = [newMenuItem];
      }
    }
    window.setTimeout(() => {
      this.popup.nativeElement.show = false;
    })
    this.filterConfig = cloneDeep(this.filterConfig);
    this.updateMenu();
  }

}
