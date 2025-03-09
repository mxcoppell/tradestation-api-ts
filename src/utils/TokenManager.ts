import axios, { AxiosInstance } from 'axios';
import { ClientConfig, AuthResponse, ApiError } from '../types/config';

export class TokenManager {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenExpiry: number | null = null;
    private refreshing: Promise<void> | null = null;
    private readonly axiosInstance: AxiosInstance;
    private readonly config: Required<Pick<ClientConfig, 'clientId' | 'clientSecret'>> & Omit<ClientConfig, 'clientId' | 'clientSecret'>;
    // 5 minutes in milliseconds
    private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000;

    constructor(config?: Partial<ClientConfig>) {
        const clientId = config?.clientId || process.env.CLIENT_ID;
        const clientSecret = config?.clientSecret || process.env.CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Client ID and Client Secret are required');
        }

        this.config = {
            clientId,
            clientSecret,
            maxConcurrentStreams: config?.maxConcurrentStreams,
        };

        // Set initial refresh token if provided in config
        if (config?.refresh_token) {
            this.refreshToken = config.refresh_token;
        }

        this.axiosInstance = axios.create({
            baseURL: 'https://signin.tradestation.com',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }

    private shouldRefreshToken(): boolean {
        if (!this.tokenExpiry) return true;
        // Refresh if less than REFRESH_THRESHOLD milliseconds remaining
        return Date.now() >= (this.tokenExpiry - TokenManager.REFRESH_THRESHOLD);
    }

    /**
     * Gets a valid access token, refreshing it if necessary.
     * This is the main method that should be used to get an access token.
     * @returns A promise that resolves to a valid access token
     * @throws Error if unable to get a valid token
     */
    async getValidAccessToken(): Promise<string> {
        if (this.shouldRefreshToken()) {
            if (this.refreshToken) {
                await this.refreshAccessToken();
            } else {
                throw new Error('No refresh token available. You must provide a refresh token in the client configuration.');
            }
        }
        return this.getAccessToken();
    }

    /**
     * Refreshes the access token using the refresh token.
     * If the response includes a new refresh token, it will be stored for future use.
     * @throws Error if refresh fails or no refresh token is available
     */
    async refreshAccessToken(): Promise<void> {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        // If already refreshing, wait for that to complete
        if (this.refreshing) {
            await this.refreshing;
            return;
        }

        const refreshToken = this.refreshToken; // Capture current refresh token

        this.refreshing = (async () => {
            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                refresh_token: refreshToken,
            });

            try {
                const response = await this.axiosInstance.post<AuthResponse>('/oauth/token', params);
                this.updateTokens(response.data);
            } catch (error: any) {
                if (axios.isAxiosError(error) && error.response?.data) {
                    const apiError = error.response.data as ApiError;
                    throw new Error(`Token refresh failed: ${apiError.error_description || apiError.error}`);
                }
                throw error;
            } finally {
                this.refreshing = null;
            }
        })();

        await this.refreshing;
    }

    private updateTokens(authResponse: AuthResponse): void {
        this.accessToken = authResponse.access_token;
        // Update refresh token only if a new one is provided
        if (authResponse.refresh_token) {
            this.refreshToken = authResponse.refresh_token;
        }
        this.tokenExpiry = Date.now() + (authResponse.expires_in * 1000);
    }

    /**
     * Returns the current refresh token
     * @returns The current refresh token or null if none is available
     */
    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    private getAccessToken(): string {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }
        return this.accessToken;
    }

    isTokenExpired(): boolean {
        return this.tokenExpiry ? Date.now() >= this.tokenExpiry : true;
    }

    hasValidToken(): boolean {
        return !!this.accessToken && !this.isTokenExpired();
    }
} 