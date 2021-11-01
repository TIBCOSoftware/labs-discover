import { Response } from 'koa';
import { Param, Body, Get, Post, Put, Delete, HeaderParam, QueryParam, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { logger } from '../common/logging';
import { GeneralInformation } from '../models/configuration.model';
import { Template, TemplateRequest } from '../models/templates.model';
import { ConfigurationService } from '../services/configuration.service';
import { LibraryService } from '../services/library.service';
import { TemplatesService } from '../services/templates.service';

@Service()
@JsonController('/admin')
export class AdministrationController {
  
  private templatesService: TemplatesService;
  private libraryService: LibraryService;
  private configurationService: ConfigurationService;
  
  constructor (){
    this.templatesService = new TemplatesService(process.env.LIVEAPPS as string, process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string));
    this.libraryService = new LibraryService(process.env.LIVEAPPS as string, process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string));
    this.configurationService = new ConfigurationService(process.env.LIVEAPPS as string, process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string));
    // this.templatesService.initActions();
  }

  public static getName = (): string => {
    return 'AdminController';
  }

  private preflightCheck = (token: string, response: Response): boolean | Response => {
    if (!token) {
      response.status = 400;
      return response;
    }
    return true;
  }

  // @Get('/templates')
  // async getTemplates(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Template[] | Response > {
  //   const check = this.preflightCheck(token, response);
  //   if (check !== true) {
  //     return check as Response;
  //   }

  //   return this.templatesService.getTemplates(token.replace('Bearer ',''));
  // }

  @Post('/init')
  async postTemplate(@HeaderParam("authorization")token: string, @Body({ required: true }) request: GeneralInformation, @Res() response: Response) {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check;
    }

    return
  }


}