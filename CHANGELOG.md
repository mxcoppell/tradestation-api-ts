# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-18

### Added
- Initial release of the TradeStation API TypeScript wrapper
- Complete TypeScript implementation of TradeStation WebAPI v3
- Comprehensive test coverage
- Full documentation
- Example implementations for all API endpoints

#### Authentication
- OAuth 2.0 implementation with automatic token refresh
- Environment-based configuration (Simulation/Live)
- Secure credential management

#### Request Client
- Axios-based HTTP client with interceptors
- Automatic retry logic
- Comprehensive error handling
- Request/response logging

#### Rate Limiting
- Automatic rate limit handling
- Queue-based request management
- Headers-based rate tracking
- Configurable limits

#### Market Data
- Real-time quote streaming
- Historical bar data
- Option chain data
- Market depth information
- Symbol details
- Quote snapshots

#### Brokerage
- Account management
- Position tracking
- Balance information
- Order history
- Activity monitoring

#### Order Execution
- Order placement
- Order modification
- Order cancellation
- Complex order types
- OCO and bracket orders

#### Streaming
- WebSocket implementation
- Event-based data handling
- Automatic reconnection
- Stream management

#### Examples
- Comprehensive example implementations
- Helper script for running examples
- Documentation for all examples

#### Development
- Complete TypeScript configuration
- Jest test setup
- ESLint configuration
- Prettier formatting
- GitHub Actions CI/CD

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- Secure token management
- Environment variable handling
- API key protection 