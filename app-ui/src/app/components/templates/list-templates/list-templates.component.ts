import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { DatasetService } from '../../../service/dataset.service';
import {AnalyticTemplateUI} from '../../../models_ui/analyticTemplate';
import {CardMode} from '../../../models_ui/configuration';
@Component({
  selector: 'list-templates',
  templateUrl: './list-templates.component.html',
  styleUrls: ['./list-templates.component.css']
})
export class ListTemplatesComponent implements OnInit, OnChanges {

  @Input() templates: AnalyticTemplateUI[];
  @Input() mode: CardMode;
  @Input() selectedTemplate: string;
  @Output() selected: EventEmitter<{mode: CardMode, template: AnalyticTemplateUI, event: MouseEvent}> = new EventEmitter<{mode: CardMode, template: AnalyticTemplateUI, event: MouseEvent}>();


  public filteredTemplates: AnalyticTemplateUI[];
  public filterTypes = ['General', 'Vertical', 'User defined'];
  public filterEnabled = [false, false, false];
  public objHeaderConfig = {
    title: {
      value: 'Templates',
      isEdit: false,
      editing: false
    }
  };
  public search$: Subject<number> = new Subject<number>();
  public searchValue: string;

  constructor(
    protected router: Router,
    protected templatesService: DatasetService
  ) { }

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(300)
    ).subscribe(
      (searchV) => {
        this.searchValue = searchV + '';
        this.filterTemplates();
      }
    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filterTemplates();
  }

  public goProcessAnalysis = (): void => {
    this.router.navigate(['/discover/process-analysis']);
  }

  public handleSelected = (event): void => {
    this.selected.emit(event);
  }

  public handleSearch = (data): void => {
    this.search$.next(data.detail.value);
  }

  public filterTemplates = (): void => {
    let allowedTypes = this.filterTypes.filter((_, index) => {
      return this.filterEnabled[index];
    });
    if (allowedTypes.length === 0){
      allowedTypes = this.filterTypes;
    }

    // Filter based on type
    let filteredTemplates = this.templates?.filter(template => allowedTypes.findIndex(el => el === template.type) > -1);

    // Filter based on text
    if (this.searchValue !== undefined){
      filteredTemplates = filteredTemplates.filter(template => template.description.toLowerCase().indexOf(this.searchValue.toLowerCase()) >= 0 || template.name.toLowerCase().indexOf(this.searchValue.toLowerCase()) >= 0)
    }

    this.filteredTemplates = filteredTemplates;
  }

  public filterSelected = (index: number): void => {
    this.filterEnabled[index] = !this.filterEnabled[index];
    this.filterTemplates();
  }

  public isSelected = (name: string): boolean => {
    return name === this.selectedTemplate;
  }
}
