export * from './attributesApi';
import { AttributesApi } from './attributesApi';
export * from './lastAccessChangesApi';
import { LastAccessChangesApi } from './lastAccessChangesApi';
export * from './notesApi';
import { NotesApi } from './notesApi';
export * from './notificationsApi';
import { NotificationsApi } from './notificationsApi';
export * from './rolesApi';
import { RolesApi } from './rolesApi';
export * from './threadsApi';
import { ThreadsApi } from './threadsApi';
export * from './topicsApi';
import { TopicsApi } from './topicsApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [AttributesApi, LastAccessChangesApi, NotesApi, NotificationsApi, RolesApi, ThreadsApi, TopicsApi];
