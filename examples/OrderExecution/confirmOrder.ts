import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with environment variables
    const client = new TradeStationClient()

    try {
        // Get accounts first
        const accounts = await client.brokerage.getAccounts();
        if (accounts.length > 0) {
            const accountId = accounts[0].AccountID;

            // Example 1: Confirm a market order
            console.log('\nConfirming market order for MSFT:');
            const marketOrderConfirm = await client.orderExecution.confirmOrder({
                AccountID: accountId,
                Symbol: 'MSFT',
                Quantity: '1',
                OrderType: 'Market',
                TradeAction: 'BUY',
                TimeInForce: {
                    Duration: 'DAY'
                },
                Route: 'Intelligent'
            });

            console.log('Market Order Confirmation:', {
                route: marketOrderConfirm.Route,
                duration: marketOrderConfirm.Duration,
                account: marketOrderConfirm.Account,
                summaryMessage: marketOrderConfirm.SummaryMessage,
                estimatedPrice: marketOrderConfirm.EstimatedPrice,
                estimatedCommission: marketOrderConfirm.EstimatedCommission
            });

            // Example 2: Confirm a limit order
            console.log('\nConfirming limit order for AAPL:');
            const limitOrderConfirm = await client.orderExecution.confirmOrder({
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

            console.log('Limit Order Confirmation:', {
                route: limitOrderConfirm.Route,
                duration: limitOrderConfirm.Duration,
                account: limitOrderConfirm.Account,
                summaryMessage: limitOrderConfirm.SummaryMessage,
                estimatedPrice: limitOrderConfirm.EstimatedPrice,
                estimatedCommission: limitOrderConfirm.EstimatedCommission
            });

            // Example 3: Confirm an option order
            console.log('\nConfirming option order:');
            const optionOrderConfirm = await client.orderExecution.confirmOrder({
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
            });

            console.log('Option Order Confirmation:', {
                route: optionOrderConfirm.Route,
                duration: optionOrderConfirm.Duration,
                account: optionOrderConfirm.Account,
                summaryMessage: optionOrderConfirm.SummaryMessage,
                estimatedPrice: optionOrderConfirm.EstimatedPrice,
                estimatedCommission: optionOrderConfirm.EstimatedCommission
            });

            // Example 4: Confirm a stop order
            console.log('\nConfirming stop order for GOOGL:');
            const stopOrderConfirm = await client.orderExecution.confirmOrder({
                AccountID: accountId,
                Symbol: 'GOOGL',
                Quantity: '1',
                OrderType: 'StopLimit',
                StopPrice: '140.00',
                LimitPrice: '139.50',
                TradeAction: 'SELL',
                TimeInForce: {
                    Duration: 'GTC'
                },
                Route: 'Intelligent'
            });

            console.log('Stop Order Confirmation:', {
                route: stopOrderConfirm.Route,
                duration: stopOrderConfirm.Duration,
                account: stopOrderConfirm.Account,
                summaryMessage: stopOrderConfirm.SummaryMessage,
                estimatedPrice: stopOrderConfirm.EstimatedPrice,
                estimatedCommission: stopOrderConfirm.EstimatedCommission
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 