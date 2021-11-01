"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoverCache = void 0;
const redis = __importStar(require("redis"));
const bluebird_1 = require("bluebird");
const typedi_1 = require("typedi");
const logging_1 = require("../common/logging");
const uuid_1 = require("uuid");
const api_1 = require("../liveapps/authorization/api");
let DiscoverCache = class DiscoverCache {
    constructor(host, port, liveappsURL) {
        this.set = (token, database, key, value, ttl, lock, path, confirmValue) => __awaiter(this, void 0, void 0, function* () {
            if (false) {
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
                let response = '';
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
                bluebird_1.promisifyAll(clients.watcher);
                bluebird_1.promisifyAll(redis.Multi.prototype);
                clients.watcher.watch("foo", function (watchError) {
                    if (watchError)
                        throw watchError;
                    // if you comment out the next line, the transaction will work
                    clients.modifier.set("foo", 'Math.random()', setError => {
                        if (setError)
                            throw setError;
                    });
                    // using a setTimeout here to ensure that the MULTI/EXEC will come after the SET.
                    // Normally, you would use a callback to ensure order, but I want the above SET command
                    // to be easily comment-out-able.
                    setTimeout(function () {
                        clients.watcher
                            .multi()
                            .set("foo", "bar")
                            .set("hello", "world")
                            .exec((multiExecError, results) => {
                            if (multiExecError)
                                throw multiExecError;
                            if (results === null) {
                                console.log("transaction aborted because results were null");
                            }
                            else {
                                console.log("transaction worked and returned", results);
                            }
                            clients.watcher.quit();
                            clients.modifier.quit();
                        });
                    }, 1000);
                });
                return response;
            }
            else {
                return yield this._set(database, (yield this.getSubscriptionId(token)) + '-' + key, value, ttl);
            }
        });
        this._set = (database, key, value, ttl) => __awaiter(this, void 0, void 0, function* () {
            this.client.select(this.obtainDatabase(database));
            // @ts-ignore
            const response = yield this.client.setAsync(key, value);
            if (response === 'OK' && ttl) {
                // @ts-ignore
                yield this.client.expireAsync(key, ttl);
            }
            return response;
        });
        this.get = (token, database, key) => __awaiter(this, void 0, void 0, function* () {
            const realClient = yield this.getClient(token);
            logging_1.logger.debug('En 0 Client: ' + token + ' database: ' + database + ' key: ' + key + ' realClient: ' + realClient.globalSubscriptionId);
            const kk = yield this._get(database, realClient.globalSubscriptionId + '-' + key);
            return kk;
        });
        this._get = (database, key) => __awaiter(this, void 0, void 0, function* () {
            this.client.select(this.obtainDatabase(database));
            // @ts-ignore
            return yield this.client.getAsync(key);
        });
        this.delete = (token, database, key) => __awaiter(this, void 0, void 0, function* () {
            return yield this._del(database, (yield this.getTokenInformation(token)).globalSubscriptionId + '-' + key);
        });
        this._del = (database, key) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('_del: Database: ' + database + ' Key: ' + key);
            this.client.select(this.obtainDatabase(database));
            // @ts-ignore
            return yield this.client.delAsync(key);
        });
        this.search = (token, database, key) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('discover-cache-search-start: Token: ' + token + ' database: ' + database + ' key: ' + key);
            const keys = yield this._search(database, (yield this.getTokenInformation(token)).globalSubscriptionId + '-' + key);
            logging_1.logger.debug('discover-cache-search: Returned ' + keys.length + ' entries');
            const promises = keys.map((el) => {
                return this._get(database, el);
            });
            return yield Promise.all(promises);
        });
        this._search = (database, key) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('discover-cache-_search-start: Database: ' + database + ' key: ' + key);
            let entries = [];
            this.client.select(this.obtainDatabase(database));
            let token = '0';
            do {
                // @ts-ignore
                const response = yield this.client.scanAsync(token, 'MATCH', key, 'COUNT', 100);
                token = response[0];
                entries = [...entries, ...response[1]];
            } while (token !== '0');
            logging_1.logger.debug('discover-cache-_search-return: Returned ' + entries.length + ' entries.');
            return entries;
        });
        this.obtainId = (key) => __awaiter(this, void 0, void 0, function* () {
            this.client.select(this.obtainDatabase('config'));
            // @ts-ignore
            return yield this.client.incrAsync(key);
        });
        this.obtainUUID = () => {
            return uuid_1.v4();
        };
        this.obtainDatabase = (component) => {
            let database = 14;
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
            }
            ;
            return database;
        };
        this.disconnect = () => {
            this.client.quit();
        };
        this.getSubscriptionInfo = (token) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const header = { headers: { 'Authorization': 'Bearer ' + token } };
            const claims = (yield this.claimsService.getClaims(header)).body;
            return {
                globalSubscriptionId: claims.globalSubcriptionId,
                firstName: claims.firstName,
                lastName: claims.lastName,
                userName: claims.username,
                email: claims.email,
                sandboxId: (_a = claims.sandboxes) === null || _a === void 0 ? void 0 : _a.filter((sandbox) => sandbox.type === api_1.ClaimsSandbox.TypeEnum.Production)[0].id
            };
        });
        this.getSubscriptionId = (token) => __awaiter(this, void 0, void 0, function* () {
            const info = yield this.getClient(token);
            return info.globalSubscriptionId;
        });
        this.getClient = (token) => __awaiter(this, void 0, void 0, function* () {
            if (token.startsWith('CIC')) {
                let name = yield this._get('subscription', token);
                let newName = {};
                if (!name) {
                    newName = yield this.getSubscriptionInfo(token);
                }
                else {
                    newName = JSON.parse(name);
                }
                yield this._set('subscription', token, JSON.stringify(newName), 3600);
                return newName;
            }
            else {
                return { globalSubscriptionId: token };
            }
        });
        this.getTokenInformation = (token) => __awaiter(this, void 0, void 0, function* () {
            return yield this.getClient(token);
        });
        /**
         * The orgId here means subscription id in CIC
         * @param token The bearer token.
         * @returns The subscription id (in discover backend, it's called orgId).
         */
        this.getOrgId = (token) => __awaiter(this, void 0, void 0, function* () {
            if (token) {
                const tokenInfo = yield this.getClient(token);
                if (tokenInfo && tokenInfo.globalSubscriptionId) {
                    return tokenInfo.globalSubscriptionId;
                }
            }
            logging_1.logger.warn(`[DiscoverCache] Failed to get orgId from the token = ${token}`);
            return '';
        });
        logging_1.logger.info('Creating redis client: ');
        logging_1.logger.info('  Host: ' + host);
        logging_1.logger.info('  Port: ' + port);
        logging_1.logger.info('  Liveapps URL: ' + liveappsURL);
        this.client = new redis.RedisClient({
            port,
            host
        });
        bluebird_1.promisifyAll(this.client);
        this.liveappsURL = liveappsURL;
        this.claimsService = new api_1.ClaimsApi(process.env.LIVEAPPS + '/organisation/v1');
    }
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
};
DiscoverCache = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [String, Number, String])
], DiscoverCache);
exports.DiscoverCache = DiscoverCache;
//# sourceMappingURL=DiscoverCache.js.map