import { RateLimiter } from '../RateLimiter';
import { RawAxiosResponseHeaders } from 'axios';

describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;
    const endpoint = '/test/endpoint';

    beforeEach(() => {
        rateLimiter = new RateLimiter();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('updateLimits', () => {
        it('should update rate limits from headers', () => {
            const headers: RawAxiosResponseHeaders = {
                'x-ratelimit-limit': '100',
                'x-ratelimit-remaining': '99',
                'x-ratelimit-reset': '1706108400' // Example timestamp
            };

            rateLimiter.updateLimits(endpoint, headers);
            const limits = rateLimiter.getRateLimit(endpoint);

            expect(limits).toBeDefined();
            expect(limits?.limit).toBe(100);
            expect(limits?.remaining).toBe(99);
            expect(limits?.resetTime).toBe(1706108400000); // Converted to milliseconds
        });

        it('should use default limit when not provided in headers', () => {
            const headers: RawAxiosResponseHeaders = {};

            rateLimiter.updateLimits(endpoint, headers);
            const limits = rateLimiter.getRateLimit(endpoint);

            expect(limits).toBeDefined();
            expect(limits?.limit).toBe(120); // Default limit
            expect(limits?.remaining).toBe(0);
            expect(limits?.resetTime).toBe(0);
        });

        it('should handle custom default limit', () => {
            const customLimiter = new RateLimiter(200);
            const headers: RawAxiosResponseHeaders = {};

            customLimiter.updateLimits(endpoint, headers);
            const limits = customLimiter.getRateLimit(endpoint);

            expect(limits?.limit).toBe(200);
        });
    });

    describe('waitForSlot', () => {
        it('should resolve immediately when no rate limit is set', async () => {
            const promise = rateLimiter.waitForSlot(endpoint);
            await expect(promise).resolves.toBeUndefined();
        });

        it('should resolve immediately when remaining requests are available', async () => {
            const headers: RawAxiosResponseHeaders = {
                'x-ratelimit-limit': '100',
                'x-ratelimit-remaining': '99',
                'x-ratelimit-reset': '1706108400'
            };

            rateLimiter.updateLimits(endpoint, headers);
            const promise = rateLimiter.waitForSlot(endpoint);
            await expect(promise).resolves.toBeUndefined();
        });

        it('should wait for reset when rate limit is exceeded', async () => {
            const now = Date.now();
            const resetTime = now + 5000; // 5 seconds from now

            const headers: RawAxiosResponseHeaders = {
                'x-ratelimit-limit': '100',
                'x-ratelimit-remaining': '0',
                'x-ratelimit-reset': String(Math.floor(resetTime / 1000))
            };

            rateLimiter.updateLimits(endpoint, headers);

            const promise = rateLimiter.waitForSlot(endpoint);

            // Fast-forward time
            jest.advanceTimersByTime(5000);

            await promise;

            const limits = rateLimiter.getRateLimit(endpoint);
            expect(limits?.remaining).toBe(100); // Reset to full limit
        });

        it('should queue multiple requests when rate limited', async () => {
            const now = Date.now();
            const resetTime = now + 5000;

            const headers: RawAxiosResponseHeaders = {
                'x-ratelimit-limit': '100',
                'x-ratelimit-remaining': '0',
                'x-ratelimit-reset': String(Math.floor(resetTime / 1000))
            };

            rateLimiter.updateLimits(endpoint, headers);

            // Create multiple requests
            const promise1 = rateLimiter.waitForSlot(endpoint);
            const promise2 = rateLimiter.waitForSlot(endpoint);
            const promise3 = rateLimiter.waitForSlot(endpoint);

            // Fast-forward time
            jest.advanceTimersByTime(5000);

            // All promises should resolve
            await Promise.all([promise1, promise2, promise3]);

            const limits = rateLimiter.getRateLimit(endpoint);
            expect(limits?.remaining).toBe(100);
        });

        it('should resolve immediately when reset time is in the past', async () => {
            const pastTime = Math.floor((Date.now() - 1000) / 1000); // 1 second ago

            const headers: RawAxiosResponseHeaders = {
                'x-ratelimit-limit': '100',
                'x-ratelimit-remaining': '0',
                'x-ratelimit-reset': String(pastTime)
            };

            rateLimiter.updateLimits(endpoint, headers);

            const promise = rateLimiter.waitForSlot(endpoint);
            await expect(promise).resolves.toBeUndefined();
        });
    });

    describe('getRateLimit', () => {
        it('should return undefined for unknown endpoint', () => {
            expect(rateLimiter.getRateLimit('unknown')).toBeUndefined();
        });

        it('should return rate limit for known endpoint', () => {
            const headers: RawAxiosResponseHeaders = {
                'x-ratelimit-limit': '100',
                'x-ratelimit-remaining': '99',
                'x-ratelimit-reset': '1706108400'
            };

            rateLimiter.updateLimits(endpoint, headers);
            const limits = rateLimiter.getRateLimit(endpoint);

            expect(limits).toEqual({
                limit: 100,
                remaining: 99,
                resetTime: 1706108400000
            });
        });
    });
}); 