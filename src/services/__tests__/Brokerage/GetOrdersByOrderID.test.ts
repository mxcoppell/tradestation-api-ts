import { BrokerageService } from '../../BrokerageService';
import { OrdersById } from '../../../types/brokerage';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Get Orders By Order ID', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    it('should fetch orders by order ID for all accounts', async () => {
        const mockResponse: OrdersById = {
            Orders: [
                {
                    AccountID: '123456',
                    OrderID: 'ORDER123',
                    Status: 'OPN',
                    StatusDescription: 'Sent',
                    OpenedDateTime: '2024-01-19T12:00:00Z',
                    OrderType: 'Limit',
                    Duration: 'DAY',
                    LimitPrice: '150.00',
                    Legs: [
                        {
                            AssetType: 'STOCK',
                            BuyOrSell: 'Buy',
                            ExecQuantity: '0',
                            ExecutionPrice: '0.00',
                            OpenOrClose: 'Open',
                            QuantityOrdered: '100',
                            QuantityRemaining: '100',
                            Symbol: 'MSFT'
                        }
                    ]
                },
                {
                    AccountID: '789012',
                    OrderID: 'ORDER456',
                    Status: 'FPR',
                    StatusDescription: 'Partial Fill (Alive)',
                    OpenedDateTime: '2024-01-19T11:00:00Z',
                    OrderType: 'Market',
                    Duration: 'DAY',
                    Legs: [
                        {
                            AssetType: 'STOCKOPTION',
                            BuyOrSell: 'Buy',
                            ExecQuantity: '1',
                            ExecutionPrice: '2.50',
                            ExpirationDate: '2024-02-16',
                            OpenOrClose: 'Open',
                            OptionType: 'CALL',
                            QuantityOrdered: '2',
                            QuantityRemaining: '1',
                            StrikePrice: '155.00',
                            Symbol: 'MSFT 240216C155',
                            Underlying: 'MSFT'
                        }
                    ]
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getOrdersByOrderID(
            '123456,789012',
            'ORDER123,ORDER456'
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456,789012/orders/ORDER123,ORDER456'
        );
    });

    it('should fetch orders by order ID for a specific account', async () => {
        const mockResponse: OrdersById = {
            Orders: [
                {
                    AccountID: '123456',
                    OrderID: 'ORDER123',
                    Status: 'OPN',
                    StatusDescription: 'Sent',
                    OpenedDateTime: '2024-01-19T12:00:00Z',
                    OrderType: 'Limit',
                    Duration: 'DAY',
                    LimitPrice: '150.00',
                    Legs: [
                        {
                            AssetType: 'STOCK',
                            BuyOrSell: 'Buy',
                            ExecQuantity: '0',
                            ExecutionPrice: '0.00',
                            OpenOrClose: 'Open',
                            QuantityOrdered: '100',
                            QuantityRemaining: '100',
                            Symbol: 'MSFT'
                        }
                    ]
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getOrdersByOrderID(
            '123456',
            'ORDER123'
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/orders/ORDER123'
        );
    });

    it('should handle errors for invalid accounts', async () => {
        const mockResponse: OrdersById = {
            Orders: [],
            Errors: [
                {
                    AccountID: 'INVALID',
                    OrderID: 'ORDER123',
                    Error: 'INVALID_ACCOUNT',
                    Message: 'Account not found'
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getOrdersByOrderID(
            'INVALID',
            'ORDER123'
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/INVALID/orders/ORDER123'
        );
    });

    it('should handle errors for invalid order IDs', async () => {
        const mockResponse: OrdersById = {
            Orders: [],
            Errors: [
                {
                    AccountID: '123456',
                    OrderID: 'INVALID',
                    Error: 'INVALID_ORDER',
                    Message: 'Order not found'
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getOrdersByOrderID(
            '123456',
            'INVALID'
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/orders/INVALID'
        );
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.getOrdersByOrderID('123456', 'ORDER123'))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/orders/ORDER123'
        );
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.getOrdersByOrderID('123456', 'ORDER123'))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/orders/ORDER123'
        );
    });
}); 