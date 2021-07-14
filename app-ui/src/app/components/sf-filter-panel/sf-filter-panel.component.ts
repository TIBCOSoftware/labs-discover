import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {UxplLeftNav} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav';
import {NavMenu} from '@tibco-tcstk/tc-web-components/dist/types/models/leftNav';
import {ResizableDraggableComponent} from '../resizable-draggable/resizable-draggable.component';
import {TemplateFilterConfigUI} from '../../models_ui/analyticTemplate';

@Component({
  selector: 'sf-filter-panel',
  templateUrl: './sf-filter-panel.component.html',
  styleUrls: ['./sf-filter-panel.component.scss']
})
export class SfFilterPanelComponent implements OnInit, AfterViewInit, OnChanges {

  @Input('width') public width: number;
  @Input('height') public height: number;
  @Input('left') public left: number;
  @Input('top') public top: number;

  @Input('filterIds') public filterIds: string[];
  @Input('filterConfig') public filterConfig: TemplateFilterConfigUI[];

  @Output() enableSFPointerEvents: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() openFilterPage: EventEmitter<string> = new EventEmitter<string>();



  activeTab: string;

  // @Input('containerTop') public containerTop: number;
  // @Input('containerLeft') public containerLeft: number;
  // @Input('containerHeight') public containerHeight: number;
  // @Input('containerWidth') public containerWidth: number;

  @ViewChild('sfFilterContainer', {static: false}) sfFilterContainer: ResizableDraggableComponent;
  @ViewChild('sfView', {static: false}) sfView: ElementRef;
  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;

  leftNavTabs: NavMenu[] = [];

  private firstShow = false;

  contentExpanded = true;
  oriHeight: number;
  minFilterPanelSize = {x: 228, y: 68};

  ngOnInit() {
    this.processConfig();
  }


  ngAfterViewInit() {
    this.setMenu();
  }

  private setMenu() {
    const firstTab = this.filterConfig?.filter(fc => fc.isDefault === true)[0];
    if (firstTab) {
      this.activeTab = firstTab.id;
      this.openFilterPage.emit(firstTab.id);
      setTimeout(() => {
        this.leftNav?.nativeElement?.setTab(firstTab, true);
      }, 100);
    }
  }

  handleMenuClick(event) {
    // console.log('click menu', event);
    if (event.detail && event.detail.id) {
      const filterId = event.detail.id;
      this.activeTab = this.filterConfig.find(fc => fc.id === filterId).uiId;
      // this.activeTab = event.detail.id;
      this.openFilterPage.emit(filterId);
    }
  }

  public setContainerScope(scope) {
    this.sfFilterContainer.setContainerScope(scope);
  }

  public startDrag(event) {
    this.sfFilterContainer.startDrag(event);
  }

  public enableSpotfirePointerEvents(event) {
    this.enableSFPointerEvents.emit(event);
    this.enableInnerSFPointerEvents(event);
  }

  public enableInnerSFPointerEvents(enabled) {
    // console.log('enableInnerSFPointerEvents', enabled);
    // console.log('the div of the iframe is ', this.sfView.nativeElement.querySelector('div#' + this.activeTab));
    // console.log('this.activeTab', this.activeTab);
    const iframe = this.sfView.nativeElement.querySelector('div#' + this.activeTab + ' > iframe');
    // console.log('iframe', iframe);
    if (iframe) {
      const style = 'border: 0px; margin: 0px; padding: 0px; width: 100%; height: 100%;';
      if (enabled) {
        iframe.setAttribute('style', style);
      } else {
        iframe.setAttribute('style', style + 'pointer-events: none;');
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.processConfig();
  }

  private processConfig() {
    this.leftNavTabs = [];
    this.filterConfig?.forEach(fc => {
      if (fc.enabled) {
        this.leftNavTabs.push({
          id: fc.id,
          label: fc.label
        });
        if (fc.isDefault) {
          this.activeTab = fc.id.replace(/\s/g, '');
        }
      }
    })
  }

  public toggleShow(isShown: boolean) {
    if (isShown && !this.firstShow) {
      this.firstShow = true;
      this.setMenu();
    }
  }

  public toggleContentExpanded() {
    if (this.contentExpanded) {
      this.oriHeight = this.sfFilterContainer.verticalCollapse(68);
    } else {
      this.sfFilterContainer.verticalExpand(this.oriHeight);
    }
    this.contentExpanded = !this.contentExpanded;
  }

}
