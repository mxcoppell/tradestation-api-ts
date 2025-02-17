import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { StreamManager } from '../StreamManager';
import { HttpClient } from '../../client/HttpClient';
import { ClientConfig } from '../../types/config';

// Mock dependencies
jest.mock('../../client/HttpClient');

describe('StreamManager', () => {
    let streamManager: StreamManager;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let config: ClientConfig;
    let mockStream: Readable;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup config
        config = {
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            maxConcurrentStreams: 2
        };

        // Setup mock HTTP client
        mockHttpClient = {
            createStream: jest.fn()
        } as unknown as jest.Mocked<HttpClient>;

        // Setup mock stream
        mockStream = new Readable({
            read() { } // Required implementation
        });
        jest.spyOn(mockStream, 'destroy');

        // Create StreamManager instance
        streamManager = new StreamManager(mockHttpClient, config);
    });

    describe('createStream', () => {
        it('should create a new stream successfully', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            const endpoint = '/test/stream';
            const params = { param1: 'value1' };
            const options = { headers: { 'Accept': 'application/json' } };

            const emitter = await streamManager.createStream(endpoint, params, options);

            expect(mockHttpClient.createStream).toHaveBeenCalledWith(endpoint, {
                ...options,
                params
            });
            expect(emitter).toBeInstanceOf(EventEmitter);
            expect(streamManager.getActiveStreams()).toHaveLength(1);
            expect(streamManager.getActiveStreams()[0]).toBe(`${endpoint}:${JSON.stringify(params)}`);
        });

        it('should reuse existing stream with same endpoint and params', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            const endpoint = '/test/stream';
            const params = { param1: 'value1' };

            const emitter1 = await streamManager.createStream(endpoint, params);
            const emitter2 = await streamManager.createStream(endpoint, params);

            expect(mockHttpClient.createStream).toHaveBeenCalledTimes(1);
            expect(emitter1).toBe(emitter2);
            expect(streamManager.getActiveStreams()).toHaveLength(1);
        });

        it('should handle stream data events', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            const emitter = await streamManager.createStream('/test/stream');
            const mockData = { test: 'data' };
            const receivedData: any[] = [];

            emitter.on('data', (data) => {
                receivedData.push(data);
            });

            mockStream.emit('data', Buffer.from(JSON.stringify(mockData) + '\n'));

            // Wait for event processing
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(receivedData).toEqual([mockData]);
        });

        it('should handle stream errors', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            const emitter = await streamManager.createStream('/test/stream');
            const errors: Error[] = [];

            emitter.on('error', (error) => {
                errors.push(error);
            });

            // Emit a stream error directly
            const streamError = new Error('Stream data error');
            mockStream.emit('error', streamError);

            // Wait for event processing
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('Stream data error');
        });

        it('should handle stream end event', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            const emitter = await streamManager.createStream('/test/stream');
            let endCalled = false;

            emitter.on('end', () => {
                endCalled = true;
            });

            mockStream.emit('end');

            expect(endCalled).toBe(true);
            expect(streamManager.getActiveStreams()).toHaveLength(0);
        });

        it('should handle stream creation errors', async () => {
            const error = new Error('Failed to create stream');
            mockHttpClient.createStream.mockRejectedValue(error);

            await expect(streamManager.createStream('/test/stream'))
                .rejects
                .toThrow('Failed to create stream');
            expect(streamManager.getActiveStreams()).toHaveLength(0);
        });

        it('should enforce maximum concurrent streams limit', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            // Create max number of streams
            await streamManager.createStream('/stream1');
            await streamManager.createStream('/stream2');

            // Attempt to create one more stream
            await expect(streamManager.createStream('/stream3'))
                .rejects
                .toThrow('Maximum number of concurrent streams (2) reached');
        });
    });

    describe('closeStream', () => {
        it('should close a specific stream', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            const streamId = '/test/stream:{}';
            const emitter = await streamManager.createStream('/test/stream');

            streamManager.closeStream(streamId);

            expect(streamManager.getActiveStreams()).toHaveLength(0);
        });

        it('should handle closing non-existent stream', () => {
            expect(() => {
                streamManager.closeStream('non-existent');
            }).not.toThrow();
        });
    });

    describe('closeAllStreams', () => {
        it('should close all active streams', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            await streamManager.createStream('/stream1');
            await streamManager.createStream('/stream2');

            expect(streamManager.getActiveStreams()).toHaveLength(2);

            streamManager.closeAllStreams();

            expect(streamManager.getActiveStreams()).toHaveLength(0);
            expect(mockStream.destroy).toHaveBeenCalledTimes(2);
        });
    });

    describe('getActiveStreams', () => {
        it('should return list of active stream IDs', async () => {
            mockHttpClient.createStream.mockResolvedValue(mockStream);

            const endpoint1 = '/stream1';
            const endpoint2 = '/stream2';
            const params1 = { param: 'value1' };
            const params2 = { param: 'value2' };

            await streamManager.createStream(endpoint1, params1);
            await streamManager.createStream(endpoint2, params2);

            const activeStreams = streamManager.getActiveStreams();
            expect(activeStreams).toHaveLength(2);
            expect(activeStreams).toContain(`${endpoint1}:${JSON.stringify(params1)}`);
            expect(activeStreams).toContain(`${endpoint2}:${JSON.stringify(params2)}`);
        });

        it('should return empty array when no streams are active', () => {
            expect(streamManager.getActiveStreams()).toEqual([]);
        });
    });
}); 