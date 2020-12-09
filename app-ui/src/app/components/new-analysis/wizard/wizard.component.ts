import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewAnalysis, NewAnalysisStepStatus } from 'src/app/models/discover';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { LiveAppsService, CaseTypesList } from '@tibco-tcstk/tc-liveapps-lib';
import { map } from 'rxjs/operators';
import { CsvService } from 'src/app/service/csv.service';
import { TDVService } from 'src/app/service/tdv.service';
import { MessageTopicService } from '@tibco-tcstk/tc-core-lib';
// import { jsf } from 'json-schema-faker';

declare var JSONSchemaFaker: any;
@Component({
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {

  public newAnalysis: NewAnalysis;
  public caseReference: string;
  public previewData: any[];
  public previewColumns: any[];

  public config: any;

  private creatorSchema: any;
  private statuses: NewAnalysisStepStatus[];

  constructor(
    protected liveapps: LiveAppsService,
    protected configService: ConfigurationService,
    public dialogRef: MatDialogRef<WizardComponent>,
    protected csvService: CsvService,
    protected tdvService: TDVService,
    protected messageService: MessageTopicService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.messageService.sendMessage('integratedHelp', 'discover/process-analysis/wizard');
    if (this.data.analysisData){
      this.convertToAnalysis(this.data.analysisData);
    } else {
      this.initializeForm();
    }
    this.getCreatorSchema();
    this.getStepperConfiguration();
  }

  private convertToAnalysis = (data): void => {
    this.newAnalysis = {
      basicInfo: {
        analysisName: data.Name,
        analysisDescription: data.Description
      },
      datasource: {
        inputType: data.InputType
      },
      parse: {},
      columns: [],
      mapping: {
        caseId: data.EventMap.case_id,
        activity: data.EventMap.activity_id,
        start: data.EventMap.activity_start_time,
        end: data.EventMap.activity_end_time,
        resource: data.EventMap.resource_id,
        other: data.EventMap.otherAttributes ? data.EventMap.otherAttributes.split(',') : []
      }
    }
    if (this.newAnalysis.datasource.inputType === 'csv') {
      this.newAnalysis.datasource.file = {
        filename: data.Datasource.File.FileName,
        location: '/webresource/orgFolders/' + this.configService.config.discover.csv.folder + '/' + data.Datasource.File.FileName
      };
      this.newAnalysis.parse = {
        columnSeparator: data.Datasource.File.Separator,
        encoding: data.Datasource.File.Encoding,
        comments: '',
        dateTimeFormat: data.Datasource.File.DateTimeFormat,
        numberRowsForPreview: 15,
        escapeChar: data.Datasource.File.EscapeChar,
        quoteChar: data.Datasource.File.QuoteChar,
        skipComments: false,
        skipEmptyLines: false
      };
    } else {
      this.newAnalysis.datasource.tdv = {
        domain: data.Datasource.TDV.Domain,
        site: data.Datasource.TDV.Site,
        database: data.Datasource.TDV.Database,
        table: data.Datasource.TDV.Table,
        username: '',
        password: '',
        numPartition: '',
        primaryKey: '',
        query: '',
        tdvTable: undefined
      }
      this.newAnalysis.parse = {
        dateTimeFormat: data.Datasource.TDV.DateTimeFormat,
        encoding: data.Datasource.TDV.Encoding,
        numberRowsForPreview: 15,
        skipComments: false,
        skipEmptyLines: false
      }
    }
  }

  private initializeForm = ():void => {
    this.newAnalysis = {
      basicInfo: {},
      datasource: {
        inputType: 'csv',
        file: {},
        tdv: {
          site: '',
          database: '',
          table: ''
        }
      },
      columns: [],
      parse: {
        numberRowsForPreview: 15,
        skipComments: true,
        columnSeparator: ',',
        comments: '//',
        escapeChar: '\\',
        skipEmptyLines: false,
        quoteChar: '"',
        encoding: 'UTF-8',
        dateTimeFormat: ''
      },
      mapping: {}
    } as NewAnalysis;
  }

  private getCreatorSchema = (): void => {
    const config = this.configService.config;
    this.liveapps.getCaseTypeSchema(config.sandboxId, config.discover.analysis.applicationId + ' and isCase eq TRUE',1).pipe(
      map((element: CaseTypesList) => {
        const creators = element.casetypes[0].creators;
        this.creatorSchema = creators.filter(creator => { return config.discover.analysis.creatorId === creator.id})[0].jsonSchema;
      })
    ).subscribe();
  }

  private getStepperConfiguration = ():void => {
    const stepConfig = {
      steps: [
        {
          slot: 'basic-info',
          name: '1',
          label: 'Basic info',
          available: true
        },
        {
          slot: 'datasource',
          name: '2',
          label: 'Data source',
        },
        {
          slot: 'parse',
          name: '3',
          label: 'Parsing',
        },
        {
          slot: 'map',
          name: '4',
          label: 'Mapping',
        },
        {
          slot: 'dates',
          name: '5',
          label: 'Dates',
        },
        {
          slot: 'confirmation',
          name: '6',
          label: 'Confirmation'
        }
      ],
      currentStepIdx: 0
    };
    this.config = { ...stepConfig };
    this.initStatuses();
  }

  private initStatuses = (): void => {
    this.statuses = [
      { step: 'basic-info'  , completed: false },
      { step: 'datasource'  , completed: false },
      { step: 'parse'       , completed: false },
      { step: 'map'         , completed: false },
      { step: 'dates', completed: false },
      { step: 'confirmation', completed: false }
    ];
  }

  public onNoClick = (): void => {
    this.dialogRef.close();
  }

  public changeTab = (delta: number): void => {
    const newSteptStep = this.config.currentStepIdx + delta;
    this.config.steps[newSteptStep].available = true;
    this.config = {...this.config, currentStepIdx: newSteptStep};
  }

  private case: any;
  public createAnalysis = (): void => {

    this.case = this.initCaseData();

    const sandboxId = Number(this.configService.config.sandboxId).valueOf();
    const datasourceAppId = this.configService.config.discover.analysis.applicationId;
    let datasourceCreatorActionId: string;
    let caseReference: string;
    if (this.data.analysisData){
      datasourceCreatorActionId = this.data.actionId
      caseReference = this.data.caseReference;
    } else {
      datasourceCreatorActionId = this.configService.config.discover.analysis.creatorId;
      caseReference = undefined;
    }

    this.liveapps.runProcess(sandboxId, datasourceAppId, datasourceCreatorActionId, caseReference, this.case).
      pipe(
        map(response => {
          if (response) {
            if (!response.data.errorMsg) {
              response.data = JSON.parse(response.data);
              if (response.caseReference) {
                this.caseReference = response.caseReference;
              }
            } else {
              console.error('Error create the business process.');
            }
          }
        })
      ).subscribe(
        success => {
          const action = this.data.actionId === undefined ? 'created' : 'saved'
          const message = 'Analysis ' + this.newAnalysis.basicInfo.analysisName + ' has been ' + action + ' successfully.'
          this.messageService.sendMessage('news-banner.topic.message', message);
        },
        error => {
          console.error('Error creating the business process.',);
        }
      );
  }

  private initCaseData = (): any => {
    // JSONSchemaFaker.option('alwaysFakeOptionals', true);
    // JSONSchemaFaker.resolve(jsonSchema).then(sample => {
    //   console.log(sample);
    // });

    const caseData = {
      Discoveranalysis: {
        Name: this.newAnalysis.basicInfo.analysisName,
        Description: this.newAnalysis.basicInfo.analysisDescription,
        InputType: this.newAnalysis.datasource.inputType,
        Columns: this.newAnalysis.columns,
        Datasource: {},
        EventMap: {
          case_id: this.newAnalysis.mapping.caseId,
          activity_id: this.newAnalysis.mapping.activity,
          resource_id: this.newAnalysis.mapping.resource,
          activity_start_time: this.newAnalysis.mapping.start,
          activity_end_time: this.newAnalysis.mapping.end,
          otherAttributes: this.newAnalysis.mapping.other ? this.newAnalysis.mapping.other.toString() : undefined
        },
        Spotfire: {
          AddSuffix_1: 'No'
        },
        Organisation: 'oocto2'
      }
    };

    if (this.newAnalysis.datasource.inputType === 'csv'){
      const server = window.location.origin.search('localhost:') == 0 ? window.location.origin : 'https://eu.liveapps.cloud.tibco.com';
      caseData.Discoveranalysis.Datasource['File'] = {
        FileName: this.newAnalysis.datasource.file.filename,
        FilePath: server + this.newAnalysis.datasource.file.location,
        DateTimeFormat: this.newAnalysis.parse.dateTimeFormat,
        Encoding: this.newAnalysis.parse.encoding,
        EscapeChar: this.newAnalysis.parse.escapeChar,
        QuoteChar: this.newAnalysis.parse.quoteChar,
        Separator: this.newAnalysis.parse.columnSeparator,
        UseFirstLineAsHeader: 'true'
      }
    }

    if (this.newAnalysis.datasource.inputType === 'tdv') {
      caseData.Discoveranalysis.Datasource['TDV'] = {
        Endpoint: this.newAnalysis.datasource.tdv.site + ':' + this.configService.config.discover.tdv.jdbcPort,
        Site: this.newAnalysis.datasource.tdv.site,
        Domain: this.newAnalysis.datasource.tdv.domain,
        Database: this.newAnalysis.datasource.tdv.database,
        Table: this.newAnalysis.datasource.tdv.table,
        Query: '',
        PrimaryKey: '',
        Partitions: this.configService.config.discover.storage.partitions,
        DateTimeFormat: this.newAnalysis.parse.dateTimeFormat,
      }
    }
    return caseData;
  }

  public hide = (element: string): boolean => {
    if (element === 'prev') {
      return this.config.currentStepIdx == 0;
    }
    if (element === 'next') {
      return this.config.currentStepIdx === 5;
    }
    if (element === 'finish') {
      return this.config.currentStepIdx != 5;
    }
  }

  public display = (element: string): boolean => {
    if (element === 'basic-info') {
      return this.config.currentStepIdx === 0
    }
    if (element === 'datasource') {
      return this.config.currentStepIdx === 1
    }
    if (element === 'parse') {
      return this.config.currentStepIdx === 2
    }
    if (element === 'map') {
      return this.config.currentStepIdx === 3
    }
    if (element === 'dates') {
      return this.config.currentStepIdx === 4
    }
    if (element === 'confirmation') {
      return this.config.currentStepIdx === 5
    }
  }

  public handleStepClick = (step): void => {
    this.config.currentStepIdx = step.detail;
  }

  public handleStatus = ($event: NewAnalysisStepStatus): void => {
    let stepStatus = this.statuses.filter(status => status.step === $event.step)[0];
    stepStatus.completed = $event.completed;
  }

  public handleDisableNextButton = (): boolean => {
    return !this.statuses.filter(status => status.step === this.config.steps[this.config.currentStepIdx].slot)[0].completed;
  }

  public handleDisablePrevButton = (): boolean => {
    return false;
  }

  public handlePreviewData = (event): void => {
    if (event){
      this.previewData = this.calculateData(event.columns, event.preview);
      this.previewColumns = this.calculateColumns(event.columns);
      this.newAnalysis.columns = event.columns;

      if (event.columnSeparator){
        this.newAnalysis.parse.columnSeparator = event.columnSeparator;
      }
    } else {
      this.previewData = undefined;
      this.previewColumns = undefined;
      this.newAnalysis.columns = [];
    }
  }

  private calculateColumns = (columns: string[]): any[] => {
    return columns.map(column => {
      const newColumn = {
        headerName: column,
        field: column,
        sortable: false,
        filter: false,
        resizable: false
      };
      return newColumn;
    })
  }

  private calculateData = (columns: any[], data: any[]): any[] => {
    let returnData = [];
    data.forEach(element => {
      let row = {};
      for (let index = 0; index < columns.length; index++) {
        row[columns[index]] = element[index];
      }
      returnData.push(row)
    });
    return returnData;
  }


}
