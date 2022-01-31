import { Response } from "koa";
import { Param, Body, Get, Post, HeaderParam, JsonController, Res } from "routing-controllers";
import { Service } from "typedi";
import { logger } from "../common/logging";
import { Mapdata, FolderModel } from "../models/documentation.model";
import { DocumentationService } from "../services/documentation.service";
import { DiscoverCache } from "../cache/DiscoverCache";
import { MapFolderCollection } from "../api/nimbus/api";

@Service()
@JsonController("/documentation")
export class DocumentationController {

  constructor(
    protected documentationService: DocumentationService,
    protected cache: DiscoverCache
  ) {}

  public static getName = (): string => {
    return "DocumentationController";
  }

  // *** REST Operation - get all Documentation Service Folders
  @Get("/folders")
  async getrootfolders(@HeaderParam("authorization") token: string, @Res() response: Response): Promise<MapFolderCollection|Response> {
    logger.info("Documentation Service - " + "Get Folders");

    return this.documentationService.getFolders(token, 0);
  }

  @Get("/folders/:folderId")
  async getfolders(@HeaderParam("authorization") token: string, @Res() response: Response, @Param("folderId") folderId: number): Promise<MapFolderCollection|Response> {
    logger.info("Documentation Service - " + "Get Folders");

    return this.documentationService.getFolders(token, folderId);
  }

  // *** REST Operation - create one Documentation Service Folder
  @Post("/folder")
  async folders(@HeaderParam("authorization") token: string, @Body() foldermodel: FolderModel, @Res() response: Response): Promise<Mapdata | Response> {
    logger.info("Documentation Service - " + "create folder called");

    return this.documentationService.createFolder(token, foldermodel.parentFolderId, foldermodel.name);
  }

  // *** REST Operation - create one Graph in Documentation Service Folder with specific Graph Name
  @Post("/exportGraph/:folderId/:graphname")
  async exportGraph(@HeaderParam("authorization") token: string, @Body() graph: any, @Param("graphname") graphname: string, @Param("folderId") folderId: number, @Res() response: Response): Promise<Mapdata | Response> {
    logger.info("Documentation Service - " + "Export called");

    logger.info(" - Folder ID  : " + folderId);
    logger.info(" - Graph Name : " + graphname);
    // logger.info(" - Graph      : " + graph.controlPanel.title);
    // logger.info(" - Graph JSON : " + JSON.stringify(graph));
    return this.documentationService.exportGraph(token, folderId, graphname, graph);
  }

}