import { Injectable } from '@angular/core';
import { CaseInfo, LiveAppsService, TcCaseDataService } from '@tibco-tcstk/tc-liveapps-lib';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  private CASES_TO_LOAD = 1000;
  private sandboxId: any;
  private hideTerminalStates = true;

  constructor(protected liveApps: LiveAppsService,
              protected caseDataService: TcCaseDataService,
              protected configService: ConfigurationService) {
    this.sandboxId = this.configService.config.sandboxId;
  }

  public async loadCaseRefsAsync(appId): Promise<string[]> {
    return (await this.liveApps.caseSearchEntries('', this.sandboxId, appId, '1', true, 0, this.CASES_TO_LOAD, undefined, undefined, this.hideTerminalStates).toPromise()).caserefs;
  }

  public async loadCasesAsync(appId, caseRefs: string[]): Promise<CaseInfo[]> {
    return this.caseDataService.getCaseDataByRefs(this.sandboxId, caseRefs).toPromise();
  }

  public async getCasesP(appId): Promise<CaseInfo[]> {
    const caseRefs = await this.loadCaseRefsAsync(appId);
    return this.loadCasesAsync(appId, caseRefs);
  }

}

