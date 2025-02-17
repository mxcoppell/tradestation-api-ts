import { MarketDataService } from '../../MarketDataService';
import { SymbolDetail, SymbolDetailsResponse } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Get Symbol Details', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    const mockStockDetail: SymbolDetail = {
        AssetType: 'STOCK',
        Country: 'US',
        Currency: 'USD',
        Description: 'MICROSOFT CORP',
        Exchange: 'NASDAQ',
        PriceFormat: {
            Format: 'Decimal',
            Decimals: '2',
            IncrementStyle: 'Simple',
            Increment: '0.01',
            PointValue: '1'
        },
        QuantityFormat: {
            Format: 'Decimal',
            Decimals: '0',
            IncrementStyle: 'Simple',
            Increment: '1',
            MinimumTradeQuantity: '1'
        },
        Root: 'MSFT',
        Symbol: 'MSFT'
    };

    const mockOptionDetail: SymbolDetail = {
        AssetType: 'STOCKOPTION',
        Country: 'US',
        Currency: 'USD',
        Description: 'MSFT Jan 19 2024 400 Call',
        Exchange: 'OPRA',
        ExpirationDate: '2024-01-19T00:00:00Z',
        OptionType: 'Call',
        PriceFormat: {
            Format: 'Decimal',
            Decimals: '2',
            IncrementStyle: 'Simple',
            Increment: '0.01',
            PointValue: '100'
        },
        QuantityFormat: {
            Format: 'Decimal',
            Decimals: '0',
            IncrementStyle: 'Simple',
            Increment: '1',
            MinimumTradeQuantity: '1'
        },
        Root: 'MSFT',
        StrikePrice: '400',
        Symbol: 'MSFT 240119C400',
        Underlying: 'MSFT'
    };

    const mockFutureDetail: SymbolDetail = {
        AssetType: 'FUTURE',
        Country: 'US',
        Currency: 'USD',
        Description: 'E-mini S&P 500 Mar 2024',
        Exchange: 'CME',
        ExpirationDate: '2024-03-15T00:00:00Z',
        FutureType: 'ES',
        PriceFormat: {
            Format: 'Decimal',
            Decimals: '2',
            IncrementStyle: 'Simple',
            Increment: '0.25',
            PointValue: '50'
        },
        QuantityFormat: {
            Format: 'Decimal',
            Decimals: '0',
            IncrementStyle: 'Simple',
            Increment: '1',
            MinimumTradeQuantity: '1'
        },
        Root: 'ES',
        Symbol: 'ESH24'
    };

    it('should fetch symbol details for a single symbol', async () => {
        const mockResponse: SymbolDetailsResponse = {
            Symbols: [mockStockDetail],
            Errors: []
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getSymbolDetails('MSFT');

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbols/MSFT');
    });

    it('should fetch symbol details for multiple symbols', async () => {
        const mockResponse: SymbolDetailsResponse = {
            Symbols: [mockStockDetail, mockOptionDetail, mockFutureDetail],
            Errors: []
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const symbols = ['MSFT', 'MSFT 240119C400', 'ESH24'];
        const result = await marketDataService.getSymbolDetails(symbols);

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbols/MSFT,MSFT%20240119C400,ESH24');
    });

    it('should handle invalid symbols', async () => {
        const mockResponse: SymbolDetailsResponse = {
            Symbols: [mockStockDetail],
            Errors: [{
                Symbol: 'INVALID',
                Message: 'Symbol not found'
            }]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const symbols = ['MSFT', 'INVALID'];
        const result = await marketDataService.getSymbolDetails(symbols);

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbols/MSFT,INVALID');
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getSymbolDetails('MSFT'))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbols/MSFT');
    });

    it('should handle authentication errors', async () => {
        const errorMessage = 'Unauthorized';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getSymbolDetails('MSFT'))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbols/MSFT');
    });

    it('should throw error if more than 50 symbols are requested', async () => {
        const symbols = Array.from({ length: 51 }, (_, i) => `SYMBOL${i}`);

        await expect(marketDataService.getSymbolDetails(symbols))
            .rejects
            .toThrow('Maximum of 50 symbols allowed per request');
        expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
}); 