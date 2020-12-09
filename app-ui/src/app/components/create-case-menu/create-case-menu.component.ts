import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {NewAnalysisStepStatus, NewInvestigation} from "../../models/discover";
import {UxplLeftNav} from "@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav";
import {UxplSelectInput} from "@tibco-tcstk/tc-web-components/dist/types/components/uxpl-select-input/uxpl-select-input";

@Component({
  selector: 'create-case-menu',
  templateUrl: './create-case-menu.component.html',
  styleUrls: ['./create-case-menu.component.css']
})
export class CreateCaseMenuComponent implements OnInit, AfterViewInit {

  @Output() createInvestigation: EventEmitter<NewInvestigation> = new EventEmitter();

  @ViewChild('selectInput', {static: false}) caseTypeInput: ElementRef<UxplSelectInput>;

  public invInfo: NewInvestigation;

  constructor() {

  }

  ngOnInit(): void {
    this.invInfo = {
      type: "Compliance",
      additionalDetails : "",
      summary: ""
    }
  }

  createInvestiagation(){
    console.log('Creating investigation: ', this.invInfo)
    this.createInvestigation.emit(this.invInfo);
  }

  ngAfterViewInit(): void {
    this.caseTypeInput.nativeElement.options = [
      {
        label: 'Discover - Compliance',
        value: 'Compliance'
      },
      {
        label: 'Discover - Improvement',
        value: 'Improvement'
      }
    ]
    // TODO: It looks like sometimes nativeElement is null
    this.caseTypeInput.nativeElement.value = 'Compliance';
  }
}
