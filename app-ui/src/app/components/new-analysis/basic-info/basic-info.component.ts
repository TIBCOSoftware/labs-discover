import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {map} from 'rxjs/operators';
import {RepositoryService} from 'src/app/api/repository.service';
import {NewAnalysisStepStatus} from 'src/app/models_ui/discover';

@Component({
  selector: 'basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.css']
})
export class BasicInfoComponent implements OnInit, OnChanges {

  @Input() name: string;
  @Input() description: string;
  @Input() originalName: string;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter<NewAnalysisStepStatus>();
  @Output() changed: EventEmitter<string[]> = new EventEmitter<string[]>();

  private analysisNames: string[] = [];
  public differentName: boolean;

  public nameHint = '';

  constructor(
    protected repositoryService: RepositoryService
  ) {
  }

  ngOnInit(): void {
    this.getAnalysisNames();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.originalName) {
      this.getAnalysisNames();
    }
    this.updateStatus();
  }

  private getAnalysisNames() {
    this.repositoryService.getAnalysis().pipe(
      map(analysisList => {
        this.analysisNames = analysisList.map(el => el.data.name);
        if (this.originalName !== '') {
          const index = this.analysisNames.indexOf(this.originalName, 0);
          if (index > -1) {
            this.analysisNames.splice(index, 1);
          }
        }
        this.updateStatus();
      })
    ).subscribe();
  }

  handleUpdate = (event, fieldName) => {
    this.changed.emit([fieldName, event.detail.value]);
  }

  public isValidName = (): boolean => {
    return this.differentName;
  }

  private updateStatus = (): void => {
    this.differentName = this.name ? !this.analysisNames.includes(this.name) : true;
    if (!this.differentName) {
      this.nameHint = 'A Process Analysis with this name already exists...';
    } else {
      this.nameHint = '';
    }
    const status = this.differentName && !(this.name === undefined || this.description === undefined || this.name === '' || this.description === '');
    const stepStatus = {
      step: 'basic-info',
      completed: status
    } as NewAnalysisStepStatus;
    // FIX for "Expression has changed after it was checked" (https://blog.angular-university.io/angular-debugging/)
    // Only send status update in the next JavaScript Cycle
    window.setTimeout(() => {
      this.status.emit(stepStatus);
    })

  }
}
