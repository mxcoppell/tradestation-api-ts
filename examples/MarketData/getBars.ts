import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient();

    try {
        // Example 1: Get daily bars for the last 5 days
        const dailyBars = await client.marketData.getBarHistory('MSFT', {
            unit: 'Daily',
            barsback: 5
        });
        console.log('\nDaily Bars for MSFT:');
        dailyBars.Bars.forEach(bar => {
            console.log(`Date: ${bar.TimeStamp}`);
            console.log(`Open: ${bar.Open}`);
            console.log(`High: ${bar.High}`);
            console.log(`Low: ${bar.Low}`);
            console.log(`Close: ${bar.Close}`);
            console.log(`Volume: ${bar.TotalVolume}`);
            console.log('---');
        });

        // Example 2: Get 1-minute bars for a specific date range with extended hours
        const minuteBars = await client.marketData.getBarHistory('MSFT', {
            unit: 'Minute',
            interval: '1',
            firstdate: '2024-01-01T14:30:00Z',
            lastdate: '2024-01-01T21:00:00Z',
            sessiontemplate: 'USEQPreAndPost'
        });
        console.log('\n1-Minute Bars for MSFT with Extended Hours:');
        minuteBars.Bars.forEach(bar => {
            console.log(`Time: ${bar.TimeStamp}`);
            console.log(`Close: ${bar.Close}`);
            console.log(`Volume: ${bar.TotalVolume}`);
            console.log('---');
        });

        // Example 3: Get weekly bars for the last month
        const weeklyBars = await client.marketData.getBarHistory('MSFT', {
            unit: 'Weekly',
            barsback: 4
        });
        console.log('\nWeekly Bars for MSFT:');
        weeklyBars.Bars.forEach(bar => {
            console.log(`Week of: ${bar.TimeStamp}`);
            console.log(`Open: ${bar.Open}`);
            console.log(`High: ${bar.High}`);
            console.log(`Low: ${bar.Low}`);
            console.log(`Close: ${bar.Close}`);
            console.log(`Volume: ${bar.TotalVolume}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 