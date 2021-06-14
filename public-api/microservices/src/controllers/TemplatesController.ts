import { Response } from 'koa';
import { Param, Body, Get, Post, Put, Delete, HeaderParam, QueryParam, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { logger } from '../common/logging';
import { Template } from '../models/templates.model';
import { TemplatesService } from '../services/templates.service';

@Service()
@JsonController('/visualisation')
export class TemplatesController {
  
  private templatesService: TemplatesService
  
  constructor (){
    this.templatesService = new TemplatesService(process.env.LIVEAPPS as string, process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string));
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
  async postTemplate(@HeaderParam("authorization")token: string, @Body({ required: true }) template: Template, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    return this.templatesService.createTemplate(token.replace('Bearer ',''), template);
  }

  @Get('/templates/:id')
  public async getTemplate(@HeaderParam("authorization") token: string, @Param('id') id: number, @Res() response: Response): Promise<Template | Response> {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    const templateDetail = await this.templatesService.getTemplate(token.replace('Bearer ',''), id);
    logger.debug("Template name: " + templateDetail.name);
    return templateDetail
  }

  @Put('/templates/:id')
  putTemplate(@HeaderParam("authorization")token: string, @Param('id') id: number, @Body({ required: true }) template: Template, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    return this.templatesService.updateTemplate(token.replace('Bearer ',''), id, template);
  }

  @Delete('/templates/:id')
  deleteTemplate(@HeaderParam("authorization")token: string, @Param('id') id: number, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }
    return this.templatesService.deleteTemplate(token.replace('Bearer ',''), id);
  }
}