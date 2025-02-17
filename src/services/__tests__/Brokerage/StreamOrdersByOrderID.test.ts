import { EventEmitter } from 'events';
import { BrokerageService } from '../../BrokerageService';
import { StreamOrderResponse, StreamStatus, StreamHeartbeat, StreamOrderErrorResponse } from '../../../types/brokerage';
import { createMockHttpClient, createMockStreamManager } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Stream Orders By Order ID', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    it('should create orders stream for specific order IDs', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await brokerageService.streamOrdersByOrderID('123456,789012', 'ORDER123,ORDER456');
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/brokerage/stream/accounts/123456,789012/orders/ORDER123,ORDER456',
            undefined,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    });

    it('should handle stream events correctly', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await brokerageService.streamOrdersByOrderID('123456', 'ORDER123');

        // Test order update
        const mockOrderUpdate: StreamOrderResponse = {
            AccountID: '123456',
            OrderID: 'ORDER123',
            Status: 'FLL',
            StatusDescription: 'Order filled',
            OrderType: 'Market',
            Symbol: 'MSFT',
            Quantity: '100',
            FilledQuantity: '100',
            RemainingQuantity: '0',
            CommissionFee: '1.00',
            Currency: 'USD',
            Duration: 'Day',
            OpenedDateTime: '2024-01-19T12:00:00Z',
            Legs: []
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
            Error: 'INVALID_ORDER',
            Message: 'Order not found',
            AccountID: '123456',
            OrderID: 'ORDER123'
        };

        // Simulate events
        let orderReceived = false;
        let statusReceived = false;
        let heartbeatReceived = false;
        let errorReceived = false;

        stream.on('data', (data) => {
            if ('OrderID' in data && !('Error' in data)) {
                expect(data).toEqual(mockOrderUpdate);
                orderReceived = true;
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
        mockEmitter.emit('data', mockOrderUpdate);
        mockEmitter.emit('data', mockStatusUpdate);
        mockEmitter.emit('data', mockHeartbeat);
        mockEmitter.emit('data', mockError);

        // Verify all events were received
        expect(orderReceived).toBe(true);
        expect(statusReceived).toBe(true);
        expect(heartbeatReceived).toBe(true);
        expect(errorReceived).toBe(true);
    });

    it('should handle network errors', async () => {
        mockStreamManager.createStream.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.streamOrdersByOrderID('123456', 'ORDER123'))
            .rejects
            .toThrow('Network error');
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/brokerage/stream/accounts/123456/orders/ORDER123',
            undefined,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    });

    it('should handle unauthorized access', async () => {
        mockStreamManager.createStream.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.streamOrdersByOrderID('123456', 'ORDER123'))
            .rejects
            .toThrow('Unauthorized');
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/brokerage/stream/accounts/123456/orders/ORDER123',
            undefined,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    });
}); 