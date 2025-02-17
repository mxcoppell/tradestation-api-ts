import { EventEmitter } from 'events';
import { MarketDataService } from '../../MarketDataService';
import { Bar, BarStreamParams, BarStreamResponse, Heartbeat, StreamErrorResponse } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Stream Bars', () => {
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

    const mockBar: Bar = {
        Close: '216.39',
        DownTicks: 231021,
        DownVolume: 19575455,
        Epoch: 1604523600000,
        High: '218.32',
        IsEndOfHistory: false,
        IsRealtime: true,
        Low: '212.42',
        Open: '214.02',
        OpenInterest: '0',
        TimeStamp: '2020-11-04T21:00:00Z',
        TotalTicks: 460552,
        TotalVolume: '42311777',
        UpTicks: 229531,
        UpVolume: 22736321,
        BarStatus: 'Open'
    };

    const mockHeartbeat: Heartbeat = {
        Heartbeat: 1706108400000,
        Timestamp: '2024-01-24T15:30:00Z'
    };

    const mockError: StreamErrorResponse = {
        Error: 'InvalidSymbol',
        Message: 'The symbol INVALID is not valid'
    };

    it('should create bar stream with default parameters', async () => {
        const stream = await marketDataService.streamBars('MSFT');
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/barcharts/MSFT',
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );

        // Test bar data event
        let receivedBar: Bar | undefined;
        stream.on('data', (data: BarStreamResponse) => {
            if ('Close' in data) {
                receivedBar = data;
            }
        });
        mockEmitter.emit('data', mockBar);
        expect(receivedBar).toEqual(mockBar);

        // Test heartbeat event
        let receivedHeartbeat: Heartbeat | undefined;
        stream.on('data', (data: BarStreamResponse) => {
            if ('Heartbeat' in data) {
                receivedHeartbeat = data;
            }
        });
        mockEmitter.emit('data', mockHeartbeat);
        expect(receivedHeartbeat).toEqual(mockHeartbeat);

        // Test error event
        let receivedError: StreamErrorResponse | undefined;
        stream.on('data', (data: BarStreamResponse) => {
            if ('Error' in data) {
                receivedError = data;
            }
        });
        mockEmitter.emit('data', mockError);
        expect(receivedError).toEqual(mockError);
    });

    it('should create bar stream with custom parameters', async () => {
        const params: BarStreamParams = {
            interval: '5',
            unit: 'Minute',
            barsback: 100,
            sessiontemplate: 'USEQPreAndPost'
        };

        const stream = await marketDataService.streamBars('MSFT', params);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/barcharts/MSFT',
            params,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );

        // Test real-time bar update
        const realtimeBar: Bar = {
            ...mockBar,
            IsRealtime: true,
            BarStatus: 'Open',
            TimeStamp: '2024-01-24T15:30:00Z'
        };

        let receivedBar: Bar | undefined;
        stream.on('data', (data: BarStreamResponse) => {
            if ('Close' in data) {
                receivedBar = data;
            }
        });
        mockEmitter.emit('data', realtimeBar);
        expect(receivedBar).toEqual(realtimeBar);
    });

    it('should throw error for invalid minute interval', async () => {
        const params: BarStreamParams = {
            unit: 'Minute',
            interval: '1441'
        };

        await expect(async () => {
            await marketDataService.streamBars('MSFT', params);
        }).rejects.toThrowError('Maximum interval for minute bars is 1440');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should throw error for non-minute bars with interval not 1', async () => {
        const params: BarStreamParams = {
            unit: 'Daily',
            interval: '2'
        };

        await expect(async () => {
            await marketDataService.streamBars('MSFT', params);
        }).rejects.toThrowError('Interval must be 1 for non-minute bars');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should throw error for too many bars back', async () => {
        const params: BarStreamParams = {
            barsback: 57601
        };

        await expect(async () => {
            await marketDataService.streamBars('MSFT', params);
        }).rejects.toThrowError('Maximum of 57,600 bars allowed per request');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
        mockStreamManager.createStream.mockRejectedValueOnce(new Error('Network error'));

        await expect(marketDataService.streamBars('MSFT'))
            .rejects
            .toThrow('Network error');
        expect(mockStreamManager.createStream).toHaveBeenCalled();
    });

    it('should handle session template values', async () => {
        const validTemplates: Array<'USEQPre' | 'USEQPost' | 'USEQPreAndPost' | 'USEQ24Hour' | 'Default'> = [
            'USEQPre', 'USEQPost', 'USEQPreAndPost', 'USEQ24Hour', 'Default'
        ];

        for (const template of validTemplates) {
            const params: BarStreamParams = {
                sessiontemplate: template
            };

            const stream = await marketDataService.streamBars('MSFT', params);
            expect(stream).toBe(mockEmitter);
            expect(mockStreamManager.createStream).toHaveBeenCalledWith(
                '/v3/marketdata/stream/barcharts/MSFT',
                params,
                { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
            );
        }
    });
}); 