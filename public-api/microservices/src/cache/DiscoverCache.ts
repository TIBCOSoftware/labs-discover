import * as redis from "redis";
import { promisifyAll} from 'bluebird';
import axios from "axios";
import { Service } from "typedi";
import { logger } from "../common/logging";
import { v4 as uuidv4} from 'uuid';
import { Analysis } from "../models/analysis-redis.model";
import { get } from 'lodash';
import { ClaimsApi, ClaimsSandbox } from "../liveapps/authorization/api";

@Service()
export class DiscoverCache  {

  private client: redis.RedisClient;
  private liveappsURL: string;

  private claimsService: ClaimsApi;

  constructor(host: string, port: number, liveappsURL: string) {
    logger.info('Creating redis client: ');
    logger.info('  Host: ' + host);
    logger.info('  Port: ' + port);
    logger.info('  Liveapps URL: ' + liveappsURL);
    this.client = new redis.RedisClient({
      port,
      host
    });
    promisifyAll(this.client);
    this.liveappsURL = liveappsURL;
    this.claimsService = new ClaimsApi(process.env.LIVEAPPS +'/organisation/v1');
  }


  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

  public set = async (token: string, database: string, key: string, value: string, ttl?: number, lock?: boolean, path?: string, confirmValue?: string): Promise<string> => {

    if (false){
    //   const fullKey = await this.getSubscriptionId(token) + '-' + key;
      
    //   const watcher = this.client.duplicate();
    //   const modifier = this.client.duplicate();
    //   promisifyAll(watcher);
    //   promisifyAll(redis.Multi.prototype);
    //   logger.debug('Watching key: ' + fullKey);
    //   // @ts-ignore
    //   const kk = await watcher.watchAsync(fullKey);
    //   const prevEntry = await this.get(token, database, key);
    //   const prevEntryParsed = JSON.parse(prevEntry);
    //   const prevValue = get(prevEntryParsed, path);      

    //   // if (prevValue != confirmValue){
    //   //   logger.error('Value has changed. New value: ' + confirmValue + ' old value: ' + prevValue);
    //   //   return '-1';
    //   // }
      let response: string = '';
    //   await setTimeout(async () => {
    //   // await this.sleep(10000);

    //   const operation = await watcher
    //     .multi()
    //     .select(this.obtainDatabase(database))
    //     .set(fullKey,value);
    //   // @ts-ignore
    //   const kk3 = await operation.execAsync();
    //   logger.debug('kk3');
    //   logger.debug(kk3);
      
    //   if (kk3 === null){
    //     logger.debug('transaction aborted because results were null');
    //     response = '0';
    //   } else {
    //     logger.debug('transaction worked and returned');
    //     response = 'OK';
    //   }
    //   watcher.quit();
    //   modifier.quit();
    // }, 1000);

    const clients = {
      watcher: this.client.duplicate(),
      modifier: this.client.duplicate(),
    };
    promisifyAll(clients.watcher);
    promisifyAll(redis.Multi.prototype);
    
    clients.watcher.watch("foo", function(watchError) {
      if (watchError) throw watchError;
    
      // if you comment out the next line, the transaction will work
      clients.modifier.set("foo", 'Math.random()', setError => {
        if (setError) throw setError;
      });
    
      // using a setTimeout here to ensure that the MULTI/EXEC will come after the SET.
      // Normally, you would use a callback to ensure order, but I want the above SET command
      // to be easily comment-out-able.
      setTimeout(function() {
        clients.watcher
          .multi()
          .set("foo", "bar")
          .set("hello", "world")
          .exec((multiExecError, results) => {
            if (multiExecError) throw multiExecError;
    
            if (results === null) {
              console.log("transaction aborted because results were null");
            } else {
              console.log("transaction worked and returned", results);
            }
    
            clients.watcher.quit();
            clients.modifier.quit();
          });
      }, 1000);
    });

      return response;
    } else {
      return await this._set(database, await this.getSubscriptionId(token) + '-' + key, value, ttl);
    }
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

  public get = async (token: string, database: string, key: string): Promise<string> => {
    const realClient = await this.getClient(token);
    logger.debug('En 0 Client: ' + token + ' database: ' + database + ' key: ' + key + ' realClient: ' + realClient.globalSubscriptionId);
    const kk =  await this._get(database, realClient.globalSubscriptionId + '-' + key);
    return kk;
  }

  private _get = async (database: string, key: string): Promise<string> => {
    this.client.select(this.obtainDatabase(database));
    // @ts-ignore
    return await this.client.getAsync(key);
  }

  public delete = async (token: string, database: string, key: string): Promise<number> => {
    return await this._del(database, (await this.getTokenInformation(token)).globalSubscriptionId + '-' + key);
  }

  private _del = async (database: string, key: string): Promise<number> => {
    logger.debug('_del: Database: ' + database + ' Key: ' + key);
    this.client.select(this.obtainDatabase(database));
    // @ts-ignore
    return await this.client.delAsync(key);
  }

  public search = async (token: string, database: string, key: string): Promise<any[]> => {
    logger.debug('discover-cache-search-start: Token: ' + token + ' database: ' + database + ' key: ' + key);
    const keys = await this._search(database, (await this.getTokenInformation(token)).globalSubscriptionId + '-' + key);
    logger.debug('discover-cache-search: Returned ' + keys.length + ' entries');

    const promises = keys.map((el) => {
      return this._get(database, el);
    })

    return await Promise.all(promises);
  }

  private _search = async (database: string, key: string): Promise<string[]> => {
    logger.debug('discover-cache-_search-start: Database: ' + database + ' key: ' + key);
    let entries: string[] = [];
    this.client.select(this.obtainDatabase(database));
    let token: string = '0';
    
    do {
      // @ts-ignore
      const response = await this.client.scanAsync(token, 'MATCH', key, 'COUNT', 100);
      token = response[0];
      entries = [ ...entries, ...response[1]];
    } while (token !== '0')
    logger.debug('discover-cache-_search-return: Returned ' + entries.length + ' entries.');

    return entries;
  }

  public obtainId = async (key: string): Promise<number> => {
    this.client.select(this.obtainDatabase('config'));
    // @ts-ignore
    return await this.client.incrAsync(key);
  }

  public obtainUUID =  (): string => {
    return uuidv4();
  }

  private obtainDatabase = (component: string): number => {
    let database = 14 as number;
    switch (component) {
      case 'config':
        database = 0;
        break;
      case 'subscription':
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
      case 'configuration':
        database = 8;
        break;      
      default:
        break;
    };
    return database;
  }

  public disconnect = (): void => {
    this.client.quit();
  }

  private getSubscriptionInfo = async (token: string): Promise<any> => {
    const header = { headers: { 'Authorization': 'Bearer ' + token}};
    const claims = (await this.claimsService.getClaims(header)).body;
    return {
      globalSubscriptionId: claims.globalSubcriptionId,
      firstName: claims.firstName,
      lastName: claims.lastName,
      userName: claims.username,
      email: claims.email,
      sandboxId: claims.sandboxes?.filter((sandbox: ClaimsSandbox) => sandbox.type === ClaimsSandbox.TypeEnum.Production)[0].id
    }
  }

  private getSubscriptionId = async (token: string): Promise<string> => {
    const info = await this.getClient(token)
    return info.globalSubscriptionId;
  }

  public getClient = async (token: string): Promise<any> => {
    if (token.startsWith('CIC')){
      let name = await this._get('subscription', token);
      let newName = {};
      if (!name) {
        newName = await this.getSubscriptionInfo(token);
      } else {
        newName = JSON.parse(name);
      }
      await this._set('subscription', token, JSON.stringify(newName), 3600);
      return newName;
    } else {
      return {globalSubscriptionId: token};
    }
  }

  public getTokenInformation = async (token: string): Promise<any> => {
    return await this.getClient(token);
  }

  /**
   * The orgId here means subscription id in CIC
   * @param token The bearer token. 
   * @returns The subscription id (in discover backend, it's called orgId).
   */
  public getOrgId = async (token: string): Promise<string> => {
    if (token) {
      const tokenInfo = await this.getClient(token);
      if (tokenInfo && tokenInfo.globalSubscriptionId) {
        return tokenInfo.globalSubscriptionId;
      }
    }
    logger.warn(`[DiscoverCache] Failed to get orgId from the token = ${token}`);
    return '';
  }
}
