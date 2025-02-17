# Streaming Guide

This guide explains how to use the streaming functionality in the TradeStation API TypeScript wrapper.

## Overview

The wrapper provides real-time streaming capabilities for:
- Market Data (quotes, bars, options)
- Order Updates
- Position Updates
- Market Depth

All streams use Node.js EventEmitter pattern and handle:
- Automatic reconnection
- Rate limiting
- Error handling
- Resource cleanup

## Stream Types

### Market Data Streams

1. **Quote Streaming**
```typescript
const stream = await client.marketData.streamQuotes(['MSFT', 'AAPL']);

stream.on('data', (quote) => {
    if ('Ask' in quote) {
        console.log('Quote:', quote);
    } else if ('Heartbeat' in quote) {
        console.log('Heartbeat:', quote);
    }
});
```

2. **Bar Streaming**
```typescript
const stream = await client.marketData.streamBars('MSFT', {
    interval: '1',
    unit: 'Minute'
});

stream.on('data', (bar) => {
    if ('Close' in bar) {
        console.log('Bar:', bar);
    }
});
```

3. **Option Chain Streaming**
```typescript
const stream = await client.marketData.streamOptionChain('MSFT');

stream.on('data', (option) => {
    console.log('Option:', option);
});
```

### Order Streams

1. **Order Updates**
```typescript
const stream = await client.brokerage.streamOrders('account_id');

stream.on('data', (order) => {
    if ('OrderID' in order) {
        console.log('Order Update:', order);
    }
});
```

2. **Specific Order Updates**
```typescript
const stream = await client.brokerage.streamOrdersByOrderID(
    'account_id',
    'order_id1,order_id2'
);

stream.on('data', (order) => {
    console.log('Order Update:', order);
});
```

### Position Streams

```typescript
const stream = await client.brokerage.streamPositions('account_id');

stream.on('data', (position) => {
    console.log('Position Update:', position);
});
```

## Stream Management

### 1. Creating Streams

```typescript
// Single symbol
const stream1 = await client.marketData.streamQuotes(['MSFT']);

// Multiple symbols
const stream2 = await client.marketData.streamQuotes(['MSFT', 'AAPL', 'GOOGL']);

// With parameters
const stream3 = await client.marketData.streamBars('MSFT', {
    interval: '5',
    unit: 'Minute',
    sessiontemplate: 'USEQPreAndPost'
});
```

### 2. Event Handling

All streams emit these events:
```typescript
stream.on('data', (data) => {
    // Handle data updates
});

stream.on('error', (error) => {
    // Handle errors
});

stream.on('end', () => {
    // Handle stream end
});

stream.on('close', () => {
    // Handle stream closure
});
```

### 3. Stream Cleanup

```typescript
// Close a specific stream
stream.emit('close');

// Close all active streams
client.closeAllStreams();

// Get list of active streams
const activeStreams = client.getActiveStreams();
```

## Best Practices

1. **Resource Management**
```typescript
// Create stream
const stream = await client.marketData.streamQuotes(['MSFT']);

// Use try-finally for cleanup
try {
    // Use the stream
} finally {
    stream.emit('close');
}
```

2. **Error Handling**
```typescript
stream.on('error', (error) => {
    if (error.name === 'RateLimitError') {
        // Handle rate limiting
    } else if (error.name === 'NetworkError') {
        // Handle network issues
    } else {
        // Handle other errors
    }
});
```

3. **Heartbeat Monitoring**
```typescript
stream.on('data', (data) => {
    if ('Heartbeat' in data) {
        // Update last heartbeat timestamp
        lastHeartbeat = Date.now();
    }
});
```

## Rate Limiting

Streams are subject to rate limits:
- Maximum concurrent streams per client
- Maximum symbols per stream
- Maximum data frequency

```typescript
// Configure max concurrent streams
const client = new TradeStationClient({
    maxConcurrentStreams: 10
});
```

## Error Handling

Common streaming errors:
1. Rate limit exceeded
2. Invalid symbols
3. Network disconnection
4. Authentication failures

Example error handling:
```typescript
stream.on('error', (error) => {
    switch (error.name) {
        case 'RateLimitError':
            console.error('Rate limit exceeded:', error.message);
            // Implement backoff strategy
            break;
        case 'NetworkError':
            console.error('Network issue:', error.message);
            // Attempt reconnection
            break;
        case 'AuthenticationError':
            console.error('Auth error:', error.message);
            // Re-authenticate
            break;
        default:
            console.error('Unknown error:', error.message);
    }
});
```

## Performance Optimization

1. **Symbol Batching**
```typescript
// Instead of multiple single-symbol streams
const stream = await client.marketData.streamQuotes([
    'MSFT', 'AAPL', 'GOOGL'
]);
```

2. **Data Processing**
```typescript
// Use efficient data handling
stream.on('data', (data) => {
    // Process only needed fields
    const { Symbol, Last, Volume } = data;
    // Update your application state
});
```

3. **Resource Cleanup**
```typescript
// Monitor memory usage
const usage = process.memoryUsage();
if (usage.heapUsed > threshold) {
    // Clean up unused streams
}
```

## Debugging

Enable debug mode for detailed logging:
```typescript
const client = new TradeStationClient({
    debug: true
});
```

Monitor stream status:
```typescript
setInterval(() => {
    const streams = client.getActiveStreams();
    console.log('Active streams:', streams.length);
}, 60000);
```

## Additional Resources

- [TradeStation WebAPI Documentation](https://api.tradestation.com/docs/)
- [Node.js EventEmitter Documentation](https://nodejs.org/api/events.html)
- [WebSocket Best Practices](https://websocket.org/echo.html) 