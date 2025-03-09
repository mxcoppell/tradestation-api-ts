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

            // Example 1: Confirm a One-Cancels-Other (OCO) order group
            console.log('\nConfirming OCO Order Group for MSFT:');
            const ocoGroupConfirm = await client.orderExecution.confirmGroupOrder({
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
                        OrderType: 'StopLimit',
                        StopPrice: '375.00',
                        LimitPrice: '374.50',
                        TradeAction: 'BUY',
                        TimeInForce: {
                            Duration: 'DAY'
                        },
                        Route: 'Intelligent'
                    }
                ]
            });

            console.log('OCO Group Confirmation:', {
                orders: ocoGroupConfirm.Orders.map(order => ({
                    orderId: order.OrderID,
                    message: order.Message
                })),
                errors: ocoGroupConfirm.Errors
            });

            // Example 2: Confirm a bracket order group
            console.log('\nConfirming Bracket Order Group for AAPL:');
            const bracketGroupConfirm = await client.orderExecution.confirmGroupOrder({
                Type: 'BRK',
                Orders: [
                    {
                        // Entry order
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
                    },
                    {
                        // Profit target
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
                        // Stop loss
                        AccountID: accountId,
                        Symbol: 'AAPL',
                        Quantity: '1',
                        OrderType: 'StopMarket',
                        StopPrice: '168.00',
                        TradeAction: 'SELL',
                        TimeInForce: {
                            Duration: 'GTC'
                        },
                        Route: 'Intelligent'
                    }
                ]
            });

            console.log('Bracket Group Confirmation:', {
                orders: bracketGroupConfirm.Orders.map(order => ({
                    orderId: order.OrderID,
                    message: order.Message
                })),
                errors: bracketGroupConfirm.Errors
            });

            // Example 3: Confirm an option spread order group
            console.log('\nConfirming Option Spread OCO Group:');
            const spreadGroupConfirm = await client.orderExecution.confirmGroupOrder({
                Type: 'OCO',
                Orders: [
                    {
                        // Buy the lower strike call
                        AccountID: accountId,
                        Symbol: 'MSFT 240621C400',
                        Quantity: '1',
                        OrderType: 'Limit',
                        LimitPrice: '3.50',
                        TradeAction: 'BUY',
                        TimeInForce: {
                            Duration: 'DAY'
                        },
                        Route: 'Intelligent'
                    },
                    {
                        // Sell the higher strike call
                        AccountID: accountId,
                        Symbol: 'MSFT 240621C405',
                        Quantity: '1',
                        OrderType: 'Limit',
                        LimitPrice: '2.00',
                        TradeAction: 'SELL',
                        TimeInForce: {
                            Duration: 'DAY'
                        },
                        Route: 'Intelligent'
                    }
                ]
            });

            console.log('Option Spread Group Confirmation:', {
                orders: spreadGroupConfirm.Orders.map(order => ({
                    orderId: order.OrderID,
                    message: order.Message
                })),
                errors: spreadGroupConfirm.Errors
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 