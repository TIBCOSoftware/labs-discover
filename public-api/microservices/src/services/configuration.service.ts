import { Service } from "typedi";
import { logger } from "../common/logging";
import { Analytics, Automapping, DiscoverConfiguration, FieldFormats, GeneralInformation, InvestigationApplication, LandingPage, Message } from "../models/configuration.model";
import { DiscoverCache } from '../cache/DiscoverCache';

@Service()
export class ConfigurationService {

  private DATABASE = 'configuration'; 
  private cache: DiscoverCache;

  constructor (
    liveappsURL: string, 
    redisHost: string, 
    redisPort: number
  ) {
    this.cache = new DiscoverCache(redisHost, redisPort, liveappsURL);
  }

  public getConfiguration = async (token: string, element: string): Promise<string> => {
    return await this.cache.get(token, this.DATABASE, element);
  }

  public postConfiguration = async (token: string, element: string, value: string): Promise<string> => {
    return await this.cache.set(token, this.DATABASE, element, value);
  }
}