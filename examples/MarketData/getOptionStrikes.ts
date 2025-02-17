import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient();

    try {
        // Get available expiration dates for SPY options
        console.log('\nGetting SPY Option Expirations:');
        const expirations = await client.marketData.getOptionExpirations('SPY');
        console.log('Available Expirations:', expirations.Expirations.map(exp => `${exp.Date} (${exp.Type})`));

        // Use the first monthly expiration
        const monthlyExpiration = expirations.Expirations.find(exp => exp.Type === 'Monthly')?.Date;
        if (!monthlyExpiration) {
            throw new Error('No monthly expiration found');
        }
        console.log(`\nUsing expiration date: ${monthlyExpiration}`);

        // Example 1: Get all strikes for SPY
        console.log('\nGetting All Option Strikes for SPY:');
        const spyStrikes = await client.marketData.getOptionStrikes('SPY');

        console.log(`\nSpread Type: ${spyStrikes.SpreadType}`);
        console.log('Available Strikes:');
        spyStrikes.Strikes.forEach(strike => {
            console.log(strike);
        });

        // Example 2: Get strikes for SPY options for the selected expiration
        console.log(`\nGetting Option Strikes for SPY expiring on ${monthlyExpiration}:`);
        const spyDateStrikes = await client.marketData.getOptionStrikes('SPY', monthlyExpiration);

        console.log(`\nSpread Type: ${spyDateStrikes.SpreadType}`);
        console.log('Available Strikes:');
        spyDateStrikes.Strikes.forEach(strike => {
            console.log(strike);
        });

        // Example 3: Get strikes for SPY butterfly spreads
        console.log(`\nGetting Option Strikes for SPY Butterfly Spreads expiring on ${monthlyExpiration}:`);
        const butterflyStrikes = await client.marketData.getOptionStrikes('SPY', monthlyExpiration, 'Butterfly');

        console.log(`\nSpread Type: ${butterflyStrikes.SpreadType}`);
        console.log('Available Butterfly Spreads:');
        butterflyStrikes.Strikes.forEach(strikes => {
            console.log(`${strikes[0]} / ${strikes[1]} / ${strikes[2]}`);
        });

        // Example 4: Get strikes for SPY vertical spreads
        console.log(`\nGetting Option Strikes for SPY Vertical Spreads expiring on ${monthlyExpiration}:`);
        const verticalStrikes = await client.marketData.getOptionStrikes('SPY', monthlyExpiration, 'Vertical');

        console.log(`\nSpread Type: ${verticalStrikes.SpreadType}`);
        console.log('Available Vertical Spreads:');
        verticalStrikes.Strikes.forEach(strikes => {
            console.log(`${strikes[0]} / ${strikes[1]}`);
        });

        // Example 5: Get strikes for SPY calendar spreads
        // For calendar spreads, we need two expiration dates
        const nextMonthlyExpiration = expirations.Expirations
            .filter(exp => exp.Type === 'Monthly' && exp.Date > monthlyExpiration)[0]?.Date;

        if (nextMonthlyExpiration) {
            console.log('\nGetting Option Strikes for SPY Calendar Spreads:');
            const calendarStrikes = await client.marketData.getOptionStrikes(
                'SPY',
                monthlyExpiration,
                'Calendar',
                { expiration2: nextMonthlyExpiration }
            );

            console.log(`\nSpread Type: ${calendarStrikes.SpreadType}`);
            console.log(`Using expirations: ${monthlyExpiration} and ${nextMonthlyExpiration}`);
            console.log('Available Calendar Spreads:');
            calendarStrikes.Strikes.forEach(strikes => {
                console.log(`Strike: ${strikes[0]}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 