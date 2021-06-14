import { Injectable } from '@angular/core';
import {bType, CIDState, TButton} from '../models/buttons';
import {CaseAction, TcCaseProcessesService} from '@tibco-tcstk/tc-liveapps-lib';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class LaWrapperService {

  constructor(private caseProcessesService: TcCaseProcessesService, private configService: ConfigurationService) {
    console.log('[LAW] SERVICE LOADED...');
  }

  protected TYPE_ID = '1';

  // TODO: Create stateCache type
  private actionCache = {};
  private actionCatalog = {};

  public async getActionsForCase(caseRef, appId, actionFilter): Promise<CaseAction[]> {
    if (this.caseProcessesService) {
      const caseactions = await this.caseProcessesService.getCaseActionsForCaseRef(caseRef, this.configService.config.sandboxId, appId, this.TYPE_ID).toPromise();
      if (actionFilter && actionFilter != '') {
        caseactions.actions = caseactions.actions.filter(act => {
          // check if it matches any of the actionFilters
          let test = true;
          actionFilter.forEach(actfilter => {
            if (test && act.label.substr(0, actfilter.length) === actfilter) {
              test = false;
            }
          });
          return test;
        });
      }
      return caseactions.actions;
    }
  }

  public async getPossibleTButtonsForStates(cidStates: CIDState[] , appId, actionFilter, exList: TButton[]): Promise<TButton[]> {
    let butType: bType = 'ACTION';
    if (cidStates.length > 1) {
      butType = 'MULTIPLE';
    }
    const actions = await this.getPossibleActionsForStates(cidStates, appId, actionFilter, exList);
    const re = new Array<TButton>();
    for (const act of actions) {
      let exFound = false;
      for (const ex of exList) {
        // if (ex.id === act.label) {
        if (ex.id === act.name) {
          exFound = true;
          ex.caseAction = act;
          // this.multipleActionButtons.push(ex);
          re.push(ex);
        }
      }
      if (!exFound) {
        // this.multipleActionButtons.push({id: but.label, label: but.label, type: "MULTIPLE"});
        re.push({id: act.name, label: act.label, type: butType, caseAction: act});
      }
    }
    return re;
  }


  public async getPossibleActionsForStates(cidStates: CIDState[] , appId, actionFilter, exList: TButton[]): Promise<CaseAction[]> {
    let cacheMark = 'MULTIPLE';
    if (cidStates.length == 1) {
        cacheMark = 'SINGLE';
    }
    // Make an unique list of CaseID-State Type, one for every state.
    const cidStatesUnique = this.uniqueArray(cidStates);
    let intersectedActions = null;
    // Loop over Unique CaseID-States
    for (const cis of cidStatesUnique) {
      let tempActions = [''];
      // Check if state is in cache
      if (this.actionCache[appId + '-' + cis.state + '-' + cacheMark] != null) {
        tempActions = this.actionCache[appId + '-' + cis.state + '-' + cacheMark];
      } else {
        // If State is not in Cache:,
        //    call the API with the CASE ID to get the allowed Actions,
        const pActions = await this.getActionsForCase(cis.caseRef, appId, '');
        for (const pa of pActions) {
          // Except if it is part of an exception list.
          for (const exep of exList) {
            if (pa.name == exep.id) {
              tempActions.push(pa.name);
              this.actionCatalog[appId + '-' + pa.name] = pa;
            }
          }
          // Check if action does not have any data entry.
          // Only if the Action does not have input data or if we are looking for one Action
          if (pa.noData || (cidStates.length == 1)) {
            // add the case action to the action catalog
            // Note: We apply the action filter here, since actionfilters can be part of exception list.
            for (const actfilter of actionFilter) {
              if (!(pa.label.substr(0, actfilter.length) === actfilter)) {
                // Check if the tempActions do not already have an exception
                if (!tempActions.includes(pa.name)) {
                  tempActions.push(pa.name);
                  this.actionCatalog[appId + '-' + pa.name] = pa;
                }
              }
            }
          }
        }
        // update the cache with the allowed action for a case
        this.actionCache[appId + '-' + cis.state + '-' + cacheMark] = tempActions;
      }
      // Now find unification of all the allowed actions
      if (intersectedActions == null) {
        intersectedActions = [...tempActions];
      } else {
        intersectedActions = intersectedActions.filter(value => tempActions.includes(value));
      }
    }
    let allowedActionsArray = [];
    if (intersectedActions != null) {
        allowedActionsArray = [...intersectedActions];
        // Remove the empty action
        allowedActionsArray = allowedActionsArray.filter(value => value.toString() != '');

    }
    // console.log('[LAW] Allowed Actions Array: ' , allowedActionsArray);
    const re = new Array<CaseAction>();
    // Create the return value from the action catalog
    for (const allowed of allowedActionsArray) {
      re.push(this.actionCatalog[appId + '-' + allowed]);
    }
    return re;
  }


  private uniqueArray(arr) {
    const hashMap = {};
    const uniqueArr = [];
    for (let i = 0; i < arr.length; i++) {
      if (!hashMap.hasOwnProperty(arr[i].state)) {
        uniqueArr.push(arr[i]);
        hashMap[arr[i].state] = i;
      }
    }
    return uniqueArr;
  }


}
