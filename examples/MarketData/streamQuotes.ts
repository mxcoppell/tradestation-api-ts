import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient()

    try {
        // Stream real-time quotes
        console.log('\nStreaming Real-time Quotes for AAPL:');
        const quoteStream = await client.marketData.streamQuotes(['AAPL']);

        quoteStream.on('data', (quote) => {
            if ('Symbol' in quote) {
                console.log(`\nReal-time Update for ${quote.Symbol}:`);
                console.log(`Time: ${new Date().toISOString()}`);
                console.log(`Last Price: ${quote.Last}`);
                console.log(`Bid: ${quote.Bid}`);
                console.log(`Ask: ${quote.Ask}`);
                console.log(`Volume: ${quote.Volume}`);
                console.log(`High: ${quote.High}`);
                console.log(`Low: ${quote.Low}`);
                console.log(`Change: ${quote.NetChange} (${quote.NetChangePct}%)`);
                console.log('---');
            } else if ('Heartbeat' in quote) {
                console.log('Heartbeat:', quote.Timestamp);
            } else {
                console.log('Error:', quote.Message);
            }
        });

        // Keep the stream open for 30 seconds
        await new Promise(resolve => setTimeout(resolve, 30000));
        quoteStream.emit('close');

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 