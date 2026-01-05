# TradeStation API TypeScript Wrapper

A comprehensive TypeScript wrapper for TradeStation WebAPI v3, providing type-safe access to TradeStation's brokerage and market data services.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This project provides a complete TypeScript implementation of the TradeStation WebAPI v3, offering:

- 🔒 Secure authentication and token management
- 🚦 Built-in rate limiting
- 📊 Real-time market data streaming
- 💼 Complete brokerage functionality
- 📈 Order execution capabilities
- 📘 Comprehensive TypeScript definitions
- ⚡ Streaming WebSocket support
- 🧪 Example implementations

> **Note**: For the most up-to-date API specifications and documentation, please refer to the [official TradeStation API documentation](https://api.tradestation.com/docs/).

## Installation

```bash
npm install tradestation-api-ts
```

## Usage

### Basic Setup

```typescript
import { TradeStationClient } from 'tradestation-api-ts';

// Initialize with environment variables
// Automatically reads CLIENT_ID, CLIENT_SECRET (optional), REFRESH_TOKEN, and ENVIRONMENT from .env
const client = new TradeStationClient();

// Or with explicit configuration
const client = new TradeStationClient({
    refresh_token: 'your_refresh_token',
    environment: 'Simulation'  // or 'Live'
});
```

### Market Data

```typescript
// Get quote snapshots
const quotes = await client.marketData.getQuoteSnapshots(['MSFT', 'AAPL']);

// Stream real-time quotes
const stream = await client.marketData.streamQuotes(['MSFT', 'AAPL']);
stream.on('data', (quote) => {
    console.log('Quote update:', quote);
});

// Get historical bars
const bars = await client.marketData.getBarHistory('MSFT', {
    interval: '1',
    unit: 'Minute',
    barsback: 100
});
```

### Order Execution

```typescript
// Place a market order
const order = await client.orderExecution.placeOrder({
    AccountID: 'your_account_id',
    Symbol: 'MSFT',
    Quantity: '100',
    OrderType: 'Market',
    TradeAction: 'Buy',
    TimeInForce: { Duration: 'DAY' },
    Route: 'Intelligent'
});

// Place a bracket order
const bracketOrder = await client.orderExecution.placeGroupOrder({
    Type: 'BRK',
    Orders: [
        {
            AccountID: 'your_account_id',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'Market',
            TradeAction: 'Buy',
            TimeInForce: { Duration: 'DAY' }
        },
        {
            AccountID: 'your_account_id',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'Limit',
            LimitPrice: '160.00',
            TradeAction: 'Sell',
            TimeInForce: { Duration: 'GTC' }
        },
        {
            AccountID: 'your_account_id',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'StopMarket',
            StopPrice: '145.00',
            TradeAction: 'Sell',
            TimeInForce: { Duration: 'GTC' }
        }
    ]
});
```

### Brokerage

```typescript
// Get accounts
const accounts = await client.brokerage.getAccounts();

// Get positions
const positions = await client.brokerage.getPositions('your_account_id');

// Stream position updates
const positionStream = await client.brokerage.streamPositions('your_account_id');
positionStream.on('data', (position) => {
    console.log('Position update:', position);
});
```

### Error Handling

```typescript
try {
    const quotes = await client.marketData.getQuoteSnapshots(['INVALID']);
} catch (error) {
    if (error.name === 'ValidationError') {
        console.error('Invalid input:', error.message);
    } else if (error.name === 'ApiError') {
        console.error('API error:', error.message);
    } else {
        console.error('Unknown error:', error);
    }
}
```

### Resource Cleanup

```typescript
// Close specific stream
stream.emit('close');

// Close all active streams
client.closeAllStreams();
```

## Quick Start

1. Create a `.env` file with your TradeStation API credentials:

```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret # Optional for public clients
REFRESH_TOKEN=your_refresh_token
ENVIRONMENT=Simulation  # or 'Live'
```

1. Initialize the client:

```typescript
import { TradeStationClient } from 'tradestation-api-ts';

const client = new TradeStationClient();

// Get account balances
const balances = await client.brokerage.getBalances('your_account_id');

// Stream real-time quotes
const quoteStream = await client.marketData.streamQuotes(['MSFT', 'AAPL']);
quoteStream.on('data', (quote) => {
    console.log('Quote update:', quote);
});
```

## Features

### 1. Request Client

- Automatic token management
- Configurable retry logic
- Error handling
- Request/response interceptors

### 2. Authentication

- OAuth 2.0 implementation
- Automatic token refresh
- Simulation/Live environment support

### 3. Rate Limiter

- Automatic rate limiting
- Configurable limits
- Queue management
- Headers-based rate tracking

### 4. Market Data APIs

- Real-time quotes
- Historical bars
- Option chains
- Market depth
- Symbol information

### 5. Brokerage APIs

- Account management
- Position tracking
- Balance information
- Order history
- Activity tracking

### 6. Order Execution APIs

- Order placement
- Order modification
- Order cancellation
- Complex order types
- OCO and bracket orders

## Local Development

### Prerequisites

- Node.js (>=14.0.0)
- npm or yarn
- Git

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/mxcoppell/tradestation-api-ts.git
cd tradestation-api-ts

# Install dependencies
npm install

# Create local environment file
cp .env.sample .env
# Edit .env with your TradeStation API credentials
```

### Build

```bash
# Build the library
npm run build

# Build examples
npm run build:examples

# Build both library and examples
npm run build:all
```

### Test

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Run Examples

The project includes a helper script to run examples:

```bash
# List all available examples
./run-example.sh --list

# Run a specific example
./run-example.sh QuickStart/getStarted

# Run multiple examples
./run-example.sh MarketData/getBars MarketData/getQuotes
```

### Development Workflow

1. Make your changes in the `src` directory
2. Add or update tests in `src/**/__tests__`
3. Run tests to ensure everything works
4. Build the project to check for compilation errors
5. Try your changes using the examples
6. Submit a pull request with your changes

## Documentation

- [Detailed API Documentation](./docs/API.md)
- [Authentication Guide](./docs/Authentication.md)
- [Streaming Guide](./docs/Streaming.md)
- [Rate Limiting](./docs/RateLimiting.md)
- [Examples Guide](./docs/Examples.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code of Conduct
- Development process
- Pull request process
- Coding standards
- Testing requirements

## Building from Source

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Build examples
npm run build:examples

# Run tests
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- TradeStation for providing the WebAPI
- All contributors to this project
- The TypeScript team for the amazing language and tools

## Support

- For API-specific questions, refer to [TradeStation API Documentation](https://api.tradestation.com/docs/)
- For issues with this wrapper, [open an issue](https://github.com/your-repo/tradestation-api-ts/issues)
- For general TradeStation questions, contact [TradeStation Client Services](mailto:ClientExperience@tradestation.com)

---

**Disclaimer**: This is an unofficial wrapper for the TradeStation WebAPI. It is not affiliated with, maintained, authorized, or endorsed by TradeStation.
