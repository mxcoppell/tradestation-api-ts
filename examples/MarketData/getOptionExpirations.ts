import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient()

    try {
        // Example 1: Get all expirations for MSFT
        console.log('\nGetting Option Expirations for MSFT:');
        const msftExpirations = await client.marketData.getOptionExpirations('MSFT');

        console.log('\nAvailable Expirations:');
        msftExpirations.Expirations.forEach(exp => {
            console.log(`${exp.Date} (${exp.Type})`);
        });

        // Example 2: Get expirations for MSFT at strike price 400
        console.log('\nGetting Option Expirations for MSFT at strike 400:');
        const msftStrikeExpirations = await client.marketData.getOptionExpirations('MSFT', 400);

        console.log('\nAvailable Expirations at Strike 400:');
        msftStrikeExpirations.Expirations.forEach(exp => {
            console.log(`${exp.Date} (${exp.Type})`);
        });

        // Example 3: Get all strikes for MSFT
        console.log('\nGetting Option Strikes for MSFT:');
        const msftStrikes = await client.marketData.getOptionStrikes('MSFT');

        console.log(`\nSpread Type: ${msftStrikes.SpreadType}`);
        console.log('Available Strikes:');
        msftStrikes.Strikes.forEach(strike => {
            console.log(strike.join(', '));
        });

        // Example 4: Get strikes for MSFT options expiring on June 21, 2024
        console.log('\nGetting Option Strikes for MSFT expiring on June 21, 2024:');
        const msftDateStrikes = await client.marketData.getOptionStrikes('MSFT', '2024-06-21');

        console.log(`\nSpread Type: ${msftDateStrikes.SpreadType}`);
        console.log('Available Strikes:');
        msftDateStrikes.Strikes.forEach(strike => {
            console.log(strike.join(', '));
        });

        // Example 5: Get strikes for MSFT butterfly spreads expiring on June 21, 2024
        console.log('\nGetting Option Strikes for MSFT Butterfly Spreads expiring on June 21, 2024:');
        const butterflyStrikes = await client.marketData.getOptionStrikes('MSFT', '2024-06-21', 'Butterfly');

        console.log(`\nSpread Type: ${butterflyStrikes.SpreadType}`);
        console.log('Available Butterfly Spreads:');
        butterflyStrikes.Strikes.forEach(strikes => {
            console.log(`${strikes[0]} / ${strikes[1]} / ${strikes[2]}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 