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

            // Example 1: Get all orders for an account
            console.log(`\nGetting All Orders for Account ${accountId}:`);
            const allOrders = await client.brokerage.getOrders(accountId);

            allOrders.Orders.forEach(order => {
                console.log(`\nOrder ID: ${order.OrderID}`);
                console.log(`Status: ${order.Status}`);
                if (order.Legs && order.Legs.length > 0) {
                    order.Legs.forEach(leg => {
                        console.log(`Symbol: ${leg.Symbol}`);
                        console.log(`Quantity Ordered: ${leg.QuantityOrdered}`);
                        console.log(`Quantity Remaining: ${leg.QuantityRemaining}`);
                    });
                }
                if (order.LimitPrice) console.log(`Limit Price: ${order.LimitPrice}`);
                if (order.StopPrice) console.log(`Stop Price: ${order.StopPrice}`);
                console.log('---');
            });

            // Example 2: Get orders for multiple accounts
            if (accounts.length > 1) {
                const accountIds = accounts.slice(0, 3).map(a => a.AccountID).join(',');
                console.log(`\nGetting Orders for Multiple Accounts (${accountIds}):`);
                const multiAccountOrders = await client.brokerage.getOrders(accountIds);

                multiAccountOrders.Orders.forEach(order => {
                    console.log(`\nAccount: ${order.AccountID}`);
                    console.log(`Order ID: ${order.OrderID}`);
                    console.log(`Status: ${order.Status}`);
                    if (order.Legs && order.Legs.length > 0) {
                        order.Legs.forEach(leg => {
                            console.log(`Symbol: ${leg.Symbol}`);
                            console.log(`Quantity: ${leg.QuantityOrdered}`);
                        });
                    }
                    console.log('---');
                });
            }

            // Example 3: Get historical orders
            console.log('\nGetting Historical Orders:');
            const since = new Date();
            since.setDate(since.getDate() - 30); // Last 30 days
            const historicalOrders = await client.brokerage.getHistoricalOrders(accountId, since.toISOString().split('T')[0]);

            historicalOrders.Orders.forEach(order => {
                console.log(`\nOrder ID: ${order.OrderID}`);
                console.log(`Status: ${order.Status} (${order.StatusDescription})`);
                if (order.Legs && order.Legs.length > 0) {
                    order.Legs.forEach(leg => {
                        console.log(`Symbol: ${leg.Symbol}`);
                        console.log(`Buy/Sell: ${leg.BuyOrSell}`);
                        console.log(`Executed Quantity: ${leg.ExecQuantity}`);
                        console.log(`Execution Price: ${leg.ExecutionPrice}`);
                    });
                }
                console.log(`Opened: ${order.OpenedDateTime}`);
                if (order.ClosedDateTime) console.log(`Closed: ${order.ClosedDateTime}`);
                console.log('---');
            });

            // Example 4: Get orders by ID
            if (allOrders.Orders.length > 0) {
                const orderId = allOrders.Orders[0].OrderID;
                console.log(`\nGetting Order Details for Order ${orderId}:`);
                const orderDetails = await client.brokerage.getHistoricalOrdersByOrderID(
                    accountId,
                    orderId,
                    since.toISOString().split('T')[0]
                );

                orderDetails.Orders.forEach(order => {
                    console.log(`\nOrder Details:`);
                    console.log(`Status: ${order.Status} (${order.StatusDescription})`);
                    if (order.Legs && order.Legs.length > 0) {
                        console.log('\nOrder Legs:');
                        order.Legs.forEach(leg => {
                            console.log(`  Asset Type: ${leg.AssetType}`);
                            console.log(`  Symbol: ${leg.Symbol}`);
                            console.log(`  Buy/Sell: ${leg.BuyOrSell}`);
                            console.log(`  Open/Close: ${leg.OpenOrClose}`);
                            if (leg.OptionType) {
                                console.log(`  Option Type: ${leg.OptionType}`);
                                console.log(`  Strike Price: ${leg.StrikePrice}`);
                                console.log(`  Expiration: ${leg.ExpirationDate}`);
                                console.log(`  Underlying: ${leg.Underlying}`);
                            }
                            console.log('  ---');
                        });
                    }
                    if (order.AdvancedOptions) {
                        const advancedOptions = JSON.parse(order.AdvancedOptions);
                        console.log('\nAdvanced Options:');
                        if (advancedOptions.TrailingStop) {
                            console.log(`  Trailing Stop: ${advancedOptions.TrailingStop}`);
                            console.log(`  Trailing Stop Amount: ${advancedOptions.TrailingStopAmount}`);
                        }
                    }
                    console.log('---');
                });
            }

            // Example 5: Stream orders for real-time updates
            console.log('\nStreaming Order Updates:');
            const orderStream = await client.brokerage.streamOrders(accountId);

            orderStream.on('data', (data) => {
                if ('OrderID' in data) {
                    console.log('\nOrder Update:');
                    console.log(`Order ID: ${data.OrderID}`);
                    console.log(`Status: ${data.Status} (${data.StatusDescription})`);
                    if (data.Legs && data.Legs.length > 0) {
                        data.Legs.forEach((leg: {
                            OrderID: string;
                            Status: string;
                            Message: string;
                            Symbol: string;
                            QuantityOrdered: number;
                            QuantityRemaining: number;
                        }) => {
                            console.log(`Symbol: ${leg.Symbol}`);
                            console.log(`Quantity Ordered: ${leg.QuantityOrdered}`);
                            console.log(`Quantity Remaining: ${leg.QuantityRemaining}`);
                        });
                    }
                    console.log('---');
                } else if ('Heartbeat' in data) {
                    console.log('Heartbeat:', data.Timestamp);
                } else {
                    console.log('Error:', data.Message);
                }
            });

            // Keep the stream open for 30 seconds
            await new Promise(resolve => setTimeout(resolve, 30000));
            orderStream.emit('close');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 