import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient({
        refresh_token: process.env.REFRESH_TOKEN,
        environment: (process.env.ENVIRONMENT || 'Simulation') as 'Simulation' | 'Live'
    });

    try {
        // Get accounts first to get the account IDs
        const accounts = await client.brokerage.getAccounts();

        if (accounts.length > 0) {
            // Get balances for all accounts
            console.log('\nGetting Balances for All Accounts:');

            // Process each account
            for (const account of accounts) {
                const accountId = account.AccountID;
                const balanceResponse = await client.brokerage.getBalances(accountId);

                if (balanceResponse.Balances.length > 0) {
                    const accountBalance = balanceResponse.Balances[0];

                    console.log(`\nAccount: ${accountBalance.AccountID}`);
                    console.log(`Account Type: ${accountBalance.AccountType || 'N/A'}`);

                    // Display basic balance information
                    console.log('Balance Information:');
                    console.log(`  Cash Balance: $${accountBalance.CashBalance || 'N/A'}`);
                    console.log(`  Equity: $${accountBalance.Equity || 'N/A'}`);
                    console.log(`  Market Value: $${accountBalance.MarketValue || 'N/A'}`);
                    console.log(`  Buying Power: $${accountBalance.BuyingPower || 'N/A'}`);
                    console.log(`  Today's P/L: $${accountBalance.TodaysProfitLoss || 'N/A'}`);

                    // Display balance details if available
                    if (accountBalance.BalanceDetail) {
                        console.log('\nBalance Details:');
                        const detail = accountBalance.BalanceDetail;

                        // Only display properties that exist in the BalanceDetail object
                        if (detail.MarginRequirement) console.log(`  Margin Requirement: $${detail.MarginRequirement}`);
                        if (detail.DayTradeMargin) console.log(`  Day Trade Margin: $${detail.DayTradeMargin}`);
                        if (detail.UnsettledFunds) console.log(`  Unsettled Funds: $${detail.UnsettledFunds}`);
                    }

                    // Display currency details if available
                    if (accountBalance.CurrencyDetails && accountBalance.CurrencyDetails.length > 0) {
                        console.log('\nCurrency Details:');
                        accountBalance.CurrencyDetails.forEach(currency => {
                            console.log(`  ${currency.Currency}:`);
                            if (currency.CashBalance) console.log(`    Cash Balance: $${currency.CashBalance}`);
                            if (currency.MarginRequirement) console.log(`    Margin Requirement: $${currency.MarginRequirement}`);
                            if (currency.NonTradeDebit) console.log(`    Non-Trade Debit: $${currency.NonTradeDebit}`);
                            if (currency.TradeEquity) console.log(`    Trade Equity: $${currency.TradeEquity}`);
                        });
                    }
                }
                console.log('---');
            }
        } else {
            console.log('No accounts found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 