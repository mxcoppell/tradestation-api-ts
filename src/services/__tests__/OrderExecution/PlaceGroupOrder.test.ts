import { OrderExecutionService } from '../../OrderExecutionService';
import { GroupOrderRequest, GroupOrderResponse } from '../../../types/orderExecution';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('OrderExecutionService - Place Group Order', () => {
    let orderExecutionService: OrderExecutionService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        orderExecutionService = new OrderExecutionService(mockHttpClient, mockStreamManager);
    });

    it('should place a bracket order', async () => {
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
                    LimitPrice: '160.00',
                    TradeAction: 'SELL',
                    TimeInForce: { Duration: 'GTC' },
                    Route: 'Intelligent'
                },
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'StopMarket',
                    StopPrice: '145.00',
                    TradeAction: 'SELL',
                    TimeInForce: { Duration: 'GTC' },
                    Route: 'Intelligent'
                }
            ]
        };

        const mockResponse: GroupOrderResponse = {
            Orders: [
                {
                    OrderID: 'ORDER123',
                    Message: 'Entry order received successfully'
                },
                {
                    OrderID: 'ORDER124',
                    Message: 'Profit target order received'
                },
                {
                    OrderID: 'ORDER125',
                    Message: 'Stop loss order received'
                }
            ]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.placeGroupOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroups',
            request
        );
    });

    it('should place an OCO order', async () => {
        const request: GroupOrderRequest = {
            Type: 'OCO',
            Orders: [
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'Limit',
                    LimitPrice: '160.00',
                    TradeAction: 'SELL',
                    TimeInForce: { Duration: 'GTC' },
                    Route: 'Intelligent'
                },
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '100',
                    OrderType: 'StopMarket',
                    StopPrice: '145.00',
                    TradeAction: 'SELL',
                    TimeInForce: { Duration: 'GTC' },
                    Route: 'Intelligent'
                }
            ]
        };

        const mockResponse: GroupOrderResponse = {
            Orders: [
                {
                    OrderID: 'ORDER123',
                    Message: 'Limit order received'
                },
                {
                    OrderID: 'ORDER124',
                    Message: 'Stop order received'
                }
            ]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.placeGroupOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroups',
            request
        );
    });

    it('should handle validation errors', async () => {
        const request: GroupOrderRequest = {
            Type: 'BRK',
            Orders: [
                {
                    AccountID: '123456',
                    Symbol: 'MSFT',
                    Quantity: '-100', // Invalid quantity
                    OrderType: 'Market',
                    TradeAction: 'BUY',
                    TimeInForce: { Duration: 'DAY' },
                    Route: 'Intelligent'
                }
            ]
        };

        const mockResponse: GroupOrderResponse = {
            Orders: [],
            Errors: [
                {
                    OrderID: 'ORDER123',
                    Error: 'INVALID_QUANTITY',
                    Message: 'Invalid order: Quantity must be greater than 0'
                }
            ]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.placeGroupOrder(request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroups',
            request
        );
    });

    it('should handle network errors', async () => {
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

        mockHttpClient.post.mockRejectedValueOnce(new Error('Network error'));

        await expect(orderExecutionService.placeGroupOrder(request))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroups',
            request
        );
    });

    it('should handle unauthorized access', async () => {
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

        mockHttpClient.post.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(orderExecutionService.placeGroupOrder(request))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/orderexecution/ordergroups',
            request
        );
    });
}); 