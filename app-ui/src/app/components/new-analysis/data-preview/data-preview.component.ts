import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {NavMenu} from '@tibco-tcstk/tc-web-components/dist/types/models/leftNav';
import {SpotfireDocument, SpotfireFiltering, SpotfireViewerComponent} from '@tibco/spotfire-wrapper';
import {map} from 'rxjs/operators';
import {ConfigurationService} from 'src/app/service/configuration.service';
import {DiscoverBackendService} from 'src/app/service/discover-backend.service';
import {DatasetService} from 'src/app/service/dataset.service';
import {OauthService} from 'src/app/service/oauth.service';
import {getSFLink} from '../../../functions/templates';
import {UxplLeftNav} from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-left-nav/uxpl-left-nav';
// import { Map, StartStop, TypeValue } from '../../../models/analysis';
import {encodeColumnName, START_NAME, STOP_NAME} from '../../../functions/analysis';
import { Mapping, TypeValue } from 'src/app/model/models';
import { StartStop } from 'src/app/models/analysis';

// TODO: Use these interfaces till nicolas de roche has changed his component
export interface MySpotfireFilterSetting {
  values: string[];
  lowValue: any;
  highValue: any;
  includeEmpty: boolean;
  searchPattern: any;
  hierarchyPaths: any[];
}

export interface MySpotfireFilter {
  filteringSchemeName: string;
  dataTableName: string;
  dataColumnName: string;
  filterType: string | any;
  filterSettings: MySpotfireFilterSetting; // | MySpotfireFilterSetting[];
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

  public spotfireServer:string;
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

  constructor(
    protected dataserService: DatasetService,
    protected backendService: DiscoverBackendService,
    protected configService: ConfigurationService,
    protected oService: OauthService
  ) {
  }

  ngOnInit(): void {
    this.previewDXPLocation = this.configService.config?.discover?.analyticsSF?.previewDXPLocation;
    this.spotfireServer = getSFLink(this.configService.config?.discover?.analyticsSF);

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
    this.backendService.getColumnsFromSpark(this.selectedDataset, this.configService.config.claims.globalSubcriptionId).pipe(
      map(response => {
        this.availableColumns = response.map(column => column.COLUMN_NAME);
      })
    ).subscribe();
  }

  public updateStatus(event) {
    // Mapping has been updated in the left panel
    if (this.document) {
      // const normalizedMap = this.analysisData.Map
      for (const key of Object.keys(this.mapping)) {
        if (this.mapping[key]) {
          if (typeof (this.mapping[key]) === 'string') {
            this.mapping[key] = encodeColumnName(this.mapping[key]);
          }
        }
      }
      this.document.setDocumentProperty('DatasetId', this.selectedDataset);
      this.document.setDocumentProperty('ColumnMapping', JSON.stringify(this.mapping));
      this.document.setDocumentProperty('Token', this.oService.token);
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
                  type: 'ActivitiesStart',
                  value: startStop.startActivities,
                  includeEmpty: false
                }
                this.upsertFilter(startFilterObject);
              }
              if (startStop.stopActivities && startStop.stopActivities.length > 0) {
                const stopFilterObject: TypeValue = {
                  name: STOP_NAME,
                  description: 'Activities that indicate the end of a variant',
                  type: 'ActivitiesEnd',
                  value: startStop.stopActivities,
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
              type: sfSet.values ? 'values' : 'range',
              value: sfSet.values ? sfSet.values : [sfSet.lowValue, sfSet.highValue],
              includeEmpty: sfSet.includeEmpty
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
}
