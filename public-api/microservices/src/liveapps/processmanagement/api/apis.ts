export * from './instanceStatesApi';
import { InstanceStatesApi } from './instanceStatesApi';
export * from './instancesApi';
import { InstancesApi } from './instancesApi';
export * from './processesApi';
import { ProcessesApi } from './processesApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [InstanceStatesApi, InstancesApi, ProcessesApi];
