import {Component, ElementRef, Inject, Input, OnChanges, OnInit, ViewChild, ViewEncapsulation, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {DropInfo} from '../../../models_ui/dragDropMenuItems';
import {AnalyticsMenuConfigUI} from '../../../models_ui/configuration';
import {UxplPopup} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import {clearAllNodeFromDefault, getNewID} from '../../../functions/templates';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {Level, notifyUser} from '../../../functions/message';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'template-analytics-menu-dragdrop',
  templateUrl: './template-analytics-menu-dragdrop.component.html',
  styleUrls: ['./template-analytics-menu-dragdrop.component.css'],
  animations: [
    trigger('blinking', [
      state('normal', style({
      })),
      state('blink', style({
        backgroundColor: '#AECFF6'
      })),
      transition('normal => blink', [
        animate('0.10s')
      ]),
      transition('blink => normal', [
        animate('0.10s')
      ]),
    ])]
})
export class TemplateAnalyticsMenuDragdropComponent implements OnInit, OnChanges {

  constructor(@Inject(DOCUMENT) private document: Document,
              private msService: MessageTopicService) {
  }
  @ViewChild('popup', {static: true}) popup: ElementRef<UxplPopup>;

  @Input() menuNodesIN: AnalyticsMenuConfigUI[];
  @Input() analyticTabs: string[];
  @Input() allowNesting: boolean;
  @Input() allowIcons: boolean;

  @Output() popupOpens: EventEmitter<void> = new EventEmitter<void>();
  @Output() update: EventEmitter<AnalyticsMenuConfigUI[]> = new EventEmitter<AnalyticsMenuConfigUI[]>();

  public currentEditNode: AnalyticsMenuConfigUI;

  public popupX = '0';
  public popupY = '0';
  public POPUP_HEIGHT = 450;
  readonly POPUP_ABOVE_PAGE_BOTTOM = 60;

  // ids for connected drop lists
  dropTargetIds = [];
  nodeLookup = {};
  dropActionTodo: DropInfo = null;

  animationId = 0;
  NUMBER_OF_BLINKS = 4;
  BLINK_SPEED_MS = 90;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.menuNodesIN?.currentValue) {
      this.reloadMenu();
      // this.update.emit(this.menuNodes);
      // this.emitNodes();
    }
  }

  ngOnInit(): void {
    this.reloadMenu();
    if(this.allowNesting  === undefined){
      this.allowNesting = true;
    }
    if(this.allowIcons  === undefined){
      this.allowIcons = true;

    }
    if(!this.allowIcons){
      this.POPUP_HEIGHT = 245;
    }
  }

  public reloadMenu() {
    this.generateIDs();
    this.dropTargetIds = [];
    this.nodeLookup = {};
    if (this.menuNodesIN && this.menuNodesIN.length > 0) {
      this.prepareDragDrop(this.menuNodesIN);
    }
  }

  prepareDragDrop(nodes: AnalyticsMenuConfigUI[]) {
    nodes.forEach(node => {
      this.dropTargetIds.push(node.uiId);
      this.nodeLookup[node.uiId] = node;
      if (node.child && node.child.length > 0) {
        this.prepareDragDrop(node.child);
      }
    });
  }

  // @debounce(50)
  dragMoved(event) {
    const e = this.document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);
    if (!e) {
      this.clearDragInfo();
      return;
    }
    const container = e.classList.contains('node-item') ? e : e.closest('.node-item');
    if (!container) {
      this.clearDragInfo();
      return;
    }

    this.dropActionTodo = {
      targetId: container.getAttribute('data-id')
    };

    const targetRect = container.getBoundingClientRect();
    const oneThird = targetRect.height / 3;

    if (event.pointerPosition.y - targetRect.top < oneThird) {
      // before
      this.dropActionTodo.action = 'before';
    } else if (event.pointerPosition.y - targetRect.top > 2 * oneThird) {
      // after
      this.dropActionTodo.action = 'after';
    } else {
      const nodeMoving = this.findById(this.menuNodesIN, event.source.data);
      if (nodeMoving) {
        if (this.menuNodesIN.filter(node => node.uiId === container.getAttribute('data-id')).length !== 0 && (!nodeMoving.child || nodeMoving?.child?.length === 0)) {
          // inside
          this.dropActionTodo.action = 'inside';
        }
      }
    }
    this.showDragInfo();
  }

  drop(event) {
    if (!this.dropActionTodo?.action) return;

    const draggedItemId = event.item.data;
    const parentItemId = event.previousContainer.id;
    const targetListId = this.getParentNodeId(this.dropActionTodo.targetId, this.menuNodesIN, 'main');

    const draggedItem = this.nodeLookup[draggedItemId];

    const oldItemContainer = parentItemId !== 'main' ? this.nodeLookup[parentItemId].child : this.menuNodesIN;
    const newContainer = targetListId !== 'main' ? this.nodeLookup[targetListId].child : this.menuNodesIN;
    if (targetListId === 'main' || !(draggedItem.child && draggedItem.child.length > 0)) {
      const i = oldItemContainer.findIndex(c => c.uiId === draggedItemId);
      switch (this.dropActionTodo.action) {
        case 'before':
        case 'after':
          oldItemContainer.splice(i, 1);
          const targetIndex = newContainer.findIndex(c => c.uiId === this.dropActionTodo.targetId);
          if (this.dropActionTodo.action === 'before') {
            newContainer.splice(targetIndex, 0, draggedItem);
          } else {
            newContainer.splice(targetIndex + 1, 0, draggedItem);
          }
          break;
        case 'inside':
          if(this.allowNesting) {
            oldItemContainer.splice(i, 1);
            if (!this.nodeLookup[this.dropActionTodo.targetId].child) {
              this.nodeLookup[this.dropActionTodo.targetId].child = [];
            }
            this.nodeLookup[this.dropActionTodo.targetId].child.push(draggedItem)
          } else {
            notifyUser('WARNING', 'You can\'t create sub menus...', this.msService);
          }
          break;
      }
      this.document.getElementById('node-' + draggedItemId).classList.add('demo');
     this.blink(draggedItemId);
      // document.getElementById(this.dropActionTodo.targetId).className = 'demo'
      // this.nodeLookup[this.dropActionTodo.targetId].dropAnimation = true;
      this.clearDragInfo(true);
      this.update.emit(this.menuNodesIN);
    } else {
      notifyUser('WARNING', 'You can\'t create sub menus of sub menus...', this.msService);
    }

    // this.emitNodes();
  }


  blink(id: number){
    for(let i = 1; i < this.NUMBER_OF_BLINKS; i++){
      if(i % 2 === 0){
        window.setTimeout(() => {
          this.animationId = 0;
        }, i * this.BLINK_SPEED_MS);
      } else {
        window.setTimeout(() => {
          this.animationId = id;
        }, i * this.BLINK_SPEED_MS);
      }
    }
    // reset at the end
    window.setTimeout(() => {
      this.animationId = 0;
    }, this.NUMBER_OF_BLINKS * this.BLINK_SPEED_MS);
  }

  animate(id: number){
    return id === this.animationId ? true : false;
  }

  getParentNodeId(id: string, nodesToSearch: AnalyticsMenuConfigUI[], parentId: string): string {
    for (const node of nodesToSearch) {
      if (node.uiId === id) return parentId;
      if (node.child && node.child.length > 0) {
        const ret = this.getParentNodeId(id, node.child, node.uiId);
        if (ret) return ret;
      }
    }
    return null;
  }

  showDragInfo() {
    this.clearDragInfo();
    if (this.dropActionTodo) {
      this.document.getElementById('node-' + this.dropActionTodo.targetId).classList.add('drop-' + this.dropActionTodo.action);
    }
  }

  clearDragInfo(dropped = false) {
    if (dropped) {
      this.dropActionTodo = null;
    }
    this.document.querySelectorAll('.drop-before').forEach(element => element.classList.remove('drop-before'));
    this.document.querySelectorAll('.drop-after').forEach(element => element.classList.remove('drop-after'));
    this.document.querySelectorAll('.drop-inside').forEach(element => element.classList.remove('drop-inside'));
  }

  private findById = (data, id): AnalyticsMenuConfigUI => {
    for (const i in data) {
      if (data[i].uiId === id) {
        return data[i];
      } else if (data[i].child && data[i].child.length && typeof data[i].child === 'object') {
        this.findById(data[i].child, id);
      }
    }
  }

  private updateById(data, id, newNode: AnalyticsMenuConfigUI) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].uiId === id) {
        data[i] = newNode;
      } else if (data[i].child && data[i].child.length && typeof data[i].child === 'object') {
        this.updateById(data[i].child, id, newNode);
      }
    }
  }

  private deleteById(data, id) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].uiId === id) {
        data.splice(i, 1);
      } else if (data[i].child && data[i].child.length && typeof data[i].child === 'object') {
        this.deleteById(data[i].child, id);
      }
    }
  }

  toggleVisible(node: AnalyticsMenuConfigUI) {
    node.enabled = !node.enabled;
    // Disable cascade
    if (node.child && node.child.length > 0) {
      node.child.forEach((child) => {
        // All children take over enabled / disabled from parent...
        child.enabled = node.enabled;
      })
    }
    this.update.emit(this.menuNodesIN);
    // this.emitNodes();
  }

  public closePopup() {
    this.popup.nativeElement.show = false;
  }

  updateItem(node: AnalyticsMenuConfigUI) {
    if (node.isDefault) {
      clearAllNodeFromDefault(this.menuNodesIN);
      // Bring it back to true (after setting all to false)
      node.isDefault = true;
    }
    this.updateById(this.menuNodesIN, node.uiId, node);
    // Update the drag and drop config with changes
    this.reloadMenu();
    this.menuNodesIN = [...this.menuNodesIN];
    this.popup.nativeElement.show = false;
    this.update.emit(this.menuNodesIN);
    // this.emitNodes();
  }

  toggleEditMenuPopup(node, ev: MouseEvent) {
    // 25px next (right of) the mouse
    this.popupX = (ev.pageX + 25) + 'px';
    const mouseY = ev.pageY;
    const pageY = document.body.scrollHeight;
    // Height of the popup is 430
    if (mouseY + this.POPUP_HEIGHT > pageY) {
      // If the popup goes below the page
      // Move the popup just above the bottom of the page
      const newPopupY = mouseY + (pageY - (mouseY + this.POPUP_HEIGHT)) - this.POPUP_ABOVE_PAGE_BOTTOM;
      this.popupY = newPopupY + 'px';
    } else {
      this.popupY = mouseY + 'px';
    }
    // Set the menu item of the popup
    this.currentEditNode = node;
    // See if we need to toggle the current popup
    if (this.currentEditNode && (node.uiId === this.currentEditNode?.uiId)) {
      this.popup.nativeElement.show = !this.popup.nativeElement.show;
    } else {
      // We are working on a new node / menu item
      this.popup.nativeElement.show = false;
      setTimeout(() => {
        this.popup.nativeElement.show = true;
      })
    }
    if (this.popup.nativeElement.show) {
      this.popupOpens.emit();
    }
  }

  deleteMenuItem(node: AnalyticsMenuConfigUI) {
    this.deleteById(this.menuNodesIN, node.uiId);
    this.update.emit(this.menuNodesIN);
    // this.emitNodes();
  }

  private generateIDs() {
    // this.uiMenu = [];
    this.menuNodesIN?.forEach(item => {
      item.child?.forEach(cItem => {
        if (!cItem.uiId) {
          cItem.uiId = getNewID();
        }
      });
      if (!item.uiId) {
        item.uiId = getNewID();
      }
    });
  }

  /*
  private emitNodes() {
    // this.menuNodesIN = [];
    const toEmit: AnalyticsMenuConfigUI[] = [];
    this.uiMenu.forEach(item => {
      const mItem: UIMenu = {...item};
      delete mItem.uiId;
      const children: UIMenu[] = item.child.map(cItem => {
        delete cItem.uiId;
        return cItem;
      });
      mItem.child = children;
      toEmit.push(mItem)
    });
    this.update.emit(toEmit);
  }*/

}
