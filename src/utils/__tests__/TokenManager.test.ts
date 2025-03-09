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
        refresh_token: 'test-refresh-token',
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

    describe('refreshAccessToken', () => {
        it('should refresh token successfully', async () => {
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'new_access_token',
                    refresh_token: 'new_refresh_token',
                    expires_in: 3600,
                }
            };

            mockPost.mockResolvedValueOnce(mockResponse);

            await tokenManager.refreshAccessToken();

            expect(mockPost).toHaveBeenCalledWith(
                '/oauth/token',
                expect.any(URLSearchParams)
            );
            expect(tokenManager.hasValidToken()).toBe(true);
            expect(tokenManager.getRefreshToken()).toBe('new_refresh_token');
        });

        it('should refresh token successfully with same refresh token', async () => {
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'new_access_token',
                    refresh_token: 'test-refresh-token', // Same refresh token
                    expires_in: 3600,
                }
            };

            mockPost.mockResolvedValueOnce(mockResponse);

            await tokenManager.refreshAccessToken();

            expect(mockPost).toHaveBeenCalledWith(
                '/oauth/token',
                expect.any(URLSearchParams)
            );
            expect(tokenManager.hasValidToken()).toBe(true);
            expect(tokenManager.getRefreshToken()).toBe('test-refresh-token');
        });

        it('should refresh token successfully without returning a refresh token', async () => {
            const mockResponse: TokenResponse = {
                data: {
                    access_token: 'new_access_token',
                    refresh_token: '', // Empty refresh token
                    expires_in: 3600,
                }
            };

            mockPost.mockResolvedValueOnce(mockResponse);

            await tokenManager.refreshAccessToken();

            expect(mockPost).toHaveBeenCalledWith(
                '/oauth/token',
                expect.any(URLSearchParams)
            );
            expect(tokenManager.hasValidToken()).toBe(true);
            expect(tokenManager.getRefreshToken()).toBe('test-refresh-token'); // Original refresh token retained
        });

        it('should throw error when refresh fails', async () => {
            const error = new Error('Refresh failed');
            mockPost.mockRejectedValueOnce(error);

            await expect(tokenManager.refreshAccessToken()).rejects.toThrow('Refresh failed');
            expect(tokenManager.hasValidToken()).toBe(false);
        });

        it('should handle Axios error with response data during refresh', async () => {
            const axios = require('axios');

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
            expect(tokenManager.hasValidToken()).toBe(false);
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

            await tokenManager.refreshAccessToken();

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
            await tokenManager.refreshAccessToken();
            const token = await tokenManager.getValidAccessToken();
            expect(token).toBe('test_access_token');
        });

        it('should refresh token when token is about to expire', async () => {
            // First, get a token that expires immediately
            const initialResponse: TokenResponse = {
                data: {
                    access_token: 'initial_access_token',
                    refresh_token: 'test_refresh_token',
                    expires_in: 0, // Expires immediately
                },
            };
            mockPost.mockResolvedValueOnce(initialResponse);
            await tokenManager.refreshAccessToken();

            // Clear the first mock call
            mockPost.mockClear();

            // Now mock the second refresh
            const refreshResponse: TokenResponse = {
                data: {
                    access_token: 'refreshed_access_token',
                    refresh_token: 'new_refresh_token',
                    expires_in: 3600,
                },
            };
            mockPost.mockResolvedValueOnce(refreshResponse);

            // This should refresh the token
            const token = await tokenManager.getValidAccessToken();

            expect(mockPost).toHaveBeenCalledWith(
                '/oauth/token',
                expect.any(URLSearchParams)
            );
            expect(token).toBe('refreshed_access_token');
            expect(tokenManager.getRefreshToken()).toBe('new_refresh_token');
        });

        it('should throw error when no refresh token is available', async () => {
            const tokenManagerWithoutRefreshToken = new TokenManager({
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
            });

            await expect(tokenManagerWithoutRefreshToken.getValidAccessToken()).rejects.toThrow('No refresh token available');
        });
    });
}); 