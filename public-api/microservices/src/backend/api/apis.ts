export * from './filesOperationsApi';
import { FilesOperationsApi } from './filesOperationsApi';
export * from './loginApi';
import { LoginApi } from './loginApi';
export * from './metricsApi';
import { MetricsApi } from './metricsApi';
export * from './miningDataApi';
import { MiningDataApi } from './miningDataApi';
export * from './sparkOneTimeJobApi';
import { SparkOneTimeJobApi } from './sparkOneTimeJobApi';
export * from './sparkPreviewJobApi';
import { SparkPreviewJobApi } from './sparkPreviewJobApi';
export * from './sparkScheduledJobApi';
import { SparkScheduledJobApi } from './sparkScheduledJobApi';
export * from './tibcoDataVirtualizationApi';
import { TibcoDataVirtualizationApi } from './tibcoDataVirtualizationApi';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export { RequestFile } from '../model/models';

export const APIS = [FilesOperationsApi, LoginApi, MetricsApi, MiningDataApi, SparkOneTimeJobApi, SparkPreviewJobApi, SparkScheduledJobApi, TibcoDataVirtualizationApi];
