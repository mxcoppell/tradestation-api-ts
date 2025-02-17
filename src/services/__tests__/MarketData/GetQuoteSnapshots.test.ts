import { MarketDataService } from '../../MarketDataService';
import { Quote, QuoteSnapshot } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Get Quote Snapshots', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    const mockQuote: Quote = {
        Symbol: 'MSFT',
        Open: '213.65',
        High: '215.77',
        Low: '205.48',
        PreviousClose: '214.46',
        Last: '212.85',
        Ask: '212.87',
        AskSize: '300',
        Bid: '212.85',
        BidSize: '200',
        NetChange: '-1.61',
        NetChangePct: '3.5',
        High52Week: '232.86',
        High52WeekTimestamp: '2020-09-02T00:00:00Z',
        Low52Week: '132.52',
        Low52WeekTimestamp: '2020-03-23T00:00:00Z',
        Volume: '5852511',
        PreviousVolume: '24154112',
        Close: '212.85',
        DailyOpenInterest: '0',
        TradeTime: '2020-11-18T15:19:14Z',
        TickSizeTier: '0',
        MarketFlags: {
            IsDelayed: false,
            IsHardToBorrow: false,
            IsBats: false,
            IsHalted: false
        },
        LastSize: '954',
        LastVenue: 'ARCX',
        VWAP: '136.340542862433'
    };

    const mockCryptoQuote: Quote = {
        Symbol: 'BTCUSD',
        Open: '50123.45',
        High: '51234.56',
        Low: '49876.54',
        PreviousClose: '50000.00',
        Last: '50789.12',
        Ask: '50790.00',
        AskSize: '1.5',
        Bid: '50788.00',
        BidSize: '2.3',
        NetChange: '789.12',
        NetChangePct: '1.58',
        High52Week: '68789.63',
        High52WeekTimestamp: '2021-11-10T00:00:00Z',
        Low52Week: '15899.00',
        Low52WeekTimestamp: '2020-03-13T00:00:00Z',
        Volume: '123456.78',
        PreviousVolume: '98765.43',
        Close: '50789.12',
        DailyOpenInterest: '0',
        TradeTime: '2024-01-24T15:30:00Z',
        TickSizeTier: '0',
        MarketFlags: {
            IsDelayed: false,
            IsHardToBorrow: false,
            IsBats: false,
            IsHalted: false
        },
        LastSize: '0.5',
        LastVenue: 'CRYP',
        VWAP: '50456.789'
    };

    it('should fetch quote snapshots for a single symbol', async () => {
        const mockResponse: QuoteSnapshot = {
            Quotes: [mockQuote],
            Errors: []
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getQuoteSnapshots(['MSFT']);

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/quotes/MSFT');
    });

    it('should fetch quote snapshots for multiple symbols', async () => {
        const mockResponse: QuoteSnapshot = {
            Quotes: [mockQuote, mockCryptoQuote],
            Errors: []
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getQuoteSnapshots(['MSFT', 'BTCUSD']);

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/quotes/MSFT,BTCUSD');
    });

    it('should handle invalid symbols', async () => {
        const mockResponse: QuoteSnapshot = {
            Quotes: [mockQuote],
            Errors: [{
                Symbol: 'INVALID',
                Error: 'Symbol not found'
            }]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getQuoteSnapshots(['MSFT', 'INVALID']);

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/quotes/MSFT,INVALID');
    });

    it('should throw error if more than 100 symbols are requested', async () => {
        const symbols = Array.from({ length: 101 }, (_, i) => `SYMBOL${i}`);

        await expect(marketDataService.getQuoteSnapshots(symbols))
            .rejects
            .toThrow('Maximum of 100 symbols allowed per request');
        expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getQuoteSnapshots(['MSFT']))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/quotes/MSFT');
    });

    it('should handle authentication errors', async () => {
        const errorMessage = 'Unauthorized';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getQuoteSnapshots(['MSFT']))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/quotes/MSFT');
    });
}); 