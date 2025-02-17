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
            const accountId = accounts[0].AccountID;

            // Example 1: Stream all orders
            console.log('\nStreaming all orders:');
            const ordersStream = await client.brokerage.streamOrders(accountId);
            console.log('Streaming orders...');

            ordersStream.on('data', (data: {
                OrderID?: string;
                Status?: string;
                StatusDescription?: string;
                OrderType?: string;
                Symbol?: string;
                Quantity?: string;
                FilledQuantity?: string;
                RemainingQuantity?: string;
                Heartbeat?: string;
                Error?: string;
            }) => {
                if ('OrderID' in data) {
                    // Handle order update
                    console.log('Order update:', data);
                } else if ('Heartbeat' in data) {
                    // Handle heartbeat
                    console.log('Heartbeat:', data);
                } else if ('Error' in data) {
                    // Handle error
                    console.log('Error:', data);
                }
            });

            // Wait for 30 seconds to receive updates
            await new Promise(resolve => setTimeout(resolve, 30000));
            ordersStream.emit('close');

            // Example 2: Place an order to stream
            console.log('\nPlacing order to stream:');
            const order = await client.orderExecution.placeOrder({
                AccountID: accountId,
                Symbol: 'MSFT',
                Quantity: '1',
                OrderType: 'Limit',
                LimitPrice: '380.00',
                TradeAction: 'BUY',
                TimeInForce: {
                    Duration: 'DAY'
                },
                Route: 'Intelligent'
            });

            console.log('Order placed:', {
                orderId: order.Orders?.[0]?.OrderID,
                message: order.Orders?.[0]?.Message
            });

            // Example 3: Stream a specific order
            console.log('\nStreaming a specific order...');
            const orderId = '123456789'; // Replace with a valid order ID
            const orderStream = await client.brokerage.streamOrders(`${accountId}/${orderId}`);

            orderStream.on('data', (data: {
                OrderID?: string;
                Status?: string;
                StatusDescription?: string;
                OrderType?: string;
                Symbol?: string;
                Quantity?: string;
                FilledQuantity?: string;
                RemainingQuantity?: string;
                Heartbeat?: string;
                Error?: string;
            }) => {
                if ('OrderID' in data) {
                    // Handle order update
                    console.log('Order update:', data);
                } else if ('Heartbeat' in data) {
                    // Handle heartbeat
                    console.log('Heartbeat:', data);
                } else if ('Error' in data) {
                    // Handle error
                    console.log('Error:', data);
                }
            });

            // Wait for 30 seconds to receive updates
            await new Promise(resolve => setTimeout(resolve, 30000));
            orderStream.emit('close');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 