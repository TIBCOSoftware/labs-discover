import { Response } from "koa";
import { Param, Body, Get, Post, QueryParam, Put, Delete, HeaderParam, JsonController, Res } from "routing-controllers";
import { Service } from "typedi";
import { logger } from "../common/logging";
import { Mapdata, FolderModel, Iactivity, Iline, ControlPanel } from "../models/documentation.model";
import { DocumentationService } from "../services/documentation.service";
import { DiscoverCache } from "../cache/DiscoverCache";
import { MapFolderCollection } from "../nimbus/api";
import { IsOptional } from "class-validator";

@Service()
@JsonController("/documentation")
export class DocumentationController {

  constructor(
      protected documentationService: DocumentationService,
      protected cache: DiscoverCache,
    ) {
  }

  private preflightCheck = (token: string, response: Response): boolean | Response => {
    if (!token) {
      response.status = 401;
      return response;
    }
    return true;
  }

  public static getName = (): string => {
    return "DocumentationController";
  }

  // *** REST Operation - get all Documentation Service Folders
  @Get("/folders")
  async getrootfolders(@HeaderParam("authorization") token: string, @Res() response: Response): Promise<MapFolderCollection|Response> {
    logger.info("Documentation Service - " + "Get Folders");
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    return this.documentationService.getFolders(token, undefined);
  }

  @Get("/folders/:folderId")
  async getfolders(@HeaderParam("authorization") token: string, @Res() response: Response, @Param("folderId") folderId: number): Promise<MapFolderCollection|Response> {
    logger.info("Documentation Service - " + "Get Folders");
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    return this.documentationService.getFolders(token, folderId);
  }

  // *** REST Operation - create one Documentation Service Folder
  @Post("/folder")
  async folders(@HeaderParam("authorization") token: string, @Body() foldermodel: FolderModel, @Res() response: Response): Promise<Mapdata | Response> {
    logger.info("Documentation Service - " + "create folder called");
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    return this.documentationService.createFolder(token, foldermodel.parentFolderId, foldermodel.name);
  }

  // *** REST Operation - create one Graph in Documentation Service Folder with specific Graph Name
  @Post("/exportGraph/:folderId/:graphname")
  async exportGraph(@HeaderParam("authorization") token: string, @Body() graph: any, @Param("graphname") graphname: string, @Param("folderId") folderId: number, @Res() response: Response): Promise<Mapdata | Response> {
    logger.info("Documentation Service - " + "Export called");
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    logger.info(" - Folder ID  : " + folderId);
    logger.info(" - Graph Name : " + graphname);
    // logger.info(" - Graph      : " + graph.controlPanel.title);
    // logger.info(" - Graph JSON : " + JSON.stringify(graph));
    return this.documentationService.exportGraph(token, folderId, graphname, graph);
  }

}