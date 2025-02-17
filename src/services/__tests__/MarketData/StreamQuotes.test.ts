import { EventEmitter } from 'events';
import { MarketDataService } from '../../MarketDataService';
import { QuoteStream, Heartbeat, StreamErrorResponse } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Stream Quotes', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;
    let mockEmitter: EventEmitter;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
        mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValue(mockEmitter);
    });

    const mockQuoteUpdate: QuoteStream = {
        Symbol: 'MSFT',
        Ask: '212.87',
        AskSize: '300',
        Bid: '212.85',
        BidSize: '200',
        Close: '212.85',
        DailyOpenInterest: '0',
        High: '215.77',
        Low: '205.48',
        High52Week: '232.86',
        High52WeekTimestamp: '2020-09-02T00:00:00Z',
        Last: '212.85',
        Low52Week: '132.52',
        Low52WeekTimestamp: '2020-03-23T00:00:00Z',
        NetChange: '-1.61',
        NetChangePct: '3.5',
        Open: '213.65',
        PreviousClose: '214.46',
        Volume: '5852511',
        PreviousVolume: '24154112',
        TradeTime: '2020-11-18T15:19:14Z',
        MarketFlags: {
            IsDelayed: false,
            IsHalted: false,
            IsBats: false,
            IsHardToBorrow: false
        },
        TickSizeTier: '0'
    };

    const mockCryptoUpdate: QuoteStream = {
        Symbol: 'BTCUSD',
        Ask: '50790.00',
        AskSize: '1.5',
        Bid: '50788.00',
        BidSize: '2.3',
        Close: '50789.12',
        DailyOpenInterest: '0',
        High: '51234.56',
        Low: '49876.54',
        High52Week: '68789.63',
        High52WeekTimestamp: '2021-11-10T00:00:00Z',
        Last: '50789.12',
        Low52Week: '15899.00',
        Low52WeekTimestamp: '2020-03-13T00:00:00Z',
        NetChange: '789.12',
        NetChangePct: '1.58',
        Open: '50123.45',
        PreviousClose: '50000.00',
        Volume: '123456.78',
        PreviousVolume: '98765.43',
        TradeTime: '2024-01-24T15:30:00Z',
        MarketFlags: {
            IsDelayed: false,
            IsHalted: false,
            IsBats: false,
            IsHardToBorrow: false
        },
        TickSizeTier: '0'
    };

    const mockHeartbeat: Heartbeat = {
        Heartbeat: 1,
        Timestamp: '2024-01-24T15:30:00Z'
    };

    const mockError: StreamErrorResponse = {
        Error: 'INVALID_SYMBOL',
        Message: 'Invalid symbol'
    };

    it('should create quote stream for a single symbol', async () => {
        const stream = await marketDataService.streamQuotes(['MSFT']);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/quotes/MSFT',
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );

        // Test quote update
        let quoteReceived = false;
        stream.on('data', (data) => {
            if ('Ask' in data) {
                expect(data).toEqual(mockQuoteUpdate);
                quoteReceived = true;
            }
        });
        mockEmitter.emit('data', mockQuoteUpdate);
        expect(quoteReceived).toBe(true);
    });

    it('should create quote stream for multiple symbols', async () => {
        const stream = await marketDataService.streamQuotes(['MSFT', 'BTCUSD']);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/quotes/MSFT,BTCUSD',
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );

        // Test multiple quote updates
        let msftReceived = false;
        let btcReceived = false;
        stream.on('data', (data) => {
            if ('Ask' in data) {
                if (data.Symbol === 'MSFT') {
                    expect(data).toEqual(mockQuoteUpdate);
                    msftReceived = true;
                } else if (data.Symbol === 'BTCUSD') {
                    expect(data).toEqual(mockCryptoUpdate);
                    btcReceived = true;
                }
            }
        });
        mockEmitter.emit('data', mockQuoteUpdate);
        mockEmitter.emit('data', mockCryptoUpdate);
        expect(msftReceived).toBe(true);
        expect(btcReceived).toBe(true);
    });

    it('should handle heartbeat events', async () => {
        const stream = await marketDataService.streamQuotes(['MSFT']);
        let heartbeatReceived = false;
        stream.on('data', (data) => {
            if ('Heartbeat' in data) {
                expect(data).toEqual(mockHeartbeat);
                heartbeatReceived = true;
            }
        });
        mockEmitter.emit('data', mockHeartbeat);
        expect(heartbeatReceived).toBe(true);
    });

    it('should handle error events', async () => {
        const stream = await marketDataService.streamQuotes(['INVALID']);
        let errorReceived = false;
        stream.on('data', (data) => {
            if ('Error' in data) {
                expect(data).toEqual(mockError);
                errorReceived = true;
            }
        });
        mockEmitter.emit('data', mockError);
        expect(errorReceived).toBe(true);
    });

    it('should throw error if more than 100 symbols are requested', async () => {
        const symbols = Array.from({ length: 101 }, (_, i) => `SYMBOL${i}`);
        await expect(marketDataService.streamQuotes(symbols))
            .rejects
            .toThrowError('Maximum of 100 symbols allowed per request');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        mockStreamManager.createStream.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.streamQuotes(['MSFT']))
            .rejects
            .toThrow(errorMessage);
        expect(mockStreamManager.createStream).toHaveBeenCalled();
    });
}); 