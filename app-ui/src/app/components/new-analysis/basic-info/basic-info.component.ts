import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { RepositoryService } from 'src/app/backend/api/repository.service';
import { Analysis } from 'src/app/backend/model/analysis';
import { NewAnalysisStepStatus } from 'src/app/models_ui/discover';

@Component({
  selector: 'basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.css']
})
export class BasicInfoComponent implements OnInit, OnChanges {

  @Input() name: string;
  @Input() description: string;
  @Input() analysisId: string;
  @Output() status: EventEmitter<NewAnalysisStepStatus> = new EventEmitter<NewAnalysisStepStatus>();
  @Output() changed: EventEmitter<string[]> = new EventEmitter<string[]>();

  public nameChanged: Subject<any> = new Subject<any>();

  private analysisNames: string[] = [];
  public sameName = false;

  public nameHint = '';

  constructor(
    protected repositoryService: RepositoryService
  ) {}

  ngOnInit(): void {
    this.nameChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .pipe(
        map((newValue: any) => {
          return this.analysisNames.includes(newValue.value);
        })
      ).subscribe((re: any) => {
        if (re ) {
          this.sameName = true;
        } else {
          this.sameName = false;
        }
        this.updateStatus();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.analysisId?.currentValue != undefined){
      this.getAnalysisNames();
    }
  }

  private getAnalysisNames() {
    return this.repositoryService.getAnalysis().pipe(
      map((analysisList: Analysis[]) => {
        this.analysisNames = analysisList.filter(
          (el: Analysis) => el.id !== this.analysisId
        ).map(
          (el: Analysis) => el.data.name
        );
      })
    ).toPromise();
  }

  handleUpdate = (event, fieldName) => {
    const value = event.detail.value;
    this.changed.emit([fieldName, event.detail.value]);
    if (fieldName === 'name' && value && value.trim() !== '') {
      this.nameChanged.next({
        value
      });
    } else {
      // Use a setTimeout here to fix the issue that when a description get's pasted the Next button does not get enabled
      // (this gives the input to this class the change to be set)
      setTimeout(() => {
        this.updateStatus();
      })
    }
  }

  public isValidName = (): boolean => {
    return !this.sameName;
  }

  private updateStatus = (): void => {
    if (this.sameName) {
      this.nameHint = 'A Process Analysis with this name already exists...';
    } else {
      this.nameHint = '';
    }
    const status = !this.sameName && !(this.name === undefined || this.description === undefined || this.name === '' || this.description === '');
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
