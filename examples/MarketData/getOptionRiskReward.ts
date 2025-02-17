import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient()

    try {
        // Example 1: Analyze a vertical spread
        console.log('\nAnalyzing MSFT Vertical Spread:');
        const verticalSpreadAnalysis = await client.marketData.getOptionRiskReward({
            SpreadPrice: '0.24',
            Legs: [
                {
                    Symbol: 'MSFT 240621C400',
                    Ratio: 1,
                    OpenPrice: '3.50',
                    TargetPrice: '5.00',
                    StopPrice: '2.00'
                },
                {
                    Symbol: 'MSFT 240621C405',
                    Ratio: -1,
                    OpenPrice: '2.00',
                    TargetPrice: '1.00',
                    StopPrice: '3.00'
                }
            ]
        });

        console.log('\nVertical Spread Analysis:');
        console.log(`Max Gain: ${verticalSpreadAnalysis.MaxGain}`);
        console.log(`Max Loss: ${verticalSpreadAnalysis.MaxLoss}`);
        console.log(`Risk/Reward Ratio: ${verticalSpreadAnalysis.RiskRewardRatio}`);
        console.log(`Commission: ${verticalSpreadAnalysis.Commission}`);

        // Example 2: Analyze a butterfly spread
        console.log('\nAnalyzing MSFT Butterfly Spread:');
        const butterflySpreadAnalysis = await client.marketData.getOptionRiskReward({
            SpreadPrice: '0.24',
            Legs: [
                {
                    Symbol: 'MSFT 240621C400',
                    Ratio: 1,
                    OpenPrice: '3.50',
                    TargetPrice: '5.00',
                    StopPrice: '2.00'
                },
                {
                    Symbol: 'MSFT 240621C405',
                    Ratio: -2,
                    OpenPrice: '2.00',
                    TargetPrice: '1.00',
                    StopPrice: '3.00'
                },
                {
                    Symbol: 'MSFT 240621C410',
                    Ratio: 1,
                    OpenPrice: '1.00',
                    TargetPrice: '0.50',
                    StopPrice: '1.50'
                }
            ]
        });

        console.log('\nButterfly Spread Analysis:');
        console.log(`Max Gain: ${butterflySpreadAnalysis.MaxGain}`);
        console.log(`Max Loss: ${butterflySpreadAnalysis.MaxLoss}`);
        console.log(`Risk/Reward Ratio: ${butterflySpreadAnalysis.RiskRewardRatio}`);
        console.log(`Commission: ${butterflySpreadAnalysis.Commission}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 