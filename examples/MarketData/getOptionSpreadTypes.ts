import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient();

    try {
        // Get available option spread types
        console.log('\nGetting Available Option Spread Types:');
        const spreadTypes = await client.marketData.getOptionSpreadTypes();

        // Display all available spread types
        console.log('\nAvailable Spread Types:');
        spreadTypes.SpreadTypes.forEach(type => {
            console.log(`\nSpread Type: ${type.Name}`);
            console.log(`Uses Strike Intervals: ${type.StrikeInterval}`);
            console.log(`Uses Multiple Expirations: ${type.ExpirationInterval}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 