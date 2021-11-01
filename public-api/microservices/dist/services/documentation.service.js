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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationService = void 0;
const typedi_1 = require("typedi");
const logging_1 = require("../common/logging");
const DiscoverCache_1 = require("../cache/DiscoverCache");
const api_1 = require("../nimbus/api");
let DocumentationService = class DocumentationService {
    constructor(cache) {
        // logger.info('DocumentationService constructor called with values: ');
        // logger.info('    Nimbus: ' + nimbusURL);
        this.cache = cache;
        // *** Public Service Functions
        // Get All available Folders and Structure
        this.getFolders = (token, folderid) => __awaiter(this, void 0, void 0, function* () {
            const header = { headers: { "Authorization": token } };
            const resultExport = (yield this.folders.getMapFolders(folderid, header)).body;
            return resultExport;
        });
        // Get All available Folders and Structure
        this.createFolder = (token, parentfolderId, foldername) => __awaiter(this, void 0, void 0, function* () {
            const header = { headers: { "Authorization": token } };
            const folderModelData = { parentMapFolderId: parentfolderId, name: foldername };
            const resultExport = (yield this.folders.createMapFolder(folderModelData, header)).body;
            return resultExport;
        });
        // Export a Variant to the Documentation System
        this.exportGraph = (token, FolderId, mapname, graph) => __awaiter(this, void 0, void 0, function* () {
            const header = { headers: { "Authorization": token } };
            const newMap = {
                name: mapname,
                mapFolderId: FolderId
            };
            const createExport = (yield this.maps.createMap(newMap, header)).body;
            // get createExport.draft?.mapId
            if (createExport.draft) {
                const mapId = createExport.draft.mapId;
                const resultExport = yield this.formatExport(mapname, mapId, graph);
                // logger.info(" - MAP JSON : " + JSON.stringify(resultExport));
                const diagram = resultExport;
                const updateExport = (yield this.diagrams.updateDiagram(mapId, undefined, undefined, undefined, undefined, undefined, undefined, diagram, header)).body;
                return updateExport;
            }
            return createExport;
        });
        // *** Private Utilities and Functions
        // create from Sportfire and Cytoscape JSON, the new Documentation Graph JSON
        this.formatExport = (mapname, diagramId, flow) => __awaiter(this, void 0, void 0, function* () {
            const revision = 1;
            const xoffset = 1.8;
            const yoffset = 2.2;
            // TIBCO Nimbus Map
            const controlPanel = {
                owner: { id: 1 },
                // tslint:disable-next-line:object-literal-sort-keys
                author: { id: 1 },
                version: "1",
                title: mapname,
                description: "Export from TIBCO Cloud Discover \nused xy-offset: (" + xoffset + "|" + yoffset + ")"
            };
            const language = { languageId: 1 };
            let activitycount = 0;
            let linecount = 0;
            let validlinecount = 0;
            let looplinecount = 0;
            const objects = [];
            const activityIds = [];
            const looplines = [];
            // check for Loop-Lines
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < flow.length; i++) {
                const obj = flow[i];
                if (obj.group === "edges") {
                    if (obj.data.source === obj.data.target) {
                        looplinecount++;
                        looplines.push({ activity: obj.data.source, text: obj.data.tooltip });
                    }
                }
            }
            // Loop Discover Activities JSON
            for (let i = 0; i < flow.length; i++) {
                const act = flow[i];
                if (act.group === "nodes") {
                    activitycount++;
                    const activityname = act.data.id;
                    const activity = {};
                    activity.tag = "none";
                    activity.text = { value: activityname, format: "plain" };
                    activity.displayId = i;
                    activity.displayIdVisible = true;
                    activity.objectType = "activity";
                    activity.position = {
                        top: Math.round(act.position.x * xoffset),
                        // tslint:disable-next-line:object-literal-sort-keys
                        left: Math.round(act.position.y * yoffset),
                        bottom: Math.round(act.position.x * xoffset) + 60 * 2,
                        right: Math.round(act.position.y * yoffset) + 80 * 2,
                    };
                    activity.style = {
                        rounded: true,
                        visibleBorder: true,
                        // tslint:disable-next-line:object-literal-sort-keys
                        pen: {
                            color: "#000000",
                            width: 2,
                        },
                        background: {
                            color: act.data.color,
                        },
                    };
                    const bubbletext = yield this.checkLoopData(activityname, looplines);
                    if (bubbletext !== "") {
                        activity.bubbleText = {
                            text: {
                                value: "Activity Loops:\n" + (yield this.checkLoopData(activityname, looplines)),
                                // tslint:disable-next-line:object-literal-sort-keys
                                format: "plain",
                            },
                            visible: true,
                        };
                        activity.commentary = {
                            showAsHint: true,
                            text: {
                                value: act.data.label + " | " + act.data.tooltip,
                                // tslint:disable-next-line:object-literal-sort-keys
                                format: "plain",
                            },
                        };
                    }
                    objects.push(activity);
                    activityIds.push({ name: activityname, id: i });
                }
            }
            // Loop Discover Lines JSON
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < flow.length; i++) {
                const obj = flow[i];
                if (obj.group === "edges") {
                    linecount++;
                    const source = yield this.checkID(obj.data.source, activityIds);
                    const target = yield this.checkID(obj.data.target, activityIds);
                    // console.log("Link from " + source + " to " + target )
                    if (source !== "undefined" && target !== "undefined") {
                        if (source !== target) {
                            validlinecount++;
                            const line = {};
                            line.text = { value: obj.data.label, format: "plain" };
                            line.sourceObject = { objectDisplayId: source, edge: "right" };
                            line.destObject = { objectDisplayId: target, edge: "left" };
                            line.straight = true;
                            // Nimbus allows just integer width from 1 to 4
                            let nsize = Math.ceil(obj.data.sizeBy * 10);
                            if (nsize < 1) {
                                nsize = 1;
                            }
                            if (nsize > 4) {
                                nsize = 4;
                            }
                            line.style = {
                                // tslint:disable-next-line:object-literal-sort-keys
                                pen: {
                                    color: obj.data.color,
                                    width: nsize,
                                },
                                // tslint:disable-next-line:object-literal-sort-keys
                                background: {
                                    color: obj.data.color,
                                },
                            };
                            line.commentary = {
                                showAsHint: true,
                                text: {
                                    value: "ID: " + obj.data.id + "\n" +
                                        "Size: " + obj.data.sizeBy,
                                    // tslint:disable-next-line:object-literal-sort-keys
                                    format: "plain",
                                },
                            };
                            line.objectType = "line";
                            objects.push(line);
                        }
                    }
                }
            }
            const map = { controlPanel, diagramId, language, objects, revision };
            // tslint:disable-next-line:max-line-length
            logging_1.logger.info("Discover JSON contained | " + activitycount + " Activities | " + linecount + " Lines | " + validlinecount + " valid Lines | Loops " + looplinecount);
            // logger.info("JSON: " + JSON.stringify(map));
            return map;
        });
        // **** helper for checking content
        this.checkID = (name, activityIds) => __awaiter(this, void 0, void 0, function* () {
            const obj = activityIds.filter((value) => value.name === name);
            // console.log(obj[0])
            return obj[0].id;
        });
        this.checkLoopData = (name, looplines) => __awaiter(this, void 0, void 0, function* () {
            const obj = looplines.filter((value) => value.activity === name);
            if (typeof obj !== "undefined" && obj.length > 0) {
                // console.log(name + " | " + obj[0].text);
                return obj[0].text;
            }
            else {
                return "";
            }
        });
        this.folders = new api_1.MapFoldersApi(process.env.NIMBUS + "");
        this.maps = new api_1.MapsApi(process.env.NIMBUS + "");
        this.diagrams = new api_1.DiagramsApi(process.env.NIMBUS + "");
    }
};
DocumentationService = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [DiscoverCache_1.DiscoverCache])
], DocumentationService);
exports.DocumentationService = DocumentationService;
//# sourceMappingURL=documentation.service.js.map