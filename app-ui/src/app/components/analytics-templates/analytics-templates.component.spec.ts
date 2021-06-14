import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';
import {TcCoreConfig, TcCoreConfigService, TcCoreLibModule} from '@tibco-tcstk/tc-core-lib'

import { AnalyticsTemplatesComponent } from './analytics-templates.component';

describe('AnalyticsTemplatesComponent', () => {
  let component: AnalyticsTemplatesComponent;
  let fixture: ComponentFixture<AnalyticsTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TcCoreLibModule, RouterTestingModule],
      providers: [TcCoreConfigService],
      declarations: [ AnalyticsTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TODO: Fix injector problem: NullInjectorError: R3InjectorError(DynamicTestModule)[AnalyticTemplateService -> ConfigurationService -> TcAppDefinitionService -> TcCoreConfigService -> InjectionToken TcCoreConfiguration -> InjectionToken TcCoreConfiguration]:
  //   NullInjectorError: No provider for InjectionToken TcCoreConfiguration!
  //
  //  error properties: Object({ ngTempTokenPath: null, ngTokenPath: [ 'AnalyticTemplateService', 'ConfigurationService', 'TcAppDefinitionService', 'TcCoreConfigService', 'InjectionToken TcCoreConfiguration', 'InjectionToken TcCoreConfiguration' ] })
  //     at <Jasmine>

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
