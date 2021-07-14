import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {ObjectHeaderConfig} from '@tibco-tcstk/tc-web-components/dist/types/models/objectHeaderConfig';
import {AnalyticTemplateUI} from '../../models_ui/analyticTemplate';
import {interval, of, Subject} from 'rxjs';
import {debounce, debounceTime} from 'rxjs/operators';
import {Router} from '@angular/router';

@Component({
  selector: 'analytics-templates',
  templateUrl: './analytics-templates.component.html',
  styleUrls: ['./analytics-templates.component.css']
})
export class AnalyticsTemplatesComponent implements OnInit {

  @Input() selectedTemplate: AnalyticTemplateUI;

  @Output() templateSelected: EventEmitter<AnalyticTemplateUI> = new EventEmitter<AnalyticTemplateUI>();

  // TODO: Loop over types
  public filterTypes = ['General', 'Vertical', 'User defined'];
  public filterEnabled = [false, false, false];

  public templates: AnalyticTemplateUI[];
  public filteredTemplates: AnalyticTemplateUI[];

  public search$: Subject<number> = new Subject<number>();

  public highLight = '';

  constructor(
              protected router: Router,
              protected messageService: MessageTopicService) {
  }

  ngOnInit(): void {
    // this.atService.getAnalyticTamplates().subscribe( (aTemplates) => {
    //   this.templates = aTemplates;
    // })
    // this.search$.pipe(
    //   debounceTime(300)
    // ).subscribe(
    //   (searchV) => {
    //     const searchValue = searchV + '';
    //     console.log('Searching on: ', searchValue);
    //     this.applyFilter();
    //     this.highLight = searchValue;
    //     if(searchValue !== '') {
    //       const searchedTemplates = [];
    //       for(const temp of this.filteredTemplates){
    //         if(temp.description.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0 || temp.name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0){
    //           searchedTemplates.push(temp);
    //         }
    //       }
    //       this.filteredTemplates = [...searchedTemplates];
    //     }
    //   }
    // )
    // this.applyFilter();
  }

  handleSearch(data){
    // console.log('C Searching on: ' , data.detail.value);
    this.search$.next(data.detail.value);
  }

  templateSelectedCard(template) {
    console.log('Template Selected: ' , template);
    this.templateSelected.emit(template);
  }

  applyFilter() {
    if(this.filterEnabled.every(v => v === false)){
      // If all filters are off, show all templates
      this.filteredTemplates = [...this.templates];
    } else {
      this.filteredTemplates = [];
      for(const tem of this.templates){
        for(const filI in this.filterTypes) {
          if (tem.type === this.filterTypes[filI]) {
            if (this.filterEnabled[filI]) {
                this.filteredTemplates.push(tem);
            }
          }
        }
      }
    }
  }

  filterSelected(fil){
    console.log('filter Seleced: ' , fil);
    for(const filI in this.filterTypes){
      if(this.filterTypes[filI] === fil){
        this.filterEnabled[filI] = !this.filterEnabled[filI]
      }
    }
    this.applyFilter();
    this.filterEnabled = [...this.filterEnabled];
  }


  addTemplate(){
    this.messageService.sendMessage('news-banner.topic.message', 'You can add an Analytic Template in this Configuration...');
    this.router.navigate(['/discover/settings/analytic-templates']);
  }
}
