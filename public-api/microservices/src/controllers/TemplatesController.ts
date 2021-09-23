import { Response } from 'koa';
import { Param, Body, Get, Post, Put, Delete, HeaderParam, QueryParam, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { logger } from '../common/logging';
import { Template, TemplateRequest } from '../models/templates.model';
import { LibraryService } from '../services/library.service';
import { TemplatesService } from '../services/templates.service';

@Service()
@JsonController('/visualisation')
export class TemplatesController {
  
  private templatesService: TemplatesService;
  private libraryService: LibraryService;
  
  constructor (){
    this.templatesService = new TemplatesService(process.env.LIVEAPPS as string, process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string));
    this.libraryService = new LibraryService(process.env.LIVEAPPS as string, process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string));
    // this.templatesService.initActions();
  }

  public static getName = (): string => {
    return 'TemplatesController';
  }

  private preflightCheck = (token: string, response: Response): boolean | Response => {
    if (!token) {
      response.status = 400;
      return response;
    }
    return true;
  }

  @Get('/templates')
  async getTemplates(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Template[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    return this.templatesService.getTemplates(token.replace('Bearer ',''));
  }

  @Post('/templates')
  async postTemplate(@HeaderParam("authorization")token: string, @Body({ required: true }) request: TemplateRequest, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    // The template will use a new spotfire DXP.
    if (request.visualisation){
      const item = await this.libraryService.copyItem(
        token.replace('Bearer ',''), 
        request.visualisation.sourceId, 
        request.template.spotfireLocation.slice(request.template.spotfireLocation.lastIndexOf('/') + 1),
        request.visualisation.destinationFolderId
      );  
    }
    return this.templatesService.createTemplate(token.replace('Bearer ',''), request.template);
  }

  @Get('/templates/:id')
  public async getTemplate(@HeaderParam("authorization") token: string, @Param('id') id: string, @Res() response: Response): Promise<Template | Response> {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    const templateDetail = await this.templatesService.getTemplate(token.replace('Bearer ',''), id);
    logger.debug("Template name: " + templateDetail.name);
    return templateDetail
  }

  @Put('/templates/:id')
  putTemplate(@HeaderParam("authorization")token: string, @Param('id') id: string, @Body({ required: true }) template: Template, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    return this.templatesService.updateTemplate(token.replace('Bearer ',''), id, template);
  }

  @Delete('/templates/:id')
  deleteTemplate(@HeaderParam("authorization")token: string, @Param('id') id: string, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    return this.templatesService.deleteTemplate(token.replace('Bearer ',''), id);
  }

  @Get('/items')
  getLibrary(@HeaderParam("authorization")token: string, @QueryParam('type') type: string, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    if (!type) {
      type = 'dxp';
    }
    
    type = 'spotfire.' + type;
    return this.libraryService.getItems(token.replace('Bearer ',''), type);
  }
}