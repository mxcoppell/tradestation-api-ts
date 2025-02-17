import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient()

    try {
        // Get accounts first
        const accounts = await client.brokerage.getAccounts();
        if (accounts.length > 0) {
            const accountId = accounts[0].AccountID;

            // Example 1: Stream all positions
            console.log('\nStreaming Position Updates:');
            const positionStream = await client.brokerage.streamPositions(accountId);

            positionStream.on('data', (data) => {
                if ('Symbol' in data) {
                    console.log('\nPosition Update:');
                    console.log(`Symbol: ${data.Symbol}`);
                    console.log(`Asset Type: ${data.AssetType}`);
                    console.log(`Quantity: ${data.Quantity}`);
                    console.log(`Average Price: ${data.AveragePrice}`);
                    console.log(`Last: ${data.Last}`);
                    console.log(`Market Value: ${data.MarketValue}`);
                    console.log(`Today's P/L: ${data.TodaysProfitLoss}`);
                    console.log(`Unrealized P/L: ${data.UnrealizedProfitLoss}`);
                    if (data.AssetType === 'STOCKOPTION') {
                        console.log(`Expiration: ${data.ExpirationDate}`);
                        console.log(`Strike Price: ${data.StrikePrice}`);
                        console.log(`Option Type: ${data.OptionType}`);
                        console.log(`Underlying: ${data.Underlying}`);
                    }
                    console.log('---');
                } else if ('Heartbeat' in data) {
                    console.log('Heartbeat:', data.Timestamp);
                } else {
                    console.log('Error:', data.Message);
                }
            });

            // Keep the stream open for 30 seconds
            await new Promise(resolve => setTimeout(resolve, 30000));

            // Clean up stream
            positionStream.emit('close');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 