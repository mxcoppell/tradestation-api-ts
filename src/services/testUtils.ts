import { AxiosResponse } from 'axios';
import { HttpClient } from '../client/HttpClient';
import { StreamManager } from '../streaming/StreamManager';

// Mock HttpClient and StreamManager
jest.mock('../client/HttpClient');
jest.mock('../streaming/StreamManager');

export function createMockHttpClient(): jest.Mocked<HttpClient> {
    return new HttpClient({
        clientId: 'test',
        clientSecret: 'test'
    }) as jest.Mocked<HttpClient>;
}

export function createMockStreamManager(mockHttpClient: HttpClient): jest.Mocked<StreamManager> {
    return new StreamManager(mockHttpClient, {
        clientId: 'test',
        clientSecret: 'test'
    }) as jest.Mocked<StreamManager>;
}

export function createAxiosResponse<T>(data: T): AxiosResponse<T> {
    return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any
    };
} 