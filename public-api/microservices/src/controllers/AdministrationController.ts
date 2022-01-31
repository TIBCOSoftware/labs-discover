import { Response } from 'koa';
import { Body, Get, Post, Put, Delete, HeaderParam, QueryParam, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { logger } from '../common/logging';
import { GeneralInformation } from '../models/configuration.model';
import { ConfigurationService } from '../services/configuration.service';
import { LibraryService } from '../services/library.service';
import { TemplatesService } from '../services/templates.service';

@Service()
@JsonController('/admin')
export class AdministrationController {
  
  constructor (
    protected configurationService: ConfigurationService,
    protected libraryService: LibraryService,
    protected templateService: TemplatesService
    ){}

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