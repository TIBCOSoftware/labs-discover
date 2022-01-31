export * from './attributesApi';
import { AttributesApi } from './attributesApi';
export * from './linksApi';
import { LinksApi } from './linksApi';
export * from './rolesApi';
import { RolesApi } from './rolesApi';
export * from './statesApi';
import { StatesApi } from './statesApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [AttributesApi, LinksApi, RolesApi, StatesApi];
