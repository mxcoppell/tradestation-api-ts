import { BrokerageService } from '../../BrokerageService';
import { HistoricalOrdersById, HistoricalOrder, OrderLeg } from '../../../types/brokerage';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Get Historical Orders By Order ID', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    // Get current date and valid date within 90 days
    const currentDate = new Date();
    const validDate = new Date();
    validDate.setDate(currentDate.getDate() - 30); // 30 days ago
    const validDateStr = validDate.toISOString().split('T')[0];

    it('should fetch historical orders by order ID for all accounts', async () => {
        const mockResponse: HistoricalOrdersById = {
            Orders: [
                {
                    AccountID: '123456',
                    OrderID: 'ORDER123',
                    Status: 'FLL',
                    StatusDescription: 'Filled',
                    OpenedDateTime: validDate.toISOString(),
                    OrderType: 'Market',
                    Duration: 'DAY',
                    Legs: [
                        {
                            AssetType: 'STOCK',
                            BuyOrSell: 'Buy',
                            ExecQuantity: '100',
                            ExecutionPrice: '150.00',
                            OpenOrClose: 'Open',
                            QuantityOrdered: '100',
                            QuantityRemaining: '0',
                            Symbol: 'MSFT'
                        }
                    ]
                },
                {
                    AccountID: '789012',
                    OrderID: 'ORDER456',
                    Status: 'CAN',
                    StatusDescription: 'Canceled',
                    OpenedDateTime: '2024-01-19T11:00:00Z',
                    OrderType: 'Limit',
                    Duration: 'GTC',
                    Legs: [
                        {
                            AssetType: 'STOCKOPTION',
                            BuyOrSell: 'Buy',
                            ExecQuantity: '0',
                            ExecutionPrice: '0.00',
                            ExpirationDate: '2024-02-16',
                            OpenOrClose: 'Open',
                            OptionType: 'CALL',
                            QuantityOrdered: '1',
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

        const result = await brokerageService.getHistoricalOrdersByOrderID(
            '123456,789012',
            'ORDER123,ORDER456',
            validDateStr
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456,789012/historicalorders/ORDER123,ORDER456',
            {
                params: {
                    since: '2025-01-18'
                }
            }
        );
    });

    it('should fetch historical orders by order ID for a specific account', async () => {
        const mockResponse: HistoricalOrdersById = {
            Orders: [
                {
                    AccountID: '123456',
                    OrderID: 'ORDER123',
                    Status: 'FLL',
                    StatusDescription: 'Filled',
                    OpenedDateTime: validDate.toISOString(),
                    OrderType: 'Market',
                    Duration: 'DAY',
                    Legs: [
                        {
                            AssetType: 'STOCK',
                            BuyOrSell: 'Buy',
                            ExecQuantity: '100',
                            ExecutionPrice: '150.00',
                            OpenOrClose: 'Open',
                            QuantityOrdered: '100',
                            QuantityRemaining: '0',
                            Symbol: 'MSFT'
                        }
                    ]
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getHistoricalOrdersByOrderID(
            '123456',
            'ORDER123',
            validDateStr
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders/ORDER123',
            {
                params: {
                    since: '2025-01-18'
                }
            }
        );
    });

    it('should handle errors for invalid accounts', async () => {
        const mockResponse: HistoricalOrdersById = {
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

        const result = await brokerageService.getHistoricalOrdersByOrderID(
            'INVALID',
            'ORDER123',
            validDateStr
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/INVALID/historicalorders/ORDER123',
            {
                params: {
                    since: '2025-01-18'
                }
            }
        );
    });

    it('should handle errors for invalid order IDs', async () => {
        const mockResponse: HistoricalOrdersById = {
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

        const result = await brokerageService.getHistoricalOrdersByOrderID(
            '123456',
            'INVALID',
            validDateStr
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders/INVALID',
            {
                params: {
                    since: '2025-01-18'
                }
            }
        );
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.getHistoricalOrdersByOrderID('123456', 'ORDER123', validDateStr))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders/ORDER123',
            {
                params: {
                    since: '2025-01-18'
                }
            }
        );
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.getHistoricalOrdersByOrderID('123456', 'ORDER123', validDateStr))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders/ORDER123',
            {
                params: {
                    since: '2025-01-18'
                }
            }
        );
    });
}); 