import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient()

    try {
        // Get all available crypto symbols
        console.log('\nGetting Available Crypto Symbols:');
        const cryptoSymbols = await client.marketData.getCryptoSymbolNames();

        // Display all available crypto symbols
        console.log('\nAvailable Crypto Symbols:');
        cryptoSymbols.SymbolNames.forEach(symbol => {
            console.log(symbol);
        });

        // Example of filtering by specific crypto pairs
        const popularPairs = ['BTCUSD', 'ETHUSD', 'DOGEUSD'];
        console.log('\nPopular Crypto Pairs:');
        cryptoSymbols.SymbolNames
            .filter(symbol => popularPairs.includes(symbol))
            .forEach(symbol => {
                console.log(`\nSymbol: ${symbol}`);
                console.log('---');
            });

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 