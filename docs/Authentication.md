# Authentication Guide

This guide explains how to authenticate with the TradeStation API using this TypeScript wrapper.

## Overview

The TradeStation API uses OAuth 2.0 for authentication. This wrapper handles all the OAuth complexity for you, including:
- Initial authentication
- Token refresh
- Token storage
- Environment selection (Simulation/Live)

## Setup

### 1. Get API Credentials

1. Go to the [TradeStation API Portal](https://api.tradestation.com/)
2. Create or log into your account
3. Create a new application
4. Note your Client ID and Client Secret

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
USERNAME=your_username
PASSWORD=your_password
ENVIRONMENT=Simulation  # or 'Live'
```

### 3. Initialize the Client

```typescript
import { TradeStationClient } from 'tradestation-api-ts';

// Using environment variables
const client = new TradeStationClient();

// Or with explicit configuration
const client = new TradeStationClient({
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret',
    username: 'your_username',
    password: 'your_password',
    environment: 'Simulation'
});
```

## Authentication Flow

1. When you create a new `TradeStationClient`, it initializes the authentication system but doesn't authenticate immediately.

2. The first time you make an API request, the client will:
   - Authenticate using your credentials
   - Store the access token
   - Store the refresh token
   - Set up automatic token refresh

3. Subsequent requests will:
   - Use the stored access token
   - Automatically refresh when needed
   - Handle token errors

## Token Management

The wrapper handles tokens automatically:

```typescript
// Authentication happens automatically on first request
const accounts = await client.brokerage.getAccounts();

// Token refresh happens automatically when needed
const positions = await client.brokerage.getPositions('account_id');

// You can manually authenticate if needed
await client.authenticate();
```

## Environment Selection

The wrapper supports both Simulation and Live environments:

```typescript
// Simulation environment (default)
const simClient = new TradeStationClient({
    environment: 'Simulation',
    // ... other config
});

// Live environment
const liveClient = new TradeStationClient({
    environment: 'Live',
    // ... other config
});
```

## Error Handling

Authentication-related errors are handled consistently:

```typescript
try {
    await client.authenticate();
} catch (error) {
    if (error.name === 'AuthenticationError') {
        console.error('Authentication failed:', error.message);
        // Handle invalid credentials
    } else if (error.name === 'NetworkError') {
        console.error('Network error:', error.message);
        // Handle network issues
    } else {
        console.error('Other error:', error.message);
    }
}
```

Common authentication errors:
- Invalid credentials
- Expired tokens
- Network issues
- Rate limiting
- Invalid scope

## Security Best Practices

1. Never commit credentials to source control
2. Use environment variables for sensitive data
3. Keep your Client Secret secure
4. Use the Simulation environment for testing
5. Monitor token usage and refresh patterns
6. Implement proper error handling
7. Close unused streams to manage resources

## Troubleshooting

### Common Issues

1. "Invalid Credentials"
   - Check your username and password
   - Verify your Client ID and Secret
   - Ensure you're using the correct environment

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
    // ... other config
});
```

## Additional Resources

- [TradeStation API Documentation](https://api.tradestation.com/docs/)
- [OAuth 2.0 Documentation](https://oauth.net/2/)
- [API Status Page](https://status.tradestation.com/)
- [TradeStation Support](https://www.tradestation.com/support/) 