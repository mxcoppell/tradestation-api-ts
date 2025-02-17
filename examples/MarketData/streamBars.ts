import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient();

    try {
        // Stream 1-minute bars for MSFT
        console.log('\nStreaming 1-Minute Bars for MSFT:');
        const stream = await client.marketData.streamBars('MSFT', {
            unit: 'Minute',
            interval: '1',
            sessiontemplate: 'USEQPreAndPost'  // Include pre and post market data
        });

        stream.on('data', (data) => {
            if ('TimeStamp' in data) {
                console.log('\nNew Bar:');
                console.log(`Time: ${data.TimeStamp}`);
                console.log(`Open: ${data.Open}`);
                console.log(`High: ${data.High}`);
                console.log(`Low: ${data.Low}`);
                console.log(`Close: ${data.Close}`);
                console.log(`Volume: ${data.TotalVolume}`);
                console.log('---');
            } else if ('Heartbeat' in data) {
                console.log('Heartbeat:', data.Timestamp);
            } else {
                console.log('Error:', data.Message);
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