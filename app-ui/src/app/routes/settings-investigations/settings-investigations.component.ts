import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, DoCheck, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MessageTopicService, TcCoreCommonFunctions } from "@tibco-tcstk/tc-core-lib";
import { UxplPopup } from '@tibco-tcstk/tc-web-components/dist/types/components/uxpl-popup/uxpl-popup';
import _, { cloneDeep, isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { CaseStateEditComponent } from 'src/app/components/case-state-edit/case-state-edit.component';
import { Application, InvestigationApplication, InvestigationApplicationDefinition, InvestigationDetails, InvestigationField, InvestigationMetadata, Investigations, InvestigationState} from 'src/app/model/models';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { ConfigurationService as KK } from 'src/app/api/configuration.service';
import { InvestigationsService } from 'src/app/api/investigations.service';


@Component({
  selector: 'settings-investigations',
  templateUrl: './settings-investigations.component.html',
  styleUrls: ['./settings-investigations.component.scss']
})
export class SettingsInvestigationsComponent implements OnInit, DoCheck {

  public maxInvestigations: number;
  public availableApps = [];
  public availableCreators = [];

  // the config of case type store
  public caseConfig: InvestigationApplication[];
  public originalData: InvestigationApplication[];

  // the index of the current selected menu item
  public activeCaseConfigIndex: number;

  public tableAvailableFields: InvestigationField[] = [];
  // the uxpl-select-options for the available field of the table list
  public tableAvailableOptions = [];
  // the field name of the selected option
  public inputTableField: string;
  // the label of the selected option
  public inputTableLabel: string;

  public detailTitleField: string;
  public showStatesMilestone: boolean;
  public detailTitle: InvestigationField;
  public detailFields: InvestigationField[][] = [];

  public detailAvailableFields: InvestigationField[] = [];
  public detailAvailableOptions = [];
  public detailField: string;
  public detailFieldLabel: string;
  public readonly DETAIL_COLS = 3;

  public creatorAppProperties: any;
  public creatorSelections: {[key: string]: string} = {};
  public creatorSelectOptions: any = {};
  public creatorSelectOptions2: any[] = [];

  public showResetConfirm: boolean = false;
  public showMenuConfirm: boolean = false;
  public showDeleteConfirm: boolean = false;
  public newMenuIndex: number;

  public showEditTableField = false;
  public fieldInEdit;
  public fieldsArrayInEdit: InvestigationField[];
  @ViewChild('editPopup', {static: true}) editPopup: ElementRef<UxplPopup>;
  @ViewChild('settingsMain', {static: true}) settingsMain: ElementRef;
  public editPopupX;
  public editPopupY;

  public stateDialogRef: MatDialogRef<CaseStateEditComponent, any>;

  public allFieldsArray: InvestigationField[] = [];
  public allFieldsOptions = [];
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
    protected configurationService: KK,
    protected investigationService: InvestigationsService,
    protected messageService: MessageTopicService) { }

  ngDoCheck(): void {
    if (!this.loading) {
      this.unsavedChange = this.isValidActiveConfiguration();
    }
  }

  private isValidActiveConfiguration = (): boolean => {
    if (this.activeCaseConfig) {
      if (this.activeCaseConfig.customTitle === '') return false;
      if (!this.activeCaseConfig.applicationId) return false;
      if (!this.activeCaseConfig.creatorId) return false;
      if ( this.activeCaseConfig.headerFields.length == 0) return false;
      if ( this.activeCaseConfig.detailFields[0].length == 0 && 
           this.activeCaseConfig.detailFields[1].length == 0 &&
           this.activeCaseConfig.detailFields[2].length == 0) return false;
      if (this.activeCaseConfig.creatorData.length < 4) return false;  
    }

    return true;
  }

  ngOnInit(): void {
    this.loading = true;
    this.reset();
  }

  public getCreatorField = (key: string): string => {
    const field = this.activeCaseConfig.creatorData.filter((element: InvestigationField) => element.label === key)[0];
    if (field) {
      return field.field;
    } else {
      return '';
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
        return c.applicationId == this.allAppsOptions[i].id && index != this.activeCaseConfigIndex
      })) {
        this.availableApps.push({ label: this.allAppsOptions[i].label, value: this.allAppsOptions[i].id } );
      }
    }

    this.availableApps = [...this.availableApps];
  }

  private initTableFields = (): void => {
    this.detailTitleField = this.activeCaseConfig.detailTitle?.field;
    this.activeCaseConfig.headerFields = this.activeCaseConfig.headerFields ? this.activeCaseConfig.headerFields : [];
  }

  /**
   * Get the case type app info by appId and initialize configuration. If the configuration in caseConfig
   * is existing, use the existing config to init UI, otherwise use the case type app info.
   * @param appId
   * @returns
   */
  private getCaseAppInfoToInit(appId: string): Observable<any> {
    return this.investigationService.getApplicationDefinition(appId).pipe(
      map((appDefinition: InvestigationApplicationDefinition) => {
        this.availableCreators = appDefinition.creators;
        this.initCreatorSelectOptions();
        this.activeCaseConfig.states = this.activeCaseConfig?.states?.length > 0 ? [...this.activeCaseConfig.states] : [...appDefinition.states];
        this.allFieldsArray = appDefinition.fields;
        this.allFieldsOptions = this.convertFieldsToSelectOptions(this.allFieldsArray);
        this.assembleTableAvailableOption();
        this.assembleDetailAvailableOption();
      })
    );
  }

  /**
   * Empty the current configuration
   */
  private emptyCurrentConfig() {
    this.tableAvailableFields = [];
    this.tableAvailableOptions = [];
    this.allFieldsArray = [];
    this.detailFields = [];
    this.detailAvailableFields = [];
    this.detailAvailableOptions = [];
    this.creatorAppProperties = {};
    // this.creatorSelections = {};
  }

  public setCustomTitle(event) {
    if (!this.loading && event.detail) {
      this.activeCaseConfig.customTitle = event.detail;
    }
  }

  public handleAdd = (): void => {
    this.loading = true;
    const caseConfig = {
      customTitle: "menu item",
      headerFields: [],
      detailFields: [[], [], []],
      creatorData: [],
      states: [],
      detailTitle: {
        field: '',
        label: ''
      }
    } as InvestigationApplication;
    this.caseConfig.push(caseConfig);
    this.activeCaseConfigIndex = this.caseConfig.length - 1;
    this.emptyCurrentConfig();
    this.initAvailableApps();
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  public handleSave = (): void => {
    this.configurationService.postInvestigations(this.caseConfig).subscribe(
      _ => {
        this.messageService.sendMessage('news-banner.topic.message', 'Settings saved ...');
        this.configService.refresh(); 
      }
    );
  }

  public onClickReset() {
    // if (this.checkUnsavedChange()) {
    //   this.showResetConfirm = true;
    // }
  }

  public handleReset = (event): void => {
    if (event.action === true) {
      this.reset();
    }
    this.showResetConfirm = false;
  }

  private reset() {
    this.investigationService.getAllApplications().pipe(
      flatMap((apps: Application[]) => {
        this.allAppsOptions = apps;

        return this.configurationService.getInvestigations().pipe(
          map((result: Investigations) => {
            this.caseConfig = result.applications;
            this.originalData = cloneDeep(this.caseConfig);
            this.maxInvestigations = result.numberApplications;
            this.activeCaseConfigIndex = 0;
            this.switchMenu(this.activeCaseConfigIndex);
          })
        );    
      })
    ).subscribe(() => {
      this.loading = false;
    });
  }

  public getCreator = (index: number): string => {
    return this.caseConfig[index].creatorId;
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.caseConfig, event.previousIndex, event.currentIndex);
    // MC moveItemInArray(this.discover.investigations.caseConfig, event.previousIndex, event.currentIndex);
    if (event.previousIndex === this.activeCaseConfigIndex) {
      this.activeCaseConfigIndex = event.currentIndex;
    } else if (event.previousIndex < this.activeCaseConfigIndex && event.currentIndex >= this.activeCaseConfigIndex) {
      this.activeCaseConfigIndex --;
    } else if (event.previousIndex > this.activeCaseConfigIndex && event.currentIndex <= this.activeCaseConfigIndex){
      this.activeCaseConfigIndex ++;
    }
  }

  public handleApplicationSelection = ($event): void => {
    if ($event.detail) {
      const appId = $event.detail.value;
      this.activeCaseConfig.applicationId = appId;
      this.getCaseAppInfoToInit(appId).subscribe(() => {
      });
    }
  }

  public handleCreatorSelection = ($event): void => {
    if ($event.detail) {
      const creatorId = $event.detail.value
      this.activeCaseConfig.creatorId = creatorId;
      this.initCreatorSelectOptions();
    }
  }

  private initCreatorSelectOptions() {
    const creator = this.availableCreators.filter(el => el.value === this.activeCaseConfig.creatorId);
    this.creatorSelectOptions2 = creator.length > 0 ? creator[0].fields : [];
  }

  public handleCreatorConfigSelection = ($event, key): void => {
    if ($event.detail) {
      const field = $event.detail.value;
      let entry = this.activeCaseConfig.creatorData.find((element: InvestigationField) => element.label === key);
      if (entry) {
        entry.field = field;
      } else {
        this.activeCaseConfig.creatorData.push({ label: key, field: field});
      }
    }
  }

  public get activeCaseConfig(): InvestigationApplication {
    if (this.caseConfig) {
      if (this.activeCaseConfigIndex < this.caseConfig.length) {
        return this.caseConfig[this.activeCaseConfigIndex];
      }
    }
    return null;
  }

  public selectMenu(index: number) {
    if (isEqual(this.activeCaseConfig, this.originalData[this.activeCaseConfigIndex])) {
      this.showMenuConfirm = true;
      this.newMenuIndex = index;
    } else {
      this.switchMenu(index);
    }
  }

  public handleSwitchMenu(event) {
    if (event.action === true) {
      this.caseConfig[this.activeCaseConfigIndex] = cloneDeep(this.originalData[this.activeCaseConfigIndex]);
      this.switchMenu(this.newMenuIndex);
    }
    this.newMenuIndex = null;
    this.showMenuConfirm = false;
  }

  private switchMenu(index: number) {
    this.loading = true;
    if (this.caseConfig.length > 0) {
      this.activeCaseConfigIndex = index;
      this.initAvailableApps();
      this.initTableFields();
      this.getCaseAppInfoToInit(this.activeCaseConfig.applicationId).subscribe(() => {
        this.loading = false;
      });        
    }
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
    if (this.caseConfig.find(cf => cf.applicationId == caseConfig.applicationId)) {
      // the caseConfig to be deleted is stored in the shared state already, need to call
      // api to save
      this.caseConfig.splice(index, 1);
      this.handleSave();
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
    moveItemInArray(this.activeCaseConfig.headerFields, event.previousIndex, event.currentIndex);
  }

  public handleSelectFieldForTable(event) {
    const value = event.detail.value;
    this.inputTableField = value;
    this.inputTableLabel = this.allFieldsArray.filter((el: InvestigationField) => el.field === value)[0].label;
  }

  public handleEditLabelForTable(event) {
    const value = event.detail;
    if (value) {
      this.inputTableLabel = value;
    }
  }

  public addTableField() {
    const fieldToAdd = this.allFieldsArray.filter((el: InvestigationField) => el.field === this.inputTableField)[0];
    if (fieldToAdd){
      this.activeCaseConfig.headerFields.push(
        {
          label: this.inputTableLabel,
          field: this.inputTableField
        }
      );
      this.assembleTableAvailableOption();
    }
  }

  public addAllTableColumns() {
    this.tableAvailableOptions.forEach(el => {
      this.activeCaseConfig.headerFields.push(
        {
          label: el.label,
          field: el.value
        }
      );      
    });
    this.assembleTableAvailableOption();
  }

  public deleteAllTableFields() {
    this.activeCaseConfig.headerFields = [];
    this.tableAvailableFields = [];
    for(let i = 0; i < this.allFieldsArray.length; i++) {
      const f = this.allFieldsArray[i];
      this.tableAvailableFields.push(f);
    }
    this.assembleTableAvailableOption();
  }

  private convertFieldsToSelectOptions(caseFields: InvestigationField[]) {
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
    const possibleFields = this.allFieldsArray.filter(ar => !this.activeCaseConfig.headerFields.find(rm => (rm.field === ar.field)));
    this.tableAvailableOptions = this.convertFieldsToSelectOptions(possibleFields);

    if (possibleFields.length > 0) {
      const firstField = possibleFields[0];
      this.inputTableField = firstField.field;
      this.inputTableLabel = firstField.label;
    }
  }

  private assembleDetailAvailableOption() {
    const possibleFields = this.allFieldsArray.
      filter(ar => !this.activeCaseConfig.detailFields[0].find(rm => (rm.field === ar.field))).
      filter(ar => !this.activeCaseConfig.detailFields[1].find(rm => (rm.field === ar.field))).
      filter(ar => !this.activeCaseConfig.detailFields[2].find(rm => (rm.field === ar.field)));
    this.detailAvailableOptions = this.convertFieldsToSelectOptions(possibleFields);
    
    if (this.detailAvailableFields.length > 0) {
      const firstField = this.detailAvailableOptions[0];
      this.detailField = firstField.field;
      this.detailFieldLabel = firstField.label;
    }
  }

  public deleteTableField(event) {
    const deletedField = this.activeCaseConfig.headerFields.splice(event, 1)[0];
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
  }

  public editStateColorAndIcon(index: number) {
    const stateConfig = this.activeCaseConfig.states[index];
    this.stateDialogRef = this.dialog.open(CaseStateEditComponent, {
      width: '400px',
      height: '460px',
      data: {
        caseStateConfig: {...stateConfig, index}
      }
    });

    this.stateDialogRef.componentInstance.stateEditSaved.subscribe(data => {
      this.activeCaseConfig.states[index].color = data.color;
      this.activeCaseConfig.states[index].icon = data.icon;
    });
  }

  public selectDetailTitle(event) {
    if (event.detail) {
      const value = event.detail.value;
      if (value) {
        this.activeCaseConfig.detailTitle.field = value;
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
    const deletedField = this.activeCaseConfig.detailFields[col].splice(event, 1)[0];
    if (deletedField) {
      // the config maybe is wrong, or the Live Apps app is modified after the configuration
      this.detailAvailableFields.push(deletedField);
    }
    this.assembleDetailAvailableOption();
  }

  public handleSelectFieldForDetail(event) {
    const value = event.detail.value;
    this.detailField = value;
    this.detailFieldLabel = this.allFieldsArray.filter((el: InvestigationField) => el.field === value)[0].label;
  }

  public handleEditLabelForDetail(event) {
    const value = event.detail;
    if (value) {
      this.detailFieldLabel = value;
    }
  }

  public addDetailField() {
    const fieldToAdd = this.allFieldsArray.filter((el: InvestigationField) => el.field === this.detailField)[0];
    if (fieldToAdd){
      const newField = (
        {
          label: this.detailFieldLabel,
          field: this.detailField
        }
      );
      this.assignDetailFieldToColumn(newField);

      this.assembleDetailAvailableOption();
    }
  }

  private assignDetailFieldToColumn(addedField: InvestigationField) {
    // special process
    if (addedField.field == 'DataSourceName') {
      addedField.format = 'EVENT-LINK';
    }

    // add field to the shortest column. If all columns are the same, add it to the first one
    let col = 0;
    let length = 10000;
    for (let i = 0; i < this.activeCaseConfig.detailFields.length; i++) {
      if (this.activeCaseConfig.detailFields[i].length < length) {
        col = i;
        length = this.activeCaseConfig.detailFields[i].length;
      }
    }

    for (let i = 0; i < this.DETAIL_COLS; i++) {
      if (!this.activeCaseConfig.detailFields[i]) {
        this.activeCaseConfig.detailFields[i] = [];
      }
    }

    this.activeCaseConfig.detailFields[col].push(addedField);
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
    for (let i = 0; i < this.activeCaseConfig.detailFields.length; i++) {
      this.activeCaseConfig.detailFields[i].length = 0;
    }

    for(let i = 0; i < this.allFieldsArray.length; i++) {
      this.detailAvailableFields.push(this.allFieldsArray[i]);
    }

    this.assembleDetailAvailableOption();
  }

  // The cConfig that detail component needs is exactly the same json that
  public getDetailConfig() {
    const configCopy: InvestigationApplication = cloneDeep(this.activeCaseConfig);
    if (!configCopy.detailTitle) {
      configCopy.detailTitle = {
        field: '',
        label: ''
      }
    }
    configCopy.showMilestone = false;
    // @ts-ignore
    configCopy.showMilestones = true;
    return configCopy;
  }

  public getDummyDetailData(): InvestigationDetails {
    let metadata: InvestigationMetadata[] = [];
    const untaggedCasedataObj = {};
    for(let i = 0; i < this.activeCaseConfig.detailFields.length; i++) {
      const col = this.activeCaseConfig.detailFields[i];
      for (let j = 0; j < col.length; j ++) {
        if (col[j]) {
          let field = col[j].field;
          if (field === '') {
            untaggedCasedataObj[field] = '';
          } else {
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
                  metadata.push({ name: field, value: new Date().toISOString()} as InvestigationMetadata);
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
    }
    // Set state to first state
    untaggedCasedataObj['state'] = this.activeCaseConfig.states[0].name;

    const dummyData: InvestigationDetails = {
      id: '1234567',
      data: untaggedCasedataObj,
      metadata: metadata
    }
    return dummyData;
  }

  public clickOverlayOutside(event) {
    this.showMenuConfirm = false;
    this.showResetConfirm = false;
  }

  public isEmptyDetailGroups = (): boolean => {
    let elements: number;
    elements = 0;
    this.activeCaseConfig.detailFields.forEach((el: InvestigationField[]) => { 
      elements = elements + el.length 
    });

    return elements > 0;
  } 

  public showCreateNewInvestigation = (): boolean => {
    return this.caseConfig?.length < this.maxInvestigations;
  }
}
