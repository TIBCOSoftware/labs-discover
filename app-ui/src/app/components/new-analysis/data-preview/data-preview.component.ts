import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {NavMenu} from '@tibco-tcstk/tc-web-components/dist/types/models/leftNav';
import {
  SpotfireDocument,
  SpotfireFilter,
  SpotfireFilterSetting,
  SpotfireViewerComponent
} from '@tibco/spotfire-wrapper';
import {map} from 'rxjs/operators';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {OauthService} from 'src/app/service/oauth.service';
import {getSFLink} from '../../../functions/templates';
import {UxplLeftNav} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav';
// import { Map, StartStop, TypeValue } from '../../../models_ui/analysis';
import {
  convertDateFromLocale,
  encodeColumnName,
  START_NAME,
  STOP_NAME,
  transformMapping
} from '../../../functions/analysis';
import {Mapping, TypeValue} from 'src/app/backend/model/models';
import {StartStop} from 'src/app/models_ui/analysis';
import {DateTime} from 'luxon';
import { CatalogService } from 'src/app/backend/api/catalog.service';

// TODO: Use these interfaces till nicolas de roche has changed his component
export interface MySpotfireFilter {
  filteringSchemeName: string;
  dataTableName: string;
  dataColumnName: string;
  filterType: string | any;
  filterSettings: SpotfireFilterSetting; // | MySpotfireFilterSetting[];
}

@Component({
  selector: 'data-preview',
  templateUrl: './data-preview.component.html',
  styleUrls: ['./data-preview.component.css']
})
export class DataPreviewComponent implements OnInit {

  @Input() mapping: Mapping;
  @Input() selectedDataset: string;
  @Input() selectedDatasetName: string;
  @Input() filters: TypeValue[];
  @Input() groups: TypeValue[];

  @ViewChild('leftNav', {static: false}) leftNav: ElementRef<UxplLeftNav>;
  @ViewChild('analysis', {static: false}) analysisRef: SpotfireViewerComponent;

  public spotfireServer: string;
  public availableColumns = [];
  public leftNavTabs: NavMenu[];
  public page: string;
  private document: SpotfireDocument;

  public analysisParameters: string;
  public customization = {
    showFilterPanel: true
  }

  public showMapping = false;
  public showTopSection = true;
  public previewDXPLocation: string;
  private previewDataTable: string;

  constructor(
    private catalogService: CatalogService,
    private configService: ConfigurationService,
    private oService: OauthService
  ) {
  }

  ngOnInit(): void {
    this.previewDXPLocation = this.configService.config?.discover?.analytics?.previewLocation;
    this.previewDataTable = this.configService.config?.discover?.analytics?.previewTableName;
    this.spotfireServer = getSFLink(this.configService.config?.discover?.analytics);

    this.leftNavTabs = [
      {id: 'Statistics', label: 'Summary'},
      {id: 'Case Filters', label: 'Case filters'},
      {id: 'Event Filters', label: 'Event filters'},
      /*{ id: 'Groups', label: 'Groups' },*/
      {id: 'Start & Stop Activities', label: 'Label Start & Stop'},
      {id: 'Config', label: 'Config'}
    ];
    this.page = this.leftNavTabs[0].id;
    setTimeout(() => {
      this.leftNav?.nativeElement?.setTab(this.leftNavTabs[0], true);
    }, 0);
    // Sometime the left tab is not selected, this code ensures it is
    setTimeout(() => {
      this.leftNav.nativeElement.setTab(this.leftNavTabs[0], true);
    }, 100);
    this.analysisParameters = 'DatasetId="' + this.selectedDataset + '";&Token="' + this.oService.token + '";';
    this.catalogService.getTdvMetaData(this.selectedDataset).pipe(
      map(response => {
        this.availableColumns = response.map(column => column.COLUMN_NAME);
      })
    ).subscribe();
  }

  public updateStatus(event) {
    // Mapping has been updated in the left panel
    if (this.document) {
      // const normalizedMap = this.analysisData.Map

      /* Moved to function
      const colMappObj = {};
      for (const key of Object.keys(this.mapping)) {
        if (this.mapping[key]) {
          if (typeof (this.mapping[key]) === 'string') {
            colMappObj[key] = encodeColumnName(this.mapping[key]);
            // this.mapping[key] = encodeColumnName(this.mapping[key]);
          }
        }
      }*/
      this.document.setDocumentProperty('DatasetId', this.selectedDataset);
      this.document.setDocumentProperty('ColumnMapping', JSON.stringify(transformMapping(this.mapping)));
      this.document.setDocumentProperty('Token', this.oService.token);
      if (this.filters && this.filters.length > 0) {
        const ssAct: StartStop = {
          startActivities: this.filters.find(v => v.category === 'ActivitiesStart')?.values,
          stopActivities: this.filters.find(v => v.category === 'ActivitiesEnd')?.values,
        }
        this.document.setDocumentProperty('StartStopActivities', JSON.stringify(ssAct));
        const filterColumns: SpotfireFilter[] = [];
        this.filters.forEach(f => {
          if (f.name.indexOf(':') > -1) {
            const fType = f.name.split(':')
            if (fType.length > 1) {
              let fSettings: SpotfireFilterSetting;
              if (f.category === 'values') {
                fSettings = new SpotfireFilterSetting({
                  includeEmpty: f.includeEmpty,
                  values: f.values
                })
              }
              if (f.category === 'range' && f.values.length > 1) {
                fSettings = new SpotfireFilterSetting({
                  includeEmpty: f.includeEmpty,
                  lowValue: f.values[0],
                  highValue: f.values[1]
                })
              }
              filterColumns.push(new SpotfireFilter(
                {
                  filteringSchemeName: fType[0],
                  dataTableName: this.previewDataTable,
                  dataColumnName: fType[1],
                  filterSettings: fSettings
                }))
            }
          }
        })
        this.document.getFiltering().setFilters(filterColumns)
      }
    }
  }

  public handleClick = (event: any): void => {
    this.page = event.detail.id;
  }

  public setDocument = (event): void => {
    // console.log('******* Document: ', event);
    this.document = event;
    this.updateStatus(event);
  }

  public async extractSpotfireFilterData(): Promise<boolean> {
    if (this.document) {
      const ssPromise = await new Promise<void>((resolve, reject) => {
        const propSub = this.document.getDocumentProperties$().subscribe(properties => {
          // console.log('Property: ', properties);
          try {
            const startStopProp = properties.find(prop => prop.name === 'StartStopActivities');
            // console.log('startStopProp: ', startStopProp);
            if (startStopProp?.value) {
              const startStop = JSON.parse(startStopProp.value + '') as StartStop;
              // console.log('StartStop: ', startStop);
              if (startStop.startActivities && startStop.startActivities.length > 0) {
                const startFilterObject: TypeValue = {
                  name: START_NAME,
                  description: 'Activities that indicate the start of a variant',
                  category: 'ActivitiesStart',
                  values: startStop.startActivities,
                  includeEmpty: false
                }
                this.upsertFilter(startFilterObject);
              }
              if (startStop.stopActivities && startStop.stopActivities.length > 0) {
                const stopFilterObject: TypeValue = {
                  name: STOP_NAME,
                  description: 'Activities that indicate the end of a variant',
                  category: 'ActivitiesEnd',
                  values: startStop.stopActivities,
                  includeEmpty: false
                }
                this.upsertFilter(stopFilterObject);
              }
            }
          } catch (e) {
            console.error(e);
            reject(e);
          }
          propSub.unsubscribe();
          resolve();
        })
      });
      const filterPromise = await new Promise<void>((resolve, reject) => {
        const filterSub = this.document.getFiltering().getAllModifiedFilterColumns$().subscribe((filters) => {
          filters.forEach((filter) => {
            // TEMP Fix, till spotifre lib get's updated
            const sfFilter = filter as any as MySpotfireFilter;
            const sfSet = sfFilter.filterSettings;
            const caseFilterObject: TypeValue = {
              name: filter.filteringSchemeName + ':' + sfFilter.dataColumnName,
              description: 'Filter',
              category: sfSet.values ? 'values' : 'range',
              values: sfSet.values ? sfSet.values : [sfSet.lowValue, sfSet.highValue],
              includeEmpty: sfSet.includeEmpty
            }
            // Check specifically for range filter
            if (sfFilter.filterType === 'RangeFilter') {
              caseFilterObject.category = 'range'
              caseFilterObject.values = [convertDateFromLocale(sfSet.lowValue), convertDateFromLocale(sfSet.highValue)]
            }
            this.upsertFilter(caseFilterObject);
          })
          filterSub.unsubscribe();
          resolve();
        })
      });
      Promise.all([ssPromise, filterPromise]).then(values => {
        return true;
      });
    } else {
      return false;
    }
  }

  private upsertFilter(filterObject: TypeValue) {
    const index = this.filters.findIndex(item => item.name === filterObject.name);
    if (index > -1) {
      this.filters[index] = filterObject;
    } else {
      this.filters.push(filterObject);
    }
  }

  private convertDateFromLocale = (date: string): string => {
    const locale = window.navigator.language;
    const newDateLocale = Intl.DateTimeFormat(locale).formatToParts(new Date());
    let format = '';
    newDateLocale.forEach((element: Intl.DateTimeFormatPart) => {
      switch (element.type) {
        case 'day':
          format = format + 'd';
          break;
        case 'month':
          format = format + 'M';
          break;
        case 'year':
          format = format + (element.value.length ==2 ? 'yy' : 'yyyy');
          break;
        case 'literal':
          format = format + element.value;
        default:
          break;
      }
    })
    format = format + ' hh:mm:ss';
    const newDate = DateTime.fromFormat(date, format, { locale: locale }).toISO();
    console.log('OLD DATE: ' + date + ' NEW DATE: ' + newDate + ' Returning: ');
    return newDate;
  }

  private convertDateToLocale = (date: string): string => {
    const currentDate = new Date(date);
    const locale = window.navigator.language;
    return currentDate.toLocaleDateString(locale) + ' ' + currentDate.toLocaleTimeString(locale)
  }
}
