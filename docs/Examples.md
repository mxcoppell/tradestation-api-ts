# Examples Guide

This guide explains how to use the example implementations provided with the TradeStation API TypeScript wrapper.

## Running Examples

The project includes a helper script to run examples:

```bash
# List all available examples
./run-example.sh --list

# Run a specific example
./run-example.sh QuickStart/getStarted

# Run multiple examples
./run-example.sh MarketData/getBars MarketData/getQuotes
```

## Example Categories

### 1. Quick Start Examples

Basic examples to get started:

```bash
./run-example.sh QuickStart/getStarted
```

This example demonstrates:
- Client initialization
- Authentication
- Basic market data requests
- Error handling

### 2. Market Data Examples

#### Quote Data
```bash
# Stream real-time quotes
./run-example.sh MarketData/streamQuotes

# Get quote snapshots
./run-example.sh MarketData/getQuoteSnapshots
```

#### Bar Data
```bash
# Stream real-time bars
./run-example.sh MarketData/streamBars

# Get historical bars
./run-example.sh MarketData/getBars
```

#### Options Data
```bash
# Stream option chain
./run-example.sh MarketData/streamOptionChain

# Stream option quotes
./run-example.sh MarketData/streamOptionQuotes

# Get option strikes
./run-example.sh MarketData/getOptionStrikes
```

#### Market Depth
```bash
# Stream market depth
./run-example.sh MarketData/streamMarketDepth

# Stream market depth aggregates
./run-example.sh MarketData/streamMarketDepthAggregates
```

### 3. Brokerage Examples

#### Account Information
```bash
# Get accounts
./run-example.sh Brokerage/getAccounts

# Get balances
./run-example.sh Brokerage/getBalances

# Get positions
./run-example.sh Brokerage/getPositions
```

#### Order Management
```bash
# Get orders
./run-example.sh Brokerage/getOrders

# Stream orders
./run-example.sh Brokerage/streamOrders

# Get historical orders
./run-example.sh Brokerage/getHistoricalOrders
```

### 4. Order Execution Examples

#### Order Placement
```bash
# Place order
./run-example.sh OrderExecution/placeOrder

# Place group order
./run-example.sh OrderExecution/placeGroupOrder
```

#### Order Confirmation
```bash
# Confirm order
./run-example.sh OrderExecution/confirmOrder

# Confirm group order
./run-example.sh OrderExecution/confirmGroupOrder
```

#### Order Management
```bash
# Cancel order
./run-example.sh OrderExecution/cancelOrder

# Replace order
./run-example.sh OrderExecution/replaceOrder

# Get routes
./run-example.sh OrderExecution/getRoutes
```

## Example Structure

Each example follows this structure:

```typescript
import { TradeStationClient } from '../../src';

async function main() {
    try {
        // Initialize client
        const client = new TradeStationClient();

        // Example implementation
        // ...

        // Cleanup
        client.closeAllStreams();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
```

## Creating Your Own Examples

1. Create a new TypeScript file in the appropriate category:
```bash
touch examples/MarketData/myExample.ts
```

2. Use the example template:
```typescript
import { TradeStationClient } from '../../src';

async function main() {
    const client = new TradeStationClient();

    try {
        // Your implementation here
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        client.closeAllStreams();
    }
}

main();
```

3. Run your example:
```bash
./run-example.sh MarketData/myExample
```

## Example Best Practices

1. **Error Handling**
```typescript
try {
    // Implementation
} catch (error) {
    if (error.name === 'ValidationError') {
        console.error('Invalid input:', error.message);
    } else if (error.name === 'ApiError') {
        console.error('API error:', error.message);
    } else {
        console.error('Unknown error:', error);
    }
} finally {
    client.closeAllStreams();
}
```

2. **Resource Cleanup**
```typescript
const streams: EventEmitter[] = [];

try {
    const stream1 = await client.marketData.streamQuotes(['MSFT']);
    streams.push(stream1);
    
    const stream2 = await client.marketData.streamBars('AAPL');
    streams.push(stream2);
    
} finally {
    // Clean up all streams
    streams.forEach(stream => stream.emit('close'));
}
```

3. **Configuration**
```typescript
// Load from environment
const client = new TradeStationClient();

// Or explicit configuration
const client = new TradeStationClient({
    environment: 'Simulation',
    debug: true
});
```

## Debugging Examples

1. Enable debug mode:
```typescript
const client = new TradeStationClient({
    debug: true
});
```

2. Use the debug environment variable:
```bash
DEBUG=true ./run-example.sh MarketData/streamQuotes
```

3. Add logging:
```typescript
client.on('debug', (message) => {
    console.log('Debug:', message);
});
```

## Additional Resources

- [API Documentation](./API.md)
- [Authentication Guide](./Authentication.md)
- [Streaming Guide](./Streaming.md)
- [Rate Limiting Guide](./RateLimiting.md)
- [TradeStation API Documentation](https://api.tradestation.com/docs/) 