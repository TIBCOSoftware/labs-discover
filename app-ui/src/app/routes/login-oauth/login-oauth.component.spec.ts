import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginOauthComponent } from './login-oauth.component';

describe('LoginOauthComponent', () => {
  let component: LoginOauthComponent;
  let fixture: ComponentFixture<LoginOauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginOauthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginOauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
