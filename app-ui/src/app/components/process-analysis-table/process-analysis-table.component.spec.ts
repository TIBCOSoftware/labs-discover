import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessAnalysisTableComponent } from './process-analysis-table.component';

describe('TestProcessAnalysisTableComponent', () => {
  let component: ProcessAnalysisTableComponent;
  let fixture: ComponentFixture<ProcessAnalysisTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessAnalysisTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessAnalysisTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
