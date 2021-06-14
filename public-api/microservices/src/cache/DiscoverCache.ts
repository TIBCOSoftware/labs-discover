import * as redis from "redis";
import { promisifyAll} from 'bluebird';
import axios from "axios";
import { Service } from "typedi";
import { logger } from "../common/logging";

export class DiscoverCache  {

  private client: redis.RedisClient;
  private liveappURL: string;

  constructor(host: string, port: number, liveappURL: string) {
    logger.info('Creating redis client: ');
    logger.info('  Host: ' + host);
    logger.info('  Port: ' + port);
    this.client = new redis.RedisClient({
      port,
      host
    });
    promisifyAll(this.client);
    logger.info('  Liveapps URL: ' + liveappURL);
    this.liveappURL = liveappURL;
  }

  public set = async (client: string, database: string, key: string, value: string, ttl?: number): Promise<string> => {
    const realClient = await this.getClient(client);
    return this._set(database, realClient + '-' + key, value, ttl);
  }

  private _set = async (database: string, key: string, value: string, ttl?: number): Promise<string> => {
    this.client.select(this.obtainDatabase(database));

    // @ts-ignore
    const response = await this.client.setAsync(key, value);
    if (response === 'OK' && ttl) {
      // @ts-ignore
      await this.client.expireAsync(key, ttl);
    }
    return response;
  }

  public get = async (client: string, database: string, key: string): Promise<string> => {
    const realClient = await this.getClient(client);
    logger.debug('En 0');
    const kk =  await this._get(database, realClient + '-' + key);
    logger.debug('En 01');
    return kk;
  }

  private _get = async (database: string, key: string): Promise<string> => {
    this.client.select(this.obtainDatabase(database));
    // @ts-ignore
    return await this.client.getAsync(key);
  }

  public delete = async (client: string, database: string, key: string): Promise<number> => {
    const realClient = await this.getClient(client);
    return await this._del(database, realClient + '-' + key);
  }

  private _del = async (database: string, key: string): Promise<number> => {
    this.client.select(this.obtainDatabase(database));
    // @ts-ignore
    return await this.client.delAsync(key);
  }

  public search = async (client: string, database: string, key: string): Promise<any[]> => {
    const realClient = await this.getClient(client);
    const keys = await this._search(database, realClient + '-' + key);
    
    const promises = keys.map((el) => {
      return this._get(database, el);
    })

    return await Promise.all(promises);
  }

  private _search = async (database: string, key: string): Promise<string[]> => {
    let entries: string[] = [];
    this.client.select(this.obtainDatabase(database));
    let token: string = '0';
    
    do {
      // @ts-ignore
      const response = await this.client.scanAsync(token, 'MATCH', key, 'COUNT', 100);
      token = response[0];
      entries = [ ...entries, ...response[1]];
    } while (token !== '0')

    return entries;
  }

  public obtainId = async (key: string): Promise<number> => {
    this.client.select(this.obtainDatabase('config'));
    // @ts-ignore
    return await this.client.incrAsync(key);
  }

  private obtainDatabase = (component: string): number => {
    let database = 14 as number;
    switch (component) {
      case 'config':
        database = 0;
        break;
      case 'configuration':
        database = 1;
        break;
      case 'datasets':
        database = 2;
        break;
      case 'templates':
        database = 3;
        break;      
      case 'analysis':
        database = 4;
        break;      
      case 'token':
        database = 5;
        break;      
      case 'tdv':
        database = 6;
        break;      
      case 'spark':
        database = 7;
        break;      
      default:
        break;
    };
    return database;
  }

  public disconnect = (): void => {
    this.client.quit();
  }

  public getSubscriptionName = async (token: string): Promise<any> => {
    const url = this.liveappURL + '/organisation/v1/claims'; 
    const data = await axios.get( url,
    {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(response => {
      return response.data.globalSubcriptionId;
    });
    return data;
  }

  public getClient = async (client: string): Promise<string> => {
    if (client.startsWith('CIC')){
      let name = await this._get('token', client);
      if (!name) {
        name = await this.getSubscriptionName(client);
      }
      await this._set('token', client, name, 3600);
      return name;
    } else {
      return client;
    }
  }
}
