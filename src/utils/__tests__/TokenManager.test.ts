import { TokenManager } from '../TokenManager';
import { ClientConfig } from '../../types/config';
import { jest } from '@jest/globals';
import { AxiosInstance } from 'axios';

interface TokenResponse {
    data: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    };
}

const mockPost = jest.fn<(url: string, data: URLSearchParams) => Promise<TokenResponse>>();
const mockAxiosInstance = {
    post: mockPost,
} as unknown as jest.Mocked<AxiosInstance>;

jest.mock('axios', () => ({
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(),
}));

describe('TokenManager', () => {
    let tokenManager: TokenManager;
    const mockConfig: ClientConfig = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        username: 'test-user',
        password: 'test-pass',
        scope: 'MarketData ReadAccount Trade Matrix',
    };

    beforeEach(() => {
        tokenManager = new TokenManager(mockConfig);
        const axios = require('axios');
        axios.isAxiosError.mockReturnValue(false);
        mockPost.mockReset();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('authenticate', () => {
        it('should authenticate successfully with valid credentials', async () => {
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'test_access_token',
                    refresh_token: 'test_refresh_token',
                    expires_in: 3600,
                }
            };

            mockPost.mockResolvedValueOnce(mockResponse);

            await tokenManager.authenticate();

            expect(mockPost).toHaveBeenCalledWith(
                '/oauth/token',
                expect.any(URLSearchParams)
            );
            expect(tokenManager.hasValidToken()).toBe(true);
        });

        it('should throw error when authentication fails', async () => {
            const error = new Error('Authentication failed');
            mockPost.mockRejectedValueOnce(error);

            await expect(tokenManager.authenticate()).rejects.toThrow('Authentication failed');
            expect(tokenManager.hasValidToken()).toBe(false);
        });

        it('should handle Axios error with response data', async () => {
            const axios = require('axios');
            const error = {
                response: {
                    data: {
                        error: 'invalid_grant',
                        error_description: 'Invalid credentials',
                    },
                },
            };
            mockPost.mockRejectedValueOnce(error);
            axios.isAxiosError.mockReturnValueOnce(true);

            await expect(tokenManager.authenticate()).rejects.toThrow('Authentication failed: Invalid credentials');
            expect(tokenManager.hasValidToken()).toBe(false);
        });
    });

    describe('refreshAccessToken', () => {
        it('should refresh token successfully', async () => {
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'new_access_token',
                    refresh_token: 'new_refresh_token',
                    expires_in: 3600,
                }
            };

            // First authenticate to get a refresh token
            mockPost.mockResolvedValueOnce(mockResponse);
            await tokenManager.authenticate();

            // Clear the first mock call
            mockPost.mockClear();

            // Now mock the refresh token call
            mockPost.mockResolvedValueOnce(mockResponse);

            await tokenManager.refreshAccessToken();

            expect(mockPost).toHaveBeenCalledWith(
                '/oauth/token',
                expect.any(URLSearchParams)
            );
            expect(tokenManager.hasValidToken()).toBe(true);
        });

        it('should throw error when refresh fails', async () => {
            // First authenticate to get a refresh token
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'test_access_token',
                    refresh_token: 'test_refresh_token',
                    expires_in: 3600,
                }
            };
            mockPost.mockResolvedValueOnce(mockResponse);

            await tokenManager.authenticate();

            // Clear the first mock call
            mockPost.mockClear();

            // Now mock the refresh token failure
            const error = new Error('Refresh failed');
            mockPost.mockRejectedValueOnce(error);

            await expect(tokenManager.refreshAccessToken()).rejects.toThrow('Refresh failed');
            expect(tokenManager.hasValidToken()).toBe(true); // Still true because the token hasn't expired
        });

        it('should handle Axios error with response data during refresh', async () => {
            const axios = require('axios');

            // First authenticate to get a refresh token
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'test_access_token',
                    refresh_token: 'test_refresh_token',
                    expires_in: 3600,
                }
            };
            mockPost.mockResolvedValueOnce(mockResponse);

            await tokenManager.authenticate();

            // Clear the first mock call
            mockPost.mockClear();

            // Now mock the refresh token failure with Axios error
            const error = {
                response: {
                    data: {
                        error: 'invalid_grant',
                        error_description: 'Invalid refresh token',
                    },
                },
            };
            mockPost.mockRejectedValueOnce(error);
            axios.isAxiosError.mockReturnValueOnce(true);

            await expect(tokenManager.refreshAccessToken()).rejects.toThrow('Token refresh failed: Invalid refresh token');
            expect(tokenManager.hasValidToken()).toBe(true); // Still true because the token hasn't expired
        });
    });

    describe('hasValidToken', () => {
        it('should return false when no token exists', () => {
            expect(tokenManager.hasValidToken()).toBe(false);
        });

        it('should return false when token is expired', async () => {
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'test_access_token',
                    refresh_token: 'test_refresh_token',
                    expires_in: 0, // Expired token
                }
            };

            mockPost.mockResolvedValueOnce(mockResponse);

            await tokenManager.authenticate();

            // Wait for the token to expire
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(tokenManager.hasValidToken()).toBe(false);
        });
    });

    describe('getValidAccessToken', () => {
        it('should return the access token when valid', async () => {
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'test_access_token',
                    refresh_token: 'test_refresh_token',
                    expires_in: 3600,
                },
            };
            mockPost.mockResolvedValueOnce(mockResponse);
            await tokenManager.authenticate();
            const token = await tokenManager.getValidAccessToken();
            expect(token).toBe('test_access_token');
        });

        it('should throw error when no token is available', async () => {
            mockPost.mockRejectedValueOnce(new Error('Authentication failed'));
            await expect(tokenManager.getValidAccessToken()).rejects.toThrow('Authentication failed');
        });
    });
}); 