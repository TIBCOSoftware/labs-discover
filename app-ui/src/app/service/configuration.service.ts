import { Injectable } from '@angular/core';
import { Configuration, DiscoverConfiguration, ResetAction } from '../models_ui/configuration';
import { HttpResponse } from '@angular/common/http';
import { ApiResponseText, Group, TcAppDefinitionService, TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { async, from, Observable, of } from 'rxjs';
import { StateRole, TcSharedStateService, SharedStateList, SharedStateContent, TcCoreCommonFunctions, SharedStateEntry, TcGeneralLandingPageConfigService, TcGeneralConfigService } from '@tibco-tcstk/tc-core-lib';
import { map, flatMap, mergeMap } from 'rxjs/operators';
import { ConfigurationService as ConfigurationServiceMS } from '../api/api';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private DEFAULT_PREFIX = '.discover.config.client.context.SHARED';
  private SHARED_STATE_GROUP_NAME = 'Discover Users';

  private configuration: Configuration;

  constructor(
    protected appDefinitionService: TcAppDefinitionService,
    protected configurationMS: ConfigurationServiceMS,
    protected sharedStateService: TcSharedStateService,
    protected landingPageConfig: TcGeneralLandingPageConfigService,
    protected generalConfig: TcGeneralConfigService,
    protected documentService: TcDocumentService
  ) { }

  get config() {
    return this.configuration;
  }

  get groups() {
    return this.appDefinitionService.usersGroups;
  }

  public async readConfig(): Promise<Configuration> {
    if (!this.configuration) {
      this.configuration = {} as Configuration;
      let index = null;
      if(this.appDefinitionService && this.appDefinitionService.usersGroups) {
        index = this.appDefinitionService.usersGroups.findIndex((grp: Group) => {
            return this.SHARED_STATE_GROUP_NAME.toLowerCase() === grp.name.toLowerCase();
          }
        );
      }
      if (index && index === -1) {
        return Promise.resolve(this.configuration);
      }

      if (this.appDefinitionService.claims){
        this.configuration.claims = this.appDefinitionService.claims;
        this.configuration.sandboxId = this.appDefinitionService.sandboxId;
        this.config.uiAppId = this.appDefinitionService.uiAppId;
      } else {
        return Promise.resolve(this.configuration);
      }
      const discoverConfig = await this.configurationMS.getConfiguration().toPromise();
      if (discoverConfig) {
        this.configuration.discover = discoverConfig;
        return Promise.resolve(this.configuration);
      } else {
        let actionIdx = 0;
        const actions: ResetAction[] = await this.calculateResetActions(false);
        const result = await this.execute(actions).pipe(
            map((response) => {
              if (response.analysis || response instanceof ApiResponseText || (response instanceof HttpResponse && response.type === 4)){
                actions[actionIdx].done = true;
                actionIdx++;
              }
            })
        ).toPromise();
      }
      return Promise.resolve(this.configuration);
    } else {
      return Promise.resolve(this.configuration);
    }
  }

  public refresh = (): Promise<Configuration> => {
    this.configuration = undefined;
    return this.readConfig();
  }

  // private initDiscoverConfig =  (): Observable<DiscoverConfiguration> => {
  //   const ssName = this.getSharedStateName(this.config.uiAppId, this.DEFAULT_PREFIX);;
  //   this.config.discover = this.appDefinitionService.appConfig.config.discover;
  //   // this.config.discover.csv.folder = this.config.uiAppId + '_' + this.config.discover.csv.folder;

  //   return this.createDiscoverConfig(this.config.sandboxId, this.config.uiAppId, this.config.discover).pipe(
  //     flatMap((ssId: string) => {
  //       this.config.discover.id = ssId;
  //       return this.updateDiscoverConfig(this.config.sandboxId, this.config.uiAppId, this.config.discover, ssId).pipe(
  //         map((value: DiscoverConfiguration) =>  {
  //           return value as DiscoverConfiguration;
  //         })
  //       );
  //     })
  //   );
  // }

  // private createDiscoverConfig(sandboxId: number, uiAppId: string, discoveryConfig: DiscoverConfiguration): Observable<string> {
  //   const ssName = this.getSharedStateName(uiAppId, this.DEFAULT_PREFIX);;
  //   const content: SharedStateContent = new SharedStateContent();
  //   const group = this.appDefinitionService.groups.find(grp => {
  //     return grp.name === this.SHARED_STATE_GROUP_NAME;
  //   })
  //   content.json = TcCoreCommonFunctions.escapeString(JSON.stringify(discoveryConfig));
  //   if (group) {
  //     const roles: StateRole[] = [
  //       {
  //         entityId: group.id,
  //         role: 'OWNER'
  //       } as StateRole];
  //     return this.sharedStateService.createSharedState(ssName, 'SHARED', '', sandboxId, undefined, roles, undefined, content).pipe(
  //       map(value => value)
  //     );
  //   } else {
  //     console.error('Discover Users group not found - unable to create config');
  //     return undefined;
  //   }
  // }

  private getDiscoverConfig = (uiAppId: string, useCache: boolean, flushCache: boolean): Observable<DiscoverConfiguration> => {
    const ssName = this.getSharedStateName(uiAppId, this.DEFAULT_PREFIX);;

    return this.sharedStateService.getSharedState(ssName, 'SHARED', useCache, flushCache).pipe(
      map((value: SharedStateList) => {
        if (value.sharedStateEntries.length > 0) {
          const ssresult = JSON.parse(value.sharedStateEntries[0].content.json) as DiscoverConfiguration;
          ssresult.id = value.sharedStateEntries[0].id;
          return ssresult;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateDiscoverConfig = (sandboxId: number, uiAppId: string, discoverConfig: DiscoverConfiguration, id: string): Observable<DiscoverConfiguration> => {
    const ssName = this.getSharedStateName(uiAppId, this.DEFAULT_PREFIX);;
    const content: SharedStateContent = new SharedStateContent();
    content.json = TcCoreCommonFunctions.escapeString(JSON.stringify(discoverConfig));
    const entry: SharedStateEntry = new SharedStateEntry();
    entry.content = content;
    entry.sandboxId = sandboxId;
    entry.name = ssName;
    entry.type = 'SHARED';
    entry.id = id;
    const ssList: SharedStateList = new SharedStateList();
    ssList.sharedStateEntries = [];
    ssList.sharedStateEntries.push(entry);

    return this.sharedStateService.updateSharedState(ssList.sharedStateEntries).pipe(
      map(value => {
          // Flush the cache
          this.getDiscoverConfig(uiAppId, true, true).subscribe();
          return JSON.parse(value.sharedStateEntries[0].content.json) as DiscoverConfiguration;
      })
    );
  }

  private getSharedStateName(uiAppId: string, suffix: string): string {
    return uiAppId + suffix;
  }

  // private deleteDiscoverConfig = (): Observable<string> => {
  //   return this.sharedStateService.deleteSharedState(+this.config.discover.id);
  // }

  public calculateResetActions = async (reset: boolean): Promise<ResetAction[]> => {
    const actions = [];
    if (reset) {
      // actions.push({ label: 'Delete discover config SS entry', done: false, action: this.deleteDiscoverConfig() });
      // actions.push({ label: 'Delete datasource org folder', done: false, action: this.documentService.deleteOrgFolder(this.appDefinitionService.uiAppId + '_' + this.config.discover.csv.folder) });
      actions.push({ label: 'Delete assets org folder', done: false, action: this.documentService.deleteOrgFolder(this.appDefinitionService.uiAppId + '_assets') });
    }

    const [background, icon1, icon2, icon3, environment, simple, scheduled] = await Promise.all([
      this.createFile('/assets/init/images/ProcessMiningsmall.jpg', 'ProcessMiningsmall.jpg', 'image/jpg'),
      this.createFile('/assets/init/images/ic-community.svg', 'ic-community.svg', 'image/svg'),
      this.createFile('/assets/init/images/ic-documentation.svg', 'ic-documentation.svg', 'image/svg'),
      this.createFile('/assets/init/images/ic-graph.svg', 'ic-graph.svg', 'image-svg'),
      this.createFile('/assets/init/config/environment.json', 'environment.json', 'application/json'),
      this.createFile('/assets/init/config/processMinerSimple_template.json', 'processMinerSimple_template.json', 'application/json'),
      this.createFile('/assets/init/config/processMinerScheduled_template.json', 'processMinerScheduled_template.json', 'application/json')
    ]);

    // actions.push({ label: 'Creates discover config SS entry', done: false, action: this.initDiscoverConfig() });
    // actions.push({ label: 'Create datasource org folder', done: false, action: this.documentService.initOrgFolder(this.appDefinitionService.uiAppId + '_' + this.appDefinitionService.appConfig.config.discover.csv.folder) });
    actions.push({ label: 'Create assets org folder', done: false, action: this.documentService.initOrgFolder(this.appDefinitionService.uiAppId + '_assets') });
    actions.push({ label: 'Upload default background image', done: false, action: this.documentService.uploadDocument('orgFolders', this.appDefinitionService.uiAppId + '_assets', this.appDefinitionService.sandboxId, background, 'ProcessMiningsmall.jpg','') });
    actions.push({ label: 'Upload default icon1 image', done: false, action: this.documentService.uploadDocument('orgFolders', this.appDefinitionService.uiAppId + '_assets', this.appDefinitionService.sandboxId, icon1, 'ic-community.svg','') });
    actions.push({ label: 'Upload default icon2 image', done: false, action: this.documentService.uploadDocument('orgFolders', this.appDefinitionService.uiAppId + '_assets', this.appDefinitionService.sandboxId, icon2, 'ic-documentation.svg','') });
    actions.push({ label: 'Upload default icon3 image', done: false, action: this.documentService.uploadDocument('orgFolders', this.appDefinitionService.uiAppId + '_assets', this.appDefinitionService.sandboxId, icon3, 'ic-graph.svg','') });
    actions.push({ label: 'Upload default environment.json file', done: false, action: this.documentService.uploadDocument('orgFolders', this.appDefinitionService.uiAppId + '_assets',this.appDefinitionService.sandboxId, environment, 'environment.json','') });
    actions.push({ label: 'Upload default processMinerSimple_template.json file', done: false, action: this.documentService.uploadDocument('orgFolders', this.appDefinitionService.uiAppId + '_assets', this.appDefinitionService.sandboxId, simple, 'processMinerSimple_template.json','') });
    actions.push({ label: 'Upload default processMinerScheduled_template.json file', done: false, action: this.documentService.uploadDocument('orgFolders', this.appDefinitionService.uiAppId + '_assets', this.appDefinitionService.sandboxId, scheduled, 'processMinerScheduled_template.json','') });

    return actions;
  }

  public execute = (actions: ResetAction[]): Observable<any> => {
    const idx = 0;
    return from(actions)
    .pipe(
      mergeMap(
        (row) => {
          return row.action
        },
        1
      )
    )
  }

  private async createFile(path: string, name: string, type: string): Promise<File> {
    const response = await fetch(path);
    const data = await response.blob();
    const metadata = {
      type
    };
    const file = new File([data], name, metadata);
    return file
  }
}
