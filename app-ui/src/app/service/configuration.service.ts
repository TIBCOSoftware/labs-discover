import { Injectable } from '@angular/core';
import { Configuration } from '../models_ui/configuration';
import { TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { ConfigurationService as ConfigurationServiceMS } from '../backend/api/api';
import { DiscoverConfiguration } from '../backend/model/discoverConfiguration';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private configuration: Configuration;
  private _adminMenu: any;

  constructor(
    private configurationMS: ConfigurationServiceMS,
    private http: HttpClient
  ) { }

  get config() {
    return this.configuration;
  }

  get adminMenu() {
    return this._adminMenu;
  }

  public async readConfig(): Promise<Configuration> {
    if (!this.configuration) {
      this.configuration = {} as Configuration;
      const whoAmI = await this.configurationMS.getWhoAmI().toPromise();

      if (whoAmI &&  !whoAmI.isUser) {
        return Promise.resolve(this.configuration);
      }

      this.configuration.user = whoAmI;
      this.configuration.uiAppId = 'discoverapp';
      const discoverConfig = await this.configurationMS.getConfiguration().toPromise();
      if (discoverConfig) {
        await this.getAdminMenu();
        this.configuration.discover = discoverConfig as DiscoverConfiguration;
        return Promise.resolve(this.configuration);
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

  private async getAdminMenu():Promise<void> {
    const fileContent = (await this.http.get('assets/config/appConfig.json').toPromise()) as any;
    this._adminMenu = fileContent.config.adminMenu;

  }
}
