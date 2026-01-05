# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2026-01-05

### Security

- Fixed several security vulnerabilities by updating dependencies:
  - **form-data**: Updated from 4.0.2 to 4.0.5 (Critical)
  - **axios**: Updated from 1.7.9 to 1.13.2 (High)
  - **@babel/helpers**: Updated from 7.26.9 to 7.28.4 (Moderate)
  - **js-yaml**: Updated from 3.14.1 to 3.14.2 (Moderate)
  - **brace-expansion**: Updated from 1.1.11 to 1.1.12 and 2.0.1 to 2.0.2 (Low)

## [1.3.0] - 2026-01-05

### Changed

- Made `clientSecret` optional in `TradeStationClient` configuration to support public clients (e.g., mobile or desktop apps) that do not use a client secret.

## [1.2.1] - 2025-03-15

### Enhanced

- Added automatic reading of refresh token from environment variables
- Client initialization now supports simpler syntax that reads all credentials from environment

## [1.2.0] - 2025-03-09

### Added

- Support for refresh token authentication
- Helper script for obtaining refresh tokens (`docs/getauthtoken.sh`)

### Changed

- Updated authentication method from username/password to refresh token
- Modified client initialization to use refresh tokens
- Updated all examples to use refresh token authentication
- Simplified environment setup with consolidated `.env` file (replacing `.env.local`)
- Updated documentation to reflect the new authentication approach
- Token manager now supports refresh token rotation

### Removed

- Username/password authentication method
- References to `.env.local` in favor of `.env`

## [1.1.0] - 2025-02-18

### Fixed

- Fixed type errors in historical orders test
- Improved test coverage across all services
- Enhanced error handling in stream management

### Changed

- Updated package dependencies to latest versions
- Improved TypeScript type definitions
- Enhanced documentation with more examples

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
