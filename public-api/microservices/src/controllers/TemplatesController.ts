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
  
  constructor (
    protected templatesService: TemplatesService,
    protected libraryService: LibraryService
  ){}

  public static getName = (): string => {
    return 'TemplatesController';
  }

  @Get('/templates')
  async getTemplates(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Template[] | Response > {

    return this.templatesService.getTemplates(token.replace('Bearer ',''));
  }

  @Post('/templates')
  async postTemplate(@HeaderParam("authorization")token: string, @Body({ required: true }) request: TemplateRequest, @Res() response: Response) {
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
    const templateDetail = await this.templatesService.getTemplate(token.replace('Bearer ',''), id);
    logger.debug("Template name: " + templateDetail.name);
    return templateDetail
  }

  @Put('/templates/:id')
  putTemplate(@HeaderParam("authorization")token: string, @Param('id') id: string, @Body({ required: true }) template: Template, @Res() response: Response) {
    return this.templatesService.updateTemplate(token.replace('Bearer ',''), id, template);
  }

  @Delete('/templates/:id')
  deleteTemplate(@HeaderParam("authorization")token: string, @Param('id') id: string, @Res() response: Response) {
    return this.templatesService.deleteTemplate(token.replace('Bearer ',''), id);
  }

  @Get('/items')
  getLibrary(@HeaderParam("authorization")token: string, @QueryParam('type') type: string, @Res() response: Response) {
    if (!type) {
      type = 'dxp';
    }
    
    type = 'spotfire.' + type;
    return this.libraryService.getItems(token.replace('Bearer ',''), type);
  }
}