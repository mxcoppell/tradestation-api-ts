import { OrderExecutionService } from '../../OrderExecutionService';
import { OrderRequest, OrderConfirmationResponse } from '../../../types/orderExecution';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('OrderExecutionService - Confirm Order', () => {
    let orderExecutionService: OrderExecutionService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        orderExecutionService = new OrderExecutionService(mockHttpClient, mockStreamManager);
    });

    it('should confirm a simple market order', async () => {
        const mockResponse: OrderConfirmationResponse = {
            Route: 'Intelligent',
            Duration: 'Day',
            Account: '123456',
            SummaryMessage: 'Buy 100 MSFT Market Day',
            EstimatedPrice: '152.05',
            EstimatedPriceDisplay: '152.05',
            EstimatedCommission: '5.00',
            EstimatedCommissionDisplay: '5.00',
            InitialMarginDisplay: '7,602.50',
            ProductCurrency: 'USD',
            AccountCurrency: 'USD'
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const request: OrderRequest = {
            AccountID: '123456',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'Market',
            TradeAction: 'BUY',
            TimeInForce: { Duration: 'DAY' },
            Route: 'Intelligent'
        };

        const result = await orderExecutionService.confirmOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orderconfirm',
            request
        );
    });

    it('should confirm a limit order', async () => {
        const request: OrderRequest = {
            AccountID: '123456',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'Limit',
            LimitPrice: '150.00',
            TradeAction: 'BUY',
            TimeInForce: {
                Duration: 'DAY'
            },
            Route: 'Intelligent'
        };

        const mockResponse: OrderConfirmationResponse = {
            Route: 'Intelligent',
            Duration: 'Day',
            Account: '123456',
            SummaryMessage: 'Buy 100 MSFT Limit @ 150.00 Day',
            EstimatedPrice: '150.00',
            EstimatedPriceDisplay: '150.00',
            EstimatedCommission: '5.00',
            EstimatedCommissionDisplay: '5.00',
            InitialMarginDisplay: '7,500.00',
            ProductCurrency: 'USD',
            AccountCurrency: 'USD'
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.confirmOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orderconfirm',
            request
        );
    });

    it('should confirm a stop order', async () => {
        const request: OrderRequest = {
            AccountID: '123456',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'StopMarket',
            StopPrice: '155.00',
            TradeAction: 'SELL',
            TimeInForce: {
                Duration: 'DAY'
            },
            Route: 'Intelligent'
        };

        const mockResponse: OrderConfirmationResponse = {
            Route: 'Intelligent',
            Duration: 'Day',
            Account: '123456',
            SummaryMessage: 'Sell 100 MSFT Stop @ 155.00 Day',
            EstimatedPrice: '155.00',
            EstimatedPriceDisplay: '155.00',
            EstimatedCommission: '5.00',
            EstimatedCommissionDisplay: '5.00',
            InitialMarginDisplay: '0.00',
            ProductCurrency: 'USD',
            AccountCurrency: 'USD'
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.confirmOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orderconfirm',
            request
        );
    });

    it('should handle validation errors', async () => {
        const request: OrderRequest = {
            AccountID: '123456',
            Symbol: 'MSFT',
            Quantity: '-100', // Invalid quantity
            OrderType: 'Market',
            TradeAction: 'BUY',
            TimeInForce: {
                Duration: 'DAY'
            },
            Route: 'Intelligent'
        };

        const mockResponse: OrderConfirmationResponse = {
            Route: 'Intelligent',
            Duration: 'Day',
            Account: '123456',
            SummaryMessage: 'Invalid order: Quantity must be greater than 0'
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.confirmOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orderconfirm',
            request
        );
    });

    it('should handle network errors', async () => {
        const request: OrderRequest = {
            AccountID: '123456',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'Market',
            TradeAction: 'BUY',
            TimeInForce: {
                Duration: 'DAY'
            },
            Route: 'Intelligent'
        };

        mockHttpClient.post.mockRejectedValueOnce(new Error('Network error'));

        await expect(orderExecutionService.confirmOrder(request))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orderconfirm',
            request
        );
    });

    it('should handle unauthorized access', async () => {
        const request: OrderRequest = {
            AccountID: '123456',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'Market',
            TradeAction: 'BUY',
            TimeInForce: {
                Duration: 'DAY'
            },
            Route: 'Intelligent'
        };

        mockHttpClient.post.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(orderExecutionService.confirmOrder(request))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orderconfirm',
            request
        );
    });
}); 