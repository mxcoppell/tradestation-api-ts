import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This example demonstrates how to:
 * 1. Set up a TradeStationClient with proper authentication
 * 2. Make API requests with automatic rate limiting
 * 3. Get symbol definition for AAPL
 * 4. Handle the response and potential errors
 * 
 * Required environment variables (.env.local):
 * - CLIENT_ID: Your TradeStation API client ID
 * - CLIENT_SECRET: Your TradeStation API client secret
 * - USERNAME: Your TradeStation username
 * - PASSWORD: Your TradeStation password
 * - SCOPE: API access scope (e.g., "ReadAccount Trade Matrix")
 */

async function main() {
    try {
        // Initialize the TradeStation client
        // The client will automatically:
        // - Load credentials from environment variables
        // - Handle authentication
        // - Manage rate limiting (default: 120 requests per minute)
        const client = new TradeStationClient();

        // Get symbol definition for AAPL
        console.log('\nFetching symbol definition for AAPL...');
        const response = await client.marketData.getSymbolDetails('AAPL');

        // Check for errors
        if (response.Errors && response.Errors.length > 0) {
            console.error('Errors:', response.Errors);
            return;
        }

        // Get the symbol details (first item in the array)
        const symbol = response.Symbols[0];

        // Display the results in a structured format
        console.log('\nSymbol Details:');
        console.log('---------------');
        console.log(`Symbol: ${symbol.Symbol}`);
        console.log(`Asset Type: ${symbol.AssetType}`);
        console.log(`Description: ${symbol.Description}`);
        console.log(`Exchange: ${symbol.Exchange}`);
        console.log(`Country: ${symbol.Country}`);
        console.log(`Currency: ${symbol.Currency}`);

        // Display price formatting information
        console.log('\nPrice Format:');
        console.log('-------------');
        console.log(`Format: ${symbol.PriceFormat.Format}`);
        console.log(`Decimals: ${symbol.PriceFormat.Decimals}`);
        console.log(`Increment Style: ${symbol.PriceFormat.IncrementStyle}`);
        console.log(`Increment: ${symbol.PriceFormat.Increment}`);

        // Display quantity formatting information
        console.log('\nQuantity Format:');
        console.log('----------------');
        console.log(`Format: ${symbol.QuantityFormat.Format}`);
        console.log(`Decimals: ${symbol.QuantityFormat.Decimals}`);
        console.log(`Increment: ${symbol.QuantityFormat.Increment}`);
        console.log(`Minimum Trade Quantity: ${symbol.QuantityFormat.MinimumTradeQuantity}`);

        // Example of formatting a price using the symbol's price format
        const examplePrice = 123.456789;
        console.log('\nPrice Formatting Example:');
        console.log('------------------------');
        console.log(`Raw Price: ${examplePrice}`);
        if (symbol.PriceFormat.Format === 'Decimal' && symbol.PriceFormat.Decimals) {
            const formattedPrice = examplePrice.toFixed(parseInt(symbol.PriceFormat.Decimals));
            console.log(`Formatted Price: ${formattedPrice}`);
        }

    } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error occurred');
        if (error instanceof Error && error.stack) {
            console.debug('Stack trace:', error.stack);
        }
    }
}

// Run the example
main(); 