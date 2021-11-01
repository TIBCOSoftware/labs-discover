import { Service } from "typedi";
import { logger } from "../common/logging";
import { Mapdata, Iactivity, Iline, ControlPanel } from "../models/documentation.model";
import { DiscoverCache } from "../cache/DiscoverCache";
import { DiagramModel, DiagramModelLanguage, MapFolderCollection, MapFolderModel, MapFoldersApi, MapsApi, DiagramsApi, MapModel } from "../nimbus/api";

@Service()
export class DocumentationService {

  private folders: MapFoldersApi;
  private maps: MapsApi;
  private diagrams: DiagramsApi;

  constructor (
    private cache: DiscoverCache,
  ) {
    // logger.info('DocumentationService constructor called with values: ');
    // logger.info('    Nimbus: ' + nimbusURL);

    this.folders = new MapFoldersApi(process.env.NIMBUS + "");
    this.maps = new MapsApi(process.env.NIMBUS + "");
    this.diagrams = new DiagramsApi(process.env.NIMBUS + "");
  }

  // *** Public Service Functions

  // Get All available Folders and Structure
  public getFolders = async (token: string, folderid?: number): Promise<MapFolderCollection> => {

    const header = { headers: { "Authorization": token}};
    const resultExport = (await this.folders.getMapFolders(folderid, header)).body;

    return resultExport;
  }

    // Get All available Folders and Structure
    public createFolder = async (token: string, parentfolderId: number, foldername: string): Promise<Mapdata> => {

      const header = { headers: { "Authorization": token}};

      const folderModelData: MapFolderModel = { parentMapFolderId: parentfolderId, name: foldername };
      const resultExport = (await this.folders.createMapFolder(folderModelData, header)).body;

      return resultExport;
    }

  // Export a Variant to the Documentation System
  public exportGraph = async (token: string, FolderId: number, mapname: string, graph: any): Promise<Mapdata> => {

    const header = { headers: { "Authorization": token}};

    const newMap: MapModel = {
      name: mapname,
      mapFolderId: FolderId
    };

    const createExport = (await this.maps.createMap(newMap, header)).body;
    // get createExport.draft?.mapId

    if (createExport.draft) {
      const mapId = createExport.draft.mapId as string;
      const resultExport = await this.formatExport(mapname, mapId, graph);
      // logger.info(" - MAP JSON : " + JSON.stringify(resultExport));

      const diagram: DiagramModel = resultExport;
      const updateExport = (await this.diagrams.updateDiagram(mapId, undefined, undefined, undefined, undefined, undefined, undefined, diagram, header)).body;

      return updateExport;
    }

    return createExport;
  }

  // *** Private Utilities and Functions

  // create from Sportfire and Cytoscape JSON, the new Documentation Graph JSON
  private formatExport = async (mapname: string, diagramId: string, flow: any): Promise<DiagramModel> => {

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

      const language: DiagramModelLanguage = { languageId: 1};

      let activitycount = 0;
      let linecount = 0;
      let validlinecount = 0;
      let looplinecount = 0;
      const objects = [];
      const activityIds = [];
      const looplines = [];

      interface Iactivity {
        [key: string]: any;
      }

      interface Iline {
        [key: string]: any;
      }

      // check for Loop-Lines
      // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < flow.length; i++) {
          const obj = flow[i];
          if (obj.group === "edges") {
            if (obj.data.source === obj.data.target) {
              looplinecount++;

              looplines.push({activity: obj.data.source, text: obj.data.tooltip});
            }
          }
        }

      // Loop Discover Activities JSON
      for (let i = 0; i < flow.length; i++) {
        const act = flow[i];
        if (act.group === "nodes") {
          activitycount++;

          const activityname = act.data.id;

          const activity: Iactivity = {};
          activity.tag = "none";
          activity.text = { value: activityname, format: "plain"};
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

          const bubbletext = await this.checkLoopData(activityname, looplines);
          if (bubbletext !== "") {

            activity.bubbleText = {
              text: {
                value: "Activity Loops:\n" + await this.checkLoopData(activityname, looplines),
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
          activityIds.push({ name: activityname, id: i});
        }
      }

      // Loop Discover Lines JSON
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < flow.length; i++) {
        const obj = flow[i];
        if (obj.group === "edges") {
          linecount++;
          const source = await this.checkID(obj.data.source, activityIds);
          const target = await this.checkID(obj.data.target, activityIds);
          // console.log("Link from " + source + " to " + target )

          if (source !== "undefined" && target !== "undefined") {
            if (source !== target) {
              validlinecount++;

              const line: Iline = {};

              line.text = { value: obj.data.label, format: "plain"};
              line.sourceObject = { objectDisplayId: source, edge: "right" };
              line.destObject = { objectDisplayId: target, edge: "left" };
              line.straight = true;

              // Nimbus allows just integer width from 1 to 4
              let nsize =  Math.ceil(obj.data.sizeBy * 10);
              if (nsize < 1) { nsize = 1; }
              if (nsize > 4) { nsize = 4; }

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
      logger.info("Discover JSON contained | " + activitycount + " Activities | " + linecount + " Lines | " + validlinecount + " valid Lines | Loops " + looplinecount);
      // logger.info("JSON: " + JSON.stringify(map));
      return map as DiagramModel;
  }

  // **** helper for checking content

  private checkID = async (name: any, activityIds: any[]): Promise<any> => {
    const obj = activityIds.filter( (value: any): boolean => value.name === name );
    // console.log(obj[0])
    return obj[0].id;
  }

  private checkLoopData = async (name: any, looplines: any[]): Promise<any> => {
    const obj = looplines.filter( (value: any): boolean => value.activity === name );
    if (typeof obj !== "undefined" && obj.length > 0) {
      // console.log(name + " | " + obj[0].text);
      return obj[0].text;
    } else {
      return "";
    }
  }

}