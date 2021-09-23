import { Response } from 'koa';
import { Param, Body, Get, Post, Put, Delete, HeaderParam, QueryParam, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';
import { DiscoverCache } from '../cache/DiscoverCache';
import { logger } from '../common/logging';
import { ClaimsApi, ClaimsSandbox, User, UsersApi } from '../liveapps/authorization/api';
import { CasesApi, GetCaseResponseItem, GetTypeResponseItem, GetTypeResponseItemAttribute, GetTypeResponseItemCreator, GetTypeResponseItemState, TypesApi } from '../liveapps/casemanagement/api';
import { CaseAction, CaseActionsApi } from '../liveapps/pageflow/api';
import { InvestigationField, InvestigationState } from '../models/configuration.model';
import { Application, InvestigationActions, InvestigationApplicationDefinition, InvestigationDetails, InvestigationMetadata, InvestigationTrigger } from '../models/investigation.model';

@Service()
@JsonController('/investigation')
export class InvestigationController {
  
  private claimsService: ClaimsApi;
  private casesService: CasesApi;
  private typesService: TypesApi;
  private usersService: UsersApi;
  private actionsService: CaseActionsApi;

  private users: User[] = [];

  constructor (
    protected cache: DiscoverCache
  ){
    this.claimsService = new ClaimsApi(process.env.LIVEAPPS +'/organisation/v1');
    this.casesService = new CasesApi(process.env.LIVEAPPS + '/case/v1');
    this.typesService = new TypesApi(process.env.LIVEAPPS + '/case/v1');
    this.usersService = new UsersApi(process.env.LIVEAPPS + '/organisation/v1');
    this.actionsService = new CaseActionsApi(process.env.LIVEAPPS + '/pageflow/v1');
  }

  public static getName = (): string => {
    return 'InvestigationController';
  }

  private preflightCheck = (token: string, response: Response): boolean | Response => {
    if (!token) {
      response.status = 400;
      return response;
    }
    return true;
  }

  @Get('/applications')
  async getAllApplications(@HeaderParam("authorization") token: string, @Res() response: Response): Promise<Application[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const header = { headers: { 'Authorization': token}};
    const sandboxId = (await this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
    const typesDetails = (await this.typesService.getTypes(sandboxId, 'b', undefined, '0', '100', undefined, header)).body;
    return typesDetails.map((app: GetTypeResponseItem) => { return { label: app.applicationName, id: app.applicationId } as Application;});
  }

  @Get('/:appId/definition')
  async getApplicationDefinition(@HeaderParam("authorization") token: string, @Param('appId') appId: string, @Param('appId') investigationId: string, @Res() response: Response): Promise<InvestigationApplicationDefinition | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const header = { headers: { 'Authorization': token}};
    const sandboxId = (await this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
    const select = 'b,a,sa,s,js,c,ac'; 
    const filter = 'isCase eq TRUE and applicationId eq ' + appId;

    const type = (await this.typesService.getTypes(sandboxId, select, filter, undefined, '1000', undefined, header)).body[0];

    const fields = this.createFields(type.attributes as GetTypeResponseItemAttribute[], type.jsonSchema);
    const creators = this.createTriggers(type.creators as GetTypeResponseItemCreator[], type.applicationInternalName as string);
    const states = type.states?.map((state: GetTypeResponseItemState) => { return {name: state.label, color: '', icon: ''} as InvestigationState}) as InvestigationState[]; 

    return {fields, creators, states};
  }

  @Get('/:appId')
  async getInvestigationsDetails(@HeaderParam("authorization") token: string, @Param('appId') investigationId: string, @Res() response: Response): Promise< InvestigationDetails[] | Response > {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const header = { headers: { 'Authorization': token}};
    const sandboxId = (await this.cache.getClient(token.replace('Bearer ', ''))).sandboxId;
    const caseDetails = (await this.casesService.getCases(sandboxId, 'applicationId eq ' + investigationId + ' and typeId eq 1 and purgeable eq FALSE', 'cr,uc,m,s', '0', '1000', undefined, undefined, undefined, header)).body;
    
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
    
    return output;
  }

  private getUsername = async (id: string | undefined, header: any): Promise<string> => {
    if (!id) {
      return '';
    }

    let user = this.users.filter((el: User) => el.id === id)[0];
    if (!user){
      user = (await this.usersService.getUser(id, header)).body;
      this.users.push(user);
    }
    return user.firstName + ' ' + user.lastName;
  }

  @Get('/:appId/:investigationId/:state/actions')
  async getActionsForInvestigation(@HeaderParam("authorization") token: string, @Param('appId') appId: string, @Param('investigationId') investigationId: string, @Param('state') state: string, @Res() response: Response): Promise<InvestigationActions[] | Response> {
    const check = this.preflightCheck(token, response);
    if (check !== true) {
      return check as Response;
    }

    const header = { headers: { 'Authorization': token}};
    const claims = (await this.claimsService.getClaims(header)).body;
    const sandboxId = claims.sandboxes?.filter((sandbox:ClaimsSandbox) => sandbox.type === ClaimsSandbox.TypeEnum.Production)[0].id as string;
    const filter = 'applicationId eq ' + appId + ' and caseType eq 1 and caseState eq ' + state + ' and caseRef eq ' + investigationId;
    const actions = (await this.actionsService.listCaseActions(sandboxId, filter, header)).body;
    logger.debug(actions);
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
    return investigationActions;
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