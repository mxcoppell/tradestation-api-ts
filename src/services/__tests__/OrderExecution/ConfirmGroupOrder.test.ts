import { OrderExecutionService } from '../../OrderExecutionService';
import { GroupOrderRequest, GroupOrderConfirmationResponse } from '../../../types/orderExecution';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('OrderExecutionService - Confirm Group Order', () => {
    let orderExecutionService: OrderExecutionService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        orderExecutionService = new OrderExecutionService(mockHttpClient, mockStreamManager);
    });

    it('should confirm a bracket order', async () => {
        const mockResponse: GroupOrderConfirmationResponse = {
            Orders: [
                {
                    OrderID: 'ORDER123',
                    Message: 'Order confirmed'
                },
                {
                    OrderID: 'ORDER124',
                    Message: 'Order confirmed'
                },
                {
                    OrderID: 'ORDER125',
                    Message: 'Order confirmed'
                }
            ]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const request: GroupOrderRequest = {
            Type: 'BRK',
            Orders: [
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'Market',
                    TradeAction: 'BUY',
                    TimeInForce: { Duration: 'DAY' },
                    Route: 'Intelligent'
                },
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'Limit',
                    TradeAction: 'SELL',
                    TimeInForce: { Duration: 'GTC' },
                    Route: 'Intelligent',
                    LimitPrice: '160'
                },
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'StopMarket',
                    TradeAction: 'SELL',
                    TimeInForce: { Duration: 'GTC' },
                    Route: 'Intelligent',
                    StopPrice: '145'
                }
            ]
        };

        const result = await orderExecutionService.confirmGroupOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroupconfirm',
            request
        );
    });

    it('should confirm an OCO order', async () => {
        const mockResponse: GroupOrderConfirmationResponse = {
            Orders: [
                {
                    OrderID: 'ORDER123',
                    Message: 'Order confirmed'
                },
                {
                    OrderID: 'ORDER124',
                    Message: 'Order confirmed'
                }
            ]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const request: GroupOrderRequest = {
            Type: 'OCO',
            Orders: [
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'Limit',
                    TradeAction: 'SELL',
                    TimeInForce: { Duration: 'GTC' },
                    Route: 'Intelligent',
                    LimitPrice: '160'
                },
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'StopMarket',
                    TradeAction: 'SELL',
                    TimeInForce: { Duration: 'GTC' },
                    Route: 'Intelligent',
                    StopPrice: '145'
                }
            ]
        };

        const result = await orderExecutionService.confirmGroupOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroupconfirm',
            request
        );
    });

    it('should handle validation errors', async () => {
        const mockResponse: GroupOrderConfirmationResponse = {
            Orders: [],
            Errors: [
                {
                    OrderID: 'ORDER123',
                    Error: 'INVALID_QUANTITY',
                    Message: 'Quantity must be positive'
                }
            ]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const request: GroupOrderRequest = {
            Type: 'BRK',
            Orders: [
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '-100',
                    OrderType: 'Market',
                    TradeAction: 'BUY',
                    TimeInForce: { Duration: 'DAY' },
                    Route: 'Intelligent'
                }
            ]
        };

        const result = await orderExecutionService.confirmGroupOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroupconfirm',
            request
        );
    });

    it('should handle network errors', async () => {
        mockHttpClient.post.mockRejectedValueOnce(new Error('Network error'));

        const request: GroupOrderRequest = {
            Type: 'BRK',
            Orders: [
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'Market',
                    TradeAction: 'BUY',
                    TimeInForce: { Duration: 'DAY' },
                    Route: 'Intelligent'
                }
            ]
        };

        await expect(orderExecutionService.confirmGroupOrder(request))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroupconfirm',
            request
        );
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.post.mockRejectedValueOnce(new Error('Unauthorized'));

        const request: GroupOrderRequest = {
            Type: 'BRK',
            Orders: [
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'Market',
                    TradeAction: 'BUY',
                    TimeInForce: { Duration: 'DAY' },
                    Route: 'Intelligent'
                }
            ]
        };

        await expect(orderExecutionService.confirmGroupOrder(request))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroupconfirm',
            request
        );
    });
}); 