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

            // Example 1: Get all positions for an account
            console.log(`\nGetting All Positions for Account ${accountId}:`);
            const allPositions = await client.brokerage.getPositions(accountId);

            allPositions.Positions.forEach(position => {
                console.log(`\nSymbol: ${position.Symbol}`);
                console.log(`Quantity: ${position.Quantity}`);
                console.log(`Average Price: ${position.AveragePrice}`);
                console.log(`Last: ${position.Last}`);
                console.log(`Market Value: ${position.MarketValue}`);
                console.log(`Today's P/L: ${position.TodaysProfitLoss}`);
                console.log(`Unrealized P/L: ${position.UnrealizedProfitLoss}`);
                console.log('---');
            });

            // Example 2: Get positions for multiple accounts
            if (accounts.length > 1) {
                const accountIds = accounts.slice(0, 2).map(a => a.AccountID).join(',');
                console.log(`\nGetting Positions for Multiple Accounts (${accountIds}):`);
                const multiPositions = await client.brokerage.getPositions(accountIds);

                multiPositions.Positions.forEach(position => {
                    console.log(`\nAccount: ${position.AccountID}`);
                    console.log(`Symbol: ${position.Symbol}`);
                    console.log(`Quantity: ${position.Quantity}`);
                    console.log(`Market Value: ${position.MarketValue}`);
                    console.log('---');
                });
            }

            // Example 3: Get all MSFT positions including options
            console.log('\nGetting MSFT Positions (including options):');
            const msftPositions = await client.brokerage.getPositions(accountId, 'MSFT,MSFT *');

            msftPositions.Positions.forEach(position => {
                console.log(`\nSymbol: ${position.Symbol}`);
                console.log(`Type: ${position.AssetType}`);
                console.log(`Quantity: ${position.Quantity}`);
                console.log(`Market Value: ${position.MarketValue}`);
                if (position.AssetType === 'STOCKOPTION') {
                    console.log(`Expiration: ${position.ExpirationDate}`);
                    console.log(`Long/Short: ${position.LongShort}`);
                    console.log(`Initial Requirement: ${position.InitialRequirement}`);
                }
                console.log('---');
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 