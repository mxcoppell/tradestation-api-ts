import { EventEmitter } from 'events';
import { MarketDataService } from '../../MarketDataService';
import { MarketDepthQuote, Heartbeat, StreamErrorResponse } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Stream Market Depth Quotes', () => {
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

    const mockMarketDepthQuote: MarketDepthQuote = {
        Bids: [
            {
                TimeStamp: '2024-01-24T15:30:00Z',
                Side: 'Bid',
                Price: '123.45',
                Size: '100',
                OrderCount: 5,
                Name: 'NSDQ'
            },
            {
                TimeStamp: '2024-01-24T15:30:00Z',
                Side: 'Bid',
                Price: '123.44',
                Size: '200',
                OrderCount: 3,
                Name: 'ARCA'
            }
        ],
        Asks: [
            {
                TimeStamp: '2024-01-24T15:30:00Z',
                Side: 'Ask',
                Price: '123.46',
                Size: '150',
                OrderCount: 4,
                Name: 'NSDQ'
            },
            {
                TimeStamp: '2024-01-24T15:30:00Z',
                Side: 'Ask',
                Price: '123.47',
                Size: '300',
                OrderCount: 2,
                Name: 'ARCA'
            }
        ]
    };

    const mockHeartbeat: Heartbeat = {
        Heartbeat: 1,
        Timestamp: '2024-01-24T15:30:00Z'
    };

    const mockError: StreamErrorResponse = {
        Error: 'INVALID_SYMBOL',
        Message: 'Invalid symbol'
    };

    it('should create market depth stream with default parameters', async () => {
        const stream = await marketDataService.streamMarketDepth('MSFT');
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/marketdepth/quotes/MSFT',
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );

        // Test market depth update
        let quoteReceived = false;
        stream.on('data', (data) => {
            if ('Bids' in data) {
                expect(data).toEqual(mockMarketDepthQuote);
                quoteReceived = true;
            }
        });
        mockEmitter.emit('data', mockMarketDepthQuote);
        expect(quoteReceived).toBe(true);
    });

    it('should create market depth stream with custom maxlevels', async () => {
        const stream = await marketDataService.streamMarketDepth('MSFT', { maxlevels: 10 });
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/marketdepth/quotes/MSFT',
            { maxlevels: 10 },
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    });

    it('should handle heartbeat events', async () => {
        const stream = await marketDataService.streamMarketDepth('MSFT');
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
        const stream = await marketDataService.streamMarketDepth('INVALID');
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

    it('should throw error for invalid maxlevels', async () => {
        const symbol = 'AAPL';
        const params = { maxlevels: 0 };
        await expect(marketDataService.streamMarketDepth(symbol, params))
            .rejects
            .toThrowError('maxlevels must be a positive integer');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();

        params.maxlevels = -1;
        await expect(marketDataService.streamMarketDepth(symbol, params))
            .rejects
            .toThrowError('maxlevels must be a positive integer');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        mockStreamManager.createStream.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.streamMarketDepth('MSFT'))
            .rejects
            .toThrow(errorMessage);
        expect(mockStreamManager.createStream).toHaveBeenCalled();
    });
}); 