import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { HttpClient } from '../HttpClient';
import { TokenManager } from '../../utils/TokenManager';
import { RateLimiter } from '../../utils/RateLimiter';
import { ClientConfig } from '../../types/config';

// Mock dependencies
jest.mock('axios');
jest.mock('../../utils/TokenManager');
jest.mock('../../utils/RateLimiter');

describe('HttpClient', () => {
    let httpClient: HttpClient;
    let mockAxiosInstance: jest.Mocked<AxiosInstance>;
    let mockTokenManager: {
        getValidAccessToken: jest.Mock<Promise<string>>;
        authenticate: jest.Mock<Promise<void>>;
        hasValidToken: jest.Mock<boolean>;
        refreshAccessToken: jest.Mock<Promise<void>>;
    };
    let mockRateLimiter: jest.Mocked<RateLimiter>;
    let config: ClientConfig;
    let requestInterceptor: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>;
    let responseInterceptor: (response: AxiosResponse) => AxiosResponse;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup config
        config = {
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            baseUrl: 'https://test-api.com'
        };

        // Setup mock axios instance
        mockAxiosInstance = {
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() }
            },
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn()
        } as unknown as jest.Mocked<AxiosInstance>;

        (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

        // Setup mock token manager
        mockTokenManager = {
            getValidAccessToken: jest.fn().mockResolvedValue('token'),
            authenticate: jest.fn().mockResolvedValue(undefined),
            hasValidToken: jest.fn().mockReturnValue(true),
            refreshAccessToken: jest.fn().mockResolvedValue(undefined),
        };
        (TokenManager as unknown as jest.Mock).mockImplementation(() => mockTokenManager);

        // Setup mock rate limiter
        mockRateLimiter = {
            waitForSlot: jest.fn(),
            updateLimits: jest.fn(),
        } as any;
        (RateLimiter as unknown as jest.Mock).mockImplementation(() => mockRateLimiter);

        // Create HttpClient instance
        httpClient = new HttpClient(config);

        // Capture interceptors
        const requestUse = mockAxiosInstance.interceptors.request.use as unknown as jest.Mock;
        const responseUse = mockAxiosInstance.interceptors.response.use as unknown as jest.Mock;
        requestInterceptor = requestUse.mock.calls[0][0];
        responseInterceptor = responseUse.mock.calls[0][0];
    });

    describe('constructor', () => {
        it('should create axios instance with correct config', () => {
            expect(axios.create).toHaveBeenCalledWith({
                baseURL: 'https://test-api.com',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });

        it('should use default base URL if not provided', () => {
            const clientWithDefaultUrl = new HttpClient({
                clientId: 'test',
                clientSecret: 'test'
            });

            expect(axios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'https://api.tradestation.com'
                })
            );
        });
    });

    describe('request interceptor', () => {
        it('should add authorization header with token', async () => {
            const headers = new AxiosHeaders();
            const mockConfig: InternalAxiosRequestConfig = {
                headers,
                url: '/test'
            };
            mockTokenManager.getValidAccessToken.mockResolvedValueOnce('test-token');

            const config = await requestInterceptor(mockConfig);

            expect(config.headers.Authorization).toBe('Bearer test-token');
            expect(mockRateLimiter.waitForSlot).toHaveBeenCalledWith('/test');
        });

        it('should handle rate limiting', async () => {
            const headers = new AxiosHeaders();
            const mockConfig: InternalAxiosRequestConfig = {
                headers,
                url: '/test'
            };
            mockTokenManager.getValidAccessToken.mockResolvedValueOnce('test-token');
            mockRateLimiter.waitForSlot.mockResolvedValueOnce(undefined);

            await requestInterceptor(mockConfig);

            expect(mockRateLimiter.waitForSlot).toHaveBeenCalledWith('/test');
        });
    });

    describe('response interceptor', () => {
        it('should update rate limits from response headers', () => {
            const headers = new AxiosHeaders();
            headers['x-ratelimit-remaining'] = '100';

            const response: AxiosResponse = {
                data: {},
                status: 200,
                statusText: 'OK',
                headers,
                config: {
                    url: '/test',
                    headers: new AxiosHeaders()
                } as InternalAxiosRequestConfig
            };

            responseInterceptor(response);

            expect(mockRateLimiter.updateLimits).toHaveBeenCalledWith('/test', response.headers);
        });
    });

    describe('HTTP methods', () => {
        const mockResponse: AxiosResponse = {
            data: { test: 'data' },
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/json'
            },
            config: { headers: { 'Content-Type': 'application/json' } } as InternalAxiosRequestConfig
        };

        beforeEach(() => {
            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            mockAxiosInstance.post.mockResolvedValue(mockResponse);
            mockAxiosInstance.put.mockResolvedValue(mockResponse);
            mockAxiosInstance.delete.mockResolvedValue(mockResponse);
        });

        it('should make GET request', async () => {
            const result = await httpClient.get('/test');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
            expect(result).toEqual(mockResponse);
        });

        it('should make POST request', async () => {
            const data = { test: 'data' };
            const result = await httpClient.post('/test', data);
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, undefined);
            expect(result).toEqual(mockResponse);
        });

        it('should make PUT request', async () => {
            const data = { test: 'data' };
            const result = await httpClient.put('/test', data);
            expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', data, undefined);
            expect(result).toEqual(mockResponse);
        });

        it('should make DELETE request', async () => {
            const result = await httpClient.delete('/test');
            expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test', undefined);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('createStream', () => {
        it('should create a readable stream', async () => {
            const mockStream = {} as NodeJS.ReadableStream;
            mockAxiosInstance.get.mockResolvedValue({ data: mockStream });

            const result = await httpClient.createStream('/test');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {
                responseType: 'stream'
            });
            expect(result).toBe(mockStream);
        });

        it('should handle stream creation errors', async () => {
            const error = new Error('Stream error');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(httpClient.createStream('/test')).rejects.toThrow('Stream error');
        });
    });

    describe('authenticate', () => {
        it('should call tokenManager.authenticate', async () => {
            mockTokenManager.authenticate.mockResolvedValue();

            await httpClient.authenticate();

            expect(mockTokenManager.authenticate).toHaveBeenCalled();
        });

        it('should handle authentication errors', async () => {
            const error = new Error('Auth error');
            mockTokenManager.authenticate.mockRejectedValue(error);

            await expect(httpClient.authenticate()).rejects.toThrow('Auth error');
        });
    });
}); 