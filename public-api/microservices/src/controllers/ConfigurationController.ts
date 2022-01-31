import { Response } from 'koa';
import { File } from 'koa-multer';
import { Param, Body, Get, Post, HeaderParam, QueryParam, JsonController, Res, UploadedFile, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { AssetsStorageOperationsApi, HttpError, RequestDetailedFile, RequestFile } from '../api/backend/api';
import { DiscoverCache } from '../cache/DiscoverCache';
import { logger } from '../common/logging';
import { ClaimsApi, ClaimsGroup, ClaimsSandbox, Group, GroupsApi } from '../api/liveapps/authorization/api';
import { Analytics, Automapping, Connection, DiscoverConfiguration, FieldFormats, GeneralInformation, InvestigationApplication, Investigations, LandingPage, LandingPageUploadResponse, Message, TenantInformation, WhoAmI } from '../models/configuration.model';
import { ConfigurationService } from '../services/configuration.service';
import axios from "axios";
import { AccountApi, TenantDetails } from '../api/tsc/api';

@Service()
@JsonController('/configuration')
export class ConfigurationController {
  
  constructor (
    protected cache: DiscoverCache,
    protected account: AccountApi,
    protected configurationService: ConfigurationService,
    protected groupsService: GroupsApi,
    protected claimsService: ClaimsApi,
    protected assetsStorage: AssetsStorageOperationsApi
  ){}

  public static getName = (): string => {
    return 'ConfigurationController';
  }

  @Get('/')
  async getConfiguration(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< DiscoverConfiguration | Response > {
    logger.debug('getConfiguration started for token: ' + token);

    const partialConfiguration = await Promise.all([
      this.getGeneralConfiguration(token, response),
      this.getLandingPagesConfiguration(token, response),
      this.getMessagesConfiguration(token, response),
      this.getFormatsConfiguration(token, 'ALL', response),
      this.getAutomap(token, response),
      this.getInvestigations(token.replace('Bearer ',''), response),
      this.getAnalytics(token.replace('Bearer ',''), response),
      this.getConnections(token.replace('Bearer ', ''), response)
    ]);

    const output = {
      general: partialConfiguration[0],
      landingPage: partialConfiguration[1],
      messages: partialConfiguration[2],
      formats: partialConfiguration[3],
      automap: partialConfiguration[4],
      investigations: partialConfiguration[5],
      analytics: partialConfiguration[6],
      connections: partialConfiguration[7]
    } as DiscoverConfiguration;
    
    logger.debug('getConfiguration ended for token: ' + token);
    return output;
  }

  @Get('/general')
  async getGeneralConfiguration(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< GeneralInformation | Response > {
    logger.debug('getGeneralConfiguration started for token: ' + token);
    
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'GENERAL')) as GeneralInformation;
    logger.debug('getGeneralConfiguration ended for token: ' + token);
    return output;
  }

  @Post('/general')
  async postGeneralConfiguration(@HeaderParam("authorization") token: string, @Body() generalInformation: GeneralInformation, @Res() response: Response): Promise< GeneralInformation | Response > {
    logger.debug('postGeneralConfiguration started for token: ' + token);

    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'GENERAL', JSON.stringify(generalInformation));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'GENERAL')) as GeneralInformation;

    logger.debug('postGeneralConfiguration ended for token: ' + token);
    return output;
  }

  @Get('/landingpages')
  async getLandingPagesConfiguration(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< LandingPage | Response > {
    logger.debug('getLandingPagesConfiguration started for token: ' + token);

    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'LANDINGPAGES')) as LandingPage;
    logger.debug('getLandingPagesConfiguration ended for token: ' + token);
    return output;
  }

  @Post('/landingpages')
  async postLandingPagesConfiguration(@HeaderParam("authorization") token: string, @Body() landingPage: LandingPage, @Res() response: Response): Promise< LandingPage | Response > {
    logger.debug('postLandingPagesConfiguration started for token: ' + token);

    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'LANDINGPAGES', JSON.stringify(landingPage));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'LANDINGPAGES')) as LandingPage;
    logger.debug('postLandingPagesConfiguration ended for token: ' + token);
    return output;
  }

  @Get('/messages')
  async getMessagesConfiguration(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Message[] | Response > {
    logger.debug('getMessagesConfiguration started for token: ' + token);
    
    let generalMessages = JSON.parse(await this.configurationService.getConfiguration('GLOBAL', 'MESSAGES')) as Message[];
    generalMessages = generalMessages.map(el => { return { id: el.id, scope: 'GLOBAL', message: el.message, persistClose: el.persistClose }});
    let subscriptionMessages = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'MESSAGES')) as Message[];
    if (subscriptionMessages != null) {
      subscriptionMessages = subscriptionMessages.map(el => { return { id: el.id, scope: 'LOCAL', message: el.message, persistClose: el.persistClose }});
    } else {
      subscriptionMessages = [];
    }
    logger.debug('getMessagesConfiguration ended for token: ' + token);
    return [...generalMessages, ...subscriptionMessages ]
  }

  @Post('/messages')
  async postMessagesConfiguration(@HeaderParam("authorization") token: string, @Body() messages: Message[], @Res() response: Response): Promise< Message[] | Response > {
    logger.debug('getMessagesConfiguration started for token: ' + token);

    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'MESSAGES', JSON.stringify(messages));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'MESSAGES')) as Message[];
    logger.debug('postMessagesConfiguration ended for token: ' + token);
    return output;
  }

  @Get('/formats')
  async getFormatsConfiguration(@HeaderParam("authorization") token: string, @QueryParam('field') field: string, @Res() response: Response): Promise< FieldFormats[] | Response > {
    logger.debug('getFormatsConfiguration started for token: ' + token);

    let formats = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'FORMATS')) as FieldFormats[];
    if (field && field.toUpperCase() != 'ALL'){
      formats = formats.filter((el: FieldFormats) =>  el.fieldName.toUpperCase() === field.toUpperCase());
    }
    logger.debug('getFormatsConfiguration ended for token: ' + token);
    return formats;
  }

  @Post('/formats')
  async postFormatsConfiguration(@HeaderParam("authorization") token: string,  @Body() format: FieldFormats[], @Res() response: Response): Promise< FieldFormats[] | Response > {
    logger.debug('postFormatsConfiguration started for token: ' + token);

    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'FORMATS', JSON.stringify(format));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'FORMATS')) as FieldFormats[];
    logger.debug('postFormatsConfiguration ended for token: ' + token);
    return output;
  }

  @Get('/automap')
  async getAutomap(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Automapping[] | Response > {
    logger.debug('getAutomap started for token: ' + token);
    
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'AUTOMAP')) as Automapping[];
    logger.debug('getAutomap ended for token: ' + token);
    return output;
  }

  @Post('/automap')
  async postAutomap(@HeaderParam("authorization") token: string, @Body() automap: Automapping[], @Res() response: Response): Promise< Automapping[] | Response > {
    logger.debug('postAutomap started for token: ' + token);
    
    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'AUTOMAP', JSON.stringify(automap));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'AUTOMAP')) as Automapping[];
    logger.debug('postAutomap ended for token: ' + token);
    return output;
  }

  @Get('/investigations')
  async getInvestigations(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Investigations | Response > {
    logger.debug('getInvestigations started for token: ' + token);
    
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'INVESTIGATIONS')) as Investigations;
    logger.debug('getInvestigations ended for token: ' + token);
    return output;
  }

  @Post('/investigations')
  async postInvestigations(@HeaderParam("authorization") token: string, @Body() investigations: InvestigationApplication[], @Res() response: Response): Promise< InvestigationApplication[] | Response > {
    logger.debug('postInvestigations started for token: ' + token);
    const currentInvestigations = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'INVESTIGATIONS')) as Investigations;
    currentInvestigations.applications = investigations; 

    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS', JSON.stringify(currentInvestigations));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'INVESTIGATIONS')).applications as InvestigationApplication[];
    logger.debug('postInvestigations ended for token: ' + token);
    return output;
  }

  @Post('/investigations/init')
  async postInvestigationsInit(@HeaderParam("authorization") token: string, @Body() investigations: Investigations, @Res() response: Response): Promise< Investigations | Response > {
    logger.debug('postInvestigationsInit started for token: ' + token);

    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'INVESTIGATIONS', JSON.stringify(investigations));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'INVESTIGATIONS')) as Investigations;
    logger.debug('postInvestigationsInit ended for token: ' + token);
    return output;
  }

  @Get('/analytics')
  async getAnalytics(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Analytics | Response > {
    logger.debug('getAnalytics started for token: ' + token);
    
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'ANALYTICS')) as Analytics;
    logger.debug('getAnalytics ended for token: ' + token);
    return output;
  }

  @Post('/analytics')
  async postAnalytics(@HeaderParam("authorization") token: string, @Body() analytics: Analytics, @Res() response: Response): Promise< Analytics | Response > {
    logger.debug('postAnalytics started for token: ' + token);

    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'ANALYTICS', JSON.stringify(analytics));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'ANALYTICS')) as Analytics;
    logger.debug('postAnalytics ended for token: ' + token);
    return output;
  }

  @Get('/connections')
  async getConnections(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< Connection[] | Response > {
    logger.debug('getConnections started for token: ' + token);
    const redisData = await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'CONNECTIONS');
    let output: Connection[] = [];
    if (redisData) {
      output = JSON.parse(redisData) as Connection[];        
    }
    logger.debug('getConnections ended for token: ' + token);
    return output;
  }

  @Post('/connections')
  async postConnections(@HeaderParam("authorization") token: string, @Body() connections: Connection[], @Res() response: Response): Promise< Connection[] | Response > {
    logger.debug('postConnections started for token: ' + token);
    
    await this.configurationService.postConfiguration(token.replace('Bearer ', ''), 'CONNECTIONS', JSON.stringify(connections));
    const output = JSON.parse(await this.configurationService.getConfiguration(token.replace('Bearer ',''), 'CONNECTIONS')) as Connection[];
    logger.debug('postConnections ended for token: ' + token);
    return output;
  }

  @Get('/whoami')
  async getWhoAmI(@HeaderParam("authorization") token: string, @Res() response: Response): Promise< WhoAmI | Response > {
    logger.debug('getWhoAmI started for token: ' + token);

    const header = { headers: { 'Authorization': token}};

    const claims = (await this.claimsService.getClaims(header)).body;
    const userMembership = claims.sandboxes?.find((el: ClaimsSandbox) => el.type === ClaimsSandbox.TypeEnum.Production)?.groups.map((el: ClaimsGroup) => el.id) || [];
    const discoverGroups = (await this.groupsService.getGroups(0, 100, "contains(name,'Discover')", header)).body;
    const groups = discoverGroups.filter((discoverGroup: Group) => userMembership.includes(discoverGroup.id)).map((group: Group) => group.name);

    const account = (await this.account.getAccountInfo(header).catch(
      (reason: HttpError) => {
        logger.error('StatusCode: ' + reason.statusCode + ' StatusBody: ' + reason.body);
        return {body: []};
      }
    )).body[0];

    const output = {
      id: claims.id,
      firstName: claims.firstName,
      lastName: claims.lastName,
      email: claims.email,
      subscriptionId: claims.globalSubcriptionId,
      isUser: groups.includes('Discover Users'),
      isAdmin: groups.includes('Discover Administrators'),
      isAnalyst: groups.includes('Discover Analysts'),
      isResolver: groups.includes('Discover Case Resolvers'),
      tenants: account ? account.tenantDetails?.map((tenant: TenantDetails) => { return {id: tenant.tenantId,  roles: tenant.tenantRoleIds }}) : {}
    } as WhoAmI;

    logger.debug('getWhoAmI ended for token: ' + token);
    return output;
  }

  @Post('/assets')
  public async uploadResource(@HeaderParam("authorization") token: string, @UploadedFile('file') fileUpload: File, @Res() response: Response): Promise< LandingPageUploadResponse | Response > {
    logger.debug('uploadResource started for token: ' + token + ' - File: ' + fileUpload.filename);

    const orgId = await this.cache.getOrgId(token.replace('Bearer ', '' ));

    const file = {
      value: fileUpload.buffer,
      options: {
        filename: fileUpload.originalname
      }
    } as RequestDetailedFile;
  
    const callOutput = await this.assetsStorage.postRouteFile1(orgId, file);
    const output = { path: callOutput.body.file } as LandingPageUploadResponse;
    logger.debug('uploadResource ended for token: ' + token + ' - File: ' + fileUpload.filename);
    return output;
  }

  @Get('/assets/:name')
  public async getResource(@HeaderParam("authorization") token: string, @Param('name') name: string, @Res() response: any) {
    logger.debug('getResource started for token: ' + token + ' - File: ' + name);

    const orgId = await this.cache.getOrgId(token.replace('Bearer ', '' ));

    const newUrl = 'https://discover.labs.tibcocloud.com/uiassets/download/' + orgId + '/' + name;

    const resourceCall = await axios.get(newUrl, {responseType: 'arraybuffer'});   
    let buffer = Buffer.from(resourceCall.data, 'binary');
    response.type = 'application/octet-stream';
    response.body = buffer;

    logger.debug('getResource ended for token: ' + token + ' - File: ' + name);
    return response;
  }
}