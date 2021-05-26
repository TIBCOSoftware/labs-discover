import {cloneDeep} from 'lodash-es';
import {AnalyticTemplateUI, MConfig} from '../models/analyticTemplate';
import {TemplateMenuConfig} from '../model/templateMenuConfig';
import {AnalyticsConfigSF, AnalyticsMenuConfigUI} from '../models/configuration';
import {VisualisationService} from '../api/visualisation.service';
import {Visualisation} from '../model/visualisation';
import {map} from 'rxjs/operators';

export const DXP_EXISTS_MESSAGE = 'A DXP with this name already exists...';
export const TEMPLATE_EXISTS_MESSAGE = 'A TEMPLATE with this name already exists...';

// This function removes all disable menu-items from a menu configuration
export function stripDisabledMenuItems(menu: TemplateMenuConfig[]): TemplateMenuConfig[] {
  const re = [];
  const tempMenu = cloneDeep(menu);
  tempMenu.forEach((mItem) => {
    if (mItem.child && mItem.child.length > 0) {
      mItem.child = stripDisabledMenuItems(mItem.child);
    }
    if (mItem.enabled) re.push(mItem);
  })
  return re;
}


export function createReadableArrayString(array: string[], maxLength: number) {
  let moreChars = true;
  let textToDisplay = '';
  for (let cMI = 0; cMI < array.length && moreChars; cMI++) {
    if (textToDisplay.length < maxLength) {
      textToDisplay += array[cMI] + ', ';
    } else {
      textToDisplay += 'and ' + (array.length - cMI) + ' more...';
      moreChars = false;
    }
  }
  if (textToDisplay.endsWith(', ')) {
    textToDisplay = textToDisplay.substring(0, textToDisplay.length - 2);
  }
  return textToDisplay;
}

export function escapeCharsForJSON(str) {
  return str
    .replace(/[\\]/g, '\\\\')
    .replace(/[\"]/g, '\\\"')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t');
};

export function getSFLink(conf: AnalyticsConfigSF): string {
  if (conf && conf.customServer && conf.customServer !== '') {
    return conf.customServer;
  }
  const urlLoc = window.location.href;
  let region = 'eu.';
  if (!(urlLoc.indexOf('eu.') > 0 || (urlLoc.indexOf('localhost') > 0))) {
    // Don't insert anything for US region.
    region = '';
  }
  return 'https://' + region + 'spotfire-next.cloud.tibco.com'
}


export function createMConfig(inputMConfig: string): MConfig {
  let re: MConfig = null;
  if (inputMConfig && inputMConfig !== '') {
    const icArr = inputMConfig.split('.');
    if (icArr.length > 2) {
      re = {
        markingName: icArr[0],
        dataTable: icArr[1],
        columnName: icArr[2],
      }
    }
  }
  return re;
}

export function stringifyMConfig(mConfig: MConfig): string {
  let re = null;
  if (mConfig) {
    re = mConfig.markingName + '.' + mConfig.dataTable + '.' + mConfig.columnName;
  }
  return re;
}

let currentLatestId = 0;

export function getNewID(): string {
  currentLatestId++;
  return '' + currentLatestId;
}

export function stripUiIdFromTemplate(temp: AnalyticTemplateUI): AnalyticTemplateUI {
  if (temp?.menuConfig) {
    temp.menuConfig.forEach(menu => {
      delete menu.uiId;
      if (menu.child && menu.child.length > 0) {
        menu.child.forEach(child => delete child.uiId)
      }
    })
  }
  return temp;
}

export async function checkIfTemplateNameExists(name: string, currentId: number, visService: VisualisationService): Promise<boolean> {
  return new Promise((resolve) => {
    visService.getTemplates()
      .subscribe(aTemplates =>
        resolve(aTemplates.filter(temp => temp.id !== currentId && temp.name === name).length === 1));
  })
}


export async function checkIfDXPExists(dxpName:string, visService: VisualisationService): Promise<boolean> {
  return new Promise((resolve) => {
    visService.getItems().pipe(
      map((items: Visualisation[]) => {
        let DXPExist = false;
            if(items){
              for(const sfObj of items){
                if(sfObj.ItemType === 'spotfire.dxp'){
                  if(sfObj.Path === dxpName){
                    DXPExist = true;
                  }
                }
              }
            } else {
              console.log('No existing DXPs...');
            }
          resolve(DXPExist);
        }
      )).subscribe();
  });
}

