import { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

interface RateLimit {
    limit: number;
    remaining: number;
    resetTime: number;
}

export class RateLimiter {
    private limits: Map<string, RateLimit> = new Map();
    private queues: Map<string, Promise<void>[]> = new Map();

    constructor(private defaultLimit: number = 120) { } // Default to 120 requests per minute

    updateLimits(endpoint: string, headers: RawAxiosResponseHeaders | AxiosResponseHeaders): void {
        const limit = parseInt(String(headers['x-ratelimit-limit'] || this.defaultLimit));
        const remaining = parseInt(String(headers['x-ratelimit-remaining'] || '0'));
        const resetTime = parseInt(String(headers['x-ratelimit-reset'] || '0')) * 1000; // Convert to milliseconds

        this.limits.set(endpoint, {
            limit,
            remaining,
            resetTime,
        });
    }

    async waitForSlot(endpoint: string): Promise<void> {
        const queue = this.queues.get(endpoint) || [];
        this.queues.set(endpoint, queue);

        const currentLimit = this.limits.get(endpoint);
        if (!currentLimit || currentLimit.remaining > 0) {
            return;
        }

        const waitPromise = new Promise<void>((resolve) => {
            const timeToReset = currentLimit.resetTime - Date.now();
            if (timeToReset > 0) {
                setTimeout(resolve, timeToReset);
            } else {
                resolve();
            }
        });

        queue.push(waitPromise);

        if (queue.length === 1) {
            await waitPromise;
            this.limits.set(endpoint, {
                ...currentLimit,
                remaining: currentLimit.limit,
                resetTime: Date.now() + 60000, // Reset in 1 minute
            });
        } else {
            await queue[queue.length - 2]; // Wait for previous request
        }

        queue.pop();
        if (queue.length === 0) {
            this.queues.delete(endpoint);
        }
    }

    getRateLimit(endpoint: string): RateLimit | undefined {
        return this.limits.get(endpoint);
    }
} 