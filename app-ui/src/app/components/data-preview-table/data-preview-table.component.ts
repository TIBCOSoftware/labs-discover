import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList, SimpleChanges,
  TemplateRef
} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {PrimeTemplate} from 'primeng/api';
import {get} from 'lodash';

@Component({
  selector: 'data-preview-table',
  templateUrl: './data-preview-table.component.html',
  styleUrls: ['./data-preview-table.component.scss'],
  animations: [
    trigger('rowExpansionTrigger', [
      state('void', style({
        transform: 'translateX(-10%)',
        opacity: 0
      })),
      state('active', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class DataPreviewTableComponent implements OnInit {

  @Input() autoLayout = true;
  @Input() showExpandButton = false;
  @Input() paginator = false;
  @Input() showCurrentPageReport = false;
  @Input() showSortIcon = false;
  @Input() currentPageReportTemplate = 'Showing {first} to {last} of {totalRecords} entries';
  @Input() defaultRows = 5;
  @Input() rowsPerPageOptions = [15, 25, 50];
  @Input() showFilterRow: boolean;
  @Input() columnDefs: any[];
  @Input() rowData: any[];

  @Input() rowExpansionTemplate: TemplateRef<any>;
  @Input() tableScrollable = false;

  @Input() tableStyle: any = {};

  /**
   * Array of selected case references
   */
  @Output() selection: EventEmitter<string[]> = new EventEmitter<string[]>();

  /**
   * Case Reference clicked
   */
  @Output() click: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Case Reference double clicked
   */
  @Output() doubleClick: EventEmitter<string> = new EventEmitter<string>();

  @ContentChildren(PrimeTemplate) templates: QueryList<any>;


  constructor() {
  }


  ngOnInit(): void {
  }


}
