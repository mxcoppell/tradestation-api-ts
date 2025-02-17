import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient();

    try {
        // Get accounts first
        const accounts = await client.brokerage.getAccounts();
        if (accounts.length > 0) {
            // Example 1: Get balances for a single account
            const accountId = accounts[0].AccountID;
            console.log(`\nGetting Balances for Account ${accountId}:`);
            const singleAccountBalance = await client.brokerage.getBalances(accountId);

            const balance = singleAccountBalance.Balances[0];
            console.log(`\nAccount Details:`);
            console.log(`Type: ${balance.AccountType}`);
            console.log(`Cash Balance: ${balance.CashBalance}`);
            console.log(`Equity: ${balance.Equity}`);
            console.log(`Market Value: ${balance.MarketValue}`);
            console.log(`Today's P/L: ${balance.TodaysProfitLoss}`);
            console.log(`Buying Power: ${balance.BuyingPower}`);
            console.log(`Uncleared Deposits: ${balance.UnclearedDeposit}`);
            console.log('---');

            // Example 2: Get balances for multiple accounts
            if (accounts.length > 1) {
                const accountIds = accounts.slice(0, 2).map(a => a.AccountID).join(',');
                console.log(`\nGetting Balances for Multiple Accounts (${accountIds}):`);
                const multiAccountBalances = await client.brokerage.getBalances(accountIds);

                multiAccountBalances.Balances.forEach(balance => {
                    console.log(`\nAccount: ${balance.AccountID}`);
                    console.log(`Type: ${balance.AccountType}`);
                    console.log(`Cash Balance: ${balance.CashBalance}`);
                    console.log(`Equity: ${balance.Equity}`);
                    console.log(`Market Value: ${balance.MarketValue}`);
                    console.log(`Today's P/L: ${balance.TodaysProfitLoss}`);
                    console.log(`Buying Power: ${balance.BuyingPower}`);
                    console.log('---');
                });
            }

            // Example 3: Get balances with currency details
            console.log('\nGetting Balances with Currency Details:');
            const balancesWithCurrency = await client.brokerage.getBalances(accountId);

            balancesWithCurrency.Balances.forEach(balance => {
                console.log(`\nAccount: ${balance.AccountID}`);
                console.log(`Type: ${balance.AccountType}`);
                console.log(`Cash Balance: ${balance.CashBalance}`);

                if (balance.CurrencyDetails && balance.CurrencyDetails.length > 0) {
                    console.log('\nCurrency Details:');
                    balance.CurrencyDetails.forEach(currency => {
                        console.log(`Currency: ${currency.Currency}`);
                        console.log(`Cash Balance: ${currency.CashBalance}`);
                        console.log(`BOD Open Trade Equity: ${currency.BODOpenTradeEquity}`);
                        console.log(`Margin Requirement: ${currency.MarginRequirement}`);
                        console.log('---');
                    });
                }
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 