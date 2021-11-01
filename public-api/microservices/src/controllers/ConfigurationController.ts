import { group } from 'console';
import { Response } from 'koa';
import { Param, Body, Get, Post, Put, Delete, HeaderParam, QueryParam, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { DiscoverCache } from '../cache/DiscoverCache';
import { logger } from '../common/logging';
import { ClaimsApi, ClaimsGroup, ClaimsSandbox, Group, GroupsApi } from '../liveapps/authorization/api';
import { Analytics, Automapping, DiscoverConfiguration, FieldFormats, GeneralInformation, InvestigationApplication, Investigations, LandingPage, Message, WhoAmI } from '../models/configuration.model';
import { ConfigurationService } from '../services/configuration.service';

@Service()
@JsonController('/configuration')
export class ConfigurationController {
  
  private configurationService: ConfigurationService;
  private groupsService: GroupsApi;
  private claimsService: ClaimsApi;
  
  constructor (
    protected cache: DiscoverCache
  ){
    this.configurationService = new ConfigurationService(process.env.LIVEAPPS as string, process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string));
    this.groupsService = new GroupsApi(process.env.LIVEAPPS +'/organisation/v1');
    this.claimsService = new ClaimsApi(process.env.LIVEAPPS +'/organisation/v1');
  }

  public static getName = (): string => {
    return 'ConfigurationController';
  }

  private preflightCheck = (token: string, response: Response): boolean | Response => {
    if (!token) {
      response.status = 400;
      return response;
    }
    return true;
  }

  @Get('/')
  async getConfiguration(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< DiscoverConfiguration | Response > {
    logger.debug('Global configuration')
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const partialConfiguration = await Promise.all([
      this.getGeneralConfiguration(token, response),
      this.getLandingPagesConfiguration(token, response),
      this.getMessagesConfiguration(token, response),
      this.getFormatsConfiguration(token, 'ALL', response),
      this.getAutomap(token, response),
      this.getInvestigations(token.replace('Bearer ',''), response),
      this.getAnalytics(token.replace('Bearer ',''), response)
    ]);

    const output = {
      general: partialConfiguration[0],
      landingPage: partialConfiguration[1],
      messages: partialConfiguration[2],
      formats: partialConfiguration[3],
      automap: partialConfiguration[4],
      investigations: partialConfiguration[5],
      analytics: partialConfiguration[6]
    } as DiscoverConfiguration;
    
    return output;
  }

  @Get('/general')
  async getGeneralConfiguration(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< GeneralInformation | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'GENERAL')) as GeneralInformation;
  }

  @Post('/general')
  async postGeneralConfiguration(@HeaderParam("authorization") token: string, @Body() generalInformation: GeneralInformation, @Res() response: Response): Promise< GeneralInformation | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const output = await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'GENERAL', JSON.stringify(generalInformation));
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'GENERAL')) as GeneralInformation;
  }

  @Get('/landingpages')
  async getLandingPagesConfiguration(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< LandingPage | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'LANDINGPAGES')) as LandingPage;
  }

  @Post('/landingpages')
  async postLandingPagesConfiguration(@HeaderParam("authorization") token: string, @Body() landingPage: LandingPage, @Res() response: Response): Promise< LandingPage | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const output = await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'LANDINGPAGES', JSON.stringify(landingPage));
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'LANDINGPAGES')) as LandingPage;
  }

  @Get('/messages')
  async getMessagesConfiguration(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Message[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    
    let generalMessages = JSON.parse(await this.configurationService.getConfiguration('GLOBAL', 'MESSAGES')) as Message[];
    generalMessages = generalMessages.map(el => { return { id: el.id, scope: 'GLOBAL', message: el.message, persistClose: el.persistClose }});
    let subscriptionMessages = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'MESSAGES')) as Message[];
    subscriptionMessages = subscriptionMessages.map(el => { return { id: el.id, scope: 'LOCAL', message: el.message, persistClose: el.persistClose }});
    return [...generalMessages, ...subscriptionMessages ]
  }

  @Post('/messages')
  async postMessagesConfiguration(@HeaderParam("authorization") token: string, @Body() messages: Message[], @Res() response: Response): Promise< Message[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const output = await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'MESSAGES', JSON.stringify(messages));
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'MESSAGES')) as Message[];
  }

  @Get('/formats')
  async getFormatsConfiguration(@HeaderParam("authorization") token: string, @QueryParam('field') field: string, @Res() response: Response): Promise< FieldFormats[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    let formats = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'FORMATS')) as FieldFormats[];
    if (field && field.toUpperCase() != 'ALL'){
      formats = formats.filter((el: FieldFormats) =>  el.fieldName.toUpperCase() === field.toUpperCase());
    }
    return formats;
  }

  @Post('/formats')
  async postFormatsConfiguration(@HeaderParam("authorization") token: string,  @Body() format: FieldFormats[], @Res() response: Response): Promise< FieldFormats[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const output = await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'FORMATS', JSON.stringify(format));
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'FORMATS')) as FieldFormats[];
  }

  @Get('/automap')
  async getAutomap(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Automapping[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'AUTOMAP')) as Automapping[];
  }

  @Post('/automap')
  async postAutomap(@HeaderParam("authorization") token: string, @Body() automap: Automapping[], @Res() response: Response): Promise< Automapping[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    
    const output = await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'AUTOMAP', JSON.stringify(automap));
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'AUTOMAP')) as Automapping[];
  }

  @Get('/investigations')
  async getInvestigations(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Investigations | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'INVESTIGATIONS')) as Investigations;
  }

  @Post('/investigations')
  async postInvestigations(@HeaderParam("authorization") token: string, @Body() investigations: InvestigationApplication[], @Res() response: Response): Promise< InvestigationApplication[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    const currentInvestigations = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'INVESTIGATIONS')) as Investigations;
    currentInvestigations.applications = investigations; 

    const output = await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS', JSON.stringify(currentInvestigations));
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'INVESTIGATIONS')).applications as InvestigationApplication[];
  }

  @Post('/investigations/init')
  async postInvestigationsInit(@HeaderParam("authorization") token: string, @Body() investigations: Investigations, @Res() response: Response): Promise< Investigations | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS', JSON.stringify(investigations));
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'INVESTIGATIONS')) as Investigations;
  }

  @Get('/analytics')
  async getAnalytics(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Analytics | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }
    
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'ANALYTICS')) as Analytics;
  }

  @Post('/analytics')
  async postAnalytics(@HeaderParam("authorization") token: string, @Body() analytics: Analytics, @Res() response: Response): Promise< Analytics | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const output = await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'ANALYTICS', JSON.stringify(analytics));
    return JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'ANALYTICS')) as Analytics;
  }

  @Get('/whoami')
  async getWhoAmI(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< WhoAmI | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const header = { headers: { 'Authorization': token}};

    const claims = (await this.claimsService.getClaims(header)).body;
    const userMembership = claims.sandboxes?.find((el: ClaimsSandbox) => el.type === ClaimsSandbox.TypeEnum.Production)?.groups.map((el: ClaimsGroup) => el.id) || [];
    const discoverGroups = (await this.groupsService.getGroups(0, 100, "contains(name,'Discover')", header)).body;
    const groups = discoverGroups.filter((discoverGroup: Group) => userMembership.includes(discoverGroup.id)).map((group: Group) => group.name);
    
    const output = {
      id: claims.id,
      firstName: claims.firstName,
      lastName: claims.lastName,
      email: claims.email,
      subscriptionId: claims.globalSubcriptionId,
      isUser: groups.includes('Discover Users'),
      isAdmin: groups.includes('Discover Administrators'),
      isAnalyst: groups.includes('Discover Analysts'),
      isResolver: groups.includes('Discover Case Resolvers')
    } as WhoAmI;
    return output;
  }
}