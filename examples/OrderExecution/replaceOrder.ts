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

            // Example 1: Place an initial limit order
            console.log('\nPlacing initial limit order:');
            const initialOrder = await client.orderExecution.placeOrder({
                AccountID: accountId,
                Symbol: 'AAPL',
                Quantity: '1',
                OrderType: 'Limit',
                LimitPrice: '170.50',
                TradeAction: 'BUY',
                TimeInForce: {
                    Duration: 'DAY'
                },
                Route: 'Intelligent'
            });

            const initialOrderId = initialOrder.Orders?.[0]?.OrderID;
            if (!initialOrderId) {
                console.error('No order ID found for initial order');
                return;
            }

            console.log('Initial order placed:', {
                orderId: initialOrderId,
                status: initialOrder.Orders?.[0]?.Message,
                message: initialOrder.Orders?.[0]?.Message
            });

            // Example 2: Replace the limit price
            console.log('\nReplacing limit price:');
            const replaceLimitPrice = await client.orderExecution.replaceOrder(initialOrderId, {
                LimitPrice: '382.00'
            });

            console.log('Replace limit price response:', {
                orderId: replaceLimitPrice.Orders?.[0]?.OrderID,
                status: replaceLimitPrice.Orders?.[0]?.Message,
                message: replaceLimitPrice.Orders?.[0]?.Message
            });

            // Example 3: Replace the quantity
            console.log('\nReplacing quantity:');
            const replaceQuantity = await client.orderExecution.replaceOrder(initialOrderId, {
                Quantity: '2'
            });

            console.log('Replace quantity response:', {
                orderId: replaceQuantity.Orders?.[0]?.OrderID,
                status: replaceQuantity.Orders?.[0]?.Message,
                message: replaceQuantity.Orders?.[0]?.Message
            });

            // Example 4: Replace multiple fields
            console.log('\nReplacing multiple fields:');
            const replaceMultiple = await client.orderExecution.replaceOrder(initialOrderId, {
                Quantity: '3',
                LimitPrice: '383.00'
            });

            console.log('Replace multiple response:', {
                orderId: replaceMultiple.Orders?.[0]?.OrderID,
                status: replaceMultiple.Orders?.[0]?.Message,
                message: replaceMultiple.Orders?.[0]?.Message
            });

            // Example 5: Convert to market order
            console.log('\nConverting to market order:');
            const convertToMarket = await client.orderExecution.replaceOrder(initialOrderId, {
                OrderType: 'Market'
            });

            console.log('Convert to market response:', {
                orderId: convertToMarket.Orders?.[0]?.OrderID,
                status: convertToMarket.Orders?.[0]?.Message,
                message: convertToMarket.Orders?.[0]?.Message
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 