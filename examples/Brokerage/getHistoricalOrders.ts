import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient();

    try {
        // Get accounts first
        const accounts = await client.brokerage.getAccounts();
        if (accounts.length > 0) {
            const accountId = accounts[0].AccountID;

            // Example 1: Get historical orders for a single account
            console.log(`\nGetting Historical Orders for Account ${accountId}:`);
            const since = new Date();
            since.setDate(since.getDate() - 30); // Last 30 days
            const historicalOrders = await client.brokerage.getHistoricalOrders(accountId, since.toISOString().split('T')[0]);

            historicalOrders.Orders.forEach(order => {
                console.log(`\nOrder ID: ${order.OrderID}`);
                console.log(`Status: ${order.Status}`);
                if (order.Legs && order.Legs.length > 0) {
                    order.Legs.forEach(leg => {
                        console.log(`Symbol: ${leg.Symbol}`);
                        console.log(`Buy/Sell: ${leg.BuyOrSell}`);
                        console.log(`Executed Quantity: ${leg.ExecQuantity}`);
                    });
                }
                console.log('---');
            });

            // Example 2: Get historical orders for multiple accounts
            if (accounts.length > 1) {
                const accountIds = accounts.slice(0, 2).map(a => a.AccountID).join(',');
                console.log(`\nGetting Historical Orders for Multiple Accounts (${accountIds}):`);
                const multiAccountHistoricalOrders = await client.brokerage.getHistoricalOrders(accountIds, since.toISOString().split('T')[0]);

                multiAccountHistoricalOrders.Orders.forEach(order => {
                    console.log(`\nAccount: ${order.AccountID}`);
                    console.log(`Order ID: ${order.OrderID}`);
                    console.log(`Status: ${order.Status}`);
                    if (order.Legs && order.Legs.length > 0) {
                        order.Legs.forEach(leg => {
                            console.log(`Symbol: ${leg.Symbol}`);
                            console.log(`Buy/Sell: ${leg.BuyOrSell}`);
                            console.log(`Executed Quantity: ${leg.ExecQuantity}`);
                        });
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