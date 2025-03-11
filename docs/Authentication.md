# Authentication Guide

This guide explains how to authenticate with the TradeStation API using this TypeScript wrapper.

## Overview

The TradeStation API uses OAuth 2.0 for authentication. This wrapper handles all the OAuth complexity for you, including:
- Token management using refresh tokens
- Automatic token refresh
- Token rotation (handling new refresh tokens)
- Environment selection (Simulation/Live)

## Setup

### 1. Get API Credentials

1. Go to the [TradeStation API Portal](https://api.tradestation.com/)
2. Create or log into your account
3. Create a new application
4. Note your Client ID and Client Secret

### 2. Obtain a Refresh Token

TradeStation uses OAuth 2.0 with refresh tokens for authentication. You'll need to:

1. Use the TradeStation OAuth flow to get an initial refresh token
2. Set up the refresh token in your environment configuration

The refresh token is a long-lived credential that allows your application to obtain new access tokens without requiring user interaction each time.

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token
ENVIRONMENT=Simulation  # or 'Live'
```

### 4. Initialize the Client

```typescript
import { TradeStationClient } from 'tradestation-api-ts';

// Using environment variables
// Automatically reads CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, and ENVIRONMENT from .env
const client = new TradeStationClient();

// Or with explicit configuration
const client = new TradeStationClient({
    refresh_token: 'your_refresh_token',
    environment: 'Simulation'  // or 'Live'
});
```

## Authentication Flow

1. When you create a new `TradeStationClient`, it initializes the authentication system but doesn't authenticate immediately.

2. The first time you make an API request, the client will:
   - Use the refresh token to obtain a new access token
   - Store the access token
   - Set up automatic token refresh

3. Subsequent requests will:
   - Use the stored access token
   - Automatically refresh when needed
   - Handle token rotation (if API returns a new refresh token)

## Token Management

The wrapper handles tokens automatically:

```typescript
// Authentication happens automatically on first request
const accounts = await client.brokerage.getAccounts();

// Token refresh happens automatically when needed
const positions = await client.brokerage.getPositions('account_id');

// The client automatically handles new refresh tokens if provided by the API
```

## Environment Selection

The wrapper supports both Simulation and Live environments:

```typescript
// Simulation environment (default)
const simClient = new TradeStationClient({
    refresh_token: 'your_refresh_token',
    environment: 'Simulation'
});

// Live environment
const liveClient = new TradeStationClient({
    refresh_token: 'your_refresh_token',
    environment: 'Live'
});
```

## Error Handling

Authentication-related errors are handled consistently:

```typescript
try {
    const data = await client.marketData.getBars('AAPL');
} catch (error) {
    if (error.name === 'AuthenticationError') {
        console.error('Authentication failed:', error.message);
        // Handle invalid credentials or expired refresh token
    } else if (error.name === 'NetworkError') {
        console.error('Network error:', error.message);
        // Handle network issues
    } else {
        console.error('Other error:', error.message);
    }
}
```

Common authentication errors:
- Invalid refresh token
- Expired refresh token
- Network issues
- Rate limiting
- Invalid scope

## Security Best Practices

1. Never commit credentials to source control
2. Use environment variables for sensitive data
3. Keep your Client Secret and Refresh Token secure
4. Use the Simulation environment for testing
5. Monitor token usage and refresh patterns
6. Implement proper error handling
7. Close unused streams to manage resources

## Troubleshooting

### Common Issues

1. "Invalid Refresh Token"
   - Make sure your refresh token is correct
   - Refresh tokens may expire after long periods of inactivity
   - You may need to generate a new refresh token through the OAuth flow

2. "Token Expired"
   - This should be handled automatically
   - If persistent, check your system clock
   - Verify network connectivity

3. "Rate Limit Exceeded"
   - Reduce request frequency
   - Check for infinite loops
   - Verify stream cleanup

### Debug Mode

Enable debug logging for authentication issues:

```typescript
const client = new TradeStationClient({
    debug: true,
    refresh_token: 'your_refresh_token'
    // ... other config
});
```

## Additional Resources

- [TradeStation API Documentation](https://api.tradestation.com/docs/)
- [OAuth 2.0 Documentation](https://oauth.net/2/)
- [API Status Page](https://status.tradestation.com/)
- [TradeStation Support](https://www.tradestation.com/support/) 