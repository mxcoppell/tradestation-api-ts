import { EventEmitter } from 'events';
import { MarketDataService } from '../../MarketDataService';
import { MarketDepthParams, MarketDepthAggregate, Heartbeat, StreamErrorResponse } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Stream Market Depth Aggregates', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    it('should create market depth aggregates stream with default parameters', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await marketDataService.streamMarketDepthAggregates('MSFT');
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/marketdepth/aggregates/MSFT',
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    });

    it('should create market depth aggregates stream with custom maxlevels', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const params: MarketDepthParams = {
            maxlevels: 10
        };

        const stream = await marketDataService.streamMarketDepthAggregates('MSFT', params);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/marketdepth/aggregates/MSFT',
            params,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    });

    it('should handle stream events correctly', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await marketDataService.streamMarketDepthAggregates('MSFT');

        // Test market depth aggregate update
        const mockMarketDepthUpdate: MarketDepthAggregate = {
            Bids: [
                {
                    EarliestTime: '2024-01-19T12:00:01Z',
                    LatestTime: '2024-01-19T12:00:56Z',
                    Side: 'Bid',
                    Price: '123.45',
                    TotalSize: '500',
                    BiggestSize: '200',
                    SmallestSize: '50',
                    NumParticipants: 3,
                    TotalOrderCount: 8
                }
            ],
            Asks: [
                {
                    EarliestTime: '2024-01-19T12:00:01Z',
                    LatestTime: '2024-01-19T12:00:56Z',
                    Side: 'Ask',
                    Price: '123.46',
                    TotalSize: '300',
                    BiggestSize: '150',
                    SmallestSize: '25',
                    NumParticipants: 2,
                    TotalOrderCount: 5
                }
            ]
        };

        // Test heartbeat
        const mockHeartbeat: Heartbeat = {
            Heartbeat: 1,
            Timestamp: '2024-01-19T12:00:00Z'
        };

        // Test error
        const mockError: StreamErrorResponse = {
            Error: 'INVALID_SYMBOL',
            Message: 'Invalid symbol'
        };

        // Simulate events
        let depthReceived = false;
        let heartbeatReceived = false;
        let errorReceived = false;

        stream.on('data', (data) => {
            if ('Bids' in data) {
                expect(data).toEqual(mockMarketDepthUpdate);
                depthReceived = true;
            } else if ('Heartbeat' in data) {
                expect(data).toEqual(mockHeartbeat);
                heartbeatReceived = true;
            } else if ('Error' in data) {
                expect(data).toEqual(mockError);
                errorReceived = true;
            }
        });

        // Emit events
        mockEmitter.emit('data', mockMarketDepthUpdate);
        mockEmitter.emit('data', mockHeartbeat);
        mockEmitter.emit('data', mockError);

        // Verify all events were received
        expect(depthReceived).toBe(true);
        expect(heartbeatReceived).toBe(true);
        expect(errorReceived).toBe(true);
    });

    it('should throw error for invalid maxlevels', async () => {
        const params: MarketDepthParams = {
            maxlevels: 0
        };

        await expect(async () => {
            await marketDataService.streamMarketDepthAggregates('MSFT', params);
        }).rejects.toThrowError('maxlevels must be a positive integer');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
        mockStreamManager.createStream.mockRejectedValueOnce(new Error('Network error'));

        await expect(marketDataService.streamMarketDepthAggregates('MSFT'))
            .rejects
            .toThrow('Network error');
        expect(mockStreamManager.createStream).toHaveBeenCalled();
    });
}); 