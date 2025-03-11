import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient();

    try {
        // Stream market depth for a single symbol
        console.log('\nStreaming Market Depth for MSFT:');
        const depthStream = await client.marketData.streamMarketDepth('MSFT', { maxlevels: 5 });

        depthStream.on('data', (data) => {
            if ('Bids' in data) {
                console.log('\nMarket Depth Update:');

                // Display bid side
                console.log('\nBids (ordered from high to low price):');
                data.Bids.forEach((bid: {
                    Price: string;
                    Size: number;
                    OrderCount: number;
                    Name: string;
                    TimeStamp: string;
                }) => {
                    console.log(`Price: ${bid.Price}`);
                    console.log(`Size: ${bid.Size}`);
                    console.log(`Orders: ${bid.OrderCount}`);
                    console.log(`Market Maker: ${bid.Name}`);
                    console.log(`Time: ${bid.TimeStamp}`);
                    console.log('---');
                });

                // Display ask side
                console.log('\nAsks (ordered from low to high price):');
                data.Asks.forEach((ask: {
                    Price: string;
                    Size: number;
                    OrderCount: number;
                    Name: string;
                    TimeStamp: string;
                }) => {
                    console.log(`Price: ${ask.Price}`);
                    console.log(`Size: ${ask.Size}`);
                    console.log(`Orders: ${ask.OrderCount}`);
                    console.log(`Market Maker: ${ask.Name}`);
                    console.log(`Time: ${ask.TimeStamp}`);
                    console.log('---');
                });

                // Calculate and display spread
                if (data.Asks.length > 0 && data.Bids.length > 0) {
                    const bestBid = Math.max(...data.Bids.map((b: { Price: string }) => parseFloat(b.Price)));
                    const bestAsk = Math.min(...data.Asks.map((a: { Price: string }) => parseFloat(a.Price)));
                    const spread = bestAsk - bestBid;
                    console.log(`\nSpread: ${spread.toFixed(4)}`);
                }
            } else if ('Heartbeat' in data) {
                console.log('Heartbeat:', data.Timestamp);
            } else {
                console.log('Error:', data.Message);
            }
        });

        // Keep the stream open for 30 seconds
        await new Promise(resolve => setTimeout(resolve, 30000));
        depthStream.emit('close');

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 