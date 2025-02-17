import { OrderExecutionService } from '../../OrderExecutionService';
import { OrderRequest, OrderResponse } from '../../../types/orderExecution';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('OrderExecutionService - Place Order', () => {
    let orderExecutionService: OrderExecutionService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        orderExecutionService = new OrderExecutionService(mockHttpClient, mockStreamManager);
    });

    it('should place a market order', async () => {
        const mockResponse: OrderResponse = {
            Orders: [{
                OrderID: 'ORDER123',
                Message: 'Order received successfully'
            }]
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

        const result = await orderExecutionService.placeOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orders',
            request
        );
    });

    it('should place a limit order', async () => {
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

        const mockResponse: OrderResponse = {
            Orders: [{
                OrderID: 'ORDER123',
                Message: 'Order received successfully'
            }]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.placeOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orders',
            request
        );
    });

    it('should place a stop order', async () => {
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

        const mockResponse: OrderResponse = {
            Orders: [{
                OrderID: 'ORDER123',
                Message: 'Order received successfully'
            }]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.placeOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orders',
            request
        );
    });

    it('should place an order with advanced options', async () => {
        const request: OrderRequest = {
            AccountID: '123456',
            Symbol: 'MSFT',
            Quantity: '100',
            OrderType: 'Market',
            TradeAction: 'BUY',
            TimeInForce: {
                Duration: 'DAY'
            },
            Route: 'Intelligent',
            AdvancedOptions: {
                AllOrNone: true,
                DoNotReduceFlag: true,
                MinimumQuantity: 50
            }
        };

        const mockResponse: OrderResponse = {
            Orders: [{
                OrderID: 'ORDER123',
                Message: 'Order received successfully'
            }]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.placeOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orders',
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

        const mockResponse: OrderResponse = {
            Errors: [{
                OrderID: 'ORDER123',
                Error: 'INVALID_QUANTITY',
                Message: 'Invalid order: Quantity must be greater than 0'
            }]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.placeOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orders',
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

        await expect(orderExecutionService.placeOrder(request))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orders',
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

        await expect(orderExecutionService.placeOrder(request))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/orders',
            request
        );
    });
}); 