export * from './catalogApi';
import { CatalogApi } from './catalogApi';
export * from './configurationApi';
import { ConfigurationApi } from './configurationApi';
export * from './documentationsApi';
import { DocumentationsApi } from './documentationsApi';
export * from './investigationsApi';
import { InvestigationsApi } from './investigationsApi';
export * from './repositoryApi';
import { RepositoryApi } from './repositoryApi';
export * from './visualisationApi';
import { VisualisationApi } from './visualisationApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [CatalogApi, ConfigurationApi, DocumentationsApi, InvestigationsApi, RepositoryApi, VisualisationApi];
