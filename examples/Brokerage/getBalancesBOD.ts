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
        // Get accounts first
        const accounts = await client.brokerage.getAccounts();
        if (accounts.length > 0) {
            // Example 1: Get beginning of day balances for a single account
            const accountId = accounts[0].AccountID;
            console.log(`\nGetting Beginning of Day Balances for Account ${accountId}:`);
            const singleBODBalances = await client.brokerage.getBalancesBOD(accountId);

            singleBODBalances.BODBalances.forEach(balance => {
                console.log(`\nAccount: ${balance.AccountID}`);
                console.log(`Type: ${balance.AccountType}`);
                if (balance.BalanceDetail) {
                    console.log(`Account Balance: ${balance.BalanceDetail.AccountBalance}`);
                    console.log(`Cash Available to Withdraw: ${balance.BalanceDetail.CashAvailableToWithdraw}`);
                    console.log(`Day Trades: ${balance.BalanceDetail.DayTrades}`);
                    console.log(`Equity: ${balance.BalanceDetail.Equity}`);
                    console.log(`Net Cash: ${balance.BalanceDetail.NetCash}`);
                }
                console.log('---');
            });

            // Example 2: Get beginning of day balances for multiple accounts
            if (accounts.length > 1) {
                const accountIds = accounts.slice(0, 2).map(a => a.AccountID).join(',');
                console.log(`\nGetting Beginning of Day Balances for Multiple Accounts (${accountIds}):`);
                const multiBODBalances = await client.brokerage.getBalancesBOD(accountIds);

                multiBODBalances.BODBalances.forEach(balance => {
                    console.log(`\nAccount: ${balance.AccountID}`);
                    console.log(`Type: ${balance.AccountType}`);
                    if (balance.BalanceDetail) {
                        console.log(`Account Balance: ${balance.BalanceDetail.AccountBalance}`);
                        console.log(`Cash Available to Withdraw: ${balance.BalanceDetail.CashAvailableToWithdraw}`);
                        console.log(`Equity: ${balance.BalanceDetail.Equity}`);
                        console.log(`Net Cash: ${balance.BalanceDetail.NetCash}`);
                    }
                    console.log('---');
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 