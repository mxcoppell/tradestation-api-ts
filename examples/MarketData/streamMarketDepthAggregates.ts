import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient()

    try {
        // Stream aggregated market depth
        console.log('\nStreaming Aggregated Market Depth for MSFT:');
        const aggregateStream = await client.marketData.streamMarketDepthAggregates('MSFT', { maxlevels: 5 });

        aggregateStream.on('data', (data) => {
            if ('Bids' in data) {
                console.log('\nAggregated Market Depth Update:');

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
                    console.log(`Total Size: ${bid.Size}`);
                    console.log(`Orders: ${bid.OrderCount} from ${bid.Name} participants`);
                    console.log(`Time Range: ${bid.TimeStamp}`);
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
                    console.log(`Total Size: ${ask.Size}`);
                    console.log(`Orders: ${ask.OrderCount} from ${ask.Name} participants`);
                    console.log(`Time Range: ${ask.TimeStamp}`);
                    console.log('---');
                });

                // Display total liquidity at each price level
                console.log('\nLiquidity by Price Level:');
                const liquidity = new Map<string, { bidSize: number, askSize: number }>();

                data.Bids.forEach((bid: {
                    Price: string;
                    Size: number;
                    OrderCount: number;
                    Name: string;
                    TimeStamp: string;
                }) => {
                    liquidity.set(bid.Price, {
                        bidSize: parseInt(bid.Size.toString()),
                        askSize: 0
                    });
                });

                data.Asks.forEach((ask: {
                    Price: string;
                    Size: number;
                    OrderCount: number;
                    Name: string;
                    TimeStamp: string;
                }) => {
                    const current = liquidity.get(ask.Price) || { bidSize: 0, askSize: 0 };
                    liquidity.set(ask.Price, {
                        ...current,
                        askSize: parseInt(ask.Size.toString())
                    });
                });

                Array.from(liquidity.entries())
                    .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
                    .forEach(([price, { bidSize, askSize }]) => {
                        console.log(`${price}: ${bidSize > 0 ? `Bid ${bidSize}` : ''}${bidSize > 0 && askSize > 0 ? ' | ' : ''}${askSize > 0 ? `Ask ${askSize}` : ''}`);
                    });
            } else if ('Heartbeat' in data) {
                console.log('Heartbeat:', data.Timestamp);
            } else {
                console.log('Error:', data.Message);
            }
        });

        // Keep the stream open for 30 seconds
        await new Promise(resolve => setTimeout(resolve, 30000));
        aggregateStream.emit('close');

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 