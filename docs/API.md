# API Documentation

This document provides detailed information about the TradeStation API TypeScript wrapper's functionality and usage.

## Table of Contents

1. [Client Configuration](#client-configuration)
2. [Market Data Service](#market-data-service)
3. [Brokerage Service](#brokerage-service)
4. [Order Execution Service](#order-execution-service)
5. [Streaming](#streaming)
6. [Error Handling](#error-handling)

## Client Configuration

### TradeStationClient

The main entry point for interacting with the TradeStation API.

```typescript
import { TradeStationClient } from 'tradestation-api-ts';

// Using environment variables
const client = new TradeStationClient();

// Using explicit configuration
const client = new TradeStationClient({
    refresh_token: 'your_refresh_token',
    environment: 'Simulation', // or 'Live'
    maxConcurrentStreams: 10  // optional
});
```

## Market Data Service

### Quote Streaming

```typescript
// Stream real-time quotes
const stream = await client.marketData.streamQuotes(['MSFT', 'AAPL']);

stream.on('data', (quote) => {
    console.log('Quote update:', quote);
});

// Handle errors
stream.on('error', (error) => {
    console.error('Stream error:', error);
});
```

### Historical Bars

```typescript
// Get historical bars
const bars = await client.marketData.getBarHistory('MSFT', {
    interval: '1',
    unit: 'Minute',
    barsback: 100,
    sessiontemplate: 'USEQPreAndPost'
});
```

### Option Chain

```typescript
// Stream option chain
const stream = await client.marketData.streamOptionChain('MSFT');

stream.on('data', (data) => {
    console.log('Option chain update:', data);
});
```

### Market Depth

```typescript
// Stream market depth
const stream = await client.marketData.streamMarketDepth('MSFT', {
    maxlevels: 10
});

stream.on('data', (data) => {
    console.log('Market depth update:', data);
});
```

## Brokerage Service

### Account Information

```typescript
// Get accounts
const accounts = await client.brokerage.getAccounts();

// Get balances
const balances = await client.brokerage.getBalances('account_id');

// Get positions
const positions = await client.brokerage.getPositions('account_id');
```

### Order Management

```typescript
// Get orders
const orders = await client.brokerage.getOrders('account_id');

// Stream orders
const stream = await client.brokerage.streamOrders('account_id');

stream.on('data', (order) => {
    console.log('Order update:', order);
});
```

## Order Execution Service

### Place Order

```typescript
// Place a market order
const order = await client.orderExecution.placeOrder({
    AccountID: 'account_id',
    Symbol: 'MSFT',
    Quantity: '100',
    OrderType: 'Market',
    TradeAction: 'Buy'
});

// Place a limit order
const limitOrder = await client.orderExecution.placeOrder({
    AccountID: 'account_id',
    Symbol: 'MSFT',
    Quantity: '100',
    OrderType: 'Limit',
    LimitPrice: '200.00',
    TradeAction: 'Buy'
});
```

### Confirm Order

```typescript
// Confirm an order before placing
const confirmation = await client.orderExecution.confirmOrder({
    AccountID: 'account_id',
    Symbol: 'MSFT',
    Quantity: '100',
    OrderType: 'Market',
    TradeAction: 'Buy'
});
```

### Cancel Order

```typescript
// Cancel an order
await client.orderExecution.cancelOrder('account_id', 'order_id');
```

## Streaming

### Stream Management

```typescript
// Get active streams
const activeStreams = client.getActiveStreams();

// Close specific stream
stream.emit('close');

// Close all streams
client.closeAllStreams();
```

### Stream Events

All streams emit the following events:
- `data`: Emitted when new data is received
- `error`: Emitted when an error occurs
- `end`: Emitted when the stream ends
- `close`: Emitted when the stream is closed

## Error Handling

The API uses a consistent error handling pattern:

```typescript
try {
    const data = await client.marketData.getQuoteSnapshots(['INVALID']);
} catch (error) {
    if (error.response) {
        // API error with response
        console.error('API Error:', error.response.data);
    } else if (error.request) {
        // Network error
        console.error('Network Error:', error.message);
    } else {
        // Other error
        console.error('Error:', error.message);
    }
}
```