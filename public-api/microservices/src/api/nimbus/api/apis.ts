export * from './diagramImagesApi';
import { DiagramImagesApi } from './diagramImagesApi';
export * from './diagramsApi';
import { DiagramsApi } from './diagramsApi';
export * from './languagesApi';
import { LanguagesApi } from './languagesApi';
export * from './mapFoldersApi';
import { MapFoldersApi } from './mapFoldersApi';
export * from './mapsApi';
import { MapsApi } from './mapsApi';
export * from './resourceGroupsApi';
import { ResourceGroupsApi } from './resourceGroupsApi';
export * from './resourcesApi';
import { ResourcesApi } from './resourcesApi';
export * from './userAccountsApi';
import { UserAccountsApi } from './userAccountsApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [DiagramImagesApi, DiagramsApi, LanguagesApi, MapFoldersApi, MapsApi, ResourceGroupsApi, ResourcesApi, UserAccountsApi];
