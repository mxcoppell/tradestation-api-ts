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

            // Example 1: Get all orders for the account
            console.log(`\nGetting All Orders for Account ${accountId}:`);
            const allOrders = await client.brokerage.getOrders(accountId);
            console.log('All orders:', allOrders);

            if (allOrders.Orders && allOrders.Orders.length > 0) {
                const order1 = await client.brokerage.getOrdersByOrderID(accountId, allOrders.Orders[0].OrderID);
                console.log('First order details:', order1);

                // Print order details
                if (order1.Orders && order1.Orders.length > 0) {
                    console.log('Order details:');
                    console.log('  Symbol:', order1.Orders[0].Legs?.[0]?.Symbol);
                    console.log('  Quantity:', order1.Orders[0].Legs?.[0]?.QuantityOrdered);
                    console.log('  Filled Quantity:', order1.Orders[0].Legs?.[0]?.ExecQuantity);
                    console.log('  Remaining Quantity:', order1.Orders[0].Legs?.[0]?.QuantityRemaining);
                    console.log('  Status:', order1.Orders[0].StatusDescription);
                }

                // Get historical order
                const historicalOrder = await client.brokerage.getHistoricalOrdersByOrderID(
                    accountId,
                    allOrders.Orders[0].OrderID,
                    new Date().toISOString().split('T')[0] // Use today's date
                );
                console.log('Historical order:', historicalOrder);

                // Print historical order details
                if (historicalOrder.Orders && historicalOrder.Orders.length > 0) {
                    console.log('Historical order details:');
                    console.log({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        legs: historicalOrder.Orders[0].Legs?.map((leg: any) => ({
                            symbol: leg.Symbol,
                            quantity: leg.QuantityOrdered,
                            filledQuantity: leg.ExecQuantity,
                            remainingQuantity: leg.QuantityRemaining,
                            status: historicalOrder.Orders[0].StatusDescription
                        }))
                    });
                }
            } else {
                console.log('No orders found for the account');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 