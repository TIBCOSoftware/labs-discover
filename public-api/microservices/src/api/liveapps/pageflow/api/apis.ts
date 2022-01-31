export * from './caseActionsApi';
import { CaseActionsApi } from './caseActionsApi';
export * from './caseCreatorsApi';
import { CaseCreatorsApi } from './caseCreatorsApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [CaseActionsApi, CaseCreatorsApi];
