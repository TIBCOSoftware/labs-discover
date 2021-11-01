import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';
import { Location } from '@angular/common';
import { PublishedViews } from 'src/app/backend/model/publishedViews';

@Component({
  selector: 'tdv-list',
  templateUrl: './tdv-list.component.html',
  styleUrls: ['./tdv-list.component.scss']
})
export class TdvListComponent implements OnInit {

  @Input() tdvs: PublishedViews[];
  @Input() selectedTdv: PublishedViews;
  @Output() tdvSelected: EventEmitter<any> = new EventEmitter();
  @Output() refreshTdvs: EventEmitter<any> = new EventEmitter();

  @ViewChild('tdvTable', {static: false}) dt;
  public searchTerm: string;

  cols = [
    {field: 'DatasetName', header: 'Name'},
    {field: 'Annotation', header: 'Description'},
    {field: 'ModificationTime', header: 'Modified on'},
    {field: 'CreationTime', header: 'Created on'}
  ];

  public noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');

  constructor(
    protected location: Location
  ) {
  }

  ngOnInit(): void {
  }

  public handleSearch = ($event): void => {
    this.searchTerm = $event.detail.value;
    this.dt.filterGlobal(this.searchTerm, 'contains');
  }

  public selectTdv(tdv: PublishedViews) {
    this.tdvSelected.emit(tdv);
    this.selectedTdv = tdv;
  }

  public refresh() {
    this.tdvs = null;
    this.refreshTdvs.emit();
  }

}
