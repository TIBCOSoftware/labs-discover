import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { C19ProfileTableComponent } from './test-table.component';

describe('TestTableComponent', () => {
  let component: C19ProfileTableComponent;
  let fixture: ComponentFixture<C19ProfileTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ C19ProfileTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(C19ProfileTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
