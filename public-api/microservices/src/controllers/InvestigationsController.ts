import { IncomingMessage } from 'http';
import { Response } from 'koa';
import { Param, Body, Get, Post, Put, Delete, HeaderParam, QueryParam, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { DiscoverCache } from '../cache/DiscoverCache';
import { logger } from '../common/logging';
import { ClaimsApi, ClaimsSandbox, User, UsersApi } from '../api/liveapps/authorization/api';
import { CasesApi, GetCaseResponseItem, GetTypeResponseItem, GetTypeResponseItemAttribute, GetTypeResponseItemCreator, GetTypeResponseItemState, HttpError, TypesApi } from '../api/liveapps/casemanagement/api';
import { CaseAction, CaseActionsApi } from '../api/liveapps/pageflow/api';
import { ProcessDetails, ProcessesApi } from '../api/liveapps/processmanagement/api';
import { InvestigationApplication, InvestigationField, Investigations, InvestigationState } from '../models/configuration.model';
import { Application, InvestigationActions, InvestigationApplicationDefinition, InvestigationCreateRequest, InvestigationCreateResponse, InvestigationDetails, InvestigationMetadata, InvestigationTrigger } from '../models/investigation.model';
import { ConfigurationApi } from '../api/discover/api';

@Service()
@JsonController('/investigation')
export class InvestigationController {
  private users: User[] = [];

  constructor (
    protected cache: DiscoverCache,
    protected claimsService: ClaimsApi,
    protected casesService: CasesApi,
    protected typesService: TypesApi,
    protected usersService: UsersApi,
    protected actionsService: CaseActionsApi,
    protected processService: ProcessesApi,
    protected configurationService: ConfigurationApi
  ){}

  public static getName = (): string => {
    return 'InvestigationController';
  }

  @Get('/applications')
  async getAllApplications(@HeaderParam("authorization") token: string, @Res() response: Response): Promise<Application[] | Response > {
    logger.debug('getAllApplications started for token: ' + token);

    const header = { headers: { 'Authorization': token}};
    const sandboxId = (await this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
    const typesDetails = (await this.typesService.getTypes(sandboxId, 'b', undefined, '0', '100', undefined, header)).body;
    const output = typesDetails.map((app: GetTypeResponseItem) => { return { label: app.applicationName, id: app.applicationId } as Application;});

    logger.debug('getAllApplications ended for token: ' + token);
    return output;
  }

  @Get('/:appId/definition')
  async getApplicationDefinition(@HeaderParam("authorization") token: string, @Param('appId') appId: string, @Param('appId') investigationId: string, @Res() response: Response): Promise<InvestigationApplicationDefinition | Response > {
    logger.debug('getApplicationDefinition started for token: ' + token + ' - appId: ' + appId);

    const header = { headers: { 'Authorization': token}};
    const sandboxId = (await this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
    const select = 'b,a,sa,s,js,c,ac'; 
    const filter = 'isCase eq TRUE and applicationId eq ' + appId;

    const type = (await this.typesService.getTypes(sandboxId, select, filter, undefined, '1000', undefined, header)).body[0];

    const fields = this.createFields(type.attributes as GetTypeResponseItemAttribute[], type.jsonSchema);
    const creators = this.createTriggers(type.creators as GetTypeResponseItemCreator[], type.applicationInternalName as string);
    const states = type.states?.map((state: GetTypeResponseItemState) => { return {name: state.label, color: '', icon: ''} as InvestigationState}) as InvestigationState[]; 

    logger.debug('getApplicationDefinition ended for token: ' + token + ' - appId: ' + appId);
    return {fields, creators, states};
  }

  @Get('/:appId')
  async getInvestigationsDetails(@HeaderParam("authorization") token: string, @Param('appId') investigationId: string, @Res() response: Response): Promise< InvestigationDetails[] | Response > {
    logger.debug('getInvestigationsDetails started for token: ' + token + ' - investigationId: ' + investigationId);
    const header = { headers: { 'Authorization': token}};
    const sandboxId = (await this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
    const caseDetails = (await this.casesService.getCases(sandboxId, 'applicationId eq ' + investigationId + ' and typeId eq 1 and purgeable eq FALSE', 'cr,uc,m,s', '0', '1000', undefined, undefined, undefined, header).catch(
      (error: HttpError) => {
        logger.error('Error: ');
        logger.error(error.body);
        return { body: []};
      }
    )).body;
    
    const output = Promise.all(caseDetails.map(async (el: GetCaseResponseItem) => {
      let element: InvestigationDetails = {
        id: el.caseReference || '',
        data: JSON.parse(el.untaggedCasedata as string),
        metadata: [
          {
            name: 'createdBy',
            value: await this.getUsername(el.metadata?.createdBy, header)
          },
          { 
            name: 'creationTimestamp',
            value: el.metadata?.creationTimestamp
          },
          { 
            name: 'modifiedBy',
            value: await this.getUsername(el.metadata?.modifiedBy, header)
          },
          { 
            name: 'modificationTimestamp',
            value: el.metadata?.modificationTimestamp
          }
        ]
      }
      return element;
    }));
    
    logger.debug('getInvestigationsDetails ended for token: ' + token + ' - investigationId: ' + investigationId);
    return output;
  }

  private getUsername = async (id: string | undefined, header: any): Promise<string> => {
    logger.debug('getUsername started for id: ' + id);
    if (!id) {
      return '';
    }
    let user = this.users.filter((el: User) => el.id === id)[0];
    if (!user){
      const userDetails = (await this.usersService.getUser(id, header).catch(
        (e: any) => {
          if (e instanceof HttpError){
            e.body
            logger.debug('Error: ' + e.body.errorMsg );
          }
          return {body: {firstName: 'Unknown', lastName: 'user'} as User, response: {} as IncomingMessage} ;
        }
      ));      
      user = userDetails.body;
      
      if (user.id){
        this.users.push(user);
      }
    }
    logger.debug('getUsername ended for id: ' + id);
    return user.firstName + ' ' + user.lastName;
  }

  @Get('/:appId/:investigationId/:state/actions')
  async getActionsForInvestigation(@HeaderParam("authorization") token: string, @Param('appId') appId: string, @Param('investigationId') investigationId: string, @Param('state') state: string, @Res() response: Response): Promise<InvestigationActions[] | Response> {
    logger.debug('getActionsForInvestigation started for token: ' + token + ' - appId: ' + appId + ' - investigationId: ' + investigationId);

    const header = { headers: { 'Authorization': token}};
    const claims = (await this.claimsService.getClaims(header)).body;
    const sandboxId = claims.sandboxes?.filter((sandbox:ClaimsSandbox) => sandbox.type === ClaimsSandbox.TypeEnum.Production)[0].id as string;
    const filter = 'applicationId eq ' + appId + ' and caseType eq 1 and caseState eq ' + state + ' and caseRef eq ' + investigationId;
    const actions = (await this.actionsService.listCaseActions(sandboxId, filter, header)).body;
    const investigationActions = actions.
      filter((action: CaseAction) => !action.label.startsWith('$')).
      map((action: CaseAction) => {
        const formData = [
          sandboxId, 
          investigationId,
          action.id,
          action.name,
          action.label,
          action.version,
          action.applicationId,
          action.applicationName,
          action.activityName
        ]            
        return {id: action.id, label: action.label, formData:  formData.join(':')}});
    logger.debug('getActionsForInvestigation ended for token: ' + token + ' - appId: ' + appId + ' - investigationId: ' + investigationId);
    return investigationActions;
  }

  @Post('/:appId/:creatorId/start')
  async postStartCaseForInvestigation(@HeaderParam('authorization') token: string, @Param('appId') appId: string, @Param('creatorId') creatorId: string, @Body() requestBody: InvestigationCreateRequest, @Res() response: Response): Promise<InvestigationCreateResponse | Response> {
    logger.debug('postStartCaseForInvestigation started for token: ' + token + ' - appId: ' + appId + ' - creatorId: ' + creatorId);

    const header = { headers: { 'Authorization': token}};
    const sandboxId = (await this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
    const select = 'b,c'; 
    const filter = 'isCase eq TRUE and applicationId eq ' + appId;

    const body = (await this.typesService.getTypes(sandboxId, select, filter, undefined, '1000', undefined, header)).body[0];
    const creatorSchema = body.creators?.filter((element: GetTypeResponseItemCreator) => element.id === creatorId)[0].jsonSchema as any;
    const properties = creatorSchema.definitions[body.applicationInternalName as string].properties;
    const creatorBody= {} as any;

    if (properties) {
      const header = { headers: { 'Authorization': token}};
      const triggerMapping = ((await this.configurationService.getInvestigations(header)).body as Investigations).applications.filter(
        (element: InvestigationApplication) => element.applicationId === appId
      )[0].creatorData;

      // Add fixed fields
      triggerMapping.push({ label: "analysisId", field: "AnalysisId"});
      triggerMapping.push({ label: "analysisName", field: "AnalysisName"});
      triggerMapping.push({ label: "templateId", field: "TemplateId"});
      triggerMapping.push({ label: "templateName", field: "TemplateName"});
      
      creatorBody[body.applicationInternalName as string] = {};
      Object.keys(properties).forEach((element) => {
        const triggerElement = triggerMapping.find((el: any) => el.field === element);
        if (triggerElement) {
          creatorBody[body.applicationInternalName as string][element] = (requestBody as any)[triggerElement.label];  
        }
      });
    }

    const details = {
      id: creatorId,
      applicationId: appId,
      sandboxId: sandboxId,
      data: JSON.stringify(creatorBody)
    } as ProcessDetails;
    const createResponse = await this.processService.processCreate(details, header);
    logger.debug('postStartCaseForInvestigation ended for token: ' + token + ' - appId: ' + appId + ' - creatorId: ' + creatorId);
    return { id: createResponse.body.caseIdentifier as string};
  }

  readonly metaFields = [
    {
      name: 'creationTimestamp',
      format: 'DATE'
    },
    {
      name: 'modificationTimestamp',
      format: 'DATE'
    },
    {
      name: 'modifiedBy',
      format: 'string'
    },
    {
      name: 'createdBy',
      format: 'string'
    }
  ];
  readonly customFields = [
    {
      name: 'caseReference'
    }
  ];

  private createFields = (attrs: GetTypeResponseItemAttribute[], jsonSchema: any): InvestigationField[] => {

    let allFieldsArray = [];
    // let allFieldsMap = {};

    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (attr.isStructuredType) {
        // get definition
        if (jsonSchema && jsonSchema.definitions && jsonSchema.definitions[attr.name as string]) {
          const defs = jsonSchema.definitions[attr.name as string];
          if (defs.properties) {
            for(let prop in defs.properties) {
              allFieldsArray.push(this.addToAllFields(attr.name + '.' + prop, defs.properties[prop].title));
            }
          }
        }
      } else if (attr.isArray === true) {
        allFieldsArray.push(this.addToAllFields(attr.name as string, attr.label as string, 'ARRAY'));
      } else {
        allFieldsArray.push(this.addToAllFields(attr.name as string, attr.label as string));
      }
    }

    this.metaFields.forEach(mf => {
      allFieldsArray.push(this.addToAllFields('META:' + mf.name, this.generateLabelFromFieldname(mf.name), mf.format));
    });

    this.customFields.forEach(cf => {
      allFieldsArray.push(this.addToAllFields('CUSTOM:' + cf.name, this.generateLabelFromFieldname(cf.name)));
    });

    // this.allFieldsOptons = this.convertFieldsToSelectOptions(this.allFieldsArray);
    return allFieldsArray;
  }

  private addToAllFields = (field: string, label: string, format?: string): InvestigationField => {
    const ele = {
      field,
      label,
      format
    }

    return ele;
  }

  private generateLabelFromFieldname = (field: string): string => {
    const codeA = 'A'.charCodeAt(0);
    const codeZ = 'Z'.charCodeAt(0);
    const wordArr = [];
    let start = 0;
    for (let i = 1; i < field.length; i++) {
      if (field.charCodeAt(i) >= codeA && field.charCodeAt(i) <= codeZ) {
        wordArr.push(field.substring(start, i));
        start = i;
      }
    }
    wordArr[0] = wordArr[0].charAt(0).toUpperCase() + wordArr[0].substring(1);
    wordArr.push(field.substring(start));

    return wordArr.join(' ');
  }

  private createTriggers  = (creators: GetTypeResponseItemCreator[], appName: string): InvestigationTrigger[] => {
    return creators.map((creator: GetTypeResponseItemCreator) => {
      const jsonSchema = creator.jsonSchema as any;
      const properties = jsonSchema.definitions[appName].properties;
      const attrsJson = [] as any[];
      for (let prop in properties) {
        // todo: if there is structural attribute
        if (properties[prop].type == 'string' && prop !== 'state') {
          attrsJson.push({value: prop, label: properties[prop].title});
        }
      }
      return { label: creator.name, value: creator.id, fields: attrsJson } as InvestigationTrigger});
    }
}