import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient({
        refresh_token: process.env.REFRESH_TOKEN,
        environment: (process.env.ENVIRONMENT || "Simulation") as "Simulation" | "Live"
    });

    try {
        // Get accounts first
        const accounts = await client.brokerage.getAccounts();
        if (accounts.length > 0) {
            const accountId = accounts[0].AccountID;

            // Example 1: Place an OCO (One-Cancels-Other) order group
            console.log('\nPlacing OCO order group:');
            const ocoGroup = await client.orderExecution.placeGroupOrder({
                Type: 'OCO',
                Orders: [
                    {
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
                    },
                    {
                        AccountID: accountId,
                        Symbol: 'MSFT',
                        Quantity: '1',
                        OrderType: 'StopMarket',
                        StopPrice: '385.00',
                        TradeAction: 'BUY',
                        TimeInForce: {
                            Duration: 'DAY'
                        },
                        Route: 'Intelligent'
                    }
                ]
            });

            console.log('OCO Group Response:', {
                orders: ocoGroup.Orders.map(order => ({
                    orderId: order.OrderID,
                    message: order.Message
                })),
                errors: ocoGroup.Errors?.map(error => ({
                    orderId: error.OrderID,
                    error: error.Error,
                    message: error.Message
                }))
            });

            // Example 2: Place a bracket order group
            console.log('\nPlacing bracket order group:');
            const bracketGroup = await client.orderExecution.placeGroupOrder({
                Type: 'BRK',
                Orders: [
                    {
                        AccountID: accountId,
                        Symbol: 'AAPL',
                        Quantity: '1',
                        OrderType: 'Market',
                        TradeAction: 'BUY',
                        TimeInForce: {
                            Duration: 'DAY'
                        },
                        Route: 'Intelligent'
                    },
                    {
                        AccountID: accountId,
                        Symbol: 'AAPL',
                        Quantity: '1',
                        OrderType: 'Limit',
                        LimitPrice: '175.00',
                        TradeAction: 'SELL',
                        TimeInForce: {
                            Duration: 'GTC'
                        },
                        Route: 'Intelligent'
                    },
                    {
                        AccountID: accountId,
                        Symbol: 'AAPL',
                        Quantity: '1',
                        OrderType: 'StopMarket',
                        StopPrice: '165.00',
                        TradeAction: 'SELL',
                        TimeInForce: {
                            Duration: 'GTC'
                        },
                        Route: 'Intelligent'
                    }
                ]
            });

            console.log('Bracket Group Response:', {
                orders: bracketGroup.Orders.map(order => ({
                    orderId: order.OrderID,
                    message: order.Message
                })),
                errors: bracketGroup.Errors?.map(error => ({
                    orderId: error.OrderID,
                    error: error.Error,
                    message: error.Message
                }))
            });

            // Example 3: Place an option spread order group
            console.log('\nPlacing option spread order group:');
            const spreadGroup = await client.orderExecution.placeGroupOrder({
                Type: 'OCO',
                Orders: [
                    {
                        AccountID: accountId,
                        Symbol: 'AAPL  230915P00170000',
                        Quantity: '1',
                        OrderType: 'Limit',
                        LimitPrice: '1.50',
                        TradeAction: 'BUYTOOPEN',
                        TimeInForce: {
                            Duration: 'DAY'
                        },
                        Route: 'Intelligent'
                    },
                    {
                        AccountID: accountId,
                        Symbol: 'AAPL  230915P00165000',
                        Quantity: '1',
                        OrderType: 'Limit',
                        LimitPrice: '1.00',
                        TradeAction: 'SELLTOOPEN',
                        TimeInForce: {
                            Duration: 'DAY'
                        },
                        Route: 'Intelligent'
                    }
                ]
            });

            console.log('Spread Group Response:', {
                orders: spreadGroup.Orders.map(order => ({
                    orderId: order.OrderID,
                    message: order.Message
                })),
                errors: spreadGroup.Errors?.map(error => ({
                    orderId: error.OrderID,
                    error: error.Error,
                    message: error.Message
                }))
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 