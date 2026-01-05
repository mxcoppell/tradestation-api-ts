import { BrokerageService } from '../../BrokerageService';
import { Positions } from '../../../types/brokerage';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Get Positions', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    it('should fetch positions for all accounts', async () => {
        const mockResponse: Positions = {
            Positions: [
                {
                    AccountID: '123456',
                    AssetType: 'STOCK',
                    AveragePrice: '150.00',
                    Bid: '152.00',
                    Ask: '152.10',
                    ConversionRate: '1.00',
                    DayTradeRequirement: '0.00',
                    InitialRequirement: '7500.00',
                    MaintenanceMargin: '3750.00',
                    Last: '152.05',
                    LongShort: 'Long',
                    MarkToMarketPrice: '152.05',
                    MarketValue: '15205.00',
                    PositionID: 'POS123',
                    Quantity: '100',
                    Symbol: 'MSFT',
                    Timestamp: '2024-01-19T12:00:00Z',
                    TodaysProfitLoss: '205.00',
                    TotalCost: '15000.00',
                    UnrealizedProfitLoss: '205.00',
                    UnrealizedProfitLossPercent: '1.37',
                    UnrealizedProfitLossQty: '2.05'
                },
                {
                    AccountID: '789012',
                    AssetType: 'STOCKOPTION',
                    AveragePrice: '2.50',
                    Bid: '2.75',
                    Ask: '2.80',
                    ConversionRate: '1.00',
                    DayTradeRequirement: '0.00',
                    ExpirationDate: '2024-02-16',
                    InitialRequirement: '250.00',
                    MaintenanceMargin: '250.00',
                    Last: '2.78',
                    LongShort: 'Long',
                    MarkToMarketPrice: '2.78',
                    MarketValue: '278.00',
                    PositionID: 'POS456',
                    Quantity: '1',
                    Symbol: 'MSFT 240216C155',
                    Timestamp: '2024-01-19T12:00:00Z',
                    TodaysProfitLoss: '28.00',
                    TotalCost: '250.00',
                    UnrealizedProfitLoss: '28.00',
                    UnrealizedProfitLossPercent: '11.20',
                    UnrealizedProfitLossQty: '28.00'
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getPositions('123456,789012');
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456,789012/positions',
            { params: {} }
        );
    });

    it('should fetch positions with symbol filter', async () => {
        const mockResponse: Positions = {
            Positions: [
                {
                    AccountID: '123456',
                    AssetType: 'STOCK',
                    AveragePrice: '150.00',
                    Bid: '152.00',
                    Ask: '152.10',
                    ConversionRate: '1.00',
                    DayTradeRequirement: '0.00',
                    InitialRequirement: '7500.00',
                    MaintenanceMargin: '3750.00',
                    Last: '152.05',
                    LongShort: 'Long',
                    MarkToMarketPrice: '152.05',
                    MarketValue: '15205.00',
                    PositionID: 'POS123',
                    Quantity: '100',
                    Symbol: 'MSFT',
                    Timestamp: '2024-01-19T12:00:00Z',
                    TodaysProfitLoss: '205.00',
                    TotalCost: '15000.00',
                    UnrealizedProfitLoss: '205.00',
                    UnrealizedProfitLossPercent: '1.37',
                    UnrealizedProfitLossQty: '2.05'
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getPositions('123456', 'MSFT');
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/positions',
            {
                params: {
                    symbol: 'MSFT'
                }
            }
        );
    });

    it('should fetch positions with wildcard symbol filter', async () => {
        const mockResponse: Positions = {
            Positions: [
                {
                    AccountID: '123456',
                    AssetType: 'STOCKOPTION',
                    AveragePrice: '2.50',
                    Bid: '2.75',
                    Ask: '2.80',
                    ConversionRate: '1.00',
                    DayTradeRequirement: '0.00',
                    ExpirationDate: '2024-02-16',
                    InitialRequirement: '250.00',
                    MaintenanceMargin: '250.00',
                    Last: '2.78',
                    LongShort: 'Long',
                    MarkToMarketPrice: '2.78',
                    MarketValue: '278.00',
                    PositionID: 'POS456',
                    Quantity: '1',
                    Symbol: 'MSFT 240216C155',
                    Timestamp: '2024-01-19T12:00:00Z',
                    TodaysProfitLoss: '28.00',
                    TotalCost: '250.00',
                    UnrealizedProfitLoss: '28.00',
                    UnrealizedProfitLossPercent: '11.20',
                    UnrealizedProfitLossQty: '28.00'
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getPositions('123456', 'MSFT *');
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/positions',
            {
                params: {
                    symbol: 'MSFT *'
                }
            }
        );
    });

    it('should handle errors for invalid accounts', async () => {
        const mockResponse: Positions = {
            Positions: [],
            Errors: [
                {
                    AccountID: 'INVALID',
                    Error: 'INVALID_ACCOUNT',
                    Message: 'Account not found'
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await brokerageService.getPositions('INVALID');
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/INVALID/positions',
            { params: {} }
        );
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.getPositions('123456'))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/positions',
            { params: {} }
        );
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.getPositions('123456'))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/brokerage/accounts/123456/positions',
            { params: {} }
        );
    });
}); 