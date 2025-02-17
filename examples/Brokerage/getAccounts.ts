import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient();

    try {
        // Get all accounts
        console.log('\nGetting All Accounts:');
        const accounts = await client.brokerage.getAccounts();

        accounts.forEach(account => {
            console.log(`\nAccount: ${account.AccountID}`);
            console.log(`Type: ${account.AccountType}`);
            if (account.Alias) console.log(`Alias: ${account.Alias}`);
            console.log(`Currency: ${account.Currency}`);
            console.log(`Status: ${account.Status}`);

            if (account.AccountDetail) {
                console.log('\nAccount Details:');
                console.log(`Option Level: ${account.AccountDetail.OptionApprovalLevel}`);
                console.log(`Day Trading Qualified: ${account.AccountDetail.DayTradingQualified ? 'Yes' : 'No'}`);
                console.log(`Pattern Day Trader: ${account.AccountDetail.PatternDayTrader ? 'Yes' : 'No'}`);
                console.log(`Stock Locate Eligible: ${account.AccountDetail.IsStockLocateEligible ? 'Yes' : 'No'}`);
                console.log(`Reg T Program: ${account.AccountDetail.EnrolledInRegTProgram ? 'Yes' : 'No'}`);
                console.log(`Buying Power Warning: ${account.AccountDetail.RequiresBuyingPowerWarning ? 'Yes' : 'No'}`);
            }
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 