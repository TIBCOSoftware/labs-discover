import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, DoCheck, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MessageTopicService, TcCoreCommonFunctions } from "@tibco-tcstk/tc-core-lib";
import { CaseAttribute, CaseCreatorsList, CaseInfo, CaseType, CaseTypesList, CaseTypeState, LiveAppsService, TcCaseProcessesService } from '@tibco-tcstk/tc-liveapps-lib';
import { UxplPopup } from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import _, { cloneDeep, isEqual } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { CaseStateEditComponent } from 'src/app/components/case-state-edit/case-state-edit.component';
import { CaseConfig, CaseField, CaseStateConfig, DiscoverConfiguration } from 'src/app/models_ui/configuration';
import { ConfigurationService } from 'src/app/service/configuration.service';


@Component({
  selector: 'settings-investigations',
  templateUrl: './settings-investigations.component.html',
  styleUrls: ['./settings-investigations.component.scss']
})
export class SettingsInvestigationsComponent implements OnInit, DoCheck {

  public availableApps = [];
  public availableCreators = [];
  public discover: DiscoverConfiguration;

  // the config of case type store in sharedState
  public caseConfig: CaseConfig[];
  // case type application details, including attributes, jsonSchema, creatorAppId, etc
  private caseType: CaseType;
  // the index of the current selected menu item
  public activeCaseConfigIndex: number;
  // the map of appId to case config
  private appIdConfigMap: {[key: string]: any} = {};

  private appId: string;
  private creatorId: string;

  private selectNewMenu: boolean = false;

  public customTitle: string;

  // the fields for the case table list
  public tableFields: CaseField[] = [];
  // the available fields list for the table
  public tableAvailableFields: CaseField[] = [];
  // the uxpl-select-options for the available field of the table list
  public tableAvailableOptions = [];
  // the field name of the selected option
  public inputTableField: string;
  // the label of the selected option
  public inputTableLabel: string;

  public caseStates: CaseStateConfig[] = [];

  public detailAttrs: CaseAttribute[];

  public detailTitleField: string;
  public showStatesMilestone: boolean;
  public detailTitle: CaseField;
  public detailFields: CaseField[][] = [];
  public flatDetailFields: CaseField[] = [];
  // 3 element array, one of them is for one column in details
  public detailFieldsGroup: CaseField[][] = [];
  public detailAvailableFields: CaseField[] = [];
  public detailAvailableOptions = [];
  public detailField: string;
  public detailFieldLabel: string;
  public readonly DETAIL_COLS = 3;

  // public creatorConfig: {[key: string]: string} = {};
  public creatorConfigKeys = [
    {
      name: 'SUMMARY',
      label: 'summary'
    },
    {
      name: 'DETAILS',
      label: 'details'
    },
    {
      name: 'CONTEXT_TYPE',
      label: 'context type'
    },
    {
      name: 'CONTEXT_IDS',
      label: 'context IDs'
    }
  ];
  // public creatorAttributesJson: any;
  public creatorAppProperties: any;
  public creatorSelections: {[key: string]: string} = {};
  public creatorSelectOptions: any = {};

  public showResetConfirm: boolean = false;
  public showMenuConfirm: boolean = false;
  public showDeleteConfirm: boolean = false;
  public newMenuIndex: number;

  public showEditTableField = false;
  public fieldInEdit;
  public fieldsArrayInEdit: CaseField[];
  @ViewChild('editPopup', {static: true}) editPopup: ElementRef<UxplPopup>;
  @ViewChild('settingsMain', {static: true}) settingsMain: ElementRef;
  public editPopupX;
  public editPopupY;

  public stateDialogRef: MatDialogRef<CaseStateEditComponent, any>;

  readonly metaFields = [
    {
      name: 'creationTimestamp',
      format: 'DATE'
    },
    {
      name: 'modificationTimestamp',
      format: 'DATE'
    }
  ];
  readonly customFields = [
    {
      name: 'caseReference'
    }
  ];

  public allFieldsMap: {[key: string]: CaseField} = {};
  public allFieldsArray: CaseField[] = [];
  public allFieldsOptons = [];
  public allAppsOptions = [];

  public noTableFieldsSvgLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/empty-state-no-columns.svg');
  public noDetailFieldsSvgLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/svg/empty-state-case-fields.svg');
  public noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');

  public loading: boolean = false;

  public unsavedChange = false;

  constructor(
    protected location: Location,
    protected dialog: MatDialog,
    protected configService: ConfigurationService,
    protected liveappsService: LiveAppsService,
    protected caseProcessesService: TcCaseProcessesService,
    protected messageService: MessageTopicService) { }

  ngDoCheck(): void {
    if (!this.loading) {
      this.unsavedChange = this.checkNewChanges();
    }
  }

  private constructAllFields(caseType: CaseType) {

    // clean the cache
    this.allFieldsArray = [];
    this.allFieldsMap = {};

    const attrs = caseType.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (attr.isStructuredType) {
        // get definition
        if (caseType.jsonSchema && caseType.jsonSchema.definitions && caseType.jsonSchema.definitions[attr.name]) {
          const defs = caseType.jsonSchema.definitions[attr.name];
          if (defs.properties) {
            for(let prop in defs.properties) {
              this.addToAllFields(attr.name + '.' + prop, defs.properties[prop].title);
            }
          }
        }
      }
      // isArray is not an attribute in CaseAttribute
      // @ts-ignore
      else if (attr.isArray === true) {
        this.addToAllFields(attr.name, attr.label, 'ARRAY');
      }
      else {
        this.addToAllFields(attr.name, attr.label);
      }
    }

    this.metaFields.forEach(mf => {
      this.addToAllFields('META:' + mf.name, this.generateLabelFromFieldname(mf.name), mf.format);
    });

    this.customFields.forEach(cf => {
      this.addToAllFields('CUSTOM:' + cf.name, this.generateLabelFromFieldname(cf.name));
    });

    this.allFieldsOptons = this.convertFieldsToSelectOptions(this.allFieldsArray);

  }

  private generateLabelFromFieldname(field: string) {
    const codeA = 'A'.charCodeAt(0);
    const codeZ = 'Z'.charCodeAt(0);
    const wordArr = [];
    let start = 0;
    for (let i = 1; i < field.length; i++) {
      if (field.charCodeAt(i) >= codeA && field.charCodeAt(i) <= codeZ) {
        wordArr.push(field.substring(start, i));
        start = i;
      }
    }
    wordArr[0] = wordArr[0].charAt(0).toUpperCase() + wordArr[0].substring(1);
    wordArr.push(field.substring(start));

    return wordArr.join(' ');
  }

  private addToAllFields(field: string, label: string, format: string=undefined) {
    const ele = {
      field,
      label,
      format
    }
    this.allFieldsMap[field] = ele;
    this.allFieldsArray.push(ele)
  }

  ngOnInit(): void {
    this.loading = true;
    this.caseConfig = cloneDeep(this.configService.config.discover.investigations.caseConfig);
    if (this.caseConfig.length > 0) {
      this.activeCaseConfigIndex = 0;
    }

    this.liveappsService.getApplications(this.configService.config.sandboxId, [], 100, false).pipe(
      map((apps: CaseTypesList) => {

        this.allAppsOptions = [...apps.casetypes.map(app => { return {label: app.applicationName, value: app.applicationId }})];

        // only the apps that are not set to any caseConfig can be the available app options
        this.initAvailableApps();

        this.initAppAndCreatorId();

        this.initCreatorSelection();

      })
    ).pipe(
      concatMap(() => {
        if (this.activeCaseConfig) {
          return this.getCaseAppInfoToInit(this.activeCaseConfig.appId);
        } else {
          return of({});
        }
      })
    ).
    subscribe(() => {
      this.obtainCreators();
      this.loading = false;
    });

    this.discover = cloneDeep(this.configService.config.discover);
  }

  private initCreatorSelection() {
    // convert the creator config to the select values which can be used in UI
    if (this.activeCaseConfig) {
      const creatorConfig = this.activeCaseConfig.creatorConfig;
      if (creatorConfig) {
        for (const creatorAppName in creatorConfig) {
          const config = creatorConfig[creatorAppName];
          const fields = {};
          this.addCreatorConfig(fields, config);
          this.creatorSelections = fields;
        }
      }
    }

  }

  private addCreatorConfig(fields: {[key: string]: string}, config: any) {
    for (const name in config) {
      const value = config[name];
      if (typeof value == 'string') {
        if (value.indexOf('@@') == 0 && value.lastIndexOf('@@') == value.length - 2) {
          fields[value.replace(/@@/ig, '')] = name;
        }
      } else if (typeof value == 'object') {
        this.addCreatorConfig(fields, value);
      }
    }
  }

  private initAvailableApps() {
    this.availableApps = [];
    for (let i = 0; i < this.allAppsOptions.length; i++) {
      if (!this.caseConfig.find((c, index) => {
        return c.appId == this.allAppsOptions[i].value && index != this.activeCaseConfigIndex
      })) {
        this.availableApps.push(this.allAppsOptions[i]);
      }
    }
  }

  /**
   * Assign the appId in caseConfig to the application select if there is, otherwise assign the
   */
  private initAppAndCreatorId() {
    if (this.availableApps && this.availableApps.length > 0 && this.activeCaseConfig && this.availableApps.find(ele => ele.value == this.activeCaseConfig.appId)) {
      this.appId = this.activeCaseConfig.appId;
      this.customTitle = this.activeCaseConfig.customTitle;
    }
  }

  private addCurrentConfigToCache(appId: string) {
    // if (this.tableFields.length != 0 || this.activeCaseConfig.states.length != 0) {
      this.appIdConfigMap[appId] = {
        tableFields: this.tableFields,
        states: this.caseStates,
        detailFields: this.detailFields,
        detailFieldsGroup: this.detailFieldsGroup,
        flatDetailFields: this.flatDetailFields,
        creatorAppProperties: this.creatorAppProperties,
        creatorSelections: this.creatorSelections
      }
    // }
  }

  /**
   * Get the case type app info by appId and initialize configuration. If the configuration in caseConfig
   * is existing, use the existing config to init UI, otherwise use the case type app info.
   * @param appId
   * @returns
   */
  private getCaseAppInfoToInit(appId: string): Observable<any> {
    return this.liveappsService.getCaseTypes(this.configService.config.sandboxId, appId, 100, true)
      .pipe(
        map((caseTypesList: CaseTypesList) => {
          this.caseType = caseTypesList.casetypes[caseTypesList.casetypes.length-1];

          this.constructAllFields(this.caseType);

          let headerFields = [];
          let caseStates = [];

          if (this.appIdConfigMap[appId]) {
            headerFields = this.appIdConfigMap[appId].tableFields;
            caseStates = this.appIdConfigMap[appId].states;
          }
          else if (appId == this.activeCaseConfig.appId) {
            if (this.activeCaseConfig.headerFields) {
              headerFields = cloneDeep(this.activeCaseConfig.headerFields);
            }

            if (this.activeCaseConfig.states) {
              caseStates = this.activeCaseConfig.states;
            } else {
              caseStates = this.generateCaseStatesConfigFromCaseType(this.caseType.states);
            }
          } else {
            caseStates = this.generateCaseStatesConfigFromCaseType(this.caseType.states);
          }

          this.tableFields = headerFields;
          this.caseStates = caseStates;

          this.tableAvailableFields = [];
          for(let i = 0; i < this.allFieldsArray.length; i++) {
            const f = this.allFieldsArray[i];
            let added = false;
            for (let j = 0; j < this.tableFields.length; j++) {
              if (this.tableFields[j].field == f.field) {
                added = true;
                break;
              }
            }
            if (!added) {
              this.tableAvailableFields.push(f);
            }
          }

          this.assembleTableAvailableOption();

          if (this.activeCaseConfig.detailTitle) {
            this.detailTitleField = this.activeCaseConfig.detailTitle.field;
          }
          this.showStatesMilestone = this.activeCaseConfig.showMilestones;

          // detail
          let detailFields = [];
          let detailFieldsGroup = [];
          let flatDetailFields = [];
          if (this.appIdConfigMap[appId]) {
            detailFields = this.appIdConfigMap[appId].detailFields;
            detailFieldsGroup = this.appIdConfigMap[appId].detailFieldsGroup;
            flatDetailFields = this.appIdConfigMap[appId].flatDetailFields;
          }
          else if (appId == this.activeCaseConfig.appId) {
            if (this.activeCaseConfig.detailFields) {
              const detailFields = cloneDeep(this.activeCaseConfig.detailFields);
              // flatten the array into 1-D array
              flatDetailFields = detailFields.flat();

              // convert the detail fields from rows to columns
              for(let i  = 0; i < detailFields.length; i++) {
                const row = detailFields[i];
                for(let j = 0; j < this.DETAIL_COLS; j++) {
                  if (!detailFieldsGroup[j]) {
                    detailFieldsGroup[j] = [];
                  }
                  if (row[j]) {
                    detailFieldsGroup[j].push(row[j]);
                  }
                }
              }
            }
          }

          this.detailFields = detailFields;
          this.detailFieldsGroup = detailFieldsGroup;
          this.flatDetailFields = flatDetailFields;

          this.detailAvailableOptions = [];
          for(let i = 0; i < this.allFieldsArray.length; i++) {
            const f = this.allFieldsArray[i];
            let added = false;
            for (let j = 0; j < this.flatDetailFields.length; j++) {
              if (this.flatDetailFields[j] && this.flatDetailFields[j].field == f.field) {
                added = true;
                break;
              }
            }
            if (!added) {
              this.detailAvailableFields.push(f);
            }
          }

          this.assembleDetailAvailableOption();

          if (this.appIdConfigMap[appId]) {
            this.detailTitle = this.appIdConfigMap[appId].detailTitle;
          }
          else if (appId == this.activeCaseConfig.appId) {
            if (this.activeCaseConfig.detailTitle) {
              // flatten the array into 1-D array
              this.detailTitle = cloneDeep(this.activeCaseConfig.detailTitle);
            }
          }

          if (this.appIdConfigMap[appId]) {
            this.creatorAppProperties = this.appIdConfigMap[appId].creatorAppProperties;
          } else {
            // creator config
            const creators = this.caseType.creators;
            const creatorAppProperties = {};
            creators.forEach(creator => {
              if (creator.jsonSchema.definitions &&  creator.jsonSchema.definitions[this.caseType.applicationInternalName]) {
                const creatorFields = [];
                const properties = creator.jsonSchema.definitions[this.caseType.applicationInternalName].properties;
                for (const prop in properties) {
                  if (properties[prop].type == 'string') {
                    creatorFields.push({
                      name: prop,
                      label: properties[prop].title
                    });
                  }
                }

                const creatorOptions = creatorFields.map(field => {return {value: field.name, label: field.label}});
                creatorAppProperties[creator.id] = {
                  creatorFields,
                  creatorOptions
                }
              }
            });
            this.creatorAppProperties = creatorAppProperties;
            // if (this.creatorId) {
            //   this.initCreatorSelectOptions();
            // }

          }

        })
      )
  }

  private generateCaseStatesConfigFromCaseType(caseTypeStates: CaseTypeState[]): CaseStateConfig[] {
    let re =  [];
    if (caseTypeStates && caseTypeStates.length > 0) {
       re = caseTypeStates.map(c => {
         return {name: c.label} as CaseStateConfig
       });
    }
    return re;
  }

  /**
   * Empty the current configuration
   */
  private emptyCurrentConfig() {
    this.tableFields = [];
    this.tableAvailableFields = [];
    this.tableAvailableOptions = [];
    this.allFieldsMap = {};
    this.allFieldsArray = [];
    this.caseStates = [];
    this.appId = undefined;
    this.creatorId = undefined;
    this.detailFields = [];
    this.detailFieldsGroup = [];
    this.flatDetailFields = [];
    this.detailAvailableFields = [];
    this.detailAvailableOptions = [];
    this.creatorAppProperties = {};
    this.creatorSelections = {};
  }

  public setCustomTitle(event) {
    if (!this.loading && event.detail) {
      this.customTitle = event.detail;
    }
  }

  public handleAdd = (): void => {
    const caseConfig = {
      customTitle: "menu item"
    } as CaseConfig;
    this.customTitle = "menu item";
    this.caseConfig.push(caseConfig);
    this.activeCaseConfigIndex = this.caseConfig.length - 1;
    this.emptyCurrentConfig();
    this.initAvailableApps();
  }

  private convertDetailFieldsTo2dArray(detailFieldsGroup: CaseField[][]): CaseField[][] {
    const twoDiFields = [];

    if (detailFieldsGroup && detailFieldsGroup.length > 0) {
      const cloneDetailFieldsGroup = cloneDeep(detailFieldsGroup);
      // find out how many row it will have
      let rows = cloneDetailFieldsGroup[0].length;
      for(let i = 1; i < cloneDetailFieldsGroup.length; i++) {
        if (cloneDetailFieldsGroup[i].length > rows) {
          rows = cloneDetailFieldsGroup[i].length;
        }
      }
      for (let i = 0; i < rows; i++) {
        const fields = [];
        for (let j = 0; j < this.DETAIL_COLS; j++) {
          if (cloneDetailFieldsGroup[j][i]) {
            fields[j] = cloneDetailFieldsGroup[j][i];
          } else {
            fields[j] = null;
          }
        }
        twoDiFields.push(fields);
      }
    }

    return twoDiFields;
  }

  public handleSave = (): void => {
    this.updateActiveCaseConfigWithSettings();
    this.initAvailableApps();
    if (this.activeCaseConfigIndex >= this.discover.investigations.caseConfig.length) {
      // new case config
      this.caseConfig[this.activeCaseConfigIndex]["allowMultiple"] = false;
    }
    this.discover.investigations.caseConfig[this.activeCaseConfigIndex] = this.caseConfig[this.activeCaseConfigIndex];
    this.discover.investigations.caseConfig[this.activeCaseConfigIndex].creatorConfig = this.buildCreatorInfo();
    this.discover.investigations.caseConfig[this.activeCaseConfigIndex].detailFields = this.convertDetailFieldsTo2dArray(this.detailFieldsGroup);
    this.saveConfig();
  }

  private buildCreatorInfo() {
    const creatorId = this.caseConfig[this.activeCaseConfigIndex].creatorId;
    const creators = this.caseType.creators.filter(c => c.id == creatorId);
    if (creators.length > 0) {
      const creator = creators[0];
      const jsonSchema = creator.jsonSchema;
      const properties = jsonSchema.definitions[this.caseType.applicationInternalName].properties;
      const attrsJson = {};
      for (let prop in properties) {
        // todo: if there is structural attribute
        if (properties[prop].type == 'string') {
          attrsJson[prop] = prop;
        }
      }

      const jsonData = {};
      // need to make sure that the attributes appears in config in order then the config can be compared by json
      for (let i = 0; i < this.creatorConfigKeys.length; i++) {
        const key = this.creatorConfigKeys[i].name;
        const field = this.creatorSelections[key];

        if (field) {
          let nameChain = this._setData(attrsJson, [], field);
          const j = this._buildJson(nameChain, "@@" + key + '@@');
          _.merge(jsonData, j);
        }
      }

      const result = {};
      result[this.caseType.applicationInternalName] = jsonData
      _.merge(jsonData, {
        "AnalysisName": "@@TEMPLATE_NAME@@",
        "AnalysisId": "@@ANALYSIS_ID@@",
        // todo: ?? why CommentHistory is here
        "CommentsHistory": []
      });
      return result;
    }
  }

  private _setData(attrsJson: any, nameChain: string[], field: string) {
    for (const name in attrsJson) {
      if (typeof attrsJson[name] == 'string' && name == field) {
        nameChain.push(name);
        return nameChain;
      } else if (typeof attrsJson[name] == 'object') {
        nameChain.push(name);
        return this._setData(attrsJson[name], nameChain, field);
      }
    }
  }

  private _buildJson(nameChain: string[], value: string) {
    if (!nameChain || nameChain.length == 0) {
      return null;
    }
    let json = {};
    nameChain = nameChain.reverse();
    while (nameChain.length > 0) {
      const name = nameChain.shift();
      if (Object.keys(json).length == 0) {
        json[name] = value;
      } else {
        const j = {};
        j[name] = json;
        json = _.merge({}, j);
      }
    }
    return json;
  }

  public saveConfig() {
    if (!isEqual(this.discover, this.configService.config.discover)) {
      this.configService.updateDiscoverConfig(this.configService.config.sandboxId, this.configService.config.uiAppId, this.discover, this.discover.id).subscribe(
        _ => {
          this.messageService.sendMessage('news-banner.topic.message', 'Settings saved...');
          this.configService.refresh();
        }
      );
    }
  }

  public onClickReset() {
    if (this.checkNewChanges()) {
      this.showResetConfirm = true;
    }
  }

  public handleReset = (event): void => {
    if (event.action === true) {
      this.reset();
    }
    this.showResetConfirm = false;
  }

  private reset() {
    this.caseConfig = cloneDeep(this.configService.config.discover.investigations.caseConfig);
    if (this.activeCaseConfigIndex >= this.discover.investigations.caseConfig.length) {
      // have a new unsaved config
      this.switchMenu(0);
    } else {
      this.switchMenu(this.activeCaseConfigIndex);
    }
  }

  public getCreator = (index: number): string => {
    return this.caseConfig[index].creatorId;
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.caseConfig, event.previousIndex, event.currentIndex);
    moveItemInArray(this.discover.investigations.caseConfig, event.previousIndex, event.currentIndex);
    if (event.previousIndex == this.activeCaseConfigIndex) {
      this.activeCaseConfigIndex = event.currentIndex;
    } else {
      if (event.currentIndex <= this.activeCaseConfigIndex) {
        this.activeCaseConfigIndex ++;
      }
    }
  }

  private obtainCreators = (): void => {
    this.caseProcessesService.getCaseCreators(this.configService.config.sandboxId, this.activeCaseConfig.appId, '1').pipe(
      map((casecreators: CaseCreatorsList) => {
        this.availableCreators = [...casecreators.creators.map(creator => {return {label: creator.label, value: creator.id }})];

        if (this.availableCreators && this.availableCreators.length > 0 && this.availableCreators.find(ele => ele.value == this.activeCaseConfig.creatorId)) {
          this.creatorId = this.activeCaseConfig.creatorId;
          if (this.creatorId) {
            this.initCreatorSelectOptions();
          }
        }
      })
    ).subscribe();
  }

  public handleApplicationSelection = ($event): void => {
    if ($event.detail) {
      const appId = $event.detail.value;
      if (!this.selectNewMenu) {
        const priorAppId = this.caseConfig[this.activeCaseConfigIndex].appId;


        if (priorAppId) {
          // when add a new case type, no prior appId yet
          this.addCurrentConfigToCache(priorAppId);
        }
      }
      this.selectNewMenu = false;
      this.getCaseAppInfoToInit(appId).subscribe(() => {
        this.caseConfig[this.activeCaseConfigIndex].appId = appId;
        // this.discover.investigations.caseConfig = [...this.discover.investigations.caseConfig]
        this.obtainCreators();
      });
    }

  }

  public handleCreatorSelection = ($event): void => {
    if ($event.detail) {
      const creatorId = $event.detail.value
      this.caseConfig[this.activeCaseConfigIndex].creatorId = creatorId;
      this.creatorId = creatorId;
      this.initCreatorSelectOptions();
    }
  }

  private initCreatorSelectOptions() {
    this.creatorConfigKeys.forEach(key => {
      this.creatorSelectOptions[key.name] = this.creatorAppProperties[this.creatorId].creatorOptions.concat();
    });
  }

  public handleCreatorConfigSelection = ($event, key): void => {
    if ($event.detail) {
      const field = $event.detail.value;
      this.creatorSelections[key] = field;
    }
  }

  public handleClick($event, key) {
    const map = {};
    for (const name in this.creatorSelections) {
      if (name != key) {
        map[this.creatorSelections[name]] = true;
      }
    }
    const allOptions = this.creatorAppProperties[this.creatorId].creatorOptions;
    const options = allOptions.filter(option => !map[option.value]);
    this.creatorSelectOptions[key] = options;
  }

  public get activeCaseConfig(): CaseConfig {
    if (this.caseConfig) {
      if (this.activeCaseConfigIndex < this.caseConfig.length) {
        return this.caseConfig[this.activeCaseConfigIndex];
      }
    }
    return null;
  }

  public selectMenu(index: number) {
    if (this.checkNewChanges()) {
      this.showMenuConfirm = true;
      this.newMenuIndex = index;
    } else {
      this.switchMenu(index);
    }
  }

  public handleSwitchMenu(event) {
    if (event.action === true) {
      this.caseConfig = cloneDeep(this.configService.config.discover.investigations.caseConfig);
      this.switchMenu(this.newMenuIndex);
    }
    this.newMenuIndex = null;
    this.showMenuConfirm = false;
  }

  private switchMenu(index: number) {
    this.loading = true;
    this.selectNewMenu = true;
    this.activeCaseConfigIndex = index;
    // clear appId config cache
    this.appIdConfigMap = {};
    this.initAvailableApps();
    this.initAppAndCreatorId();
    this.initCreatorSelection();
    this.getCaseAppInfoToInit(this.activeCaseConfig.appId).subscribe(() => {
      this.obtainCreators();
      this.loading = false;
    });
  }

  private updateActiveCaseConfigWithSettings() {
    this.caseConfig[this.activeCaseConfigIndex].customTitle = this.customTitle;
    this.caseConfig[this.activeCaseConfigIndex].headerFields = this.tableFields;
    this.caseConfig[this.activeCaseConfigIndex].states = this.caseStates;
    this.caseConfig[this.activeCaseConfigIndex].detailFields = this.convertDetailFieldsTo2dArray(this.detailFieldsGroup);
    if (!this.caseConfig[this.activeCaseConfigIndex].detailTitle
      || (this.caseConfig[this.activeCaseConfigIndex].detailTitle && this.caseConfig[this.activeCaseConfigIndex].detailTitle.field != this.detailTitle.field)) {
        this.caseConfig[this.activeCaseConfigIndex].detailTitle = this.detailTitle;
    }
    this.caseConfig[this.activeCaseConfigIndex].showMilestones = this.showStatesMilestone;
  }

  private checkNewChanges(): boolean {
    this.updateActiveCaseConfigWithSettings();
    // console.log('this.discover.investigations.caseConfig[this.activeCaseConfigIndex]', JSON.stringify(this.discover.investigations.caseConfig[this.activeCaseConfigIndex]));
    // console.log('this.caseConfig[this.activeCaseConfigIndex]', JSON.stringify(this.caseConfig[this.activeCaseConfigIndex]));
    // console.log('!this.discover.investigations.caseConfig[this.activeCaseConfigIndex]', !this.discover.investigations.caseConfig[this.activeCaseConfigIndex])
    // console.log('!_.isEqual(this.caseConfig[this.activeCaseConfigIndex], this.discover.investigations.caseConfig[this.activeCaseConfigIndex]', !_.isEqual(this.caseConfig[this.activeCaseConfigIndex], this.discover.investigations.caseConfig[this.activeCaseConfigIndex]));
    return !this.discover.investigations.caseConfig[this.activeCaseConfigIndex] || !_.isEqual(this.caseConfig[this.activeCaseConfigIndex], this.discover.investigations.caseConfig[this.activeCaseConfigIndex]);
  }

  public clickDeleteMenu(index: number) {
    this.showDeleteConfirm = true;
    this.newMenuIndex = index;
  }

  public handleDeleteMenu(event) {
    if (event.action === true) {
      this.deleteMenu(this.newMenuIndex);
    }
    this.newMenuIndex = null;
    this.showDeleteConfirm = false;
  }

  private deleteMenu(index: number) {
    const caseConfig = this.caseConfig[index];
    if (this.discover.investigations.caseConfig.find(cf => cf.appId == caseConfig.appId)) {
      // the caseConfig to be deleted is stored in the shared state already, need to call
      // api to save
      this.caseConfig.splice(index, 1);
      this.discover.investigations.caseConfig = this.caseConfig;
      this.saveConfig();
    } else {
      // the caseConfig is the new created one, not saved yet.
      this.caseConfig.splice(index, 1);
    }

    if (this.caseConfig.length > 0) {
      this.switchMenu(0);
    } else {
      // the last one is deleted
      this.emptyCurrentConfig();
      this.initAvailableApps();
    }
  }

  public tableFieldsDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tableFields, event.previousIndex, event.currentIndex);
  }

  public handleSelectFieldForTable(event) {
    const value = event.detail.value;
    if (this.allFieldsMap[value]) {
      this.inputTableField = value;
      this.inputTableLabel = this.allFieldsMap[value].label;
    }
  }

  public handleEditLabelForTable(event) {
    const value = event.detail;
    if (value) {
      this.inputTableLabel = value;
    }
  }

  public addTableField() {
    let i;
    for (i = 0; i < this.tableAvailableFields.length; i++) {
      if (this.tableAvailableFields[i].field == this.inputTableField) {
        break;
      }
    }
    if (i < this.tableAvailableFields.length) {
      const addedFields = this.tableAvailableFields.splice(i, 1);
      const addedField = this.allFieldsMap[addedFields[0].field];
      addedField.label = this.inputTableLabel;
      this.tableFields.push(addedField);

      this.assembleTableAvailableOption();
    }

  }

  public addAllTableColumns() {
    this.tableAvailableFields.forEach(field => {
      const addedField = this.allFieldsMap[field.field];
      this.tableFields.push(addedField);
    });
    this.tableAvailableFields.length = 0;
    this.assembleTableAvailableOption();
  }

  public deleteAllTableFields() {
    this.tableFields.length = 0;
    this.tableAvailableFields = [];
    for(let i = 0; i < this.allFieldsArray.length; i++) {
      const f = this.allFieldsArray[i];
      this.tableAvailableFields.push(f);
    }

    this.assembleTableAvailableOption();

  }

  private convertFieldsToSelectOptions(caseFields: CaseField[]) {
    return caseFields.map(field => {
      return {"label": field.label, "value": field.field}
    }).sort((a,b) => {
      if (a.label < b.label) {return -1}
      else if (a.label == b.label) {return 0}
      else {return 1}
    });
  }

  /**
   * Assemble the {label, value} object array for the application select
   * and make the first option the selected by default
   */
  private assembleTableAvailableOption() {
    this.tableAvailableOptions = this.convertFieldsToSelectOptions(this.tableAvailableFields);

    if (this.tableAvailableFields.length > 0) {
      const firstField = this.allFieldsMap[this.tableAvailableOptions[0].value];
      this.inputTableField = firstField.field;
      this.inputTableLabel = firstField.label;
    }
  }

  private assembleDetailAvailableOption() {
    this.detailAvailableOptions = this.convertFieldsToSelectOptions(this.detailAvailableFields);

    if (this.detailAvailableFields.length > 0) {
      const firstField = this.allFieldsMap[this.detailAvailableOptions[0].value];
      this.detailField = firstField.field;
      this.detailFieldLabel = firstField.label;
    }
  }

  public deleteTableField(event) {
    const deletedField = this.tableFields.splice(event, 1)[0];
    // const deletedField = this.allFieldsMap[event.field];
    this.tableAvailableFields.push(deletedField);
    this.assembleTableAvailableOption();
  }

  public editTableField(event, fieldsArray) {
    if (this.showEditTableField) {
      this.cancelEditTableField();
    }

    setTimeout(() => {
      const index = event.index;
      const selectedField = fieldsArray[index];

      this.fieldInEdit = selectedField;
      this.fieldsArrayInEdit = fieldsArray;

      const clickEvent = event.event;
      
      const target = clickEvent.target;
      const button = target.parentNode;
      const domRect = button.getBoundingClientRect();

      const settingsRect = this.settingsMain.nativeElement.getBoundingClientRect();

      this.editPopupY = domRect.y - settingsRect.y ;
      this.editPopupX = domRect.x - settingsRect.x;
      this.showEditTableField = true;  
      this.editPopup.nativeElement.show = true;
    }, 0);
  }

  public cancelEditTableField() {
    this.showEditTableField = false;
    this.editPopup.nativeElement.show = false;
  }

  /**
   * Save the field label edit
   * @param event {label, field} 
   */
  public saveEditTableField(event) {
    const field = this.fieldsArrayInEdit.find(ele => ele.field == event.field);
    if (field) {
      field.label = event.label;
    }
    this.cancelEditTableField();
  }

  public tableFieldDropped(event) {
    // console.log(event);
  }

  public editStateColorAndIcon(index: number) {
    const stateConfig = this.caseStates[index];
    this.stateDialogRef = this.dialog.open(CaseStateEditComponent, {
      width: '400px',
      height: '460px',
      data: {
        caseStateConfig: {...stateConfig, index}
      }
    });

    this.stateDialogRef.componentInstance.stateEditSaved.subscribe(data => {
      this.caseStates[index].color = data.color;
      this.caseStates[index].icon = data.icon;
    });
  }

  public selectDetailTitle(event) {
    if (event.detail) {
      const value = event.detail.value;
      if (value) {
        this.detailTitle = this.allFieldsMap[value];
        if (!this.caseConfig[this.activeCaseConfigIndex].detailTitle
          || (this.caseConfig[this.activeCaseConfigIndex].detailTitle && this.caseConfig[this.activeCaseConfigIndex].detailTitle.field != this.detailTitle.field)) {
            this.caseConfig[this.activeCaseConfigIndex].detailTitle = this.detailTitle;
        }
      }
    }
  }

  public checkStatesMilestone(event) {
    this.showStatesMilestone = !!event.detail;
  }

  public deleteDetailField(event, col) {
    const deletedField = this.detailFieldsGroup[col].splice(event, 1)[0];
    // const deletedField = this.allFieldsMap[event.field];
    const index = this.flatDetailFields.findIndex(el => el.field == event.field);
    this.flatDetailFields.splice(index, 1);
    if (deletedField) {
      // the config maybe is wrong, or the Live Apps app is modified after the configuration
      this.detailAvailableFields.push(deletedField);
    }
    this.assembleDetailAvailableOption();
  }

  public handleSelectFieldForDetail(event) {
    const value = event.detail.value;
    if (this.allFieldsMap[value]) {
      this.detailFieldLabel = value;
      this.detailFieldLabel = this.allFieldsMap[value].label;
    }
  }

  public handleEditLabelForDetail(event) {
    const value = event.detail;
    if (value) {
      this.detailFieldLabel = value;
    }
  }

  public addDetailField() {
    let i: number;
    for (i = 0; i < this.detailAvailableFields.length; i++) {
      if (this.detailAvailableFields[i].field == this.detailField) {
        break;
      }
    }
    if (i < this.detailAvailableFields.length) {
      const addedFields = this.detailAvailableFields.splice(i, 1);
      const addedField = this.allFieldsMap[addedFields[0].field];
      addedField.label = this.detailFieldLabel;

      this.assignDetailFieldToColumn(addedField);

      this.assembleDetailAvailableOption();
    }
  }

  private assignDetailFieldToColumn(addedField: CaseField) {

    // special process
    if (addedField.field == 'DataSourceName') {
      addedField.format = 'EVENT-LINK';
    }

    // add field to the shortest column. If all columns are the same, add it to the first one
    this.flatDetailFields.push(addedField);
    let col = 0;
    let length = 10000;
    for (let i = 0; i < this.detailFieldsGroup.length; i++) {
      if (this.detailFieldsGroup[i].length < length) {
        col = i;
        length = this.detailFieldsGroup[i].length;
      }
    }

    for (let i = 0; i < this.DETAIL_COLS; i++) {
      if (!this.detailFieldsGroup[i]) {
        this.detailFieldsGroup[i] = [];
      }
    }

    this.detailFieldsGroup[col].push(addedField);
  }

  public addAllDetailFields() {

    for(let i = 0; i < this.detailAvailableFields.length; i++) {
      const field = this.detailAvailableFields[i];
      this.assignDetailFieldToColumn(field);
    }
    this.detailAvailableFields.length = 0;
    this.assembleDetailAvailableOption();

  }

  public deleteAllDetailFields() {
    this.detailFields = [];
    for (let i = 0; i < this.detailFieldsGroup.length; i++) {
      this.detailFieldsGroup[i].length = 0;
    }
    this.flatDetailFields.length = 0;

    for(let i = 0; i < this.allFieldsArray.length; i++) {
      this.detailAvailableFields.push(this.allFieldsArray[i]);
    }

    this.assembleDetailAvailableOption();
  }

  public detailColumnAddField(event, index: number) {
    console.log(event);
    this.detailFields = this.convertDetailFieldsTo2dArray(this.detailFieldsGroup);
  }

  // The cConfig that detail component needs is exactly the same json that
  public getDetailConfig() {
    const configCopy: CaseConfig = cloneDeep(this.caseConfig[this.activeCaseConfigIndex]);
    // configCopy.detailFields = cloneDeep(this.detailFields);
    configCopy.detailFields = this.convertDetailFieldsTo2dArray(this.detailFieldsGroup);
    if (!configCopy.detailTitle) {
      configCopy.detailTitle = {
        field: '',
        label: ''
      }
    }
    // tcla-live-apps-case-states component in custom-case-details.component.html will throw some errors
    // because there is not such a case in Live Apps. Just manually hide the milestones for preview, in settings
    // save the correct value.
    configCopy.showMilestones = false;
    return configCopy;
  }

  public getDummyDetailData() {
    const caseInfo = new CaseInfo();
    //@ts-ignore
    caseInfo.metadata = {};
    const untaggedCasedataObj = {};
    for(let i = 0; i < this.detailFieldsGroup.length; i++) {
      const col = this.detailFieldsGroup[i];
      for (let j = 0; j < col.length; j ++) {
        if (col[j]) {
          let field = col[j].field;
          if (field.indexOf('.') != -1) {
            const names = field.split('.');
            let obj = untaggedCasedataObj;
            while (names.length > 1) {
              const n = names.shift();
              if (!obj[n]) {
                obj[n] = {};
              }
              obj = obj[n];
            }
            if (col[j].format == 'ARRAY') {
              obj[names[0]] = ['Sample ' + col[j].label];
            } else if (col[j].format == 'DATE') {
              obj[names[0]] = new Date().toISOString();
            } else {
              obj[names[0]] = 'Sample ' + col[j].label;
            }
          } else {
            if (field.indexOf('CUSTOM:') == 0) {
              field = field.substr(7);
            } else if (field.indexOf('META:') == 0) {
              field = field.substr(5);
              if (col[j].format == 'DATE') {
                caseInfo.metadata[field] = new Date().toISOString();
              }
            }
            if (col[j].format == 'ARRAY') {
              untaggedCasedataObj[field] = ['Sample ' + col[j].label];
            } else if (col[j].format == 'DATE') {
              untaggedCasedataObj[field] = new Date().toISOString();
            } else {
              untaggedCasedataObj[field] = 'Sample ' + col[j].label;
            }
          }
        }
      }
    }
    caseInfo.untaggedCasedataObj = untaggedCasedataObj;
    caseInfo.caseReference = '1234567'
    return caseInfo;
  }

  public clickOverlayOutside(event) {
    this.showMenuConfirm = false;
    this.showResetConfirm = false;
  }
}
