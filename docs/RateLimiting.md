# Rate Limiting Guide

This guide explains how rate limiting works in the TradeStation API TypeScript wrapper.

## Overview

The wrapper implements automatic rate limiting to:
- Prevent API quota exhaustion
- Handle rate limit headers
- Queue requests when needed
- Provide backoff strategies
- Monitor usage limits

## Rate Limit Types

TradeStation API implements several types of rate limits:

1. **Request Rate Limits**
   - Limits per endpoint
   - Limits per time window
   - Global account limits

2. **Stream Rate Limits**
   - Maximum concurrent streams
   - Data frequency limits
   - Symbol count limits

3. **Authentication Limits**
   - Token refresh limits
   - Login attempt limits

## Implementation

### Request Rate Limiting

The wrapper automatically handles rate limits using response headers:

```typescript
// Rate limits are handled automatically
const client = new TradeStationClient();

// Make requests without worrying about rates
const quotes = await client.marketData.getQuoteSnapshots(['MSFT', 'AAPL']);
const bars = await client.marketData.getBarHistory('MSFT');
```

### Stream Rate Limiting

Configure stream limits during client initialization:

```typescript
const client = new TradeStationClient({
    maxConcurrentStreams: 10,  // Default is 10
    streamRateLimit: 100       // Messages per second
});
```

### Queue Management

Requests are automatically queued when limits are reached:

```typescript
// These requests will be queued if needed
const promises = symbols.map(symbol => 
    client.marketData.getQuoteSnapshots([symbol])
);

// Wait for all requests to complete
const results = await Promise.all(promises);
```

## Rate Limit Headers

The wrapper processes these headers:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time until limit reset

Example header handling:
```typescript
client.on('rateLimit', (info) => {
    console.log('Rate limit info:', {
        endpoint: info.endpoint,
        limit: info.limit,
        remaining: info.remaining,
        reset: info.reset
    });
});
```

## Monitoring

### Rate Usage Tracking

```typescript
// Get current rate limit status
const status = client.getRateLimitStatus();
console.log('Rate limit status:', status);

// Monitor rate limit events
client.on('rateLimitWarning', (info) => {
    console.log('Approaching rate limit:', info);
});

client.on('rateLimitExceeded', (info) => {
    console.log('Rate limit exceeded:', info);
});
```

### Stream Monitoring

```typescript
// Get active stream count
const activeStreams = client.getActiveStreams();
console.log('Active streams:', activeStreams.length);

// Monitor stream rate
client.on('streamRateWarning', (info) => {
    console.log('High stream message rate:', info);
});
```

## Best Practices

### 1. Request Batching

```typescript
// Instead of multiple single requests
const quotes = await client.marketData.getQuoteSnapshots([
    'MSFT', 'AAPL', 'GOOGL', 'AMZN'
]);
```

### 2. Rate Limit Handling

```typescript
try {
    const data = await client.marketData.getQuoteSnapshots(['MSFT']);
} catch (error) {
    if (error.name === 'RateLimitError') {
        // Implement backoff strategy
        await delay(error.retryAfter);
        // Retry request
    }
}
```

### 3. Stream Management

```typescript
// Close unused streams
const streams = client.getActiveStreams();
for (const stream of streams) {
    if (isStreamUnused(stream)) {
        stream.emit('close');
    }
}
```

## Configuration Options

```typescript
const client = new TradeStationClient({
    // Rate limiting options
    maxConcurrentStreams: 10,
    streamRateLimit: 100,
    requestRateLimit: 50,
    rateLimitStrategy: 'queue', // or 'error'
    
    // Retry options
    maxRetries: 3,
    retryDelay: 1000,
    
    // Monitoring
    enableRateMonitoring: true,
    rateWarningThreshold: 0.8
});
```

## Error Handling

### Rate Limit Errors

```typescript
try {
    await client.marketData.getQuoteSnapshots(['MSFT']);
} catch (error) {
    if (error.name === 'RateLimitError') {
        console.log('Rate limit exceeded');
        console.log('Retry after:', error.retryAfter);
        console.log('Limit reset:', error.resetTime);
    }
}
```

### Backoff Strategies

```typescript
const backoff = {
    initial: 1000,    // 1 second
    max: 60000,       // 1 minute
    factor: 2,        // Double each time
};

async function requestWithBackoff() {
    let delay = backoff.initial;
    
    while (true) {
        try {
            return await client.marketData.getQuoteSnapshots(['MSFT']);
        } catch (error) {
            if (error.name !== 'RateLimitError') throw error;
            
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * backoff.factor, backoff.max);
        }
    }
}
```

## Debugging

Enable debug mode for rate limit logging:

```typescript
const client = new TradeStationClient({
    debug: true,
    debugRateLimits: true
});
```

Monitor rate limit events:

```typescript
client.on('debug', (message) => {
    if (message.type === 'rateLimit') {
        console.log('Rate limit debug:', message);
    }
});
```

## Additional Resources

- [TradeStation API Rate Limits](https://api.tradestation.com/docs/#section/Rate-Limits)
- [HTTP Rate Limiting Best Practices](https://tools.ietf.org/html/rfc6585)
- [Rate Limiting Algorithms](https://konghq.com/blog/how-to-design-a-scalable-rate-limiting-algorithm/) 