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

        // Find the margin account (ends with 'M')
        const marginAccount = accounts.find(account => account.AccountID.endsWith('M'));
        if (!marginAccount) {
            throw new Error('No margin account found. Please ensure you have a margin account available.');
        }
        const accountId = marginAccount.AccountID;
        console.log(`Using margin account: ${accountId}`);

        // Step 1: Get quote for AAPL
        console.log('\nGetting quote for AAPL:');
        const quoteResponse = await client.marketData.getQuoteSnapshots(['AAPL']);
        if (quoteResponse.Quotes.length === 0) {
            throw new Error('No quote found for AAPL');
        }
        const quote = quoteResponse.Quotes[0];
        console.log('Quote:', {
            symbol: quote.Symbol,
            lastPrice: quote.Last,
            bid: quote.Bid,
            ask: quote.Ask
        });

        // Step 2: Place a limit buy order 10% below last price
        const limitPrice = (parseFloat(quote.Last) * 0.9).toFixed(2); // Format to 2 decimal places
        console.log(`\nPlacing limit buy order at ${limitPrice}:`);
        const orderResponse = await client.orderExecution.placeOrder({
            AccountID: accountId,
            Symbol: 'AAPL',
            Quantity: '1',
            OrderType: 'Limit',
            LimitPrice: limitPrice,
            TradeAction: 'BUY',
            TimeInForce: {
                Duration: 'GTC'
            },
            Route: 'Intelligent'
        });

        console.log('Order Response:', {
            Orders: orderResponse.Orders?.map(order => ({
                OrderID: order.OrderID,
                Message: order.Message
            })) || [],
            Errors: orderResponse.Errors?.map(error => ({
                OrderID: error.OrderID,
                Error: error.Error,
                Message: error.Message
            }))
        });

        if (orderResponse.Errors?.length) {
            throw new Error('Order placement failed: ' + orderResponse.Errors[0].Message);
        }

        const limitOrder = orderResponse.Orders?.[0];
        if (!limitOrder) {
            throw new Error('No order ID received in response');
        }

        // Example 2: Cancel the order just placed
        if (limitOrder.OrderID) {
            const cancelOrder = await client.orderExecution.cancelOrder(limitOrder.OrderID);
            console.log('Order canceled:', {
                orderId: cancelOrder.OrderID,
                status: cancelOrder.Message,
                message: cancelOrder.Message
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 