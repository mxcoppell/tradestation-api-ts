import { EventEmitter } from 'events';
import { BrokerageService } from '../../BrokerageService';
import { PositionResponse, StreamStatus, StreamHeartbeat, StreamOrderErrorResponse } from '../../../types/brokerage';
import { createMockHttpClient, createMockStreamManager } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Stream Positions', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    it('should create positions stream for all accounts', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await brokerageService.streamPositions('123456,789012');
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/brokerage/stream/accounts/123456,789012/positions',
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    });

    it('should create positions stream with changes only', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await brokerageService.streamPositions('123456', true);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/brokerage/stream/accounts/123456/positions',
            { changes: true },
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    });

    it('should handle stream events correctly', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await brokerageService.streamPositions('123456');

        // Test position update
        const mockPositionUpdate: PositionResponse = {
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
        };

        // Test status update
        const mockStatusUpdate: StreamStatus = {
            StreamStatus: 'Connected',
            Message: 'Stream connected successfully'
        };

        // Test heartbeat
        const mockHeartbeat: StreamHeartbeat = {
            Heartbeat: '2024-01-19T12:00:00Z'
        };

        // Test error
        const mockError: StreamOrderErrorResponse = {
            Error: 'INVALID_ACCOUNT',
            Message: 'Invalid account',
            AccountID: '123456',
            OrderID: undefined
        };

        // Simulate events
        let positionReceived = false;
        let statusReceived = false;
        let heartbeatReceived = false;
        let errorReceived = false;

        stream.on('data', (data) => {
            if ('PositionID' in data) {
                expect(data).toEqual(mockPositionUpdate);
                positionReceived = true;
            } else if ('StreamStatus' in data) {
                expect(data).toEqual(mockStatusUpdate);
                statusReceived = true;
            } else if ('Heartbeat' in data) {
                expect(data).toEqual(mockHeartbeat);
                heartbeatReceived = true;
            } else if ('Error' in data) {
                expect(data).toEqual(mockError);
                errorReceived = true;
            }
        });

        // Emit events
        mockEmitter.emit('data', mockPositionUpdate);
        mockEmitter.emit('data', mockStatusUpdate);
        mockEmitter.emit('data', mockHeartbeat);
        mockEmitter.emit('data', mockError);

        // Verify all events were received
        expect(positionReceived).toBe(true);
        expect(statusReceived).toBe(true);
        expect(heartbeatReceived).toBe(true);
        expect(errorReceived).toBe(true);
    });

    it('should handle network errors', async () => {
        mockStreamManager.createStream.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.streamPositions('123456'))
            .rejects
            .toThrow('Network error');
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/brokerage/stream/accounts/123456/positions',
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    });

    it('should handle unauthorized access', async () => {
        mockStreamManager.createStream.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.streamPositions('123456'))
            .rejects
            .toThrow('Unauthorized');
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/brokerage/stream/accounts/123456/positions',
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    });
}); 