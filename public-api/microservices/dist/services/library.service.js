"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryService = void 0;
const axios_1 = __importDefault(require("axios"));
const typedi_1 = require("typedi");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const logging_1 = require("../common/logging");
let LibraryService = class LibraryService {
    constructor(liveappsURL, redisHost, redisPort) {
        this.getItems = (token, type) => __awaiter(this, void 0, void 0, function* () {
            const settings = yield this.callSpotfire(token, 'https://eu.spotfire-next.cloud.tibco.com/spotfire/wp/settings', 'GET');
            const rootFolderId = settings.data.rootFolderId;
            const folderInfo = yield this.getFolderInfo(token, rootFolderId);
            const folderInfo2 = yield this.getFolderInfo(token, folderInfo.data.Children.filter((folder) => folder.IsFolder && folder.Path === '/Teams')[0].Id);
            // logger.debug(folderInfo2.data);
            const teamsInfo = folderInfo2.data;
            if (teamsInfo != null) {
                const org = (yield this.cache.getTokenInformation(token)).globalSubscriptionId;
                const orgFolderId = teamsInfo.Children.filter((el) => el.IsFolder && el.Path === ('/Teams/' + org))[0].Id;
                const items = yield this.iterateItems(token, orgFolderId, type);
                return items;
            }
            else {
                logging_1.logger.error('Teams folder not found');
                return [];
            }
        });
        this.copyItem = (token, itemId, newName, newFolder) => __awaiter(this, void 0, void 0, function* () {
            const copyItem = {
                itemsToCopy: [itemId],
                // destinationItemName: newName.slice(newName.lastIndexOf('/') + 1),
                destinationFolderId: newFolder,
                conflictResolution: 'KeepBoth'
            };
            const copyResponse = yield this.callSpotfire(token, 'https://eu.spotfire-next.cloud.tibco.com/spotfire/rest/library/copy', 'POST', copyItem);
            if (newName) {
                return yield this.renameItem(token, copyResponse.data[0].Id, newName.slice(newName.lastIndexOf('/') + 1));
            }
        });
        this.callSpotfire = (token, url, method, data) => __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(token);
            logging_1.logger.debug('Session: ');
            logging_1.logger.debug(session);
            if (method === 'GET') {
                return yield axios_1.default.get(url, {
                    headers: {
                        cookie: "JSESSIONID=" + session.JSESSIONID,
                        "X-XSRF-TOKEN": session["X-XSRF-TOKEN"],
                        referer: 'eu.' + 'spotfire-next.cloud.tibco.com/spotfire/wp/startPage'
                    }
                });
            }
            if (method === 'POST') {
                // try{
                return yield axios_1.default.post(url, data, {
                    headers: {
                        cookie: "JSESSIONID=" + session.JSESSIONID,
                        "X-XSRF-TOKEN": session["X-XSRF-TOKEN"],
                        referer: 'eu.' + 'spotfire-next.cloud.tibco.com/spotfire/wp/startPage'
                    }
                });
                // } catch (e) {
                //   logger.error(e);
                // }
            }
        });
        this.iterateItems = (token, baseFolderId, type) => __awaiter(this, void 0, void 0, function* () {
            let re = [];
            const iterateFolder = yield this.getFolderInfo(token, baseFolderId);
            // logger.debug(iterateFolder.data);
            for (let itItem of iterateFolder.data.Children) { // Could be changed into a Map
                if (itItem.ItemType === type) {
                    re.push(itItem);
                }
                if (itItem.IsFolder) {
                    re = re.concat(yield this.iterateItems(token, itItem.Id, type));
                }
            }
            return re;
        });
        this.getSession = (token) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('Token is: ' + token);
            // const s  = await this.cache.get('spotfire', 'token', token);
            // if (s) {
            //   return JSON.parse(s) as Session;
            // }
            logging_1.logger.debug('GET NEW Session from spotfire');
            const response = yield axios_1.default.get('https://eu.spotfire-next.cloud.tibco.com', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const session = {
                // @ts-expect-error
                JSESSIONID: /JSESSIONID=(.*?);/g.exec(response.headers['set-cookie'])[1],
                // @ts-expect-error
                'X-XSRF-TOKEN': /XSRF-TOKEN=(.*?);/g.exec(response.headers['set-cookie'])[1],
            };
            // this.cache.set('spotfire', 'token', token, JSON.stringify(session), 600);
            return session;
        });
        this.getFolderInfo = (token, folderId) => __awaiter(this, void 0, void 0, function* () {
            const request = {
                "folderId": folderId,
                "types": ["spotfire.folder", "spotfire.dxp", "spotfire.sbdf", "spotfire.mod"]
            };
            return yield this.callSpotfire(token, 'https://eu.spotfire-next.cloud.tibco.com/spotfire/rest/library/folderInfo', 'POST', request);
        });
        this.renameItem = (token, id, title) => __awaiter(this, void 0, void 0, function* () {
            const renameItem = {
                itemId: id,
                title: title
            };
            return yield this.callSpotfire(token, 'https://eu.spotfire-next.cloud.tibco.com/spotfire/rest/library/modifyTitle', 'POST', renameItem);
        });
        this.cache = new DiscoverCache_1.DiscoverCache(redisHost, redisPort, liveappsURL);
    }
};
LibraryService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [String, String, Number])
], LibraryService);
exports.LibraryService = LibraryService;
//# sourceMappingURL=library.service.js.map