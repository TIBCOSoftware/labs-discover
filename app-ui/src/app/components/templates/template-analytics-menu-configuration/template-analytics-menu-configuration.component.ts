import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import {TemplateAnalyticsMenuDragdropComponent} from '../template-analytics-menu-dragdrop/template-analytics-menu-dragdrop.component';
import {cloneDeep} from 'lodash-es';
import {clearAllNodeFromDefault, getNewID, stripDisabledMenuItems} from '../../../functions/templates';
import {TemplateMenuConfig} from 'src/app/model/models';
import {StepStatus} from '../../../models_ui/analyticTemplate';

@Component({
  selector: 'template-analytics-menu-configuration',
  templateUrl: './template-analytics-menu-configuration.component.html',
  styleUrls: ['./template-analytics-menu-configuration.component.css']
})
export class TemplateAnalyticsMenuConfigurationComponent implements OnInit {

  @Input() menuConfig: TemplateMenuConfig[];
  @Input() pageOptions: string[];
  @Output() previewMenuEE: EventEmitter<TemplateMenuConfig[]> = new EventEmitter<TemplateMenuConfig[]>();
  @Output() status: EventEmitter<StepStatus> = new EventEmitter<StepStatus>();
  @Output() updateConfig: EventEmitter<TemplateMenuConfig[]> = new EventEmitter<TemplateMenuConfig[]>();

  @ViewChild('popup', {static: true}) popup: ElementRef<UxplPopup>;
  @ViewChild('dragdrop', {static: true}) dragdrop: TemplateAnalyticsMenuDragdropComponent;

  originalMenuNodes: TemplateMenuConfig[];
  previewMenu: TemplateMenuConfig[];
  newNode: TemplateMenuConfig;

  popupX = '0';
  popupY = '0';

  constructor() {
  }

  ngOnInit(): void {
    this.originalMenuNodes = cloneDeep(this.menuConfig);
    this.updateMenu();
  }

  reset(): void {
    this.menuConfig = cloneDeep(this.originalMenuNodes);
    this.updateStatus();
  }

  addMenuItem(newMenuItem: TemplateMenuConfig): void {
    if (!(newMenuItem.label === '')) {
      if(newMenuItem.isDefault){
        clearAllNodeFromDefault(this.menuConfig)
      }
      if (this.menuConfig) {
        this.menuConfig.push(newMenuItem);
      } else {
        this.menuConfig = [newMenuItem];
      }
    }
    window.setTimeout(() => {
      this.popup.nativeElement.show = false;
    })
    this.menuConfig = cloneDeep(this.menuConfig);
    this.updateMenu();
  }

  updateMenu(): void {
    this.dragdrop.reloadMenu();
    this.previewMenu = cloneDeep(stripDisabledMenuItems(this.menuConfig));
    this.previewMenuEE.emit(this.previewMenu);
    this.updateConfig.emit(this.menuConfig);
    this.updateStatus();
  }

  receiveMenuUpdate(menu: TemplateMenuConfig[]) {
    this.menuConfig = menu;
    this.previewMenu = cloneDeep(stripDisabledMenuItems(this.menuConfig));
    this.previewMenuEE.emit(this.previewMenu);
    this.updateConfig.emit(this.menuConfig);
    this.updateStatus();
  }

  add(ev: MouseEvent): void {
    this.popupX = (ev.pageX + 15) + 'px';
    this.popupY = (ev.pageY + 15) + 'px';
    this.newNode = {
      // uiId: getNewID(),
      label: '',
      id: '',
      icon: 'pl-icon-home',
      enabled: true,
      child: []
    }
    this.dragdrop.closePopup();
    this.popup.nativeElement.show = true;
  }

  closeAddPopup(): void {
    this.popup.nativeElement.show = false;
  }

  addAll() {
    this.closeAddPopup();
    for (const option of this.pageOptions) {
      const newNode = {
        uiId: getNewID(),
        label: option,
        id: option,
        icon: 'pl-icon-document',
        enabled: true,
        child: []
      }
      let doAdd = true;
      this.menuConfig.forEach(item => {
        if (item.id === option) {
          doAdd = false;
        }
        item.child.forEach(childItem => {
          if (childItem.id === option) {
            doAdd = false;
          }
        })
      })
      if (doAdd) {
        if (this.menuConfig) {
          this.menuConfig.push(newNode);
        } else {
          this.menuConfig = [newNode];
        }
      }
    }
    this.updateMenu();
    this.receiveMenuUpdate(this.menuConfig);
  }

  clearAll() {
    this.menuConfig = [];
    this.receiveMenuUpdate(this.menuConfig);
  }

  private updateStatus = (): void => {
    const status = this.menuConfig.length > 0;
    const stepStatus = {
      step: 'analytics-menu-configuration',
      completed: status
    };
    this.status.emit(stepStatus);
  }
}
