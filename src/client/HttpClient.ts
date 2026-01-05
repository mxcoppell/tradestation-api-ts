import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenManager } from '../utils/TokenManager';
import { RateLimiter } from '../utils/RateLimiter';
import { ClientConfig } from '../types/config';

export class HttpClient {
    private readonly axiosInstance: AxiosInstance;
    private readonly tokenManager: TokenManager;
    private readonly rateLimiter: RateLimiter;

    constructor(config?: ClientConfig) {
        this.tokenManager = new TokenManager(config);
        this.rateLimiter = new RateLimiter();

        // Determine base URL based on environment
        const baseURL = config?.environment?.toLowerCase() === 'simulation'
            ? 'https://sim.api.tradestation.com'
            : 'https://api.tradestation.com';

        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor for authentication
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                // Wait for rate limiting slot
                if (config.url) {
                    await this.rateLimiter.waitForSlot(config.url);
                }

                // Get valid token (will refresh if needed)
                const token = await this.tokenManager.getValidAccessToken();
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for rate limit headers
        this.axiosInstance.interceptors.response.use(
            (response) => {
                if (response.config.url) {
                    this.rateLimiter.updateLimits(response.config.url, response.headers);
                }
                return response;
            },
            (error) => Promise.reject(error)
        );
    }

    /**
     * Gets the current refresh token
     * @returns The current refresh token or null if none is available
     */
    getRefreshToken(): string | null {
        return this.tokenManager.getRefreshToken();
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config);
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config);
    }

    // Method for handling streaming endpoints
    createStream(url: string, config?: AxiosRequestConfig): Promise<NodeJS.ReadableStream> {
        return new Promise((resolve, reject) => {
            this.axiosInstance
                .get(url, { ...config, responseType: 'stream' })
                .then((response) => resolve(response.data))
                .catch(reject);
        });
    }
} 