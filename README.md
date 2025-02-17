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

## Quick Start

1. Create a `.env.local` file with your TradeStation API credentials:

```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
USERNAME=your_username
PASSWORD=your_password
ENVIRONMENT=Simulation  # or 'Live'
```

2. Initialize the client:

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

## Running Examples

The project includes comprehensive examples for all API functionalities. Use the provided script to run examples:

```bash
# List all available examples
./run-example.sh --list

# Run a specific example
./run-example.sh QuickStart/getStarted

# Run multiple examples
./run-example.sh MarketData/getBars MarketData/getQuotes
```

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