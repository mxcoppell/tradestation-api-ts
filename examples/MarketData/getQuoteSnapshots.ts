import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient({
        refresh_token: process.env.REFRESH_TOKEN,
        environment: (process.env.ENVIRONMENT || "Simulation") as "Simulation" | "Live"
    });

    try {
        // Example 1: Get a single quote
        const singleQuote = await client.marketData.getQuoteSnapshots(['AAPL']);
        console.log('\nSingle Quote for AAPL:');
        console.log(`Last Price: ${singleQuote.Quotes[0].Last}`);
        console.log(`Bid: ${singleQuote.Quotes[0].Bid}`);
        console.log(`Ask: ${singleQuote.Quotes[0].Ask}`);
        console.log(`Volume: ${singleQuote.Quotes[0].Volume}`);

        // Example 2: Get multiple quotes
        const multipleQuotes = await client.marketData.getQuoteSnapshots(['MSFT', 'GOOGL', 'AMZN']);
        console.log('\nMultiple Quotes:');
        multipleQuotes.Quotes.forEach(quote => {
            console.log(`\nSymbol: ${quote.Symbol}`);
            console.log(`Last Price: ${quote.Last}`);
            console.log(`Change: ${quote.NetChange}`);
            console.log(`Percent Change: ${quote.NetChangePct}%`);
            console.log(`High: ${quote.High}`);
            console.log(`Low: ${quote.Low}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 