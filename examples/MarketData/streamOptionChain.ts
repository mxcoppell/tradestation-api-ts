import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient();

    try {
        // Get available expiration dates for MSFT options
        console.log('\nGetting MSFT Option Expirations:');
        const expirations = await client.marketData.getOptionExpirations('MSFT');
        console.log('Available Expirations:', expirations.Expirations.map(exp => `${exp.Date} (${exp.Type})`));

        // Use the first available expiration date
        const expiration = expirations.Expirations[0].Date;
        console.log(`\nUsing expiration date: ${expiration}`);

        // Stream option chain for MSFT
        console.log('\nStreaming Option Chain for MSFT:');
        const stream = await client.marketData.streamOptionChain('MSFT', {
            expiration,
            strikeProximity: 5,
            enableGreeks: true
        });

        // Set up event handler for option chain data
        stream.on('data', (data) => {
            if ('Delta' in data) {
                // Display option chain details
                console.log('\nOption Details:');
                console.log(`Strike: ${data.Strikes[0]}`);
                console.log(`Side: ${data.Side}`);
                console.log(`Last: ${data.Last}`);
                console.log(`Bid: ${data.Bid}`);
                console.log(`Ask: ${data.Ask}`);
                console.log(`Volume: ${data.Volume}`);
                console.log(`Open Interest: ${data.DailyOpenInterest}`);
                console.log('\nGreeks:');
                console.log(`Delta: ${data.Delta}`);
                console.log(`Theta: ${data.Theta}`);
                console.log(`Gamma: ${data.Gamma}`);
                console.log(`Vega: ${data.Vega}`);
                console.log(`Rho: ${data.Rho}`);
                console.log(`IV: ${data.ImpliedVolatility}`);
                console.log('\nProbabilities:');
                console.log(`ITM: ${data.ProbabilityITM}`);
                console.log(`OTM: ${data.ProbabilityOTM}`);
                console.log(`BE: ${data.ProbabilityBE}`);
                console.log('-'.repeat(50));
            } else if ('Heartbeat' in data) {
                console.log('Heartbeat:', data.Timestamp);
            } else {
                console.log('Failed to parse line:', JSON.stringify(data));
            }
        });

        // Keep the stream open for 30 seconds
        await new Promise(resolve => setTimeout(resolve, 30000));
        stream.emit('close');

    } catch (error) {
        console.error('Error:', error);
    }
}

main();