import { BrokerageService } from '../../BrokerageService';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Get Historical Orders', () => {
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

    const mockHistoricalOrdersResponse = {
        Orders: [
            {
                AccountID: '123456',
                ClosedDateTime: '2024-01-19T15:30:00Z',
                Duration: 'DAY',
                Legs: [
                    {
                        AssetType: 'STOCK',
                        BuyOrSell: 'Buy',
                        ExecQuantity: '100',
                        ExecutionPrice: '150.25',
                        OpenOrClose: 'Open',
                        QuantityOrdered: '100',
                        QuantityRemaining: '0',
                        Symbol: 'MSFT'
                    }
                ],
                OpenedDateTime: '2024-01-19T14:30:00Z',
                OrderID: '123456',
                OrderType: 'Market',
                Status: 'FLL',
                StatusDescription: 'Filled'
            },
            {
                AccountID: '789012',
                ClosedDateTime: '2024-01-19T15:45:00Z',
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
                        QuantityOrdered: '1',
                        QuantityRemaining: '0',
                        StrikePrice: '155.00',
                        Symbol: 'MSFT 240216C155',
                        Underlying: 'MSFT'
                    }
                ],
                OpenedDateTime: '2024-01-19T15:00:00Z',
                OrderID: '789012',
                OrderType: 'Limit',
                Status: 'FLL',
                StatusDescription: 'Filled',
                LimitPrice: '2.50'
            }
        ],
        NextToken: 'abc123...'
    };

    it('should fetch historical orders for a single account', async () => {
        const singleAccountResponse = {
            Orders: [mockHistoricalOrdersResponse.Orders[0]]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(singleAccountResponse));

        const result = await brokerageService.getHistoricalOrders('123456', validDateStr);
        expect(result).toEqual(singleAccountResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders',
            { params: { since: validDateStr } }
        );
    });

    it('should fetch historical orders for multiple accounts', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockHistoricalOrdersResponse));

        const result = await brokerageService.getHistoricalOrders('123456,789012', validDateStr);
        expect(result).toEqual(mockHistoricalOrdersResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456,789012/historicalorders',
            { params: { since: validDateStr } }
        );
    });

    it('should handle pagination parameters', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockHistoricalOrdersResponse));

        const result = await brokerageService.getHistoricalOrders(
            '123456',
            validDateStr,
            100,
            'previousToken'
        );
        expect(result).toEqual(mockHistoricalOrdersResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders',
            {
                params: {
                    since: validDateStr,
                    pageSize: 100,
                    nextToken: 'previousToken'
                }
            }
        );
    });

    it('should handle orders with advanced options', async () => {
        const advancedOrderResponse = {
            Orders: [{
                ...mockHistoricalOrdersResponse.Orders[0],
                OrderType: 'StopLimit',
                LimitPrice: '150.00',
                StopPrice: '149.00',
                AdvancedOptions: {
                    TrailingStop: 'true',
                    TrailingStopAmount: '1.00'
                }
            }]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(advancedOrderResponse));

        const result = await brokerageService.getHistoricalOrders('123456', validDateStr);
        expect(result).toEqual(advancedOrderResponse);
        expect(result.Orders[0].AdvancedOptions).toBeDefined();
        expect(result.Orders[0].AdvancedOptions!.TrailingStop).toBe('true');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders',
            { params: { since: validDateStr } }
        );
    });

    it('should handle errors for invalid accounts', async () => {
        const errorResponse = {
            Orders: [],
            Errors: [{
                AccountID: 'INVALID',
                Error: 'INVALID_ACCOUNT',
                Message: 'Account not found'
            }]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(errorResponse));

        const result = await brokerageService.getHistoricalOrders('INVALID', validDateStr);
        expect(result).toEqual(errorResponse);
        expect(result.Errors).toBeDefined();
        expect(result.Errors![0].Error).toBe('INVALID_ACCOUNT');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/INVALID/historicalorders',
            { params: { since: validDateStr } }
        );
    });

    it('should throw error for too many accounts', async () => {
        const tooManyAccounts = Array.from({ length: 26 }, (_, i) => `ACC${i}`).join(',');

        await expect(async () => {
            await brokerageService.getHistoricalOrders(tooManyAccounts, validDateStr);
        }).rejects.toThrow('Maximum of 25 accounts allowed per request');
        expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw error for date range exceeding 90 days', async () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 91);
        const oldDateStr = oldDate.toISOString().split('T')[0];

        await expect(async () => {
            await brokerageService.getHistoricalOrders('123456', oldDateStr);
        }).rejects.toThrow('Date range cannot exceed 90 days');
        expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw error for invalid page size', async () => {
        await expect(async () => {
            await brokerageService.getHistoricalOrders('123456', validDateStr, 0);
        }).rejects.toThrow('Page size must be between 1 and 600');

        await expect(async () => {
            await brokerageService.getHistoricalOrders('123456', validDateStr, 601);
        }).rejects.toThrow('Page size must be between 1 and 600');

        expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.getHistoricalOrders('123456', validDateStr))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders',
            { params: { since: validDateStr } }
        );
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.getHistoricalOrders('123456', validDateStr))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders',
            { params: { since: validDateStr } }
        );
    });

    it('should handle empty orders response', async () => {
        const emptyResponse = {
            Orders: []
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(emptyResponse));

        const result = await brokerageService.getHistoricalOrders('123456', validDateStr);
        expect(result).toEqual(emptyResponse);
        expect(result.Orders).toHaveLength(0);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/historicalorders',
            { params: { since: validDateStr } }
        );
    });
}); 