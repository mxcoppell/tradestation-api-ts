import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient();

    try {
        // Get accounts first to get a valid account ID
        const accounts = await client.brokerage.getAccounts();
        if (accounts.length === 0) {
            console.log('No accounts found');
            return;
        }

        // Get first account ID
        const accountId = accounts[0].AccountID;

        // Example order to confirm (this will NOT place the order, just confirm it)
        const orderToConfirm = {
            AccountID: accountId,
            Symbol: 'MSFT',
            Quantity: '1', // Use string for Quantity to match the API type
            OrderType: 'Limit',
            TradeAction: 'Buy',
            LimitPrice: '350.00',
            Route: 'Intelligent',
            TimeInForce: {
                Duration: 'Day'
            },
            // Optional: custom display
            CustomDisplayName: 'My Test Order'
        };

        console.log('Confirming order:');
        console.log(JSON.stringify(orderToConfirm, null, 2));

        // Confirm (validate) the order
        const confirmation = await client.orderExecution.confirmOrder(orderToConfirm as any);

        console.log('\nOrder Confirmation Result:');

        // Print the confirmation object (since the API response structure may have changed)
        console.log(JSON.stringify(confirmation, null, 2));

        // Access confirmation properties safely with optional chaining
        const status = (confirmation as any).OrderStatus;
        if (status === 'Ok') {
            console.log('Order is valid and ready to place!');

            const orders = (confirmation as any).Orders || [];
            if (orders.length > 0) {
                const confirmedOrder = orders[0];
                console.log('\nConfirmed Order Details:');
                console.log(`Symbol: ${confirmedOrder.Symbol}`);
                console.log(`Action: ${confirmedOrder.TradeAction}`);
                console.log(`Quantity: ${confirmedOrder.Quantity}`);
                console.log(`Order Type: ${confirmedOrder.OrderType}`);

                if (confirmedOrder.LimitPrice) {
                    console.log(`Limit Price: $${confirmedOrder.LimitPrice}`);
                }

                if (confirmedOrder.StopPrice) {
                    console.log(`Stop Price: $${confirmedOrder.StopPrice}`);
                }

                // Display estimated cost if available
                const buyingPower = (confirmation as any).BuyingPower;
                if (buyingPower) {
                    console.log('\nEstimated Cost:');
                    console.log(`Principal: $${buyingPower.Principal || 'N/A'}`);
                    console.log(`Commissions: $${buyingPower.Commission || 'N/A'}`);
                    console.log(`Margin Required: $${buyingPower.MarginRequirement || 'N/A'}`);
                }

                console.log('\nTo place this order, you would use placeOrder() with the same order object');
            }
        } else {
            console.log('Order validation failed!');
            const messages = (confirmation as any).Messages || [];
            if (messages.length > 0) {
                console.log('\nError Messages:');
                messages.forEach((msg: any) => {
                    console.log(`- ${msg.Code}: ${msg.Text}`);
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 