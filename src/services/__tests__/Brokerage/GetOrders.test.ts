import { BrokerageService } from '../../BrokerageService';
import { Orders } from '../../../types/brokerage';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Get Orders', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    it('should fetch orders for all accounts', async () => {
        const mockResponse: Orders = {
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
            ],
            NextToken: 'NEXT_PAGE_TOKEN'
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getOrders('123456,789012', 10);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456,789012/orders',
            {
                params: {
                    pageSize: 10
                }
            }
        );
    });

    it('should fetch orders with pagination', async () => {
        const mockResponse: Orders = {
            Orders: [
                {
                    AccountID: '123456',
                    OrderID: 'ORDER789',
                    Status: 'OPN',
                    StatusDescription: 'Sent',
                    OpenedDateTime: '2024-01-18T12:00:00Z',
                    OrderType: 'Limit',
                    Duration: 'DAY',
                    LimitPrice: '155.00',
                    Legs: [
                        {
                            AssetType: 'STOCK',
                            BuyOrSell: 'Sell',
                            ExecQuantity: '0',
                            ExecutionPrice: '0.00',
                            OpenOrClose: 'Close',
                            QuantityOrdered: '50',
                            QuantityRemaining: '50',
                            Symbol: 'MSFT'
                        }
                    ]
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getOrders(
            '123456',
            10,
            'NEXT_PAGE_TOKEN'
        );
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/orders',
            {
                params: {
                    pageSize: 10,
                    nextToken: 'NEXT_PAGE_TOKEN'
                }
            }
        );
    });

    it('should handle errors for invalid accounts', async () => {
        const mockResponse: Orders = {
            Orders: [],
            Errors: [
                {
                    AccountID: 'INVALID',
                    Error: 'INVALID_ACCOUNT',
                    Message: 'Account not found'
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getOrders('INVALID');
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/INVALID/orders',
            { params: {} }
        );
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.getOrders('123456'))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/orders',
            { params: {} }
        );
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.getOrders('123456'))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/orders',
            { params: {} }
        );
    });
}); 