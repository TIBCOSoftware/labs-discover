import {Component, Input, EventEmitter, Output, OnChanges, SimpleChanges, ViewChild, OnInit} from '@angular/core'
import {SpotfireWrapperComponent} from '@tibco-tcstk/tc-spotfire-lib';
import {SpotfireDocument} from '@tibco/spotfire-wrapper';

@Component({
  selector: 'sfcontainer',
  templateUrl: './sf-container.component.html',
})
export class SfContainerComponent implements OnInit, OnChanges {

  @ViewChild(SpotfireWrapperComponent, {static: true}) spotfireWrapperComponent: SpotfireWrapperComponent;

  @Input() sfProps = {
    showAbout: false,
    showAnalysisInformationTool: false,
    showAuthor: false,
    showClose: false,
    showCustomizableHeader: false,
    showDodPanel: false,
    showExportFile: false,
    showExportVisualization: false,
    showFilterPanel: false,
    showHelp: true,
    showLogout: false,
    showPageNavigation: false,
    showAnalysisInfo: false,
    showReloadAnalysis: false,
    showStatusBar: false,
    showToolBar: false,
    showUndoRedo: false
  }

  @Input() sfServer;
  @Input() sfAnalysis;
  @Input() sfMarkingOn;
  @Input() sfMarkingMaxRows;
  @Input() parameters;
  @Input() page;


  @Output() outputMarking;
  @Output() markingEvent = new EventEmitter();
  @Output() handleErrorMessage: EventEmitter<string> = new EventEmitter<string>();

  public SFDocument: SpotfireDocument;

  marking(event) {
    console.log('Marking: ', event);
    this.outputMarking = event;
    this.markingEvent.emit(this.outputMarking);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('CHANGES: ', changes);
  }

  public setPage(page) {
    console.log('Opening Page: ' + page);
    this.spotfireWrapperComponent.openPage(page);
  }

  public setProp(name: string, value: any) {
    this.SFDocument.getDocumentProperties$().subscribe(s => console.log('SF Properties Before Set: ', s));
    console.log('Setting Spotfire Property Name: ' + name + ' value: ', value);
    this.SFDocument.setDocumentProperty(name, value);
    this.SFDocument.getDocumentProperties$().subscribe(s => console.log('SF Properties After Set: ', s));
  }

  public handleError = ($event): void => {
    this.handleErrorMessage.emit($event);
  }

  ngOnInit(): void {
    // this.SFDocument.getDocumentProperty$('AnalysisId').subscribe(w => console.log('SF Property: ', w));
    // this.SFDocument.getDocumentProperties$().subscribe(s => console.log('SF Properties: ', s));
  }


}
