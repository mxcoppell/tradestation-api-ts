import { EventEmitter } from 'events';
import { HttpClient } from '../client/HttpClient';
import { ClientConfig } from '../types/config';
import { AxiosRequestConfig } from 'axios';

export class StreamManager {
    private streams: Map<string, EventEmitter> = new Map();
    private streamCount: number = 0;
    private readonly maxStreams: number;

    constructor(
        private readonly httpClient: HttpClient,
        config: ClientConfig
    ) {
        this.maxStreams = config.maxConcurrentStreams || 10;
    }

    async createStream(
        endpoint: string,
        params: Record<string, any> = {},
        options: Partial<AxiosRequestConfig> = {}
    ): Promise<EventEmitter> {
        if (this.streamCount >= this.maxStreams) {
            throw new Error(`Maximum number of concurrent streams (${this.maxStreams}) reached`);
        }

        const streamId = `${endpoint}:${JSON.stringify(params)}`;
        if (this.streams.has(streamId)) {
            return this.streams.get(streamId)!;
        }

        const emitter = new EventEmitter();
        this.streams.set(streamId, emitter);
        this.streamCount++;

        try {
            const stream: NodeJS.ReadableStream = await this.httpClient.createStream(endpoint, {
                ...options,
                params
            });

            let buffer = '';
            stream.on('data', (chunk: Buffer) => {
                try {
                    // Add the chunk to our buffer
                    buffer += chunk.toString();

                    // Split the buffer into lines
                    const lines = buffer.split('\n');

                    // Process all complete lines
                    for (let i = 0; i < lines.length - 1; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            try {
                                const data = JSON.parse(line);
                                emitter.emit('data', data);
                            } catch (parseError) {
                                console.debug('Failed to parse line:', line);
                            }
                        }
                    }

                    // Keep the last incomplete line in the buffer
                    buffer = lines[lines.length - 1];
                } catch (error) {
                    emitter.emit('error', new Error('Failed to process stream data'));
                }
            });

            stream.on('error', (error) => {
                emitter.emit('error', error);
                this.closeStream(streamId);
            });

            stream.on('end', () => {
                // Process any remaining data in the buffer
                if (buffer.trim()) {
                    try {
                        const data = JSON.parse(buffer.trim());
                        emitter.emit('data', data);
                    } catch (parseError) {
                        console.debug('Failed to parse remaining buffer:', buffer);
                    }
                }
                emitter.emit('end');
                this.closeStream(streamId);
            });

            emitter.on('close', () => {
                (stream as any).destroy?.();
                this.closeStream(streamId);
            });

            return emitter;
        } catch (error) {
            this.closeStream(streamId);
            throw error;
        }
    }

    closeStream(streamId: string): void {
        const emitter = this.streams.get(streamId);
        if (emitter) {
            emitter.removeAllListeners();
            this.streams.delete(streamId);
            this.streamCount--;
        }
    }

    closeAllStreams(): void {
        for (const [streamId, emitter] of this.streams.entries()) {
            emitter.emit('close');
            this.closeStream(streamId);
        }
    }

    getActiveStreams(): string[] {
        return Array.from(this.streams.keys());
    }
} 