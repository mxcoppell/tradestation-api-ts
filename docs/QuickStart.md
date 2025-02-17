# QuickStart Guide 🚀

Welcome to the TradeStation API TypeScript wrapper! This guide will help you get up and running in no time, even if you've never used TradeStation's API before. Let's get started!

## What You'll Need 📋

Before we begin, make sure you have:
- [Node.js](https://nodejs.org/) installed (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A TradeStation account (if you don't have one, [sign up here](https://www.tradestation.com/))
- Basic knowledge of TypeScript/JavaScript

## Step 1: Getting Your API Credentials 🔑

1. Go to the [TradeStation API Portal](https://api.tradestation.com/)
2. Click "Sign In" and log in with your TradeStation credentials
3. Once logged in, click "Create New App"
4. Fill in your application details:
   - Name: Choose a name for your app
   - Description: Brief description of what you're building
   - Redirect URI: Use `http://localhost` for now
5. Click "Create App"
6. You'll receive:
   - Client ID
   - Client Secret
   Keep these safe - you'll need them soon!

## Step 2: Setting Up Your Project 🛠️

1. Create a new directory for your project:
```bash
mkdir my-tradestation-app
cd my-tradestation-app
```

2. Initialize a new npm project:
```bash
npm init -y
```

3. Install the required packages:
```bash
npm install tradestation-api-ts dotenv typescript ts-node @types/node
```

4. Create a TypeScript configuration file (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  }
}
```

## Step 3: Setting Up Environment Variables 🔐

1. Create a `.env.local` file in your project root:
```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
USERNAME=your_tradestation_username
PASSWORD=your_tradestation_password
ENVIRONMENT=Simulation  # Use 'Simulation' for testing, 'Live' for real trading
```

> 🔒 Security Tip: Never commit your `.env.local` file to version control! Add it to your `.gitignore`:
```bash
echo ".env.local" >> .gitignore
```

## Step 4: Creating Your First Script 📝

Create a new file called `quickStart.ts`:

```typescript
import { TradeStationClient } from 'tradestation-api-ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    try {
        // Initialize the client
        const client = new TradeStationClient();
        
        // Get symbol information for Apple (AAPL)
        console.log('Fetching symbol details for AAPL...');
        const response = await client.marketData.getSymbolDetails('AAPL');
        
        // Get the first symbol from the response
        const symbol = response.Symbols[0];
        
        // Display the results
        console.log('\nSymbol Details:');
        console.log('---------------');
        console.log(`Symbol: ${symbol.Symbol}`);
        console.log(`Asset Type: ${symbol.AssetType}`);
        console.log(`Description: ${symbol.Description}`);
        console.log(`Exchange: ${symbol.Exchange}`);
        console.log(`Currency: ${symbol.Currency}`);
        
        // Get a real-time quote
        console.log('\nFetching real-time quote...');
        const quoteResponse = await client.marketData.getQuoteSnapshots(['AAPL']);
        const quote = quoteResponse.Quotes[0];
        
        console.log('\nReal-time Quote:');
        console.log('---------------');
        console.log(`Last Price: $${quote.Last}`);
        console.log(`Change: ${quote.NetChange} (${quote.NetChangePct}%)`);
        console.log(`Bid: $${quote.Bid}`);
        console.log(`Ask: $${quote.Ask}`);
        console.log(`Volume: ${quote.Volume}`);
        
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
}

main();
```

## Step 5: Running Your Script 🏃‍♂️

1. Run the script using ts-node:
```bash
npx ts-node quickStart.ts
```

2. You should see output similar to this:
```
Fetching symbol details for AAPL...

Symbol Details:
---------------
Symbol: AAPL
Asset Type: Stock
Description: APPLE INC
Exchange: NASDAQ
Currency: USD

Fetching real-time quote...

Real-time Quote:
---------------
Last Price: $173.45
Change: 2.31 (1.35%)
Bid: $173.44
Ask: $173.46
Volume: 23456789
```

## What's Next? 🎯

Now that you've got your first script running, here are some things you can try:

1. **Stream Real-time Data**
```typescript
const quoteStream = await client.marketData.streamQuotes(['AAPL']);
quoteStream.on('data', (quote) => {
    console.log(`Price Update: $${quote.Last}`);
});
```

2. **Get Account Information**
```typescript
const accounts = await client.brokerage.getAccounts();
console.log('Your accounts:', accounts);
```

3. **Place a Test Order** (in Simulation environment)
```typescript
const order = await client.orderExecution.placeOrder({
    AccountID: 'your_account_id',
    Symbol: 'AAPL',
    Quantity: '1',
    OrderType: 'Market',
    TradeAction: 'BUY'
});
```

## Common Issues & Solutions 🔧

1. **Authentication Error**
   - Double-check your credentials in `.env.local`
   - Ensure you're using the correct environment ('Simulation' or 'Live')

2. **Rate Limit Exceeded**
   - The wrapper handles rate limiting automatically
   - If you see this error, your requests will be queued and retried

3. **Network Error**
   - Check your internet connection
   - Verify that the TradeStation API is up ([status page](https://status.tradestation.com/))

## Getting Help 💁‍♂️

- Check the [API Documentation](./API.md)
- Review the [Examples Guide](./Examples.md)
- Visit the [TradeStation API Documentation](https://api.tradestation.com/docs/)
- Contact [TradeStation Support](https://www.tradestation.com/support/) for account-related questions

## Tips for Success 💡

1. **Start in Simulation**
   - Always test your code in the Simulation environment first
   - Use real market data but simulated trading

2. **Monitor Your Usage**
   - Keep track of your API usage in the TradeStation API Portal
   - Set up monitoring for rate limits

3. **Handle Errors Gracefully**
   - Always use try/catch blocks
   - Implement proper error handling
   - Log errors for debugging

4. **Clean Up Resources**
   - Close streams when you're done with them
   - Use `client.closeAllStreams()` in cleanup

Happy coding! 🎉 