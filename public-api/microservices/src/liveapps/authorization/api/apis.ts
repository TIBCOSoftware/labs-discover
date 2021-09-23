export * from './claimsApi';
import { ClaimsApi } from './claimsApi';
export * from './groupsApi';
import { GroupsApi } from './groupsApi';
export * from './mappingsApi';
import { MappingsApi } from './mappingsApi';
export * from './parametersApi';
import { ParametersApi } from './parametersApi';
export * from './sandboxesApi';
import { SandboxesApi } from './sandboxesApi';
export * from './userRulesApi';
import { UserRulesApi } from './userRulesApi';
export * from './usersApi';
import { UsersApi } from './usersApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [ClaimsApi, GroupsApi, MappingsApi, ParametersApi, SandboxesApi, UserRulesApi, UsersApi];
