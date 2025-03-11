import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient();

    try {
        // Stream option quotes for a butterfly spread
        console.log('\nStreaming Option Quotes for MSFT Butterfly Spread:');
        const optionStream = await client.marketData.streamOptionQuotes({
            legs: [
                { Symbol: 'MSFT 240621C400', Ratio: 1 },   // Buy 1 contract
                { Symbol: 'MSFT 240621C405', Ratio: -2 },  // Sell 2 contracts
                { Symbol: 'MSFT 240621C410', Ratio: 1 }    // Buy 1 contract
            ],
            enableGreeks: true,
            riskFreeRate: 0.0425 // 4.25%
        });

        optionStream.on('data', (data) => {
            if ('Delta' in data) {
                console.log('\nSpread Analytics Update:');
                console.log('Greeks:', {
                    delta: data.Delta,
                    gamma: data.Gamma,
                    theta: data.Theta,
                    vega: data.Vega,
                    rho: data.Rho
                });
                console.log('Volatility:', {
                    implied: data.ImpliedVolatility,
                    standardDev: data.StandardDeviation
                });
                console.log('Probabilities:', {
                    itm: {
                        current: data.ProbabilityITM,
                        withIV: data.ProbabilityITM_IV
                    },
                    otm: {
                        current: data.ProbabilityOTM,
                        withIV: data.ProbabilityOTM_IV
                    },
                    breakeven: {
                        current: data.ProbabilityBE,
                        withIV: data.ProbabilityBE_IV
                    }
                });
                console.log('Value:', {
                    intrinsic: data.IntrinsicValue,
                    extrinsic: data.ExtrinsicValue,
                    theoretical: {
                        current: data.TheoreticalValue,
                        withIV: data.TheoreticalValue_IV
                    }
                });
                console.log('Market:', {
                    last: data.Last,
                    bid: data.Bid,
                    ask: data.Ask,
                    volume: data.Volume,
                    openInterest: data.DailyOpenInterest
                });
                console.log('---');
            } else if ('Heartbeat' in data) {
                console.log('Heartbeat:', data.Timestamp);
            } else {
                console.log('Error:', data.Message);
            }
        });

        // Keep the stream open for 30 seconds
        await new Promise(resolve => setTimeout(resolve, 30000));
        optionStream.emit('close');

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 